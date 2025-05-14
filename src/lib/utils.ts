import { auth, firestore } from "@lib/firebase/server";

async function fetchUserRole(uid: string): Promise<string> {
  try {
    const userDocRef = firestore.collection("users").doc(uid);
    const userDoc = await userDocRef.get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData && typeof userData.role === 'string') {
        return userData.role;
      }
    }
  } catch (firestoreError) {
    console.error(`Error fetching user role for UID ${uid} from Firestore:`, firestoreError);
  }
  return "user"; // Rol por defecto si no se encuentra o hay error
}

export async function getUser(cookie: string) {
  try {
    const decodedIdToken = await auth.verifySessionCookie(cookie, true);
    const firebaseUser = await auth.getUser(decodedIdToken.uid);
    const userRole = await fetchUserRole(firebaseUser.uid);

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      isAdmin: userRole === "admin",
      role: userRole,
    };
  } catch (error) {
    console.error("Error verifying session cookie or fetching user from Auth:", error);
    return null;
  }
}

export function formatDate(
  ts: Date | { seconds: number; nanoseconds: number }
): string {
  const date = ts instanceof Date ? ts : new Date(ts.seconds * 1000);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function redirectToSignin(): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/signin",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
