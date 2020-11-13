const { getFriends, getLastSeen, getRecent, likeUnliked } = require('./controllers/fsq_controller');
const twt_bufai7an = require('./controllers/twt_bufai7an');
const twt_a5tabot = require('./controllers/twt_a5tabot');
const cron = require('node-cron');

async function FSQ_BuFai7an_Autolike() {
	// const value = await getFriends();
	// console.log(value.data.response.friends);
	// const value = await getLastSeen();
	// console.log(value.data.response.user.lastPassive);
	// const value = await getRecent({ limit: 2 });
	// console.log(value.data.response.recent);
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
	const number_of_likes = 4;
	const number_of_hashtags = 10;

	// number_of_likes * number_of_hashtags 
	twt_bufai7an.likeRandomHashtags({ number_of_likes: number_of_likes, number_of_hashtags: number_of_hashtags });
}

async function TWT_a5tabotLiker() {
	const hashtag = '#السعودية';
	const number_of_likes = 10;
	twt_a5tabot.likeHashtag({ q: hashtag, number_of_likes: number_of_likes });
	// twt_bufai7an.getRateLimits();
}

async function TWT_a5tabotReverseAnswer() {
	twt_a5tabot.reverseAnswer();
}

function TWT_BuFai7anUpdateHashtags() {
	twt_bufai7an.updateHashtags();
}

cron.schedule('30 * * * *', () => {
	// once per hour, should not exceed 41 likes
	console.log('Running Every 1 hour @ 30 minutes');
	TWT_BuFai7anUpdateHashtags();
	TWT_BuFai7anRandomLiker();
	TWT_a5tabotLiker();
});

cron.schedule('*/10 * * * * *', () => {
	console.log('Running Every 10 Seconds');
	TWT_a5tabotReverseAnswer();
});

cron.schedule('*/10 * * * *', () => {
	console.log('Running Every 10 Minute');
	FSQ_BuFai7an_Autolike();
});
