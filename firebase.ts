// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAR0xPFxmJqeUx9-30x4Cd5HcbCmq6MKXQ",
  authDomain: "the-agric-app.firebaseapp.com",
  projectId: "the-agric-app",
  storageBucket: "the-agric-app.firebasestorage.app",
  messagingSenderId: "117424773484",
  appId: "1:117424773484:web:ab45512c243a787af4bb49",
  measurementId: "G-LVXEPS7VSB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);