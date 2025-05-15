import { AlertDialog } from "@kobalte/core";
import style from "../styles/dialog.module.css";
import { createSignal } from "solid-js";
import ButtonLoading from "./ButtonLoading";

async function deleteRecord(documentId?: string, setLoading?: (v: boolean) => void) {
  if (!documentId) return;
  if (setLoading) setLoading(true);
  const res = await fetch(`/api/ethical-routes/${documentId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: "Error al procesar la respuesta del servidor." }));
    console.error("Error al eliminar el registro:", data.message || "Error desconocido");
    if (setLoading) setLoading(false);
    return data;
  }

  window.location.replace("/dashboard");
}

export function DeleteDialog({ documentId, buttonClass }: { documentId?: string, buttonClass?: string }) {
  const [isLoading, setIsLoading] = createSignal(false);
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger class={buttonClass ?? "bg-red-600 hover:bg-red-700 border border-red-700 focus:ring-2 focus:ring-red-400 focus:outline-none text-white py-1.5 px-4 rounded-md font-medium text-sm transition-colors duration-150"}>
        Eliminar ruta
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay class={style.overlay} />
        <div class="fixed z-50 flex items-center justify-center inset-0">
          <AlertDialog.Content class="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-8 transition-all">
            <AlertDialog.Title class="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              ¿Estás completamente seguro?
            </AlertDialog.Title>
            <AlertDialog.Description class="text-zinc-600 dark:text-zinc-300 my-4">
              Esta acción no se puede deshacer. Esto eliminará permanentemente la ruta ética de nuestros servidores.
            </AlertDialog.Description>
            <div class="flex justify-end gap-3 mt-6">
              <AlertDialog.CloseButton class="inline-block bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 py-2 px-4 font-medium rounded-md text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-300 text-sm transition-colors">
                Cancelar
              </AlertDialog.CloseButton>
              <ButtonLoading
                loading={isLoading()}
                onClick={() => deleteRecord(documentId, setIsLoading)}
                class="inline-block bg-red-600 hover:bg-red-700 border border-red-700 focus:ring-2 focus:ring-red-400 focus:outline-none text-white py-2 px-4 rounded-md font-medium text-sm flex items-center justify-center transition-colors duration-150"
                loadingText="Eliminando..."
              >
                Sí, eliminar ruta
              </ButtonLoading>
            </div>
          </AlertDialog.Content>
        </div>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
