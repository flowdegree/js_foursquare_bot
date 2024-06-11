import dotenv from "dotenv";

dotenv.config();


const { FIREBASE_BASE64_CREDS } = process.env;
console.log(FIREBASE_BASE64_CREDS);
if (!FIREBASE_BASE64_CREDS) {
  throw new Error("Missing environment variables");
}

export const FIREBASE_BASE64_CREDS_EXPORTED = FIREBASE_BASE64_CREDS;


