const { getFriends, getLastSeen, getRecent, likeUnliked } = require('./controllers/fsq_controller');
const twt_bufai7an = require('./controllers/twt_bufai7an');
const twt_a5tabot = require('./controllers/twt_a5tabot');
const cron = require('node-cron');

async function FSQ_BuFai7an_Autolike() {
	const value = await likeUnliked({ limit: 60 });
	console.log(value);
}

async function TWT_BuFai7anLiker() {
	const hashtag = '#السعودية';
	const number_of_likes = 10;
	twt_bufai7an.likeHashtag({ q: hashtag, number_of_likes: number_of_likes });
	// twt_bufai7an.getRateLimits();
}

async function TWT_BuFai7anRandomLiker() {
	const number_of_likes = 2;
	const number_of_hashtags = 5;
	// number_of_likes * number_of_hashtags

	twt_bufai7an.likeRandomHashtags({ number_of_likes: number_of_likes, number_of_hashtags: number_of_hashtags });
}

function TWT_BuFai7anUpdateHashtags() {
	twt_bufai7an.updateHashtags();
}

twt_bufai7an.addHashtagUsersToList();
