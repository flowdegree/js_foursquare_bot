const _ = require("lodash");
const Twitter = require("twitter");

const admin = require("firebase-admin");

admin.initializeApp({
	credential: admin.credential.cert({
		project_id: process.env.FIREBASE_PROJECT_ID,
		client_email: process.env.FIREBASE_CLIENT_EMAIL,
		private_key: process.env.FIREBASE_PRIVATE_KEY,
	}),
});

const firestore = admin.firestore();

async function getFirestoreCollection(collectionName) {
	try {
		const collectionRef = firestore.collection(collectionName);
		const snapshot = await collectionRef.get();
		const collection = {};
		snapshot.forEach((doc) => {
			collection[doc.id] = doc.data();
			collection[doc.id].origin = collectionRef.doc(doc.id);
		});
		return collection;
	} catch (error) {
		console.error(`Error downloading collection "${collectionName}":`, error);
		return null;
	}
}

class Tweety {
	constructor(username) {
		this.username = username;
	}

	async initialize() {
		this.users_collection = await getFirestoreCollection("twitter");
		this.usernames = Object.keys(this.users_collection);

		this.twitter_instances = {};

		this.usernames.forEach((username) => {
			this.twitter_instances[username] = new Twitter({
				consumer_key: this.users_collection[username].CONSUMER_KEY,
				consumer_secret: this.users_collection[username].CONSUMER_SECRET,
				access_token_key: this.users_collection[username].ACCESS_TOKEN,
				access_token_secret: this.users_collection[username].ACCESS_SECRET,
			});
		});
	}

	log(message, icon = "✅") {
		console.log(`${icon} ${new Date().toLocaleString()} - ${this.username} -`, message);
	}

	error(message) {
		console.error(`🔴 ${new Date().toLocaleString()} - ${this.username} - Error:`, message);
	}

	async likeTweetsByHashtag(hashtag = "#السعودية", count = 10) {
		const search_hashtags_query = {
			count: count,
			q: hashtag,
		};

		const tweets = await this.twitter_instances[this.username].get("search/tweets", search_hashtags_query);
		this.log(`Got: ${tweets.statuses.length} tweets`);

		// Like the results
		if (tweets.statuses) {
			let counter = 1;
			for (const tweet of tweets.statuses) {
				try {
					await this.sleep(1000);
					this.log("trying to like " + tweet.text.substring(0, 40));

					const like_query = {
						id: tweet.id_str,
					};
					const result = await this.twitter_instances[this.username].post("favorites/create", like_query);
					this.log(result.id_str);

					if (counter >= count) {
						break;
					}
					counter++;
				} catch (error) {
					this.error(error);
				}
			}
		}
	}

	async LikeRandomHashtagTweets(number_of_tags = 5, number_of_likes = 10) {
		const hashtags = this.users_collection[this.username].trends;

		let requests = [];
		for (const i = 0; i < number_of_tags; i++) {
			const request = this.likeTweetsByHashtag(hashtags[i].name, number_of_likes);
			this.log("Adding hashtag to list of likes: " + hashtags[i].name);
			requests.push(request);
		}

		const responses = await Promise.all(requests);
		return responses;
	}

