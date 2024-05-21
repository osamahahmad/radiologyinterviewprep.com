// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfeZ-VVhjdo3-N5cjjyHdlOb3SWAGf2Y4",
  authDomain: "radiology-interview-prep.firebaseapp.com",
  projectId: "radiology-interview-prep",
  storageBucket: "radiology-interview-prep.appspot.com",
  messagingSenderId: "192812392599",
  appId: "1:192812392599:web:f339d39fdb5302010bc9d2",
  measurementId: "G-C8NJ7BVV58"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);