import { firestore } from "@lib/firebase/server";
import admin from "firebase-admin";

interface SyncUserParams {
  uid: string;
  email: string | null;
  name?: string | null;
  // Podrías añadir más campos aquí si los necesitas al sincronizar, ej: photoURL
}

/**
 * Crea o actualiza un documento de usuario en Firestore.
 * Se utiliza típicamente después del registro o inicio de sesión.
 */
export async function syncUserToFirestore(params: SyncUserParams): Promise<void> {
  const { uid, email, name } = params;
  const userRef = firestore.collection("users").doc(uid);

  try {
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      // Usuario existente: actualizar campos relevantes.
      // Por ahora, solo actualizamos el email si cambia.
      // Podrías añadir aquí la actualización de 'name', 'photoURL', 'lastLoginAt', etc.
      const existingData = userSnap.data();
      const updates: { email?: string | null; name?: string | null; [key: string]: any } = {};

      if (email !== existingData?.email) {
        updates.email = email;
      }
      // Ejemplo: si también quieres actualizar el nombre si se proporciona y es diferente
      // if (name && name !== existingData?.name) {
      //   updates.name = name;
      // }

      if (Object.keys(updates).length > 0) {
        await userRef.update(updates);
      }
    } else {
      // Nuevo usuario: crear el documento.
      const newUserPayload = {
        uid,
        email,
        name: name || null,
        role: "user", // Rol por defecto para nuevos usuarios
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        // podrías añadir lastLoginAt: admin.firestore.FieldValue.serverTimestamp() aquí también
      };
      await userRef.set(newUserPayload);
    }
  } catch (error) {
    console.error(`Error syncing user ${uid} to Firestore:`, error);
    // Considera si quieres relanzar el error o manejarlo de alguna otra forma
    // throw error; 
  }
}
