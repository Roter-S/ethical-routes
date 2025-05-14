import { firestore } from "@lib/firebase/server";
import type { BranchType } from "@lib/types";
import type { APIRoute } from "astro";
import { z } from "zod";

const BranchSchema: z.ZodType<BranchType> = z.lazy(() =>
  z.object({
    conclusion: z.string().optional(),
    advice: z.string().optional(),
    comentario_final: z.string().optional(),
    question: z.string().optional(),
    branches: z.record(BranchSchema).optional(),
  })
);

const EthicalRouterSchema = z.object({
  question: z.string(),
  description: z.string(),
  participations: z.number().optional().default(0),
  branches: z.record(BranchSchema),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validamos con Zod
    const parsed = EthicalRouterSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          message: "Error de validación",
          errors: parsed.error.errors,
        }),
        { status: 400 }
      );
    }

    const data = parsed.data;
    const docRef = await firestore.collection("ethical_routes").add({
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return new Response(
      JSON.stringify({ message: "Creado con éxito", id: docRef.id }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    return new Response(
      JSON.stringify({ message: "Error interno del servidor" }),
      { status: 500 }
    );
  }
};
