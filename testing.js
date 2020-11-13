const { getFriends, getLastSeen, getRecent, likeUnliked } = require('./controllers/fsq_controller');
const twt_bufai7an = require('./controllers/twt_bufai7an');
const twt_a5tabot = require('./controllers/twt_a5tabot');
const cron = require('node-cron');

async function FSQ_BuFai7an_Autolike() {
	const value = await likeUnliked({ limit: 60 });
	console.log(value);
}


console.log(FSQ_BuFai7an_Autolike());

