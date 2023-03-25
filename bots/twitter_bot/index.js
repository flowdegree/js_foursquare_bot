// Scheduler Samples https://crontab.guru/#*_*_*_*_*
const cron = require('node-cron');
const tweety = require('./models/tweety.js');
const a5tabot = new tweety('a5tabot');
//const not_kwayes = new tweety({ name: 'notKwayes' });

async function run_a5tabot(){
	await a5tabot.initialize();
	await a5tabot.updateHashtags();
	//a5tabot.addHashtagUsersToList({ number_of_adds: 4, number_of_hashtags: 10, 'list_id': '1327582294094340096' });

	// Every 30 minutes
	cron.schedule('*/30 * * * *', async () => {
		try {
			await a5tabot.updateHashtags('1939574');
			await a5tabot.addHashtagUsersToList('1327582294094340096', 4, 10);
		} catch (error) {
			console.error('occured', error)
		}
		
	});

	// Every 10 seconds
	cron.schedule('*/10 * * * * *', async () => {
		try {
			await a5tabot.processTweets('reverse','a5tabot')
		} 
		catch (error) {
			console.error('occured', error)
		}
	});
}

run_a5tabot();
