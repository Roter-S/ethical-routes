import type { APIRoute } from "astro";
import { firestore, auth as adminAuth } from "@lib/firebase/server";
import admin from "firebase-admin";
import { EthicalRouteUpdateSchema } from "@lib/ethicalRouteSchemas";

async function verifyAdmin(request: Request, cookies: any): Promise<boolean> {
  const sessionCookieValue = cookies.get("session")?.value;
  if (!sessionCookieValue) return false;
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookieValue, true);
    const userDoc = await firestore.collection("users").doc(decodedClaims.uid).get();
    return userDoc.exists && userDoc.data()?.role === "admin";
  } catch {
    return false;
  }
}

export const GET: APIRoute = async ({ params, cookies }) => {
  const sessionCookieValue = cookies.get("session")?.value;
  if (!sessionCookieValue) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }
  try {
    await adminAuth.verifySessionCookie(sessionCookieValue, true);
  } catch {
    return new Response(JSON.stringify({ error: "Sesión inválida" }), { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID de ruta no proporcionado" }), { status: 400 });
  }

  try {
    const docRef = firestore.collection("ethical_routes").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return new Response(JSON.stringify({ error: "Ruta ética no encontrada" }), { status: 404 });
    }
    return new Response(JSON.stringify({ documentId: docSnap.id, ...docSnap.data() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Error en GET /api/ethical-routes/${id}:`, error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const isAdmin = await verifyAdmin(request, cookies);
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Acceso denegado: se requiere rol de administrador" }), { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID de ruta no proporcionado" }), { status: 400 });
  }

  try {
    const body = await request.json();
    const validationResult = EthicalRouteUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          message: "Error de validación",
          errors: validationResult.error.flatten().fieldErrors,
        }),
        { status: 422 }
      );
    }

    if (Object.keys(validationResult.data).length === 0) {
      return new Response(JSON.stringify({ error: "No se proporcionaron datos para actualizar" }), { status: 400 });
    }

    const dataToUpdate = {
      ...validationResult.data,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = firestore.collection("ethical_routes").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return new Response(JSON.stringify({ error: "Ruta ética no encontrada para actualizar" }), { status: 404 });
    }

    await docRef.update(dataToUpdate);
    return new Response(null, { status: 204 });

  } catch (error) {
    console.error(`Error en PATCH /api/ethical-routes/${id}:`, error);
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return new Response(JSON.stringify({ error: "Cuerpo de la solicitud JSON malformado" }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  const isAdmin = await verifyAdmin(request, cookies);
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Acceso denegado: se requiere rol de administrador" }), { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID de ruta no proporcionado" }), { status: 400 });
  }

  try {
    const docRef = firestore.collection("ethical_routes").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return new Response(JSON.stringify({ error: "Ruta ética no encontrada para eliminar" }), { status: 404 });
    }

    await docRef.delete();
    return new Response(null, { status: 204 });

  } catch (error) {
    console.error(`Error en DELETE /api/ethical-routes/${id}:`, error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
};
