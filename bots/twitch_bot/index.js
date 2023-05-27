// initalize cronjob
const cron = require("node-cron");
require("dotenv").config({ path: "../../.env" });
// Initialize Firebase-admin
const timezone = { timezone: "Asia/Riyadh" };
const cronstrue = require("cronstrue");
const admin = require("firebase-admin");
const TwitchJs = require("twitch-js").default;

const twitch_options = {
	username: "bufai7an",
	token: process.env.TWITCH_TOKEN,
	clientId: process.env.TWITCH_CLIENT_ID,
};
const twitchJs = new TwitchJs(twitch_options);
const interval = '0 */5 * * * *';

admin.initializeApp({
	credential: admin.credential.cert({
		project_id: process.env.FIREBASE_PROJECT_ID,
		client_email: process.env.FIREBASE_CLIENT_EMAIL,
		private_key: process.env.FIREBASE_PRIVATE_KEY,
	}),
});

const firestore = admin.firestore();
const collection_name = "twitch";

console.log(`running twitch bot every ${cronstrue.toString(interval)}`)


async function run() {
	const bots_collection = await downloadCollection(collection_name);
	const bufai7an_object = bots_collection.bufai7an;

    // check friends first
	for (const friend of bufai7an_object.monitor.friends) {
		const friends_stream = await twitchJs.api.get("streams", {
			search: {
				user_login: friend,
			},
		});

		if (friends_stream.data.length > 0) {
			const user_info = await twitchJs.api.get("users", {
				search: { login: friend },
			});
			// check if exists in streaming_now property
			// if yes, do nothing
			if (bufai7an_object.streaming_now.includes(friend)) {
			}
			// if no,
			else {
				console.log("updating streaming_now");
				// add to the property
				updateStreamingNowArray([
					...bufai7an_object.streaming_now,
					friend,
				]);

				// notify discord
				const title = `${friends_stream.data[0].title}`;
				const body = `Hey @everyone, ${friend} is live now on Twitch (${friends_stream.data[0].gameName}) check it out, https://twitch.tv/${friend}`;
				const embeds = [
					{
                        title: `${friends_stream.data[0].title}`,
                        url: `https://twitch.tv/${friend}`,
						color: 1127128,
                        author: {
                            name: user_info.data[0].displayName,
                            url: `https://twitch.tv/${friend}`,
                            icon_url: user_info.data[0].profileImageUrl
                        },
						thumbnail: {
							url: user_info.data[0].profileImageUrl,
						},
						image: {
							url: friends_stream.data[0].thumbnailUrl
								.replace("{width}", "720")
								.replace("{height}", "405"),
						},
						fields: [
							{
								name: "Viewers",
								value: friends_stream.data[0].viewerCount,
								inline: false,
							},
						],
					},
				];

				notifyDiscord(title, body, embeds);
			}
		} 
        else {
			// check if exists in streaming_now property
			// if yes, remove him
			if (bufai7an_object.streaming_now.includes(friend)) {
				const new_friends_list = bufai7an_object.streaming_now.filter(
					(user) => user !== friend
				);
				updateStreamingNowArray(new_friends_list);
			}
		}

        
		console.log(
			friends_stream.data.length > 0
				? `✅ ${friend} is live`
				: `❌ ${friend} is not live`
		);
	}

    // check categories
    const categoryIdsArray = bufai7an_object.monitor.categories.map(category => category.id);

    let search_options = {
        search: {
            game_id: categoryIdsArray,
            type: 'live',
            first: 100
        }
    };
    let result = await twitchJs.api.get('streams', search_options);
    let category_streams = result.data;
    if (category_streams.length > 100){
        search_options.search.after = category_streams.pagination.cursor;
        result = await twitchJs.api.get('streams', search_options);
        category_streams = category_streams.concat(result.data);

    }

    const streamerUsernames = category_streams.map(stream => stream.user_login);


    console.log(category_streams.length);
    const search_tags = ['arab', 'arabic'];

    for(const stream of category_streams){
        const lowercaseTags = stream.tags.map(tag => tag.toLowerCase());

        if (search_tags.some(tag => lowercaseTags.includes(tag.toLowerCase()))) {
            console.log('Found a matching tag');
            // if not exists in streaming now, add it
            const friend = stream.user_login;
            const user_info = await twitchJs.api.get("users", {
				search: { login: friend },
			});

            if(bufai7an_object.streaming_now.includes(friend)){

            }
            else{
                console.log("updating streaming_now");
				// add to the property
				updateStreamingNowArray([
					...bufai7an_object.streaming_now,
					friend,
				]);

				// notify discord
				const title = `${stream.title}`;
				const body = `Hey @everyone, ${friend} is live now on Twitch (${stream.gameName}) check it out, https://twitch.tv/${friend}`;
				const embeds = [
					{
                        title: `${stream.title}`,
                        url: `https://twitch.tv/${friend}`,
						color: 1127128,
                        author: {
                            name: user_info.data[0].displayName,
                            url: `https://twitch.tv/${friend}`,
                            icon_url: user_info.data[0].profileImageUrl
                        },
						thumbnail: {
							url: user_info.data[0].profileImageUrl,
						},
						image: {
							url: stream.thumbnailUrl
								.replace("{width}", "720")
								.replace("{height}", "405"),
						},
						fields: [
							{
								name: "Viewers",
								value: stream.viewerCount,
								inline: false,
							},
						],
					},
				];

				notifyDiscord(title, body, embeds);
            }


        }
        else{
            console.log('stream not matching search criteria');
        }
    }

    // now remove the ones not appearing in friends or live streams
    for(const streamer of bufai7an_object.streaming_now){
        // if is not a friend, and not in the recent streams search, remove him
        if(!bufai7an_object.monitor.friends.includes(streamer) && !streamerUsernames.includes(streamer)){
            const new_friends_list = bufai7an_object.streaming_now.filter(
                (user) => user !== streamer
            );
            updateStreamingNowArray(new_friends_list);
        }
    }

    return;

}

async function notifyDiscord(title, message, embeds) {
	const http = require("https");
	const postData = JSON.stringify({
		title: title,
		content: message,
		embeds: embeds,
	});

	const webhookUrl =
		"https://discord.com/api/webhooks/1112121103737966594/bcFlehIaaRdoxuU1ohqys5RQ31ncpRQfitWVuQtU5UDdR4qkw9bspJLZZWHaBMZJkNeF";

	const requestOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Content-Length": Buffer.byteLength(postData),
		},
	};

	const req = http.request(webhookUrl, requestOptions, (res) => {
		console.log(`Message sent. Status code: ${res.statusCode}`);
	});

	req.on("error", (error) => {
		console.error("Error sending message:", error);
	});

	req.write(postData);
	req.end();
}

async function updateStreamingNowArray(object) {
    await firestore
		.collection(collection_name)
		.doc("bufai7an")
		.update({ streaming_now: object });
}

async function downloadCollection(collectionName) {
	try {
		const collectionRef = firestore.collection(collectionName);
		const snapshot = await collectionRef.get();
		const collection = {};
		snapshot.forEach((doc) => {
			collection[doc.id] = doc.data();
		});
		return collection;
	} catch (error) {
		console.error(
			`Error downloading collection "${collectionName}":`,
			error
		);
		return null;
	}
}

cron.schedule(interval, async () => {
	await run();
});
