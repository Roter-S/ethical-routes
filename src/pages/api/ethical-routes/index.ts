import { firestore } from "@lib/firebase/server";
import type { APIRoute } from "astro";
import admin from "firebase-admin";
import { EthicalRouteSchema } from "@lib/ethicalRouteSchemas";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validationResult = EthicalRouteSchema.safeParse(body);

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
