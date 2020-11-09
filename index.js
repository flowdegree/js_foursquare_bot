const { getFriends, getLastSeen, getRecent, likeUnliked } = require('./controllers/fsq_controller');
const twt_bufai7an = require('./controllers/twt_bufai7an');
const twt_a5tabot = require('./controllers/twt_a5tabot');
const cron = require('node-cron');

async function doit() {
	// const value = await getFriends();
	// console.log(value.data.response.friends);
	// const value = await getLastSeen();
	// console.log(value.data.response.user.lastPassive);
	// const value = await getRecent({ limit: 2 });
	// console.log(value.data.response.recent);
	const value = await likeUnliked({ limit: 60 });
	console.log(value);
}

async function BuFai7anTwitterLiker() {
	const hashtag = '#السعودية';
	const number_of_likes = 10;
	twt_a5tabot.likeHashtag({ q: hashtag, number_of_likes: number_of_likes });
	//twt_bufai7an.getRateLimits();
}

async function a5tabotTwitterLiker() {
	const hashtag = '#السعودية';
	const number_of_likes = 10;
	twt_bufai7an.likeHashtag({ q: hashtag, number_of_likes: number_of_likes });
	//twt_bufai7an.getRateLimits();
}

async function a5tabotReverseAnswer() {
	twt_a5tabot.reverseAnswer();
}

cron.schedule('*/10 * * * *', () => {
	console.log('Running Every 5 minutes');
	BuFai7anTwitterLiker();
	a5tabotTwitterLiker();
});

cron.schedule('*/10 * * * * *', () => {
	console.log('Running Every 1 Seconds');
	a5tabotReverseAnswer();
});


//doit();

// api.getLastSeen().then(result =>{
// 	const location = result.response.user.checkins.items[0].venue.location;
// 	if(location) {
// 		api.ll = location.lat + ',' + location.lng;
// 	}
// 	console.log('done with getLastSeen');
// }).catch(() =>{
// 	console.log('failed to get last seen');
// });


//console.log(api.likeUnliked());

