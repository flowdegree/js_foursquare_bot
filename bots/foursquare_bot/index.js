// Scheduler Samples https://crontab.guru/#*_*_*_*_*
const cron = require('node-cron');
const swarmappapi = require('swarmapp-api');
const { config } = require('config/config.json');

const timezone = {timezone: "Asia/Riyadh"};

const mohannad_fsq = new swarmappapi({ api_key: config.foursquare.Mohannad.token });
const mohammed_fsq = new swarmappapi({ api_key: config.foursquare.Mohammed.token });


cron.schedule('*/30 * * * *', () => {
	// once per hour, should not exceed 41 likes
	//console.log('Running Every 30 minutes');
	//twt_bufai7an.updateHashtags();
	//twt_bufai7an.addHashtagUsersToList({ number_of_likes: 4, number_of_hashtags: 10, 'list_id': '1327297142831026176' });
	//twt_a5tabot.addHashtagUsersToList({ number_of_likes: 4, number_of_hashtags: 10, 'list_id': '1327582294094340096' });
	// twt_notkwayes.addHashtagUsersToList({ number_of_likes: 4, number_of_hashtags: 10, 'list_id': '1327585663068241920' });
	// twt_notkwayes.raidHaaHashtags({ number_of_replies: 4, number_of_hashtags: 10 });
});

cron.schedule('*/10 * * * * *', () => {
	// Like unliked every 10 seconds
	console.log("Running every 10 seconds");
	await mohannad_fsq.likeUnliked(10);
});

cron.schedule('0 9 * * 0,1,2,3,4', () => {
	console.log("Running at 9 am, weekdays of Ramadhan");
	// efficiency center
	await mohannad_fsq.checkIn("5fe69655ec39e873a5811415");
},timezone);

cron.schedule('*/10 * * * *', () => {
	//console.log('Running Every 10 Minute');
	//FSQ_BuFai7an_Autolike();
});
