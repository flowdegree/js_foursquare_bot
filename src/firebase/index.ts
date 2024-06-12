import firebaseConfig from "../config";
import { FirebaseApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import *  as firebaseAdmin from "firebase-admin";

if (!firebaseAdmin.apps.length) {
   const adminCredentials = {
     credential: firebaseAdmin.credential.cert(firebaseConfig),

   };
 
   firebaseAdmin.initializeApp(adminCredentials);
 }

 const firestore = firebaseAdmin.firestore().settings();

 


 export default firestore;

 

 /*



let firebaseApp: FirebaseApp;

if (getApps().length === 0) {
   
   console.log('it is not initiated')
   firebaseApp = initializeApp(firebaseConfig);
} else {
   console.log('it is already initiated')
   firebaseApp = getApps()[0];
}

// Initialize firebase
let isFirestoreInitialized = false;

if (!isFirestoreInitialized) {
   initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: true, // this line
      
   });
   isFirestoreInitialized = true;
}

export const firestore = getFirestore(firebaseApp);
export default firebaseApp;

*/
/**
 * special settings to consider:
 *  preferRest: true,
    timestampsInSnapshots: true,
    experimentalForceLongPolling: true
 */