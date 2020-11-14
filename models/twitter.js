const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const config_file_name = '../assets/config/config.json';
const {	config } = require(config_file_name);
const Twitter = require('twitter');


class TwitterAPI {

	constructor(cnf) {
		this.configuration = eval('config.twitter.' + cnf.name);

		this.client = new Twitter({
			consumer_key: this.configuration.CONSUMER_KEY,
			consumer_secret: this.configuration.CONSUMER_SECRET,
			access_token_key: this.configuration.ACCESS_TOKEN,
			access_token_secret: this.configuration.ACCESS_SECRET,
		});
	}

	async likeHashtag(options) {
		_.defaults(options, {
			'count': 10,
			'q': '#السعودية',
		});

		const tweets = await this.client.get('search/tweets', options);
		console.log('Got: ' + tweets.statuses.length + ' tweets');

		if(tweets.statuses) {
			let counter = 1;
			for(const tweet of tweets.statuses) {
				try {
					await new Promise(r => setTimeout(r, 1000));
					console.log('trying to like ' + tweet.text.substring(0, 40));

					const result = await this.client.post('favorites/create', { id: tweet.id_str, count: options.count });
					console.log(result.id_str);

					if(counter >= options.number_of_likes) {
						break;
					}
					counter++;
				}
				catch (error) {
					console.log(error);

				}
			}
		}
	}

	async likeRandomHashtags(options) {
		_.defaults(options, {
			'number_of_likes': 10,
			'number_of_hashtags': 5,
		});

		const hashtags = this.configuration.trends;

		for(let i = 0; i < options.number_of_hashtags; i++) {
			console.log('Getting tweets from: ' + hashtags[i].name);
			const tweets = await this.client.get('search/tweets', { 'count': options.number_of_likes, 'q': hashtags[i].query });
			console.log('Got: ' + tweets.statuses.length + ' tweets');

			if(tweets.statuses) {
				let counter = 1;
				for(const tweet of tweets.statuses) {
					try {
						await new Promise(r => setTimeout(r, 1000));
						console.log('trying to like ' + tweet.text.substring(0, 40));

						const result = await this.client.post('favorites/create', { id: tweet.id_str, count: options.count });
						console.log(result.id_str);

						if(counter >= options.number_of_likes) {
							break;
						}
						counter++;
					}
					catch (error) {
						console.log(error);
					}
				}
			}
		}
	}

	async updateHashtags() {
		const DAMMAM_WOEID = '1939574';
		const trends = await this.client.get('trends/place', { id: DAMMAM_WOEID });
		if (trends[0].trends) {
			this.configuration.trends = trends[0].trends;
			this.saveScript(config_file_name, { 'config': config });
		}
		// console.log(trends[0].trends);
		return 'successfully updated trends';
	}

	async getRateLimits() {
		try {
			const result = await this.client.get('application/rate_limit_status', {});
			console.log(JSON.stringify(result, null, 4));
		}
		catch (error) {
			console.log(error);
		}
	}

	async followFollowers() {
		return;
	}

	async addHashtagUsersToList(options) {
		// Get List of People
		_.defaults(options, {
			'number_of_adds': 10,
			'number_of_hashtags': 5,
			'slug': 'special',
		});

		const hashtags = this.configuration.trends;

		for(let i = 0; i < options.number_of_hashtags; i++) {
			console.log(`Getting tweets from: ${hashtags[i].name} Maximum ${options.number_of_adds} tweets`);
			const tweets = await this.client.get('search/tweets', { 'count': options.number_of_adds, 'q': hashtags[i].query });
			console.log(`Got: ${tweets.statuses.length} tweets`);

			if(tweets.statuses) {
				for(const tweet of tweets.statuses) {
					try {
						await new Promise(r => setTimeout(r, 1000));
						console.log(`trying to add ${tweet.user.screen_name} to list ${options.list_id} `);

						// Add them to list
						const result = await this.client.post('/lists/members/create', {
							'list_id': options.list_id,
							'screen_name': tweet.user.screen_name,
						});
						console.log(`Successfully added ${tweet.user.screen_name} to ${result.name} members count ${result.member_count}`);
					}
					catch (error) {
						console.log(error);
					}
				}
			}
		}
	}


	async reverseAnswer(options) {
		const phrase = 'to:' + options.twitter_handle;

		_.defaults(options, {
			'q': phrase,
			'since_id': this.configuration.last_reversed,
		});

		const tweets = await this.client.get('search/tweets', options);
		console.log(`Found ${tweets.statuses.length} sent to ${options.twitter_handle}`);

		if (tweets.statuses.length > 0) {
			for (const tweet of tweets.statuses) {

				// Clean the string
				const question = tweet.text.replace(new RegExp('\@' + options.twitter_handle, 'ig'), '');
				console.log(question);

				const answer = this.reverse(question);
				console.log(answer);

				const reply = {
					status: answer,
					in_reply_to_status_id: tweet.id_str,
					auto_populate_reply_metadata: true,
				};

				try {
					const result = await this.client.post('statuses/update', reply);

					if (result) {
						this.configuration.last_reversed = tweet.id_str;
						this.saveScript(config_file_name, {
							'config': config,
						});
					}
				}
				catch (error) {
					console.log(error);
				}
			}
		}
	}

	async haaAnswer(options) {
		const phrase = 'to:' + options.twitter_handle;

		_.defaults(options, {
			'q': phrase,
			'since_id': this.configuration.last_haad,
		});

		const tweets = await this.client.get('search/tweets', options);
		console.log('Found ' + tweets.statuses.length + ' sent to ' + options.twitter_handle);

		if (tweets.statuses.length > 0) {
			for (const tweet of tweets.statuses) {

				// Clean the string
				const question = tweet.text.replace(new RegExp('\@' + options.twitter_handle, 'ig'), '');
				console.log(question);

				const answer = this.add_haa(question);
				console.log(answer);

				const reply = {
					status: answer,
					in_reply_to_status_id: tweet.id_str,
					auto_populate_reply_metadata: true,
				};

				try {
					const result = await this.client.post('statuses/update', reply);

					if (result) {
						this.configuration.last_haad = tweet.id_str;
						this.saveScript(config_file_name, {
							'config': config,
						});
					}
				}
				catch (error) {
					console.log(error);
				}
			}
		}
	}

	// Utility Functions

	// Saves the new config object to file
	saveScript(filename, object) {
		fs.writeFile(__dirname + path.sep + filename, JSON.stringify(object, null, 4), function writeJSON(err) {
			if (err) return console.log(err);
			console.log('writing to ' + filename);
		});
	}

	// reverse a text
	reverse_text(s) {
		return s.split('').reverse().join('');
	}

	// Haaaa? answer
	add_haa(s) {
		//    /(\w)\w*$/
		console.log(s.match(/^.*\s+(\w)\w+$/)[1]);
		console.log(s.match(/([اأإآبتثجحخدذرزسشصضطظعغفقكلمنهويءئوةـىًٌٍَُِّ])[اأإآبتثجحخدذرزسشصضطظعغفقكلمنهويءئوةـىًٌٍَُِّ]*$/)[1]);
		s = s.match(/^.*\s+(\w)\w+$/)[1];
		return s + ', هاااااا؟ ;)';
	}

}

module.exports = TwitterAPI;
