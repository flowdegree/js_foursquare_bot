const fsq_bufai7an = require('./controllers/foursquare/fsq_bufai7an');
const twt_bufai7an = require('./controllers/twitter/twt_bufai7an');
const twt_a5tabot = require('./controllers/twitter/twt_a5tabot');
const twt_notkwayes = require('./controllers/twitter/twt_not_kwayes');
const cron = require('node-cron');

// twt_bufai7an.likeHashtag({ q: '#السعودية', number_of_likes: 10 });


// twt_bufai7an.likeRandomHashtags({ number_of_likes: 2, number_of_hashtags: 5 });

// twt_bufai7an.updateHashtags();
// twt_bufai7an.addHashtagUsersToList();

fsq_bufai7an.likeUnliked({ limit: 60 });