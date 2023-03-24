const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const Twitter = require('twitter');
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

async function setDocument(collectionName, documentName, field, data){
	try {
        const collectionRef = firestore.collection(collectionName);
		collectionRef.doc(documentName)[field] = data;
        return;
    } catch (error) {
        console.error(`Error setting collection "${collectionName}${documentName}":`, error);
        return null;
    }
}

async function getDocument(collectionName, documentName){
	try {
        const collectionRef = firestore.collection(collectionName);
		const doc = await collectionRef.doc(documentName).get();
        return doc;
    } catch (error) {
        console.error(`Error getting collection "${collectionName}${documentName}":`, error);
        return null;
    }
}

class TwitterAPI {
	constructor(cnf) {
		this.cnf = cnf;
	}

	async initialize(){
		const users_collection = await downloadCollection("twitter");
		this.users_ids = Object.keys(users_collection);
		this.configuration = config[cnf.name];
		const twitter_instances = {};
		
		users_ids.forEach(async user_id => {
			twitter_instances[user_id] = new Twitter({
				consumer_key: users_collection[CONSUMER_KEY],
				consumer_secret: users_collection[CONSUMER_SECRET],
				access_token_key: users_collection[ACCESS_TOKEN],
				access_token_secret: users_collection[ACCESS_SECRET],
			});
		})
	}

	log(message){
		console.log(`✅ ${new Date().toLocaleString()} - ${this.cnf.name} -`, message);
	}

	error(message){
		console.error(`🔴 ${new Date().toLocaleString()} - ${this.cnf.name} - Error:`, message);
	}

	async likeHashtag(options) {
		_.defaults(options, {'count': 10, 'q': '#السعودية',});

		const tweets = await this.twitter_instances[this.cnf.name].get('search/tweets', options);
		this.log(`Got: ${tweets.statuses.length} tweets`);

		if(tweets.statuses) {
			let counter = 1;
			for(const tweet of tweets.statuses) {
				try {
					await new Promise(r => setTimeout(r, 1000));
					this.log('trying to like ' + tweet.text.substring(0, 40));

					const result = await this.twitter_instances[this.cnf.name].post('favorites/create', { id: tweet.id_str, count: options.count });
					this.log(result.id_str);

					if(counter >= options.number_of_likes) {
						break;
					}
					counter++;
				}
				catch (error) {
					this.error(error);

				}
			}
		}
	}

	async likeRandomHashtags(options) {
		_.defaults(options, {
			'number_of_likes': 10,
			'number_of_hashtags': 5,
		});

		const hashtags = await getDocument('twitter',this.cnf.name).trends;
		//const hashtags = this.configuration.trends;

		for(const i = 0; i < options.number_of_hashtags; i++) {
			this.log('Getting tweets from: ' + hashtags[i].name);
			const tweets = await this.twitter_instances[this.cnf.name].get('search/tweets', { 'count': options.number_of_likes, 'q': hashtags[i].query });
			this.log('Got: ' + tweets.statuses.length + ' tweets');

			if(tweets.statuses) {
				let counter = 1;
				for(const tweet of tweets.statuses) {
					try {
						await this.sleep(1000);

						this.log('trying to like ' + tweet.text.substring(0, 40));

						const result = await this.twitter_instances[this.cnf.name].post('favorites/create', { id: tweet.id_str, count: options.count });
						this.log(result.id_str);

						if(counter >= options.number_of_likes) {
							break;
						}
						counter++;
					}
					catch (error) {
						this.log(error);
					}
				}
			}
		}
	}

