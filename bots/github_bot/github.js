const _ = require('lodash');
const axios = require('axios').default;
const querystring = require('querystring');
const { GitHub } = require('github-api');


class GithubAPI {
	constructor(config) {
		this.config = {
			'oauth_token': config.api_key,
			'username': config.username,
		};
		this.basePath = 'https://api.foursquare.com/v2/';
	}

	// Get Commands

	getFriends(options = {}) {
		return axios.get(this.basePath + 'users/' + options.user_id + '/friends', { 'params': this.config });
	}

}

module.exports = FoursquareAPI;
