import { z } from "zod";

type BranchType = {
  question?: string;
  answer?: string;
  branches?: Record<string, BranchType>;
  conclusion?: string;
  advice?: string;
  comentario_final?: string;
};

const BranchSchema: z.ZodType<BranchType> = z.object({
  question: z.string().trim().min(1).optional(),
  answer: z.string().trim().min(1).optional(),
  branches: z.record(z.lazy(() => BranchSchema)).optional(),
  conclusion: z.string().trim().min(1).optional(),
  advice: z.string().trim().min(1).optional(),
  comentario_final: z.string().trim().min(1).optional(),
}).transform((data, ctx) => {
  // Si no hay answer, usar la clave del objeto
  if (!data.answer && ctx.path.length > 0) {
    const key = ctx.path[ctx.path.length - 1];
    if (typeof key === 'string') {
      return { ...data, answer: key };
    }
  }
  return data;
});

export const EthicalRouteSchema = z.object({
  question: z.string().trim().min(1, "La pregunta es requerida"),
  description: z.string().trim().min(1, "La descripción es requerida"),
  branches: z.record(BranchSchema).refine(
    (branches) => Object.keys(branches).length > 0,
    {
      message: "Debe haber al menos una rama"
    }
  ),
});

export const EthicalRouteUpdateSchema = z.object({
  question: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  participations: z.number().int().nonnegative().optional(),
  branches: z.record(BranchSchema).optional(),
}); 