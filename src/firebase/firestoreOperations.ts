import  firestore  from '.';
import { setDoc, doc, collection, getDocs, getDoc } from "firebase/firestore";

export async function downloadCollection(collectionName: string) {
    try {
        console.log('hi')
        const collectionRef = firestore.collection(collectionName);
        console.log('hi2')
        const allDocs = await collectionRef.get();
        console.log('hi3')
        console.log(allDocs)
        const docs: any = [];
        allDocs.forEach(doc => {
            console.log(doc.data());
            docs.push(doc.data());
        });

        console.log(docs)
        
        
        return docs;
    } catch (error) {
        console.error(`Error downloading collection "${collectionName}":`, error);
        return null;
    }
}

export async function updateUserDataInFirestore(user_id: string, users_collection: any, user_info: any) {
    try {
        // Update the user object in the users_collection
        const docRef = doc(firestore, users_collection, user_id);
        await setDoc(docRef, {
            last_updated_at: new Date(),
            user: user_info
        }, { merge: true });


        console.log(`05-01: User ${user_id} has been successfully updated.`);
    }
    catch (error) {
        console.error(`05-01: Error checking and updating user: ${error}`);
    }
}
// update the document changing the value of token to null and populating "legacy_tokens" array with the old token
export async function updateTokenInFirestore(user_id: string, users_collection: any, token: string) {
    try {
        // get legacy_tokens if they exist

        const documentRef = doc(firestore, users_collection, user_id);
        const user:any = await getDoc(documentRef);

        const legacy_tokens = user.data()?.legacy_tokens || [];

        // Update the user object in the users_collection
        await setDoc(documentRef, {
            last_updated_at: new Date(),
            token: null,
            legacy_tokens: [...legacy_tokens, token]
        }, { merge: true });
        console.log(`05-02: User ${user_id} has been successfully updated.`);

        //console.log(`User ${user_id} has been successfully updated.`);
    }
    catch (error) {
        console.error(`Error checking and updating user: ${error}`);
    }
}
