import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

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

export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
export const storage = getStorage(app);
export const auth = getAuth(app);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
