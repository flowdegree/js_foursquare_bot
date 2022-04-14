const twt = require('../../models/twitter.js');
const twitter_handle = 'bufai7an';
const api = new twt({ name: twitter_handle });

async function likeHashtag(options) {
	return api.likeHashtag(options);
}

async function updateHashtags() {
	return api.updateHashtags();
}

async function likeRandomHashtags(options) {
	return api.likeRandomHashtags(options);
}

async function getRateLimits(options) {
	return api.getRateLimits(options);
}

async function addHashtagUsersToList(options) {
	return api.addHashtagUsersToList(options);
}

module.exports.likeHashtag = likeHashtag;
module.exports.getRateLimits = getRateLimits;
module.exports.likeRandomHashtags = likeRandomHashtags;
module.exports.updateHashtags = updateHashtags;
module.exports.addHashtagUsersToList = addHashtagUsersToList;