	// Search a hashtag, get users, add them to a list
	async addHashtagUsersToList(options) {
		// Get List of People
		_.defaults(options, {'number_of_adds': 10, 'number_of_hashtags': 5,});

		const hashtags = await getDocument('twitter',this.cnf.name).trends;
		//const hashtags = this.configuration.trends;
		
		const requests = [];

		for (let i = 0; i < options.number_of_hashtags; i++) {
			const request = this.twitter_instances[this.cnf.name].get('search/tweets', { 'count': options.number_of_adds, 'q': hashtags[i].query });
			requests.push(request);
		}

		const responses = await Promise.all(requests);

		for (let i = 0; i < responses.length; i++) {
			const tweets = responses[i].statuses;
			const hashtagName = hashtags[i].name;
	
			if (tweets) {
				for (const tweet of tweets) {
					try {
						await this.sleep(1000);
						this.log(`trying to add ${tweet.user.screen_name} to list ${options.list_id} `);
	
						// Add them to list
						const result = await this.twitter_instances[this.cnf.name].post('/lists/members/create', {
							'list_id': options.list_id,
							'screen_name': tweet.user.screen_name,
						});
	
						this.log(`Successfully added ${tweet.user.screen_name} to ${result.name} members count ${result.member_count}`);
					} catch (error) {
						this.error(error);
					}
				}
			}
	
			this.log(`Got ${tweets.length} tweets from ${hashtagName}`);
		}
	}

	// For a5tabot
	async reverseAnswer(options) {
		const phrase = 'to:' + options.twitter_handle;

		_.defaults(options, {
			'q': phrase,
			'since_id': await getDocument('twitter',this.cnf.name).last_reversed,
			tweet_mode: 'extended',
		});

		try {
			const tweets = await this.twitter_instances[this.cnf.name].get('search/tweets', options);
			this.log(`Did not find any tweets sent to ${options.twitter_handle}`);

			if (tweets.statuses.length > 0) {
				this.log(`Found ${tweets.statuses.length} sent to ${options.twitter_handle}`);
				for (const tweet of tweets.statuses) {
					if(tweet.user.screen_name.toLowerCase() == options.twitter_handle.toLowerCase()) {
						setDocument('twitter','a5tabot',last_reversed,id_str)
						//this.configuration.last_reversed = tweet.id_str;
						//this.saveScript(config_file_name, {'config': config,});
						break;
					}
					// Clean the string
					if(!tweet.full_text) { tweet.full_text = tweet.text; }
					const question = tweet.full_text.replace(new RegExp('\@' + options.twitter_handle, 'ig'), '');
	
					const answer = this.reverse_text(question);
					this.log(`Answering ${question} with ${answer}`)
	
					const reply = {
						status: '@' + tweet.user.screen_name + ' ' + answer,
						in_reply_to_status_id: tweet.id_str,
						tweet_mode: 'extended',
						auto_populate_reply_metadata: true,
					};
	
					const result = await this.twitter_instances[this.cnf.name].post('statuses/update', reply);

					if (result) {
						setDocument('twitter','a5tabot',last_reversed,tweet.id_str)
						//this.configuration.last_reversed = tweet.id_str;
						//this.saveScript(config_file_name, {'config': config,});
					}
				}
			}

		} catch (error) {
			this.error(error);
		}	
	}

	async raidHaaHashtags(options) {
		_.defaults(options, {
			'number_of_replies': 10,
			'number_of_hashtags': 5,
			tweet_mode: 'extended',
			'twitter_handle': this.cnf.name,
		});

		
		const hashtags = await getDocument('twitter',this.cnf.name).trends;

		for(const i = 0; i < options.number_of_hashtags; i++) {
			this.log(`Getting tweets from: ${hashtags[i].name} Maximum ${options.number_of_replies} tweets`);
			const tweets = await this.twitter_instances[this.cnf.name].get('search/tweets', { 'count': options.number_of_replies, 'q': hashtags[i].query });
			this.log(`Got: ${tweets.statuses.length} tweets`);


			if (tweets.statuses.length > 0) {
				for (const tweet of tweets.statuses) {
					if(tweet.user.screen_name.toLowerCase() == options.twitter_handle.toLowerCase()) {
						setDocument('twitter','a5tabot',last_haad,tweet.id_str)
						//this.configuration.last_haad = tweet.id_str;
						//this.saveScript(config_file_name, {'config': config,});
						break;
					}
					// Clean the string
					if(!tweet.full_text) { tweet.full_text = tweet.text; }

					const question = tweet.full_text.replace(new RegExp('\@' + options.twitter_handle, 'ig'), '');
					this.log(question);

					const answer = this.add_haa(question);
					this.log(answer);

					const reply = {
						status: '@' + tweet.user.screen_name + ' ' + answer,
						in_reply_to_status_id: tweet.id_str,
						tweet_mode: 'extended',
						auto_populate_reply_metadata: true,
					};

					try {
						const result = await this.twitter_instances[this.cnf.name].post('statuses/update', reply);

						if (result) {
							setDocument('twitter','a5tabot',last_haad,tweet.id_str)
							//this.configuration.last_haad = tweet.id_str;
							//this.saveScript(config_file_name, {'config': config,});
						}
					}
					catch (error) {
						console.log(error);
					}
				}
			}
		}
	}

