// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration and project ID
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: "sombot-a187b.firebaseapp.com",
  projectId: "sombot-a187b",
  storageBucket: "sombot-a187b.appspot.com",
  messagingSenderId: "550920595737",
  appId: "1:550920595737:web:99392cb63d7472f6f1fd88",
  measurementId: "G-J5063W8EE3",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
