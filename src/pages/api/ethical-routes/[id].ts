import type { APIRoute } from "astro";
import { firestore } from "@lib/firebase/server";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

const updateSchema = z.object({
  question: z.string().optional(),
  description: z.string().optional(),
  participations: z.number().int().nonnegative().optional(),
  branches: z.record(z.any()).optional(),
  created_at: z.union([z.string(), z.date()]).optional(),
});

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return new Response("Bad Request", { status: 400 });

  const doc = await firestore.collection("ethical_routes").doc(id).get();
  if (!doc.exists) return new Response("Not Found", { status: 404 });

  return new Response(JSON.stringify({ documentId: doc.id, ...doc.data() }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const { id } = params;
  if (!id) return new Response("Bad Request", { status: 400 });

  const body = await request.json();
  const parse = updateSchema.safeParse(body);
  if (!parse.success) {
    return new Response(JSON.stringify({ error: parse.error.errors }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  const dataToUpdate: Record<string, any> = { ...parse.data };
  if (parse.data.created_at) {
    // convierte string o Date en Timestamp
    const d =
      typeof parse.data.created_at === "string"
        ? new Date(parse.data.created_at)
        : parse.data.created_at;
    dataToUpdate.created_at = Timestamp.fromDate(d);
  }

  await firestore.collection("ethical_routes").doc(id).update(dataToUpdate);
  return new Response(null, { status: 204 });
};

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return new Response("Bad Request", { status: 400 });

  await firestore.collection("ethical_routes").doc(id).delete();
  return new Response(null, { status: 204 });
};
