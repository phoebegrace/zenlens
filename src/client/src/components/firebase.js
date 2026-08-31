// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9PVU7w2e9V9T9aPbk0DsSw5XH9lj7QHA",
  authDomain: "zenlens-thesis.firebaseapp.com",
  projectId: "zenlens-thesis",
  storageBucket: "zenlens-thesis.firebasestorage.app",
  messagingSenderId: "686648493804",
  appId: "1:686648493804:web:ffe390574449e7375587c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getFirestore(app);
export default app;