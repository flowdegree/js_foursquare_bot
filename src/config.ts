import dotenv from "dotenv";

dotenv.config();

interface ServiceAccount {
  project_id: string;
  client_email: string;
  private_key: string;
}


const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  throw new Error("Missing environment variables");
}

export const serviceAccount: ServiceAccount = {
  project_id: FIREBASE_PROJECT_ID,
  client_email: FIREBASE_CLIENT_EMAIL,
  private_key: FIREBASE_PRIVATE_KEY,
};


