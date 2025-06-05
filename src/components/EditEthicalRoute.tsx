import { createSignal, Show } from "solid-js";
import type { EthicalRouteTypeWithId, BranchType } from "@lib/types";
import { DeleteDialog } from "./DeleteDialog";
import ButtonLoading from "./ButtonLoading";
import JsonEditor from "./JsonEditor";

interface Props {
  id: string;
  initialData?: EthicalRouteTypeWithId & {
    branches?: Record<string, BranchType>;
  };
}

export default function EditEthicalRoute(props: Props) {
  const [routeData, setRouteData] = createSignal(props.initialData);
  const [isLoading, setIsLoading] = createSignal(!props.initialData);
  const [error, setError] = createSignal<string | null>(null);
  const [isSaving, setIsSaving] = createSignal(false);

  if (!props.initialData) {
    fetchRouteData();
  }

  async function fetchRouteData() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/ethical-routes/${props.id}`);
      if (!res.ok) throw new Error("No existe");
      const data = await res.json();
      setRouteData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);

    try {
      const res = await fetch(`/api/ethical-routes/${props.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: fd.get("question"),
          description: fd.get("description"),
          branches: JSON.parse(fd.get("branches") as string),
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar los cambios");
      }

      window.location.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div class="w-full mx-auto max-w-3xl mt-10">
      <Show
        when={!isLoading() && routeData()}
        fallback={
          <div class="p-4 text-center">
            {error() ? (
              <div class="text-red-600">Error: {error()}</div>
            ) : (
              <div>Cargando...</div>
            )}
          </div>
        }
      >
        {(data) => (
          <>
            <h1 class="font-semibold sm:text-2xl text-xl dark:text-zinc-100 text-zinc-900 w-full mb-4">
              Editar Caso Ético
            </h1>

            {error() && (
              <div class="bg-red-100 text-red-700 p-3 mb-4 rounded">
                {error()}
              </div>
            )}

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
                  value={data().question || ""}
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
                  class="w-full p-2 border rounded min-h-[100px] text-zinc-600 dark:text-zinc-300"
                >
                  {data().description || ""}
                </textarea>
              </div>

              <div>
                <label
                  for="branches"
                  class="block mb-2 font-medium text-zinc-600 dark:text-zinc-300"
                >
                  Branches (JSON)
                </label>
                <JsonEditor
                  value={JSON.stringify(data().branches || {}, null, 2)}
                  onChange={(value) => {
                    const form = document.querySelector('form') as HTMLFormElement;
                    const fd = new FormData(form);
                    fd.set('branches', value);
                  }}
                />
              </div>

              <div class="flex flex-col sm:flex-row gap-2 mt-4">
                <ButtonLoading
                  type="submit"
                  loading={isSaving()}
                  class="flex gap-1 text-violet-600 hover:text-violet-700 border border-violet-200 dark:border-violet-800 dark:hover:border-violet-500 dark:hover:text-white hover:border-violet-300 dark:text-violet-200 dark:bg-violet-800 dark:hover:bg-violet-700 bg-violet-200 px-3 py-2 rounded-md font-medium text-sm items-center justify-center transition-colors duration-150"
                  loadingText="Guardando..."
                >
                  Guardar Cambios
                </ButtonLoading>
                <DeleteDialog documentId={props.id} buttonClass="flex gap-1 text-red-600 hover:text-red-700 border border-red-200 dark:border-red-800 dark:hover:border-red-500 dark:hover:text-white hover:border-red-300 dark:text-red-200 dark:bg-red-800 dark:hover:bg-red-700 bg-red-200 px-3 py-2 rounded-md font-medium text-sm items-center justify-center transition-colors duration-150" />
              </div>
            </form>
          </>
        )}
      </Show>
    </div>
  );
}