	async haaAnswer(options) {
		_.defaults(options, {'twitter_handle': this.cnf.name,});

		const phrase = 'to:' + options.twitter_handle;

		_.defaults(options, {'q': phrase, tweet_mode: 'extended', 'since_id': await getDocument('twitter',this.cnf.name).last_haad,});

		try {
			const tweets = await this.twitter_instances[this.cnf.name].get('search/tweets', options);
			this.log('Found ' + tweets.statuses.length + ' sent to ' + options.twitter_handle);

			if (tweets.statuses.length > 0) {
				for (const tweet of tweets.statuses) {
					if(tweet.user.screen_name.toLowerCase() == options.twitter_handle.toLowerCase()) {
						setDocument('twitter','a5tabot',last_haad,tweet.id_str)
						//this.configuration.last_haad = tweet.id_str;
						//this.saveScript(config_file_name, {'config': config,});
						break;
					}

					// Clean the string
					if(!tweet.full_text) { tweet.full_text = tweet.text; }

					const question = tweet.full_text.replace(new RegExp('\@' + options.twitter_handle, 'ig'), '');
					this.log(question);

					const answer = this.add_haa(question);
					this.log(answer);

					const reply = {
						status: '@' + tweet.user.screen_name + ' ' + answer,
						in_reply_to_status_id: tweet.id_str,
						tweet_mode: 'extended',
						auto_populate_reply_metadata: true,
					};

					const result = await this.twitter_instances[this.cnf.name].post('statuses/update', reply);

					if (result) {
						setDocument('twitter','a5tabot',last_haad,tweet.id_str)
						//this.configuration.last_haad = tweet.id_str;
						//this.saveScript(config_file_name, {'config': config,});
					}
				}
			}
		} catch (error) {
			this.error(error);
		}
		
	}

	// Utility Functions


	// Get popular trends in certain place
	async updateHashtags(LOCATION_WOID = '1939574') {
		try {
			const trends = await this.twitter_instances[this.cnf.name].get('trends/place', { id: LOCATION_WOID });
			if (trends[0].trends) {
				setDocument('twitter','a5tabot',trends,trends[0].trends)
				//this.configuration.trends = trends[0].trends;
				//this.saveScript(config_file_name, { 'config': config });
			}
			this.log(trends[0].trends);
			return true;
		} catch (error) {
			this.error(error)
			return false;
		}
	}

	// Saves the new config object to file
	saveScript(filename, object) {
		fs.writeFile(__dirname + path.sep + filename, JSON.stringify(object, null, 4), function writeJSON(err) {
			if (err) return console.log(err);
			console.log('writing to ' + filename);
		});
	}

	// reverse a text for a5tabot
	reverse_text(s) {
		s = this.clean_text(s);
		return s.split('').reverse().join('');
	}

	// Haaaa? answer
	add_haa(s) {
		s = this.clean_text(s)

		// Get the last word
		const n = s.split(' ');
		const lastword = n[n.length - 1];
		return lastword + ', هاااااا؟ 😏';
	}

	clean_text(s){
		// Remove new lines
		s = s.replace(/[\r\n]+/g, ' ');
		s = s.replace(/[\r]+/g, ' ');
		s = s.replace(/[\n]+/g, ' ');

		// Remove additional حركات if any
		s = s.replace(/[ـًٌٍَُِّْ]+/g, '');
		return s;
	}

	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
}

module.exports = TwitterAPI;
