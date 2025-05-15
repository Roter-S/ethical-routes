import { firestore, auth } from "@lib/firebase/server";
import type { APIRoute } from "astro";
import admin from "firebase-admin";
import { EthicalRouteSchema } from "@lib/ethicalRouteSchemas";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const sessionCookie = cookies.get("session")?.value;
    if (!sessionCookie) {
      return new Response(JSON.stringify({ message: "No autorizado" }), { status: 401 });
    }
    let decodedIdToken;
    try {
      decodedIdToken = await auth.verifySessionCookie(sessionCookie, true);
    } catch {
      return new Response(JSON.stringify({ message: "Sesión inválida" }), { status: 401 });
    }
    const uid = decodedIdToken.uid;

    const body = await request.json();
    // Eliminar participations si viene en el body
    const { participations, ...rest } = body;
    const validationResult = EthicalRouteSchema.safeParse(rest);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          message: "Error de validación",
          errors: validationResult.error.flatten().fieldErrors,
        }),
        { status: 400 }
      );
    }

    const dataToStore = {
      ...validationResult.data,
      participations: 0,
      created_by: uid,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await firestore.collection("ethical_routes").add(dataToStore);

    return new Response(
      JSON.stringify({ message: "Ruta ética creada con éxito", id: docRef.id }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al procesar la solicitud POST /api/ethical-routes:", error);
    return new Response(
      JSON.stringify({ message: "Error interno del servidor" }),
      { status: 500 }
    );
  }
};
