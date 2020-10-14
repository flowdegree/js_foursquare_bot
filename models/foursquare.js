const fetch = require('isomorphic-unfetch');
const querystring = require('querystring');
const https = require('https');
const _ = require('lodash');

//  To get token
// 	Client ID:		3MHHDBBCI04AYIODGEHZLXQYUAYDBGBYMIJVIYVSHQBPQT0G
// 	Client secret:	0GNQNFIGS3YYKVVJTX4XSKV0IUHAMH15D2OHGIWEMVAOUTFW
// 	1. https://foursquare.com/oauth2/authenticate?client_id=3MHHDBBCI04AYIODGEHZLXQYUAYDBGBYMIJVIYVSHQBPQT0G&response_type=code&redirect_uri=http://www.6d.com.sa
// 	2. https://foursquare.com/oauth2/access_token?client_id=3MHHDBBCI04AYIODGEHZLXQYUAYDBGBYMIJVIYVSHQBPQT0G&client_secret=0GNQNFIGS3YYKVVJTX4XSKV0IUHAMH15D2OHGIWEMVAOUTFW&grant_type=authorization_code&redirect_uri=http://www.6d.com.sa&code=R4NI4H111RWGJVOPJLGSY0DWBQTJF4IPSF0EKFGBKOAG1KJF#_=_
// 	3. LHM2UWPE1MCKXTU1KOTQZKZIHO322IHZZN3HI3UXEZYYV5PQ


class FoursquareAPI {
	constructor(config) {
		this.api_key = config.api_key;
		this.basePath = 'https://api.foursquare.com/v2';
		this.v = '20200917';
		this.m = 'swarm';
		// A random coordinate to use between calls imitating regular behavior
		this.ll = '26.30' + this.between(340000000000, 499999999999) + ',50.1' + this.between(2870000000000, 3119999999999);
	}

	_request(handler, options, data) {
		const req = handler.request(options, (res) =>{
			res.setEncoding('utf8');
			let buffer = '';

			res.on('data', response => {
				buffer += response;
			});

			res.on('end', function() {
				if(buffer === '401 Unauthorized\n') {
					return 'General API error: 401 Unauthorized';
				}

				if(_.isEmpty(buffer)) {
					return 'BTCChina returned empty response';
				}

				try {
					const json = JSON.parse(buffer);
					if('error' in json) {
						return 'API error: ' + json.error.message + ' (code ' + json.error.code + ')';
					}
					return json;
				}
				catch (err) {
					return err;
				}

			});
		});

		req.on('error', function(err) {
			return err;
		});

		req.end(data);
	}

	get_https(endpoint, params) {
		const options = {
			path: endpoint + '?' + querystring.stringify(params),
			method: 'GET',
			headers: {
				'User-Agent': 'Mozilla/4.0 (compatible; BTCchina node.js client)',
			},
		};

		this._request(https, options);
	}

	post_https(endpoint, params) {
		if(!this.key || !this.secret) {
			throw 'Must provide key and secret to make Trade API requests';
		}
		if(!_.isArray(params)) {
			throw 'Params need to be an array with parameters in the order they are listed in the API docs.';
		}

		// spoof microsecond
		const timestamp = new Date() * 1000;

		const args = {
			oauth_token: this.api_key,
			requestmethod: 'post',
			method: 'POST',
			params: params.join('~'),
		};

		const body = JSON.stringify({
			method: args.method,
			params: params,
			id: args.id,
		}, null, 4);

		const options = {
			path: endpoint,
			method: 'POST',
			headers: {
				'User-Agent': 'Mozilla/4.0 (compatible; BTCchina node.js client)',
				'Content-Length': body.length,
			},
		};

		this._request(https, options, body);
	}


	request(endpoint = '', options = {}) {

		const url = this.basePath + endpoint;

		const headers = {
			'Content-type': 'application/x-www-form-urlencoded',
		};

		const general_qs = {
			'oauth_token' : this.api_key,
			'v' : this.v,
			'm' : this.m,
			'll' : this.ll,
		};


		let qs;

		if(!url.includes('?')) {
			qs = general_qs ? '?' + querystring.stringify(general_qs) : '';
		}
		else{
			qs = general_qs ? '&' + querystring.stringify(general_qs) : '';
		}

		const config = {
			...options,
			headers : { ...headers },
			credentials: 'include',
		};

		if(options.method == 'POST') {
			console.log('its a post');
			console.log(options);
			console.log(config);
			console.log(qs);
			process.exit();
		}

		//console.log(url + qs);
		return fetch(url + qs, config).then(r => {
			if (r.ok) {
				console.log('ok');
				return r.json();
			}
			console.log('hey hey');

			const error = new Error(r.statusText);
			error.response = r;
			return Promise.reject(error);
		}).then(response => response.json()).then(data => {
			console.log(data);
		});

	}

	// Get Commands

	// Deprecated due to law, find a work-around
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





// Checkin Functions
	check_in(location_id) {
		return location_id;
	}

	promoe_checkin_nine_oclockers() {
		// get list from config
		// this.promoe_checkin();
		return;
	}

	promoe_checkin_twelve_oclockers() {
		// get list from config
		// this.promoe_checkin();
		return;
	}

	promoe_checkin_fourthirty_oclockers() {
		// get list from config
		// this.promoe_checkin();
		return;
	}

	promoe_checkin() {
		// checkin promoe
		// $this->check_in('5c1d4d037b385f002ca392ef');
		return;
	}

	// promoe auto like ?

	silent_check_in(location_id) {
		return location_id;
	}

	add_here_now() {
		// update ll to this location location
		// do a random explore request
		// checkin
		// get here now
		// call addFriend function
		return;
	}

	addFriendByID(id) {
		return id;
	}


// Like Functions
	likeCheckin(checkin_id) {

		options.set = 'true';

		const url = '/checkins/' + checkin_id + '/like';

		const options = {
			method: 'POST',
			body: querystring.stringify(options),
		};

		return this.request(url, options);
		// Optional: add your own .catch to process/deliver errors or fallbacks specific to this resource
	}

	likeUnliked() {
		const succeeded = [];


		this.getRecent().then(result => {
			result.response.recent.forEach(element => {
				if(element.like == false) {
					const like_result = this.likeCheckin(element.id).then(liked =>{
						console.log(liked);
						process.exit();
						return liked;
					}).catch(error =>{
						console.log(error);
					});
					succeeded.push(like_result);
				}
			});

			return succeeded;
		}).catch(error => {
			return error;
		});
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

	getToken() {
		this.desktopLogin(false);
		this.get_cookie_info();
	}

	desktopLogin(booleanthing) {
		return booleanthing;
	}

	get_cookie_info() {
		return;
	}

}

module.exports = FoursquareAPI;
