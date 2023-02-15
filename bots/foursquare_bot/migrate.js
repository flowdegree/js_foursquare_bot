// Initialize Firebase-admin
const admin = require('firebase-admin');

admin.initializeApp({
credential: admin.credential.cert('./config/swarm-bot-configurator-firebase-adminsdk-meqwf-bcef6344a8.json'),
});

const firestore = admin.firestore();

const usersRef = firestore.collection('users');
const configsRef = firestore.collection('configs');

configsRef.get().then(configsSnapshot => {
    configsSnapshot.forEach(configDoc => {
        const configData = configDoc.data();
        const userId = configDoc.id;
        const userRef = usersRef.doc(userId);

        userRef.get().then(userSnapshot => {
            if (userSnapshot.exists) {
                userRef.update({
                    configs: configData
                });
            } else {
                console.log(`User with id ${userId} not found.`);
            }
        });
    });
});