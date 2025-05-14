import { createSignal, onMount, Show } from "solid-js";
import { z } from "zod";
import { firestore } from "@lib/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { BranchType } from "@lib/types";

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

export type EthicalRouter = z.infer<typeof EthicalRouterSchema>;

const EthicalRouteDropzone = () => {
  const [docId, setDocId] = createSignal<string | null>(null);
  const [isDragging, setIsDragging] = createSignal(false);
  const [file, setFile] = createSignal<File | null>(null);
  const [jsonData, setJsonData] = createSignal<EthicalRouter | null>(null);
  const [isValid, setIsValid] = createSignal<boolean | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [isUploading, setIsUploading] = createSignal(false);
  const [uploadSuccess, setUploadSuccess] = createSignal(false);
  let dropzoneRef: HTMLDivElement | undefined;
  let fileInputRef: HTMLInputElement | undefined;

  // Configurar los event listeners en el montaje para asegurarnos de que funcionan en Astro
  onMount(() => {
    if (dropzoneRef) {
      dropzoneRef.addEventListener("dragenter", handleDragEnter);
      dropzoneRef.addEventListener("dragover", handleDragOver);
      dropzoneRef.addEventListener("dragleave", handleDragLeave);
      dropzoneRef.addEventListener("drop", handleDrop);
      dropzoneRef.addEventListener("click", () => {
        fileInputRef?.click();
      });
    }
  });

  // Manipuladores de eventos para el dropzone
  const handleDragEnter = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging()) setIsDragging(true);
  };

  const validateAndProcessFile = async (file: File) => {
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setError("Solo se permiten archivos JSON");
      setIsValid(false);
      return;
    }

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      // Validar con Zod
      const result = EthicalRouterSchema.safeParse(json);

      if (result.success) {
        setJsonData(result.data);
        setIsValid(true);
        setError(null);
      } else {
        setIsValid(false);
        setError(
          `Error de validación: ${result.error.errors
            .map((e) => `${e.path.join(".")} - ${e.message}`)
            .join(", ")}`
        );
      }
    } catch (err) {
      setIsValid(false);
      setError(
        `Error al procesar el archivo: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsValid(null);
    setError(null);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const newFile = e.dataTransfer.files[0];
      setFile(newFile);
      await validateAndProcessFile(newFile);
    }
  };

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const newFile = input.files[0];
      setFile(newFile);
      await validateAndProcessFile(newFile);
    }
  };

  const resetForm = () => {
    setFile(null);
    setJsonData(null);
    setIsValid(null);
    setError(null);
    setUploadSuccess(false);
    setDocId(null);
    if (fileInputRef) {
      fileInputRef.value = "";
    }
  };

  const uploadToFirestore = async () => {
    const data = jsonData();
    if (!data || !isValid()) return;

    setIsUploading(true);
    try {
      const res = await fetch("/api/ethical-routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error desconocido");

      setDocId(result.id);
      setUploadSuccess(true);
    } catch (err) {
      setError(
        `Error al subir a API: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div class="w-full max-w-md">
      <div
        ref={dropzoneRef}
        class={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer mb-4 transition-colors
          ${
            isDragging()
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="fileInput"
          class="hidden"
          accept=".json,application/json"
          onChange={handleFileSelect}
        />

        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12 mx-auto text-zinc-400 dark:text-zinc-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <p class="text-zinc-600 dark:text-zinc-300 mb-2 text-sm">
          Arrastra y suelta tu archivo JSON aquí
        </p>
        <p class="text-zinc-500 dark:text-zinc-400 text-xs">
          o haz clic para seleccionar un archivo
        </p>
      </div>

      <Show when={file()}>
        <div class="mb-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <h3 class="font-medium text-zinc-800 dark:text-zinc-200 mb-2 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {file()?.name}
          </h3>

          <Show when={isValid() === true}>
            <div class="text-green-600 dark:text-green-400 text-sm mb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Archivo válido
            </div>

            <div class="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
              <p>Pregunta principal: {jsonData()?.question}</p>
              <p>Descripción: {jsonData()?.description}</p>
            </div>
          </Show>

          <Show when={isValid() === false}>
            <div class="text-red-600 dark:text-red-400 text-sm flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Error de validación
            </div>
            <div class="mt-1 text-xs text-red-500 dark:text-red-400">
              {error()}
            </div>
          </Show>
        </div>
      </Show>

      <Show when={error() && !file()}>
        <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
          {error()}
        </div>
      </Show>

      <Show when={!uploadSuccess()}>
        <button
          onClick={uploadToFirestore}
          disabled={!isValid() || isUploading()}
          class={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors
      ${
        isValid() && !isUploading()
          ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          : "bg-zinc-400 dark:bg-zinc-700 cursor-not-allowed"
      }`}
        >
          {isUploading() ? (
            <span class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Subiendo...
            </span>
          ) : (
            "Subir a Firestore"
          )}
        </button>
      </Show>

      <Show when={uploadSuccess() && docId()}>
        <div class="flex gap-2 mt-4">
          <a
            href={`/edit/${docId()}`}
            class="w-full text-center py-2 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors"
          >
            Ver
          </a>
          <button
            onClick={resetForm}
            class="w-full py-2 px-4 rounded-lg font-medium text-white bg-zinc-600 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-800 transition-colors"
          >
            Nuevo
          </button>
        </div>
      </Show>
    </div>
  );
};

export default EthicalRouteDropzone;
