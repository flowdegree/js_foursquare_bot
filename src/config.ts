import dotenv from "dotenv";

dotenv.config();

interface ServiceAccount {
  FIREBASE_BASE64_CREDS: string;
}


const { FIREBASE_BASE64_CREDS } = process.env;

if (!FIREBASE_BASE64_CREDS) {
  throw new Error("Missing environment variables");
}

export const FIREBASE_BASE64_CREDS_EXPORTED = FIREBASE_BASE64_CREDS;


