import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAhRIxlxyG2Bob35CdSZNievZt2rFoRcUg",
    authDomain: "youpify-d7175.firebaseapp.com",
    projectId: "youpify-d7175",
    storageBucket: "youpify-d7175.appspot.com",
    messagingSenderId: "650980653305",
    appId: "1:650980653305:web:987cd567db6a7095be8a28",
    measurementId: "G-9ZMKJB86D5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
export const db = getFirestore(app);

// Configure Google Provider
googleProvider.setCustomParameters({
    prompt: 'select_account'
});
