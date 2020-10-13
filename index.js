const { config } = require('./assets/config/config.json');
const bar = require('./modules/foursquare.js');


const api = new bar({ api_key: config.foursquare.Mohannad.token });

api.getFriends().then(result =>{
	result.response.friends.items.forEach(element => {
		// console.log(element.firstName);
	});
}).catch(() =>{
	console.log('failed to get friends');
});


api.getLastSeen().then(result =>{
	const location = result.response.user.checkins.items[0].venue.location;
	if(location) {
		api.baseLocation = location.lat + ',' + location.lng;
	}
	console.log(api.baseLocation);
}).catch(() =>{
	console.log('failed to get last seen');
});


console.log(api.likeUnliked());

