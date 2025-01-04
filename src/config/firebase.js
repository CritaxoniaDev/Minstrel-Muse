import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAwznFKUgk4do4YYlfHda28fm4FI6etixM",
    authDomain: "minstrel-28a62.firebaseapp.com",
    projectId: "minstrel-28a62",
    storageBucket: "minstrel-28a62.firebasestorage.app",
    messagingSenderId: "737248193636",
    appId: "1:737248193636:web:0f77ba9fa9601e0e48c371",
    measurementId: "G-T0F853R340"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence
const enableOffline = async () => {
    try {
        await enableIndexedDbPersistence(db);
    } catch (err) {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time
            console.log('Persistence failed');
        } else if (err.code == 'unimplemented') {
            // The current browser doesn't support persistence
            console.log('Persistence not supported');
        }
    }
};

enableOffline();

// Configure Google Provider
googleProvider.setCustomParameters({
    prompt: 'select_account'
});
