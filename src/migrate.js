// Initialize Firebase-admin
require('dotenv').config({path: '../../.env'})
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert({
        "project_id": process.env.FIREBASE_PROJECT_ID,
        "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        "private_key": process.env.FIREBASE_PRIVATE_KEY,
      }),
});

const firestore = admin.firestore();

const usersRef = firestore.collection('users');

const newCollection = 'foursqure';
const newRef = firestore.collection(newCollection);

try {
    usersRef.get().then(userSnapshot =>{
        console.log(userSnapshot)
        userSnapshot.forEach(userDoc => {
            const userId = userDoc.id;

            console.log(userDoc.data())
            const userRef = newRef.doc(userId).set(userDoc.data());
            //newRef.setDoc(userDoc.data())
        })
    });
} catch (error) {
    console.log(error)
}

