// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "insta-next-420202.firebaseapp.com",
  projectId: "insta-next-420202",
  storageBucket: "insta-next-420202.appspot.com",
  messagingSenderId: "347489072877",
  appId: "1:347489072877:web:0a8bd0101358d0d5e27ee4"
};

// Initialize Firebase


export const app=initializeApp(firebaseConfig)