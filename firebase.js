// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCaKJg9lMKInEIwojWdHHWQl0faamoMQ0c",
  authDomain: "lumaro-78898.firebaseapp.com",
  projectId: "lumaro-78898",
  storageBucket: "lumaro-78898.firebasestorage.app",
  messagingSenderId: "223988266500",
  appId: "1:223988266500:web:83897f39b4a6c867522751",
  measurementId: "G-VZL669X6MK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);