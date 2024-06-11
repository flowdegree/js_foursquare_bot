import * as admin from 'firebase-admin';
import { FIREBASE_BASE64_CREDS_EXPORTED } from '../config';


const firebase_private_key_b64 = Buffer.from(FIREBASE_BASE64_CREDS_EXPORTED, 'base64');
const firebase_private_key = firebase_private_key_b64.toString('utf8');
const firebase_params_json = JSON.parse(firebase_private_key);

admin.initializeApp({
    credential: admin.credential.cert(firebase_params_json),

})
export const firestore = admin.firestore();
