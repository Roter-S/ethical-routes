import { AlertDialog } from "@kobalte/core";
import style from "../styles/dialog.module.css";

async function deleteRecord(documentId?: string) {
  if (!documentId) return;
  const res = await fetch(`/api/ethical-routes/${documentId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: "Error al procesar la respuesta del servidor." }));
    console.error("Error al eliminar el registro:", data.message || "Error desconocido");
    return data;
  }

  window.location.replace("/dashboard");
}

export function DeleteDialog({ documentId }: { documentId?: string }) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger class="dark:bg-red-600 bg-red-400 hover:bg-red-400 border-transparent py-1.5 border rounded-md mt-1 dark:text-white text-red-50 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
        Eliminar ruta
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay class={style.overlay} />
        <div class="fixed z-50 flex items-center justify-center inset-0">
          <AlertDialog.Content class={style.content}>
            <AlertDialog.Title class="text-xl font-semibold">
              ¿Estás completamente seguro?
            </AlertDialog.Title>
            <AlertDialog.Description class="text-zinc-500 my-4">
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              la ruta ética de nuestros servidores.
            </AlertDialog.Description>
            <div class="flex justify-end gap-3">
              <AlertDialog.CloseButton class="inline-block bg-zinc-100 py-1.5 px-4 font-medium rounded text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-300 hover:bg-zinc-200">
                Cancelar
              </AlertDialog.CloseButton>
              <button
                onClick={() => deleteRecord(documentId)}
                class="inline-block bg-red-100 py-1.5 px-4 font-medium rounded text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 hover:bg-red-200"
              >
                Sí, eliminar ruta
              </button>
            </div>
          </AlertDialog.Content>
        </div>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
