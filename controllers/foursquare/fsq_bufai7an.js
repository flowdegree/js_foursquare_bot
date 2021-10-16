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

async function getCheckins(options) {
	try {
		return await api.getCheckins(options);
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
				return 'Liked ' + liked_count + ' checkins';
			}
			else{
				console.log('No recents that are unliked');
				return 'No recents that are unliked';
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

// Code to check-into a location if it was not checked-into within last x minutes

async function checkInto(options = {}) {
	try {
		// results Get last checkins within X minutes
		// 59 minutes
		const the_minutes = (Math.floor(Date.now() / 1000) - (59 * 60)).toString();
		const last_checkins = await getCheckins({ 'limit': 100, 'afterTimestamp': the_minutes });
		
        // if the new location exists within the results array end
		let _exists = false;

		last_checkins.data.response.checkins.items.forEach(checkin => {
			if (checkin.id == options.location_id) {
				_exists = true;
				return;
			}			
		});
        
        if(_exists){
            return 'no need to checkin, already checked in';
        }

		// else

		// check-in
	}
	catch (error) {
		return 'error: ' + error;
	}
}


module.exports.getFriends = getFriends;
module.exports.getLastSeen = getLastSeen;
module.exports.getRecent = getRecent;
module.exports.likeUnliked = likeUnliked;
module.exports.checkInto = checkInto;