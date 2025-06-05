import { z } from "zod";

type BranchType = {
  question?: string;
  branches?: Record<string, BranchType>;
  conclusion?: string;
  advice?: string;
  comentario_final?: string;
};

const BranchSchema: z.ZodType<BranchType> = z.object({
  question: z.string().optional(),
  branches: z.record(z.lazy(() => BranchSchema)).optional(),
  conclusion: z.string().optional(),
  advice: z.string().optional(),
  comentario_final: z.string().optional(),
}).refine(
  (data) => {
    // Al menos debe tener una de estas propiedades
    return data.question || data.conclusion || data.advice || data.comentario_final;
  },
  {
    message: "Cada rama debe tener al menos una de estas propiedades: question, conclusion, advice o comentario_final"
  }
);

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