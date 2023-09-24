import * as admin from 'firebase-admin';
import { serviceAccount } from '../config';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export const firestore = admin.firestore();
