// src/firebase.js (or firebase.ts if you're using TypeScript)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ✅ Add this


const firebaseConfig = {
  apiKey: "AIzaSyDr3NlxzbkOqzGElC7_1-CBb1Cli_Hqfb4",
  authDomain: "stayfinder-dc03a.firebaseapp.com",
  projectId: "stayfinder-dc03a",
  storageBucket: "stayfinder-dc03a.appspot.com", // ✅ fixed typo: was .app
  messagingSenderId: "1064593707600",
  appId: "1:1064593707600:web:b83d289e81fa1fc5c9b755",
  measurementId: "G-5G7N4THXD0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🧪 Optional for testing
// auth.settings.appVerificationDisabledForTesting = false;

export { auth };