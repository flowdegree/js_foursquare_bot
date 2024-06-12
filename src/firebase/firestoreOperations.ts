import { firestore } from '.';

export async function downloadCollection(collectionName: string) {
    try {
        console.log(`05-01: Downloading collection "${collectionName}"...`);
        const collectionRef = firestore.collection(collectionName);
        console.log('collectionRef', collectionRef)
        const snapshot = await collectionRef.get();
        console.log('snapshot length', snapshot.docs.length)
        const collection:any = {};
        
        
        
        snapshot.forEach((doc: any) => {
            collection[doc.id] = doc.data();
        });
        return collection;
    } catch (error) {
        console.error(`Error downloading collection "${collectionName}":`, error);
        return null;
    }
}

export async function updateUserDataInFirestore(user_id: string, users_collection: any, user_info: any) {
    try {
        // Update the user object in the users_collection
        await firestore.collection(users_collection).doc(user_id).update({
            last_updated_at: new Date(),
            user: user_info
        });

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
        const user:any = await firestore.collection(users_collection).doc(user_id).get();
        const legacy_tokens = user.data()?.legacy_tokens || [];

        // Update the user object in the users_collection
        await firestore.collection(users_collection).doc(user_id).update({
            last_updated_at: new Date(),
            token: null,
            legacy_tokens: [...legacy_tokens, token]
        });

        console.log(`User ${user_id} has been successfully updated.`);
    }
    catch (error) {
        console.error(`Error checking and updating user: ${error}`);
    }
}
