// Firebase SDK Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// Your Firebase Configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZJm5A_yF-f7cdJtHBi5DQr7pxLwuDcTw",
  authDomain: "shubho-csc-website.firebaseapp.com",
  projectId: "shubho-csc-website",
  storageBucket: "shubho-csc-website.firebasestorage.app",
  messagingSenderId: "927680580174",
  appId: "1:927680580174:web:855fa191981b49d512111f",
  measurementId: "G-VYLZNHY9M0"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication
export const auth = getAuth(app);

// Firebase Database
export const db = getFirestore(app);

console.log("Shubho CSC Firebase Connected Successfully!");