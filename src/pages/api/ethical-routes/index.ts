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
    console.log("Datos recibidos:", body);

    // Eliminar participations si viene en el body
    const { participations, ...dataToValidate } = body;
    const validationResult = EthicalRouteSchema.safeParse(dataToValidate);

    if (!validationResult.success) {
      console.error("Errores de validación:", validationResult.error);
      return new Response(
        JSON.stringify({
          message: "Error de validación",
          errors: validationResult.error.errors.map(e => ({
            path: e.path.join("."),
            message: e.message
          }))
        }),
        { status: 400 }
      );
    }

    // Crear el documento principal sin los branches
    const { branches, ...mainData } = validationResult.data;
    const dataToStore = {
      ...mainData,
      participations: 0,
      created_by: uid,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await firestore.collection("ethical_routes").add(dataToStore);

    // Función recursiva para crear subcolecciones de branches
    const createBranchesSubcollection = async (
      parentRef: admin.firestore.DocumentReference,
      branches: Record<string, any>,
      level: number = 0
    ) => {
      if (level >= 20) {
        throw new Error("La profundidad máxima de ramas es 20 niveles");
      }

      for (const [key, value] of Object.entries(branches)) {
        const { branches: nestedBranches, ...branchData } = value;
        
        // Crear el documento de la rama con ID automático
        const branchRef = parentRef.collection("branches").doc();
        await branchRef.set({
          ...branchData,
          answer: branchData.answer || key, // Usar la clave como respuesta si no se proporciona
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        // Si hay ramas anidadas, procesarlas recursivamente
        if (nestedBranches) {
          await createBranchesSubcollection(branchRef, nestedBranches, level + 1);
        }
      }
    };

    // Crear las subcolecciones de branches
    await createBranchesSubcollection(docRef, branches);

    return new Response(
      JSON.stringify({ message: "Ruta ética creada con éxito", id: docRef.id }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al procesar la solicitud POST /api/ethical-routes:", error);
    return new Response(
      JSON.stringify({ 
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
};
