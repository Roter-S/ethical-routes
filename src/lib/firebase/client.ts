import { getAuth } from "firebase/auth";
import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const activeApps = getApps();
const firebaseConfig = {
  apiKey: "AIzaSyCifNe8Qya1v5jkWU_IDxTbTTtjfQsR7h4",
  authDomain: "ethical-routes-7a597.firebaseapp.com",
  projectId: "ethical-routes-7a597",
  storageBucket: "ethical-routes-7a597.firebasestorage.app",
  messagingSenderId: "910391597023",
  appId: "1:910391597023:web:4bd49fe7762cbf93ee166a",
  measurementId: "G-DY28CP6TK9",
};

const firebaseClientApp =
  activeApps.length === 0 ? initializeApp(firebaseConfig) : activeApps[0];

const firestore = getFirestore(firebaseClientApp);
const auth = getAuth(firebaseClientApp);

export { firebaseClientApp, firestore, auth };
