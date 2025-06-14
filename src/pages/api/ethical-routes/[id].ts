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

export const GET: APIRoute = async ({ params }) => {
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

    // Función recursiva para obtener todas las ramas
    const getBranches = async (parentRef: admin.firestore.DocumentReference) => {
      const branchesSnapshot = await parentRef.collection("branches").get();
      const branches: Record<string, any> = {};

      for (const branchDoc of branchesSnapshot.docs) {
        const branchData = branchDoc.data();
        const nestedBranches = await getBranches(parentRef.collection("branches").doc(branchDoc.id));
        
        if (Object.keys(nestedBranches).length > 0) {
          branches[branchDoc.id] = {
            ...branchData,
            branches: nestedBranches
          };
        } else {
          branches[branchDoc.id] = branchData;
        }
      }

      return branches;
    };

    const routeData = docSnap.data();
    const branches = await getBranches(docRef);

    return new Response(
      JSON.stringify({
        documentId: docSnap.id,
        ...routeData,
        branches
      }),
      {
      status: 200,
      headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(`Error en GET /api/ethical-routes/${id}:`, error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const sessionCookieValue = cookies.get("session")?.value;
  if (!sessionCookieValue) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }
  let decodedIdToken;
  try {
    decodedIdToken = await adminAuth.verifySessionCookie(sessionCookieValue, true);
  } catch {
    return new Response(JSON.stringify({ error: "Sesión inválida" }), { status: 401 });
  }
  const uid = decodedIdToken.uid;

  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: "ID de ruta no proporcionado" }), { status: 400 });
  }

  try {
    const docRef = firestore.collection("ethical_routes").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return new Response(JSON.stringify({ error: "Ruta ética no encontrada para actualizar" }), { status: 404 });
    }
    const routeData = docSnap.data();
    if (!routeData) {
      return new Response(JSON.stringify({ error: "Datos de la ruta no disponibles" }), { status: 500 });
    }
    // Verificar permisos: admin puede editar todo, user solo si es el creador
    const userDoc = await firestore.collection("users").doc(uid).get();
    const userRole = userDoc.exists ? userDoc.data()?.role : "user";
    const isAdmin = userRole === "admin";
    if (!isAdmin && routeData.created_by !== uid) {
      return new Response(JSON.stringify({ error: "Acceso denegado: solo puedes editar tus propias rutas" }), { status: 403 });
    }

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

    const { branches, ...mainData } = validationResult.data;
    const dataToUpdate = {
      ...mainData,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Actualizar el documento principal
    await docRef.update(dataToUpdate);

    // Si hay branches, actualizar las subcolecciones
    if (branches) {
      // Función recursiva para actualizar subcolecciones
      const updateBranches = async (
        parentRef: admin.firestore.DocumentReference,
        branches: Record<string, any>
      ) => {
        // Obtener las ramas existentes
        const existingBranches = await parentRef.collection("branches").get();
        const existingBranchesMap = new Map(
          existingBranches.docs.map(doc => [doc.id, doc.ref])
        );

        // Actualizar o crear ramas según sea necesario
        for (const [key, value] of Object.entries(branches)) {
          const { branches: nestedBranches, ...branchData } = value;
          
          // Buscar una rama existente que coincida con la clave
          let branchRef = existingBranchesMap.get(key);
          
          // Si no existe una rama con ese ID, crear una nueva
          if (!branchRef) {
            branchRef = parentRef.collection("branches").doc();
          }

          // Actualizar o crear el documento de la rama
          await branchRef.set({
            ...branchData,
            answer: branchData.answer || key,
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });

          // Si hay ramas anidadas, procesarlas recursivamente
          if (nestedBranches) {
            await updateBranches(branchRef, nestedBranches);
          }
        }

        // Eliminar las ramas que ya no existen
        const currentKeys = new Set(Object.keys(branches));
        for (const [id, ref] of existingBranchesMap.entries()) {
          if (!currentKeys.has(id)) {
            await ref.delete();
          }
        }
      };

      await updateBranches(docRef, branches);
    }

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

    // Función recursiva para eliminar subcolecciones
    const deleteSubcollections = async (docRef: admin.firestore.DocumentReference) => {
      const collections = await docRef.listCollections();
      
      for (const collection of collections) {
        const snapshot = await collection.get();
        
        for (const doc of snapshot.docs) {
          // Eliminar subcolecciones recursivamente
          await deleteSubcollections(doc.ref);
          // Eliminar el documento
          await doc.ref.delete();
        }
      }
    };

    // Eliminar todas las subcolecciones primero
    await deleteSubcollections(docRef);
    
    // Finalmente, eliminar el documento principal
    await docRef.delete();

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Error en DELETE /api/ethical-routes/${id}:`, error);
    return new Response(
      JSON.stringify({ 
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : String(error)
      }), 
      { status: 500 }
    );
  }
};
