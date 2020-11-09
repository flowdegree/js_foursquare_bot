const _ = require('lodash');
const { config } = require('../assets/config/config.json');
const Twitter = require('twitter');

const client = new Twitter({
	consumer_key: config.twitter.mohannad.CONSUMER_KEY,
	consumer_secret: config.twitter.mohannad.CONSUMER_SECRET,
	access_token_key: config.twitter.mohannad.ACCESS_TOKEN,
	access_token_secret: config.twitter.mohannad.ACCESS_SECRET,
});

// client.get(path, params, callback);
// client.post(path, params, callback);
// client.stream(path, params, callback);


async function likeHashtag(options) {
	_.defaults(options, {
		'count': 10,
		'q': '#السعودية',
	});

	const tweets = await client.get('search/tweets', options);
	console.log('Got: ' + tweets.statuses.length + ' tweets');
	if(tweets.statuses) {
		let counter = 1;
		for(const tweet of tweets.statuses) {
			try {
				await new Promise(r => setTimeout(r, 1000));
				console.log('trying to like ' + tweet.text.substring(0, 40));

				const result = await client.post('favorites/create', { id: tweet.id_str, count: options.count });
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

async function getRateLimits() {
	try {
		const result = await client.get('application/rate_limit_status', {});
		console.log(JSON.stringify(result, null, 4));
	}
	catch (error) {
		console.log(error);
	}
}

async function followFollowers() {
}

function unethical_answer(s) {
	//    /(\w)\w*$/
	Logger.log(s.match(/^.*\s+(\w)\w+$/)[1]);
	Logger.log(s.match(/([اأإآبتثجحخدذرزسشصضطظعغفقكلمنهويءئوةـىًٌٍَُِّ])[اأإآبتثجحخدذرزسشصضطظعغفقكلمنهويءئوةـىًٌٍَُِّ]*$/)[1]);
	s = s.match(/^.*\s+(\w)\w+$/)[1];
	return s + ", هاااااا؟ ;)";
}

//Random function that reverses a string
function reverse(s) {
	return s.split("").reverse().join("");
}

module.exports.likeHashtag = likeHashtag;
module.exports.getRateLimits = getRateLimits;