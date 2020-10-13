const fetch = require('isomorphic-unfetch');
const querystring = require('querystring');

class FoursquareAPI {
	constructor(config) {
		this.api_key = config.api_key;
		this.basePath = 'https://api.foursquare.com/v2';
		// A random coordinate to use between calls imitating regular behavior
		this.baseLocation = '26.30' + this.between(340000000000, 499999999999) + ',50.1' + this.between(2870000000000, 3119999999999);
	}

	request(endpoint = '', options = {}) {
		const url = this.basePath + endpoint;

		const headers = {
			'Content-type': 'application/json',
		};

		const general_qs = {
			'oauth_token' : this.api_key,
			'v' : '20200917',
			'm' : 'swarm',
			'll' : this.baseLocation,
		};

		let qs;

		if(!url.includes('?')) {
			qs = general_qs ? '?' + querystring.stringify(general_qs) : '';
		}
		else{
			qs = general_qs ? '&' + querystring.stringify(general_qs) : '';
		}

		const config = {
			options,
			headers,
		};
		console.log(config);

		console.log(url + qs);

		return fetch(url + qs, config).then(r => {
			console.log(r);
			if (r.ok) {
				return r.json();
			}
			throw new Error(r);
		}).catch((error) => {
			console.log('Promise Rejected');
			throw new Error(error);
		});

	}

	// Get Commands

	getFriends(options = {}) {
		if(options.user_id == undefined) {
			options.user_id = 'self';
		}

		const qs = options ? '?' + querystring.stringify(options) : '';

		const url = '/users/' + options.user_id + '/friends' + qs;
		const config = {
			method: 'GET',
		};

		return this.request(url, config);
	}

	getLastSeen(options = {}) {
		if(options.user_id == undefined) {
			options.user_id = 'self';
		}

		const qs = options ? '?' + querystring.stringify(options) : '';

		const url = '/users/' + options.user_id + qs;
		const config = {
			method: 'GET',
		};

		return this.request(url, config);
	}

	getCheckins(options = {}) {
		return options;
	}

	// returns user timeline after timestamp
	getRecent(options = {}) {
		if(!options.timestamp) {
			options.timestamp = Date.now() - (4 * 24 * 3600);
		}

		options.limit = 2;

		const qs = options ? '?' + querystring.stringify(options) : '';

		const url = '/checkins/recent' + qs;

		const config = {
			method: 'GET',
		};

		return this.request(url, config);
	}

	// Post Commands
	check_in(location_id) {
		return location_id;
	}

	likeCheckin(checkin_id) {
		const options = {
			method: 'POST',
			body: JSON.stringify({ set: 1 }),
		};

		options.set = 1;

		const qs = options ? '?' + querystring.stringify(options) : '';

		const url = '/checkins/' + checkin_id + '/like' + qs;

		return this.request(url, options);
		// Optional: add your own .catch to process/deliver errors or fallbacks specific to this resource
	}

	likeUnliked() {
		const succeeded = [];

		this.getRecent().then(result => {
			result.response.recent.forEach(element => {
				if(element.like == false) {
					succeeded.push(this.likeCheckin(element.id));
				}
			});

			return succeeded;
		}).catch(error => {
			return error;
		});
	}

	promo_check_in_nine_oclockers() {
		return;
	}

	promo_check_in_twelve_oclockers() {
		return;
	}

	promo_check_in_fourthirty_oclockers() {
		return;
	}

	promoe_autolike() {
		return;
	}

	auto_like() {
		return;
	}

	between(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

}

module.exports = FoursquareAPI;
