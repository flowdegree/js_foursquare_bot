export async function checkTokenValidity(user_id: string, fsq_instance: any): Promise<any | boolean> {
    try {
        const user = await fsq_instance.getUser();
        return user;
    }
    catch (error) {
        console.error(`Error getting user data for user ${user_id}:`, error);
        return false;
    }
}
