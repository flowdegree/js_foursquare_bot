// Scheduler Samples https://crontab.guru/#*_*_*_*_*
const cron = require('node-cron');
const fsq_bufai7an = require('./controllers/foursquare/fsq_bufai7an');
const twt_bufai7an = require('./controllers/twitter/twt_bufai7an');
const twt_a5tabot = require('./controllers/twitter/twt_a5tabot');
const twt_notkwayes = require('./controllers/twitter/twt_not_kwayes');


async function FSQ_BuFai7an_Autolike() {
	const value = await fsq_bufai7an.likeUnliked({ limit: 60 });
	console.log(value);
}

cron.schedule('*/30 * * * *', () => {
	// once per hour, should not exceed 41 likes
	console.log('Running Every 30 minutes');
	twt_bufai7an.updateHashtags();
	twt_bufai7an.addHashtagUsersToList({ number_of_likes: 4, number_of_hashtags: 10, 'list_id': '1327297142831026176' });
	twt_a5tabot.addHashtagUsersToList({ number_of_likes: 4, number_of_hashtags: 10, 'list_id': '1327582294094340096' });
	// twt_notkwayes.addHashtagUsersToList({ number_of_likes: 4, number_of_hashtags: 10, 'list_id': '1327585663068241920' });
	// twt_notkwayes.raidHaaHashtags({ number_of_replies: 4, number_of_hashtags: 10 });
});

cron.schedule('*/10 * * * * *', () => {
	console.log('Running Every 10 Seconds');
	twt_a5tabot.answer();
	// twt_notkwayes.answer();
});

cron.schedule('*/10 * * * *', () => {
	console.log('Running Every 10 Minute');
	FSQ_BuFai7an_Autolike();
});
