import { getAuth } from "firebase/auth";
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase obtenida de variables de entorno públicas
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let firebaseClientApp: FirebaseApp;

if (!getApps().length) {
  firebaseClientApp = initializeApp(firebaseConfig);
} else {
  firebaseClientApp = getApps()[0];
}

const firestore = getFirestore(firebaseClientApp);
const auth = getAuth(firebaseClientApp);

export { firebaseClientApp, firestore, auth };
