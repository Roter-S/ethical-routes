import { firestore } from "@lib/firebase/server";
import admin from "firebase-admin";

interface SyncUserParams {
  uid: string;
  email: string | null;
  name?: string | null;
}

export async function syncUserToFirestore(params: SyncUserParams): Promise<void> {
  const { uid, email, name } = params;
  const userRef = firestore.collection("users").doc(uid);

  try {
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      const existingData = userSnap.data();
      const updates: { email?: string | null; name?: string | null;[key: string]: any } = {};

      if (email !== existingData?.email) {
        updates.email = email;
      }
      if (name && name !== existingData?.name) {
        updates.name = name;
      }

      if (Object.keys(updates).length > 0) {
        await userRef.update(updates);
      }
    } else {
      const newUserPayload = {
        uid,
        email,
        name: name || null,
        role: "user",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await userRef.set(newUserPayload);
    }
  } catch (error) {
    console.error(`Error syncing user ${uid} to Firestore:`, error);
    throw error;
  }
}
