import { z } from "zod";
import type { BranchType } from "@lib/types";

export const BranchSchema: z.ZodType<BranchType> = z.lazy(() =>
  z.object({
    conclusion: z.string().trim().optional(),
    advice: z.string().trim().optional(),
    comentario_final: z.string().trim().optional(),
    question: z.string().trim().optional(),
    branches: z.record(BranchSchema).optional(),
  })
);

export const EthicalRouteSchema = z.object({
  question: z.string().trim().min(1, { message: "La pregunta es requerida." }),
  description: z.string().trim().min(1, { message: "La descripción es requerida." }),
  participations: z.number().int().nonnegative().optional().default(0),
  branches: z.record(BranchSchema),
});

export const EthicalRouteUpdateSchema = z.object({
  question: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  participations: z.number().int().nonnegative().optional(),
  branches: z.record(BranchSchema).optional(),
}); 