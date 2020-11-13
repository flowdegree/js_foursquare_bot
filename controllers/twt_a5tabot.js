const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const config_file_name = '../assets/config/config.json';
const {	config } = require(config_file_name);

const Twitter = require('twitter');

const twitter_handle = 'a5tabot';

const client = new Twitter({
	consumer_key: config.twitter.a5tabot.CONSUMER_KEY,
	consumer_secret: config.twitter.a5tabot.CONSUMER_SECRET,
	access_token_key: config.twitter.a5tabot.ACCESS_TOKEN,
	access_token_secret: config.twitter.a5tabot.ACCESS_SECRET,
});

async function likeHashtag(options) {
	_.defaults(options, {
		'count': 10,
		'q': '#السعودية',
	});

	const tweets = await client.get('search/tweets', options);
	console.log('Got: ' + tweets.statuses.length + ' tweets');
	if (tweets.statuses) {
		let counter = 1;
		for (const tweet of tweets.statuses) {
			try {
				await new Promise(r => setTimeout(r, 1000));
				console.log('trying to like ' + tweet.text.substring(0, 40));

				const result = await client.post('favorites/create', {
					id: tweet.id_str,
					count: options.count,
				});
				console.log(result.id_str);

				if (counter >= options.number_of_likes) {
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

async function getRateLimits() {
	try {
		const result = await client.get('application/rate_limit_status', {});
		console.log(JSON.stringify(result, null, 4));
	}
	catch (error) {
		console.log(error);
	}
}


async function reverseAnswer() {
	const phrase = 'to:' + twitter_handle;

	const options = {
		'q': phrase,
		'since_id': config.twitter.a5tabot.last_reversed,
	};

	const tweets = await client.get('search/tweets', options);
	console.log('Found ' + tweets.statuses.length + ' sent to a5tabot');

	if (tweets.statuses.length > 0) {
		for (const tweet of tweets.statuses) {
			const question = tweet.text.replace(new RegExp("\@" + twitter_handle, "ig"), "");
			// question = question.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
			console.log(question);

			const answer = reverse(question);
			console.log(answer);

			const reply = {
				status: answer,
				in_reply_to_status_id: tweet.id_str,
				auto_populate_reply_metadata: true,
			};

			try {
				const result = await client.post('statuses/update', reply);

				if (result) {
					config.twitter.a5tabot.last_reversed = tweet.id_str;
					saveScript(config_file_name, {
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

function saveScript(filename, object) {
	fs.writeFile(__dirname + path.sep + filename, JSON.stringify(object, null, 4), function writeJSON(err) {
		if (err) return console.log(err);
		console.log('writing to ' + filename);
	});

}

async function followFollowers() { return;}

function unethical_answer(s) {
	//    /(\w)\w*$/
	console.log(s.match(/^.*\s+(\w)\w+$/)[1]);
	console.log(s.match(/([اأإآبتثجحخدذرزسشصضطظعغفقكلمنهويءئوةـىًٌٍَُِّ])[اأإآبتثجحخدذرزسشصضطظعغفقكلمنهويءئوةـىًٌٍَُِّ]*$/)[1]);
	s = s.match(/^.*\s+(\w)\w+$/)[1];
	return s + ', هاااااا؟ ;)';
}

// Random function that reverses a string
function reverse(s) {
	return s.split('').reverse().join('');
}

module.exports.reverseAnswer = reverseAnswer;
module.exports.likeHashtag = likeHashtag;
module.exports.getRateLimits = getRateLimits;