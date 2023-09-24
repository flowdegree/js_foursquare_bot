//import node_cron_utils from '@6degrees/node-cron-utils';
//const node_utils = new node_cron_utils();

import cronstrue from 'cronstrue'; // convert cron expressions to human readible
import { SwarmappApi } from 'swarmapp-api'; // initialize swarmapp api 
import chalk from 'chalk';


import { scheduleTask } from './utils/taskScheduler';
import { checkTokenValidity } from './utils/tokenValidation'; // to check if user auth token is valid
import { downloadCollection, updateUserDataInFirestore, updateTokenInFirestore } from './firebase/firestoreOperations'; // firestore functions

const collection_name = 'foursqure';

async function run() {
    const users_collection: any = await downloadCollection(collection_name);
    const users_ids = Object.keys(users_collection);

    let tasks: any = [];
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
            return;
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

                if (autolikeConfig?.enabled && autolikeConfig?.interval) {
                    let interval: any = autolikeConfig.interval;
                    console.log(`07: Auto likes enabled with ${interval} (${cronstrue.toString(interval)})`);

                    // can be moved to library
                    async function like_unliked() {
                        console.log(Date(), `Running autolike for user ${user_id} with ${interval} (${cronstrue.toString(interval)})`);
                        const NUMBER_OF_CHECKINS_TO_LIKE = 20;
                        const request = await fsq_instances[user_id].likeUnliked(NUMBER_OF_CHECKINS_TO_LIKE);
                        console.log(`success: ${request.succeeded.length} failed: ${request.failed.length}`)

                    }

                    let task = scheduleTask(interval, like_unliked);
                    tasks.push(task);
                }

                // check if auto checkins enabled, then run them according to their cron timings
                const autoCheckin = user_configs.settings?.checkins;

                if (autoCheckin?.enabled) {
                    console.log(`07: venues checkins enabled`);
                    const venues = Object.entries(autoCheckin.venues);
                    console.log(`08: found ${venues.length} venue`);

                    venues.forEach(([venue_id, venue]: any) => {
                        venue.intervals.forEach((interval: any) => {
                            console.log(`09: Setting user ${user_id} check in for ${chalk.green.bold(venue.name)} at the set interval ${chalk.underline(interval.interval)} (${cronstrue.toString(interval.interval)})`);

                            let task = scheduleTask(interval.interval, async () => {
                                console.log(Date(), `Checking in user ${user_id} on ${venue_id}`);
                                await fsq_instances[user_id].checkIn(venue_id);
                            });
                            tasks.push(task);

                        })
                    })
                }

                // check if auto add trending
                const autoAddTrending = user_configs.settings?.autoaddtrending;
                 
                if (autoAddTrending?.enabled) {
                    console.log(`10: Auto Add Trending enabled`);
                    
                    const locations = Object.entries(autoAddTrending?.locations);
                    console.log(`11: found ${locations.length} locations`);

                    locations?.forEach(([location_name, location]: any) => {
                        console.log(`12: setting user ${user_id} auto checkin and add  for ${location_name} at the set interval ${location.interval} (${cronstrue.toString(location.interval)})`);

                        let task = scheduleTask(location.interval, async () => {
                            console.log(Date(), `auto adding user ${user_id} on ${location_name}`);
                            await fsq_instances[user_id].autoAddTrending(location_name, location.venues_limit);
                        });
                        tasks.push(task);
                    })
                }
            }
            else {
                console.log(chalk.red(`06: User ${chalk.bold(user_id)} does not have configs object.`));
                continue;
            }
        }
        catch (error) {
            console.error(`Error checking token validity:`, error);
        }
    }

    for (const task of tasks) {
        console.log('Starting task');
        task.start();
    }
}

run();