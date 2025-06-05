import { createSignal } from "solid-js";
import type { EthicalRouteType } from "@lib/types";
import ButtonLoading from "./ButtonLoading";
import JsonEditor from "./JsonEditor";
import { z } from "zod";

type BranchType = {
    question?: string;
    branches?: Record<string, BranchType>;
    conclusion?: string;
    advice?: string;
    comentario_final?: string;
};

export default function CreateEthicalRoute() {
    const [isSaving, setIsSaving] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);
    const [jsonError, setJsonError] = createSignal<string | null>(null);
    const [jsonValue, setJsonValue] = createSignal("{}");

    const BranchSchema: z.ZodType<BranchType> = z.object({
        question: z.string().optional(),
        branches: z.record(z.lazy(() => BranchSchema)).optional(),
        conclusion: z.string().optional(),
        advice: z.string().optional(),
        comentario_final: z.string().optional(),
    }).refine(
        (data) => {
            return data.question || data.conclusion || data.advice || data.comentario_final;
        },
        {
            message: "Cada rama debe tener al menos una de estas propiedades: question, conclusion, advice o comentario_final"
        }
    );

    const validateJson = (jsonStr: string) => {
        try {
            if (!jsonStr || jsonStr === "{}") {
                setJsonError(null);
                return true;
            }

            const json = JSON.parse(jsonStr);
            const result = z.record(BranchSchema).safeParse(json);

            if (!result.success) {
                const errors = result.error.errors.map(err => err.message).join(", ");
                setJsonError(errors);
                return false;
            }

            setJsonError(null);
            return true;
        } catch (e) {
            setJsonError("JSON inválido");
            return false;
        }
    };

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        const form = e.currentTarget as HTMLFormElement;
        const fd = new FormData(form);

        try {
            const branches = jsonValue();
            if (!validateJson(branches)) {
                throw new Error("El JSON no tiene la estructura correcta");
            }

            const data: Partial<EthicalRouteType> = {
                question: fd.get("question") as string,
                description: fd.get("description") as string,
                branches: JSON.parse(branches),
            };

            const res = await fetch("/api/ethical-routes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error("Error al crear el caso ético");
            }

            const result = await res.json();
            window.location.replace(`/edit/${result.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div class="w-full mx-auto max-w-3xl mt-10">
            <h1 class="font-semibold sm:text-2xl text-xl dark:text-zinc-100 text-zinc-900 w-full mb-4">
                Crear Nuevo Caso Ético
            </h1>

            <form onSubmit={handleSubmit} class="flex flex-col gap-4">
                <div>
                    <label
                        for="question"
                        class="block mb-2 font-medium text-zinc-600 dark:text-zinc-300"
                    >
                        Pregunta
                    </label>
                    <input
                        type="text"
                        name="question"
                        id="question"
                        required
                        class="w-full p-2 border rounded text-zinc-600 dark:text-zinc-300"
                    />
                </div>

                <div>
                    <label
                        for="description"
                        class="block mb-2 font-medium text-zinc-600 dark:text-zinc-300"
                    >
                        Descripción
                    </label>
                    <textarea
                        name="description"
                        id="description"
                        required
                        class="w-full p-2 border rounded min-h-[100px] text-zinc-600 dark:text-zinc-300"
                    />
                </div>

                <div>
                    <label
                        for="branches"
                        class="block mb-2 font-medium text-zinc-600 dark:text-zinc-300"
                    >
                        Branches (JSON)
                    </label>
                    <div class="mb-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <p class="text-sm text-zinc-600 dark:text-zinc-300 mb-2">
                            Estructura del JSON para las ramas del caso ético:
                        </p>
                        <pre class="text-xs font-mono bg-zinc-100 dark:bg-zinc-900 p-3 rounded overflow-x-auto text-zinc-800 dark:text-zinc-200">
                            {`{
  "si": {
    "question": "¿Has revisado la documentación?",
    "branches": {
      "si": {
        "conclusion": "Buenas prácticas",
        "advice": "Continúa siguiendo la documentación",
        "comentario_final": "La documentación es tu mejor amiga"
      },
      "no": {
        "conclusion": "Riesgo alto",
        "advice": "Detente y consulta la documentación",
        "comentario_final": "Sin documentación, estás navegando a ciegas"
      }
    }
  }
}`}
                        </pre>
                        <p class="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
                            Cada rama debe tener al menos una de estas propiedades:
                        </p>
                        <ul class="text-sm text-zinc-600 dark:text-zinc-300 list-disc list-inside mt-1">
                            <li><code class="bg-zinc-100 dark:bg-zinc-900 px-1 rounded">question</code>: Pregunta para esta rama</li>
                            <li><code class="bg-zinc-100 dark:bg-zinc-900 px-1 rounded">branches</code>: Sub-ramas con sus respuestas</li>
                            <li><code class="bg-zinc-100 dark:bg-zinc-900 px-1 rounded">conclusion</code>: Conclusión final de la rama</li>
                            <li><code class="bg-zinc-100 dark:bg-zinc-900 px-1 rounded">advice</code>: Consejo para esta conclusión</li>
                            <li><code class="bg-zinc-100 dark:bg-zinc-900 px-1 rounded">comentario_final</code>: Comentario final de la rama</li>
                        </ul>
                        <p class="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
                            En este ejemplo:
                        </p>
                        <ul class="text-sm text-zinc-600 dark:text-zinc-300 list-disc list-inside mt-1">
                            <li>La primera rama "si" tiene una pregunta</li>
                            <li>Las respuestas "si" y "no" tienen conclusiones directas</li>
                            <li>Cada conclusión incluye un consejo y un comentario final</li>
                        </ul>
                    </div>
                    {jsonError() && (
                        <div class="text-red-600 text-sm mb-2">
                            {jsonError()}
                        </div>
                    )}
                    <JsonEditor
                        value={jsonValue()}
                        onChange={(value) => {
                            setJsonValue(value);
                            validateJson(value);
                        }}
                    />
                </div>

                {error() && (
                    <div class="bg-red-200 text-red-700 p-3 rounded">
                        {error()}
                    </div>
                )}

                <div class="flex flex-col sm:flex-row gap-2 mt-4">
                    <ButtonLoading
                        type="submit"
                        loading={isSaving()}
                        class="flex gap-1 text-violet-600 hover:text-violet-700 border border-violet-200 dark:border-violet-800 dark:hover:border-violet-500 dark:hover:text-white hover:border-violet-300 dark:text-violet-200 dark:bg-violet-800 dark:hover:bg-violet-700 bg-violet-200 px-3 py-2 rounded-md font-medium text-sm items-center justify-center transition-colors duration-150"
                        loadingText="Creando..."
                    >
                        Crear Caso Ético
                    </ButtonLoading>
                </div>
            </form>
        </div>
    );
} 