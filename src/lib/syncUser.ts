import { auth, firestore } from "@lib/firebase/server";
import admin from "firebase-admin";

export async function syncUserToFirestore({
  uid,
  email,
  name,
}: {
  uid: string;
  email: string | null;
  name?: string | null;
}) {
  const userRef = firestore.collection("users").doc(uid);
  const snap = await userRef.get();

  if (snap.exists) {
    await userRef.update({ email });
  } else {
    await userRef.set({
      uid,
      email,
      name: name || null,
      role: "user",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}
