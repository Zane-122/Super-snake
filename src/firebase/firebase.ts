// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child } from "firebase/database";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrFcRh_1WyAwnfqhb0yPx0g0HA5QXjPRE",
  authDomain: "gotta-dodg-em.firebaseapp.com",
  projectId: "gotta-dodg-em",
  storageBucket: "gotta-dodg-em.firebasestorage.app",
  messagingSenderId: "641034018287",
  appId: "1:641034018287:web:a6b26f0c5c67d67123aa1a",
  databaseURL: "https://gotta-dodg-em-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { 
  db, 
  ref, 
  set, 
  get,
  child,
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
};