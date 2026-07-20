import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from the automatically generated file
const firebaseConfig = {
  projectId: "universal-record-7dw25",
  appId: "1:157811696181:web:b31e957d201290c81f477c",
  apiKey: "AIzaSyDm3SsnN7UwIgGx-1drOd5AnGsdxgaaRt0",
  authDomain: "universal-record-7dw25.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-theagricapp-e02e3088-6d78-4391-855c-d3b641f4c896",
  storageBucket: "universal-record-7dw25.firebasestorage.app",
  messagingSenderId: "157811696181",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
