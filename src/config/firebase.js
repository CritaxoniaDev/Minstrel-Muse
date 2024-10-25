import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
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
export const facebookProvider = new FacebookAuthProvider();
export const analytics = getAnalytics(app);
export const db = getFirestore(app);

// Configure Providers
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

facebookProvider.setCustomParameters({
    'display': 'popup'
});