	// Search a hashtag, get users, add them to a list
	async addHashtagUsersToList(list_id, number_of_users = 10, number_of_tags = 5) {
		const hashtags = this.users_collection[this.username].trends;

		let requests = [];

		for (let i = 0; i < number_of_tags; i++) {
			const request = this.twitter_instances[this.username].get("search/tweets", {
				count: number_of_users,
				q: hashtags[i].query,
			});
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
						this.log(`trying to add ${tweet.user.screen_name} to list ${list_id} `);

						// Add them to list
						const result = await this.twitter_instances[this.username].post("/lists/members/create", {
							list_id: list_id,
							screen_name: tweet.user.screen_name,
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

	// Get popular trends in certain place
	async updateHashtags(LOCATION_WOID = "1939574") {
		try {
			const trends = await this.twitter_instances[this.username].get("trends/place", {
				id: LOCATION_WOID,
			});
			if (trends[0].trends) {
				await this.updateUserDataField("trends", trends[0].trends);
			}
			console.log("Got these hashtags",trends[0].trends.map((item) => {return `#${item.name}`;}).join(", "));
			return true;
		} catch (error) {
			this.error(error);
			return false;
		}
	}

	// need to be updated with FB
	async raidHaaHashtags(options) {
		_.defaults(options, {
			number_of_replies: 10,
			number_of_hashtags: 5,
			tweet_mode: "extended",
			twitter_handle: this.username,
		});

		const hashtags = await getDocument("twitter", this.username).trends;

		for (const i = 0; i < options.number_of_hashtags; i++) {
			this.log(`Getting tweets from: ${hashtags[i].name} Maximum ${options.number_of_replies} tweets`);
			const tweets = await this.twitter_instances[this.username].get("search/tweets", {
				count: options.number_of_replies,
				q: hashtags[i].query,
			});
			this.log(`Got: ${tweets.statuses.length} tweets`);

			if (tweets.statuses.length > 0) {
				for (const tweet of tweets.statuses) {
					if (tweet.user.screen_name.toLowerCase() == options.twitter_handle.toLowerCase()) {
						setDocument("twitter", "a5tabot", last_haad, tweet.id_str);
						//this.configuration.last_haad = tweet.id_str;
						//this.saveScript(config_file_name, {'config': config,});
						break;
					}
					// Clean the string
					if (!tweet.full_text) {
						tweet.full_text = tweet.text;
					}

					const question = tweet.full_text.replace(new RegExp("@" + options.twitter_handle, "ig"), "");
					this.log(question);

					const answer = this.add_haa(question);
					this.log(answer);

					const reply = {
						status: "@" + tweet.user.screen_name + " " + answer,
						in_reply_to_status_id: tweet.id_str,
						tweet_mode: "extended",
						auto_populate_reply_metadata: true,
					};

					try {
						const result = await this.twitter_instances[this.username].post("statuses/update", reply);

						if (result) {
							setDocument("twitter", "a5tabot", last_haad, tweet.id_str);
							//this.configuration.last_haad = tweet.id_str;
							//this.saveScript(config_file_name, {'config': config,});
						}
					} catch (error) {
						console.log(error);
					}
				}
			}
		}
	}

	// Modes { reverse / haa }
	async processTweets(mode = "reverse", username = this.username) {
		const lastProcessedIdKey = `last_${mode === "reverse" ? "reversed" : "haad"}`;

		const query = {
			q: `(to:${username}) (${username})`,
			since_id: this.users_collection[username][lastProcessedIdKey],
			tweet_mode: "extended",
		};

		this.log(`Searching tweets since ${query.since_id}`, "👀");

		try {
			const tweets = await this.twitter_instances[username].get("search/tweets", query);
			if (tweets.statuses.length > 0) {
				this.log(`Found ${tweets.statuses.length} sent to @${username}`);
				for (const tweet of tweets.statuses) {
					const { user, full_text, id_str } = tweet;
					const question = full_text.replace(new RegExp(`\\@${username}`, "ig"), "");
					const answer = mode === "reverse" ? this.reverse_text(question) : this.add_haa(question);
					this.log(`Answering ${id_str}:"${question}" from @${user.screen_name} with ${answer}`);

					const reply = {
						status: `@${user.screen_name} ${answer}`,
						in_reply_to_status_id: id_str,
						tweet_mode: "extended",
						auto_populate_reply_metadata: true,
					};

					const result = await this.twitter_instances[username].post("statuses/update", reply);

					if (result) {
						await this.updateUserDataField(lastProcessedIdKey, id_str);
					}
				}
			} else {
				this.log(`Did not find any tweets sent to ${username}`, "🟧");
			}
		} catch (error) {
			this.error(error);
		}
	}

	// Utility Functions
	async updateUserDataField(field, value) {
		this.users_collection[this.username][field] = value;
		const updateObject = {};
		updateObject[field] = value;
		await this.users_collection[this.username].origin.update(updateObject);
	}

	bigIntMax = (...args) => args.reduce((m, e) => (e > m ? e : m));

	// reverse a text for a5tabot
	reverse_text(s) {
		s = this.clean_text(s);
		return Array.from(s).reverse().join("");
	}

	// Haaaa? answer
	add_haa(s) {
		s = this.clean_text(s);

		// Get the last word
		const n = s.split(" ");
		const lastword = n[n.length - 1];
		return `${lastword}, هاااااا؟ 😏`;
	}

	clean_text(s) {
		// Remove new lines and carriage returns, and Arabic diacritical marks
		s = s.replace(/[\r\n]+/g, " ").replace(/[\u064b-\u0652]+/g, "");
		return s;
	}

	sleep(ms) {
		return Promise.resolve().then(() => new Promise((resolve) => setTimeout(resolve, ms)));
	}
}

module.exports = Tweety;
