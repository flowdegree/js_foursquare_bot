// Initialize Firebase-admin
require('dotenv').config({path: '../../../.env'})
// Initialize Firebase-admin
const admin = require('firebase-admin');

console.log(process.env.FIREBASE_CLIENT_EMAIL)
admin.initializeApp({
    credential: admin.credential.cert({
        "project_id": process.env.FIREBASE_PROJECT_ID,
        "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        "private_key": process.env.FIREBASE_PRIVATE_KEY,
      }),
});

const firestore = admin.firestore();

async function run(){
    const collectionRef = firestore.collection("twitter");
    const snapshot = await collectionRef.get();
    let mycollection = [];
    
    snapshot.forEach(item =>{
        mycollection[item.id] = (item.data())
        mycollection[item.id].origin = collectionRef.doc(item.id);
    })

    await collectionRef.doc('mohannad').set({'hala': 'ahleen'}) // set a document
    console.log((await collectionRef.doc('mohannad').get()).data()) // get a document, not needed
    console.log(mycollection['a5tabot'].CONSUMER_SECRET) // get a value
    mycollection['a5tabot'].origin.update({'hi': 'wow'}) // update a value
}
run();

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
        console.error(`Error downloading collection "${collectionName}":`, error);
        return null;
    }
}

async function setDocument(collectionName, documentName, field, data){
	try {
        const collectionRef = firestore.collection(collectionName);
		collectionRef.doc(documentName)[field] = data;
        return;
    } catch (error) {
        console.error(`Error setting collection "${collectionName}${documentName}":`, error);
        return null;
    }
}

async function getDocument(collectionName, documentName){
	try {
        const collectionRef = firestore.collection(collectionName);
		const doc = await collectionRef.doc(documentName).get();
        return doc;
    } catch (error) {
        console.error(`Error getting collection "${collectionName}${documentName}":`, error);
        return null;
    }
}