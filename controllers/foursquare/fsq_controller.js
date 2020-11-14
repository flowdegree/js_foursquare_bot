const fsq = require('../models/foursquare.js');
const config_file_name = '../assets/config/config.json';
const { config } = require(config_file_name);

const api = new fsq({ api_key: config.foursquare.Mohannad.token });

function getFriends() {
	try {
		return api.getFriends();
	}
	catch (error) {
		return 'error: ' + error;
	}
}


function getRecent(options) {
	try {
		return api.getRecent(options);
	}
	catch (error) {
		return 'error: ' + error;
	}
}

function getLastSeen(options) {
	try {
		return api.getLastSeen(options);
	}
	catch (error) {
		return 'error: ' + error;
	}
}


async function likeUnliked(options) {
	try {
		const seen_at = await getLastSeen({ 'limit': 2 });
		const configurations = {};

		if(seen_at) {
			configurations.ll = seen_at.data.response.user.lastPassive.lat + ',' + seen_at.data.response.user.lastPassive.lng;
		}

		const recents = await getRecent({ ...options, 'll': configurations.ll });

		if(recents.data.response.recent.length > 0) {
			let liked_count = 0;
			recents.data.response.recent.forEach(checkin => {
				if(!checkin.like) {
					console.log(checkin.id);
					try {
						api.likeCheckin(checkin.id);
						liked_count++;
					}
					catch (error) {
						return error;
					}
				}
			});

			if(liked_count > 0) {
				console.log('Liked ' + liked_count + ' checkins');
			}
			else{
				console.log('No recents that are unliked');
			}

		}
		else{
			console.log('No new checkins found');
		}

		return 'Finished Liking';
	}
	catch (error) {
		return 'error liking unliked: ' + error;
	}
}

module.exports.getFriends = getFriends;
module.exports.getLastSeen = getLastSeen;
module.exports.getRecent = getRecent;
module.exports.likeUnliked = likeUnliked;