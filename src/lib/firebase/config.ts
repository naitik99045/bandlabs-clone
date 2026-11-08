import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAoefqMq0cHh1C7C3ShbWtg6eO-eXgEdTU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "bandlabs-clone.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bandlabs-clone",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bandlabs-clone.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1080712064487",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1080712064487:web:8304b2f291ca5064bba142",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let isFirebaseAvailable = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith("AIza")) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    isFirebaseAvailable = true;
  } else {
    console.warn("Firebase API key missing or invalid. Defaulting to offline studio mode.");
  }
} catch (err) {
  console.warn("Failed to initialize Firebase Auth client, running in offline studio mode:", err);
  app = null;
  auth = null;
  googleProvider = null;
  isFirebaseAvailable = false;
}

export { app, auth, googleProvider, isFirebaseAvailable };
