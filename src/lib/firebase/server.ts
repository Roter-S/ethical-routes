import type { ServiceAccount } from "firebase-admin";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import type { App as AdminApp } from "firebase-admin/app"; // Type-only import
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function initializeAdminApp(): AdminApp {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (import.meta.env.PROD && !import.meta.env.FIREBASE_PROJECT_ID) {
    console.info(
      "PROD env & no FIREBASE_PROJECT_ID, attempting default app initialization."
    );
    try {
    return initializeApp();
    } catch (e) {
      console.warn("Default app initialization failed. Proceeding with service account if configured: ", e);
    }
  }

  const missingVars: string[] = [];
  if (!import.meta.env.FIREBASE_PROJECT_ID) missingVars.push("FIREBASE_PROJECT_ID");
  if (!import.meta.env.FIREBASE_CLIENT_EMAIL) missingVars.push("FIREBASE_CLIENT_EMAIL");
  if (!import.meta.env.FIREBASE_PRIVATE_KEY) missingVars.push("FIREBASE_PRIVATE_KEY");

  if (missingVars.length > 0) {
    throw new Error(
      `Missing Firebase Admin SDK service account environment variables: ${missingVars.join(", ")}.`
    );
  }
  
  console.info("Initializing Firebase Admin SDK with service account from environment variables.");
  
  const serviceAccountCredentials: ServiceAccount = {
    projectId: import.meta.env.FIREBASE_PROJECT_ID!,
    clientEmail: import.meta.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: import.meta.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  };

  return initializeApp({ credential: cert(serviceAccountCredentials) });
}

const firebaseAdminApp: AdminApp = initializeAdminApp();
const auth = getAuth(firebaseAdminApp);
const firestore = getFirestore(firebaseAdminApp);

export { auth, firestore, firebaseAdminApp };
