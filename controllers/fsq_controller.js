const fsq = require('../models/foursquare.js');
const config_file_name = '../assets/config/config.json';
const { config } = require(config_file_name);

const api = new fsq({ api_key: config.foursquare.Mohannad.token });

async function getFriends() {
	try {
		return api.getFriends();
	}
	catch (error) {
		return 'error: ' + error;
	}
}

async function getLastSeen() {
	try {
		return await api.getLastSeen();
	}
	catch (error) {
		return 'error: ' + error;
	}
}

async function getRecent(options) {
	try {
		return await api.getRecent(options);
	}
	catch (error) {
		return 'error: ' + error;
	}
}

async function likeUnliked(options) {
	try {
		const recents = await getRecent(options);
		recents.data.response.recent.forEach(checkin => {
			if(!checkin.like) {
				console.log(checkin.id);
				try {
					api.likeCheckin(checkin.id);
				}
				catch (error) {
					return error;
				}
			}
		});
		return 'success liked unliked';
	}
	catch (error) {
		return 'error liking unliked: ' + error;
	}
}

module.exports.getFriends = getFriends;
module.exports.getLastSeen = getLastSeen;
module.exports.getRecent = getRecent;
module.exports.likeUnliked = likeUnliked;