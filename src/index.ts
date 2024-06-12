//import node_cron_utils from '@6degrees/node-cron-utils';
//const node_utils = new node_cron_utils();

import cronstrue from 'cronstrue'; // convert cron expressions to human readible
import SwarmappApi from '@flowdegree/swarmapp-api'; // initialize swarmapp api 
import chalk from 'chalk';
import pkg from '../package.json';

import { scheduleTask } from './utils/taskScheduler';
import { downloadCollection, updateUserDataInFirestore, updateTokenInFirestore } from './firebase/firestoreOperations'; // firestore functions

const collection_name = 'foursqure';


async function handleAutoLike(user_id: string, autolikeConfig: any, fsq_instances: any) {
    let interval: any = autolikeConfig.interval;
    
    async function like_unliked() {
      console.log("07-01: ", Date(), `Running autolike for user ${user_id} with ${interval} (${cronstrue.toString(interval)})`);
      const NUMBER_OF_CHECKINS_TO_LIKE = 20;
      const request = await fsq_instances[user_id].likeUnliked(NUMBER_OF_CHECKINS_TO_LIKE);
      console.log(`07-02: Successfully liked: ${request.succeeded.length}, failed: ${request.failed.length}`);
    }
  
    let task = scheduleTask(interval, like_unliked);
    return task;
}
  
async function handleAutoCheckin(user_id: string, autoCheckin: any, fsq_instances: any) {
    const venues = Object.entries(autoCheckin.venues);
    console.log(`08-01: found ${venues.length} venue`);
    let tasks: any = [];
  
    venues.forEach(([venue_id, venue]: any) => {
      venue.intervals.forEach((interval: any) => {
        console.log(`08-02: Setting user ${user_id} check in for ${chalk.green.bold(venue.name)} at the set interval ${chalk.underline(interval.interval)} (${cronstrue.toString(interval.interval)})`);
  
        let task = scheduleTask(interval.interval, async () => {
          console.log("08-03: ", Date(), `Checking in user ${user_id} on ${venue_id}`);
          await fsq_instances[user_id].checkIn(venue_id);
        });
        tasks.push(task);
      });
    });
  
    return tasks;
}

async function handleAutoAddTrending(user_id: string, autoAddTrending: any, fsq_instances: any) {
    const locations = Object.entries(autoAddTrending?.locations);
    console.log(`09-01: found ${locations.length} locations`);
    let tasks: any = [];
  
    locations?.forEach(([location_name, location]: any) => {
      console.log(`09-02: setting user ${user_id} auto checkin and add for ${location_name} at the set interval ${location.interval} (${cronstrue.toString(location.interval)})`);
  
      let task = scheduleTask(location.interval, async () => {
        console.log("09-03: ", Date(), `auto adding user ${user_id} on ${location_name}`);
        const auto_trending_result = await fsq_instances[user_id].autoAddTrending(location_name, location.venues_limit);
        console.log(`09-04:`, auto_trending_result);
      });
      tasks.push(task);
    });
  
    return tasks;
}

async function run() {
    let users_collection: any = null;
    try {
        users_collection = await downloadCollection(collection_name);
        //console.log(users_collection)
        if (!users_collection) {
            //console.log(users_collection);
            throw new Error("Failed to download Firestore collection or collection is empty.");
        }
    } 
    catch (error) {
        console.error(`Error downloading collection "${collection_name}":`, error);
        return; // Exit if collection retrieval fails
    }

    const users_ids = Object.keys(users_collection);

    let tasks: any = [];
    // const to hold a named array of foursquare instances
    
    const fsq_instances: any = {};

    console.log(chalk.green(`01: Found the following keys: ${users_ids.join(', ')}`))
    console.log('02: Starting the bot service')

    for (const user_id of users_ids) {
        // if token is not found, abort
        if (users_collection[user_id].token) {
            console.log(chalk.green(`03: ${chalk.blue(`[${user_id}(${users_collection[user_id]?.name})]`)} Auth token found`));
        }
        else {
            console.log(chalk.red(`03: [${user_id}(${users_collection[user_id]?.name})] Auth token not found`));
            continue;
        }

        // initialize the foursquare instance
        console.log(`04: Using token for ${chalk.blue(`${users_collection[user_id].name}(${user_id})`)} to initialize a foursquare instance`);
        fsq_instances[user_id] = new SwarmappApi(users_collection[user_id].token);

        // if token works, keep it in the memory, else delete it
        try {
            await fsq_instances[user_id].initialize();
            console.log(`05: ${chalk.green(`${users_collection[user_id].name}(${user_id})`)} foursquare instance initialized`);
        }
        catch (error) {
            console.error(`05: ${chalk.red(`${users_collection[user_id].name}(${user_id})`)} Error initializing foursquare instance\n dumping the user`);
            delete fsq_instances[user_id];
            // update the token in firestore to null and add it to legacy_tokens
            await updateTokenInFirestore(user_id, collection_name, users_collection[user_id].token);
            continue;
        }

        try {
            const user = await fsq_instances[user_id].getUser();
            
            // Update user information
            await updateUserDataInFirestore(user_id, collection_name, user.data.response.user);
            
            // we can run the codes
            const user_configs = users_collection[user_id].configs;

            if (user_configs?.enabled) {
                console.log(`06: Found enabled configs for  ${user_id}.`);

                // Check if auto like is enabled and run it with the interval value provided
                const autolikeConfig = user_configs.settings?.autolike;

                if (autolikeConfig?.enabled) {
                    console.log(`07: Auto likes enabled with ${autolikeConfig.interval} (${cronstrue.toString(autolikeConfig.interval)})`);
                    let task = await handleAutoLike(user_id, autolikeConfig, fsq_instances);
                    tasks.push(task);
                }
          
                // check if auto checkins enabled, then run them according to their cron timings
                const autoCheckin = user_configs.settings?.checkins;

                if (autoCheckin?.enabled) {
                    console.log(`08: Auto checkins enabled`);
                    let checkinTasks = await handleAutoCheckin(user_id, autoCheckin, fsq_instances);
                    tasks = [...tasks, ...checkinTasks];
                }

                // check if auto add trending
                const autoAddTrending = user_configs.settings?.autoaddtrending;
                
                if (autoAddTrending?.enabled) {
                    console.log(`09: Auto add trending enabled`);
                    let trendingTasks = await handleAutoAddTrending(user_id, autoAddTrending, fsq_instances);
                    tasks = [...tasks, ...trendingTasks];
                }
            }
            else {
                console.log(chalk.red(`06: User ${chalk.bold(user_id)} does not have configs object.`));
                continue;
            }
        }
        catch (error) {
            console.error(`06: Error checking token validity:`, error);
        }
    }

    for (const task of tasks) {
        // print task index
        console.log(`10: Starting task ${chalk.bold(tasks.indexOf(task))}`);
        task.start();
    }
}

console.log(`Running ${pkg.name} v${pkg.version}`)
run();