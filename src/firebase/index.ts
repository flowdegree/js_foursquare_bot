import firebaseConfig from "../config";
import { initializeApp, App, cert } from 'firebase-admin/app';

import { getFirestore } from 'firebase-admin/firestore';

//console.log(firebaseConfig)

const app: App = initializeApp({
   credential: cert(firebaseConfig),
});

console.log(firebaseConfig.private_key)

// check if app is connected
console.log('is app connected:', app.name);

const firestore = getFirestore(app);
// is db connected ?

export default firestore;
