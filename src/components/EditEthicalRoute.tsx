import { createSignal, Show } from "solid-js";
import type { EthicalRouteTypeWithId, BranchType } from "@lib/types";

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
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);

    try {
      const res = await fetch(`/api/ethical-routes/${props.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: fd.get("question"),
          description: fd.get("description"),
          participations: Number(fd.get("participations")),
          branches: JSON.parse(fd.get("branches") as string),
        }),
      });

      if (!res.ok) {
        throw new Error("Error al guardar los cambios");
      }

      window.location.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro de borrar?")) return;

    try {
      const res = await fetch(`/api/ethical-routes/${props.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Error al eliminar");
      }
      window.location.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
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
            <a
              href="/dashboard/"
              class="flex text-zinc-500 gap-1 items-center mb-4 text-sm hover:text-zinc-600 dark:hover:text-zinc-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
                />
              </svg>
              Volver al dashboard
            </a>

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
                  for="participations"
                  class="block mb-2 font-medium text-zinc-600 dark:text-zinc-300"
                >
                  Participaciones
                </label>
                <input
                  type="number"
                  name="participations"
                  id="participations"
                  value={data().participations || 0}
                  class="w-full p-2 border rounded text-zinc-600 dark:text-zinc-300"
                />
              </div>

              <div>
                <label
                  for="branches"
                  class="block mb-2 font-medium text-zinc-600 dark:text-zinc-300"
                >
                  Branches (JSON)
                </label>
                <textarea
                  name="branches"
                  id="branches"
                  class="w-full p-2 border rounded min-h-[200px] font-mono text-sm text-zinc-600 dark:text-zinc-300"
                >
                  {JSON.stringify(data().branches || {}, null, 2)}
                </textarea>
              </div>

              <div class="flex flex-col sm:flex-row gap-2 mt-4">
                <button
                  type="submit"
                  class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  class="bg-white hover:bg-red-50 text-red-600 border border-red-300 py-2 px-4 rounded dark:bg-zinc-800 dark:border-red-700 dark:text-red-400"
                >
                  Eliminar
                </button>
              </div>
            </form>
          </>
        )}
      </Show>
    </div>
  );
}
