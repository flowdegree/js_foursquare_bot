// Scheduler Samples https://crontab.guru/#*_*_*_*_*
const cron = require('node-cron');
const swarmappapi = require('swarmapp-api');
const { config } = require('./config/config.json');

const timezone = {timezone: "Asia/Riyadh"};

const mohannad_fsq = new swarmappapi({ api_key: config.foursquare.Mohannad.token });
const hessah_fsq = new swarmappapi({ api_key: config.foursquare.Hessah.token });
const mohammed_fsq = new swarmappapi({ api_key: config.foursquare.Mohammed.token });
const d7oom_fsq = new swarmappapi({ api_key: config.foursquare.D7oom.token });
const sumaya_fsq = new swarmappapi({ api_key: config.foursquare.Sumaya.token });


cron.schedule('*/30 * * * *', async () => {
    console.log("Every 30 minutes", Date());
});

cron.schedule('*/10 * * * * *', async () => {
	// Like unliked every 10 seconds
	console.log("Every 10 seconds", Date());
	await mohannad_fsq.likeUnliked(10);
    await mohammed_fsq.likeUnliked(10);
});

cron.schedule('*/5 * * * *', async () => {
    console.log("Every 5 minutes", Date());
    await d7oom_fsq.likeUnliked(20);
});

cron.schedule('* * * * *', async () => {
    console.log("Every 1 minute", Date());
    await sumaya_fsq.likeUnliked(20);
});

/*  efficiency center - 5fe69655ec39e873a5811415
    efficiency center business incubator - 5fe69655ec39e873a5811415
    promotion efficiency - 5f4d0445beae8f7fb01977f9
    6 degrees tech. - 625b27f71b7adb105474a994
*/

// Morning shift, Ramadhan w saturday
cron.schedule('0 9 * * 0,1,2,3,4,6', async () => {
    console.log("at 9 am, weekdays of Ramadhan with saturday", Date());
	await mohannad_fsq.checkIn("5fe69655ec39e873a5811415"); // Efficiency Center Business INc
    await mohammed_fsq.checkIn("5fe69655ec39e873a5811415"); // Efficiency Center Business INc
},timezone);


// Night shift - Ramadan w saturday
cron.schedule('0 20 * * 0,1,2,3,4,6', async () => {
    console.log("at 8 pm, weekdays of Ramadhan with saturday", Date());
	
	await mohannad_fsq.checkIn("5fe69655ec39e873a5811415"); // Efficiency Center Business INc
    await mohammed_fsq.checkIn("5fe69655ec39e873a5811415"); // Efficiency Center Business INc
},timezone);

// Morning shift - Ramadan w/o saturday
cron.schedule('0 8 * * 0,1,2,3,4', async () => {
    console.log("at 8 am, weekdays of Ramadhan without saturday", Date());
},timezone);

// Morning shift - Ramadan w/o saturday
cron.schedule('0 8 * * 0,1,2,3,4', async () => {
    console.log("at 8 am, weekdays of Ramadhan without saturday", Date());
},timezone);

// Every work day, noon time
cron.schedule('0 12 * * 0,1,2,3,4', async () => {
    console.log("at 12 pm, weekdays without saturday", Date());
    await d7oom_fsq.checkIn("5fe69655ec39e873a5811415"); // Efficiency Center Business Inc
    await mohannad_fsq.checkIn("625b27f71b7adb105474a994"); // 6 degrees tech.
    await mohammed_fsq.checkIn("5f4d0445beae8f7fb01977f9"); // Promotion Efficiency

},timezone);


cron.schedule('*/10 * * * *', async () => {
	//console.log('Running Every 10 Minute');
	//FSQ_BuFai7an_Autolike();
});