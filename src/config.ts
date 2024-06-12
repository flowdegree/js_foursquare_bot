import dotenv from "dotenv";

dotenv.config();

const { FIREBASE9_BASE64_CREDS } = process.env;

if (!FIREBASE9_BASE64_CREDS) {
  throw new Error(`Missing environment variables FIREBASE_BASE64_CREDS`);
}

const firebaseConfig = JSON.parse(Buffer.from(FIREBASE9_BASE64_CREDS, 'base64').toString());

export default firebaseConfig;