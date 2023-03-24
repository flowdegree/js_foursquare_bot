require('dotenv').config()

// initalize cronjob
const cron = require('node-cron');
const timezone = {timezone: "Asia/Riyadh"};

// convert cron expressions to human readible
const cronstrue = require('cronstrue');

// initialize swarmapp api 
const swarmappapi = require('swarmapp-api');

// Initialize Firebase-admin
const admin = require('firebase-admin');

console.log(process.env.FIREBASE_CLIENT_EMAIL)
admin.initializeApp({
    credential: admin.credential.cert({
        "project_id": process.env.FIREBASE_PROJECT_ID,
        "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        "private_key": process.env.FIREBASE_PRIVATE_KEY,
      }),
});

const firestore = admin.firestore();

async function downloadCollection(collectionName) {
    try {
        const collectionRef = firestore.collection(collectionName);
        const snapshot = await collectionRef.get();
        const collection = {};
        snapshot.forEach((doc) => {
            collection[doc.id] = doc.data();
        });
        return collection;
    } catch (error) {
        console.error(`Error downloading collection "${collectionName}":`, error);
        return null;
    }
}

async function run(){
    
    //const configs_collection = await downloadCollection("configs");
    const users_collection = await downloadCollection("users");

    const users_ids = Object.keys(users_collection);

    for (const key of users_ids) {
        console.log(key);
    }

    const fsq_instances = {};

    users_ids.forEach(async user_id => {

        // if token is not found, abort
        if(!users_collection[user_id].token){
            console.log(`auth token for user ${user_id} not found`);
            return;
        }

        console.log(`using token ${users_collection[user_id].token} to initialize a foursquare object`);
        fsq_instances[user_id] = new swarmappapi({api_key: users_collection[user_id].token});
        fsq_instances[user_id].initialize();

        // if token is found, verify if it is working
        let validity = null;
        try {
            validity = await checkTokenValidity(user_id, fsq_instances[user_id]);
            if (validity) {
                console.log(`Token is valid.`);
                // Update user information
                await updateUserDataInFirestore(user_id,users_collection,validity.data.response.user);
                // we can run the codes
                const user_configs = users_collection[user_id].configs;
                if (user_configs.enabled) {
                    console.log(`Found enabled configs for  ${user_id}.`);
                    
                    // check if auto like enabled, then run it with the interval value provided
                    if(user_configs.settings?.autolike?.enabled){
                        const interval = user_configs.settings.autolike.interval;
                        console.log(`auto likes enabled with ${interval} (${cronstrue.toString(interval)})`)
                        cron.schedule(interval, async () => {
                            console.log(Date(), `Running autolike for user ${user_id} with ${interval} (${cronstrue.toString(interval)})`);
                            await fsq_instances[user_id].likeUnliked(20);
                        }, timezone);
                    }
         
                    // check if auto checkins enabled, then run them according to their cron timings
                    if(user_configs.settings?.checkins?.enabled){
                        console.log(`venues checkins enabled`);
                        const venues = Object.entries(user_configs.settings.checkins.venues);
                        console.log(`found ${venues.length} venue`);
        
                        venues.forEach(([venue_id, venue]) => {
                            venue.intervals.forEach(interval =>{
                                console.log(`setting user ${user_id} check in for ${venue_id} at the set interval ${interval.interval} (${cronstrue.toString(interval.interval)})`);
                                cron.schedule(interval.interval, async () => {
                                    console.log(Date(), `Checking in user ${user_id} on ${venue_id}`);
                                    await fsq_instances[user_id].checkIn(venue_id);
                                }, timezone);
                            })
                        })
                    }
                } 
                else {
                    console.log(`Document with id ${user_id} does not exist in the configs_collection.`);
                }
            } 
            else {
              console.log(`Token is invalid.`);
            }
        } 
        catch (error) {
            console.error(`Error checking token validity:`, error);
        }   
    })
}

// to check if user auth token is valid
async function checkTokenValidity(user_id, fsq_instance) {
    try {
      const user = await fsq_instance.getUser();
      return user;
    } 
	catch (error) {
      console.error(`Error getting user data for user ${user_id}:`, error);
      return null;
    }
}


async function updateUserDataInFirestore(user_id,users_collection,user_info){
    try {
        // Update the user object in the users_collection
        await firestore.collection("users").doc(user_id).update({
            last_updated_at: new Date(),
            user: user_info
          });
          
        console.log(`User ${user_id} has been successfully updated.`);
      } 
	  catch (error) {
        console.error(`Error checking and updating user: ${error}`);
      }
}

run();

return;
