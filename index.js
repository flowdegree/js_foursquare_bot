const { getFriends, getLastSeen, getRecent, likeUnliked } = require('./controllers/fsq_controller');


async function doit() {
	const value = await getFriends();
	console.log(value.data.response.friends);
}

async function doit2() {
	const value = await getLastSeen();
	console.log(value.data.response.user.lastPassive);
}

async function doit3() {
	const value = await getRecent({ limit: 2 });
	console.log(value.data.response.recent);
}

async function doit4() {
	const value = await likeUnliked({ limit: 60 });
	console.log(value);
}

doit4();

// api.getLastSeen().then(result =>{
// 	const location = result.response.user.checkins.items[0].venue.location;
// 	if(location) {
// 		api.ll = location.lat + ',' + location.lng;
// 	}
// 	console.log('done with getLastSeen');
// }).catch(() =>{
// 	console.log('failed to get last seen');
// });


//console.log(api.likeUnliked());

