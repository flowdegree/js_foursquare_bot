const fsq = require('../../models/foursquare.js');
const config_file_name = '../../assets/config/config.json';
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

async function getLastSeen(options) {
	try {
		return await api.getLastSeen(options);
	}
	catch (error) {
		return 'error: ' + error;
	}
}


async function likeUnliked(options) {
	try {
		// Just to get my user recent location.
		const seen_at = await getLastSeen({ 'limit': 2 });
		const configurations = {};

		const location = seen_at.data.response.user.checkins.items[0].venue.location;
		if(location) {
			// console.log(location);
			configurations.ll = location.lat + ',' + location.lng;
		}
		console.log('before controller call', options);
		const recents = await getRecent({ ...options, 'll': configurations.ll });

		console.log(recents.data.response.length);

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
				return 'success 1';
			}
			else{
				console.log('No recents that are unliked');
				return 'success 2';
			}

		}
		else{
			console.log('No new checkins found');
			return 'fail 1';
		}
	}
	catch (error) {
		return 'error liking unliked: ' + error;
	}
}


module.exports.getFriends = getFriends;
module.exports.getLastSeen = getLastSeen;
module.exports.getRecent = getRecent;
module.exports.likeUnliked = likeUnliked;