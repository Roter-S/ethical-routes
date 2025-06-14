import { createSignal, onMount, Show } from "solid-js";
import { EthicalRouteSchema } from "@lib/ethicalRouteSchemas";
import type { EthicalRouteType } from "@lib/types";
import UploadIcon from "@components/icons/UploadIcon";
import DocumentIcon from "@components/icons/DocumentIcon";
import CheckIcon from "@components/icons/CheckIcon";
import ErrorIcon from "@components/icons/ErrorIcon";
import SpinnerIcon from "@components/icons/SpinnerIcon";

export type EthicalRouter = typeof EthicalRouteSchema._type;

const EthicalRouteDropzone = () => {
  const [docId, setDocId] = createSignal<string | null>(null);
  const [isDragging, setIsDragging] = createSignal(false);
  const [file, setFile] = createSignal<File | null>(null);
  const [jsonData, setJsonData] =
    createSignal<Partial<EthicalRouteType> | null>(null);
  const [isValid, setIsValid] = createSignal<boolean | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [isUploading, setIsUploading] = createSignal(false);
  const [uploadSuccess, setUploadSuccess] = createSignal(false);
  let dropzoneRef: HTMLDivElement | undefined;
  let fileInputRef: HTMLInputElement | undefined;

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
      console.log("JSON a validar:", json); // Para depuración
      const result = EthicalRouteSchema.safeParse(json);
      if (result.success) {
        setJsonData(result.data);
        setIsValid(true);
        setError(null);
      } else {
        setIsValid(false);
        const errorDetails = result.error.errors.map((e) => {
          const path = e.path.join(".");
          return `${path ? `Campo '${path}': ` : ""}${e.message}`;
        });
        setError(
          `Error de validación:\n${errorDetails.join("\n")}`
        );
        console.error("Errores de validación:", result.error); // Para depuración
      }
    } catch (err) {
      setIsValid(false);
      setError(
        `Error al procesar el archivo: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      console.error("Error al procesar el archivo:", err); // Para depuración
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
    <div class="w-full">
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
        <UploadIcon class="h-12 w-12 mx-auto text-zinc-400 dark:text-zinc-500 mb-4" />
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
            <DocumentIcon class="h-4 w-4 mr-2" />
            {file()?.name}
          </h3>
          <Show when={isValid() === true}>
            <div class="text-green-600 dark:text-green-400 text-sm mb-2 flex items-center">
              <CheckIcon class="h-4 w-4 mr-1" />
              Archivo válido
            </div>

            <div class="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
              <p>Pregunta principal: {jsonData()?.question}</p>
              <p>Descripción: {jsonData()?.description}</p>
            </div>
          </Show>

          <Show when={isValid() === false}>
            <div class="text-red-600 dark:text-red-400 text-sm flex items-center">
              <ErrorIcon class="h-4 w-4 mr-1" />
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
          class={`w-full py-2 px-4 rounded-md font-medium text-sm flex items-center justify-center transition-colors duration-150
            ${
              isValid() && !isUploading()
                ? "bg-blue-600 hover:bg-blue-700 border border-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none text-white"
                : "bg-zinc-400 dark:bg-zinc-700 cursor-not-allowed text-white border border-zinc-400 dark:border-zinc-700"
            }
          `}
        >
          {isUploading() ? (
            <span class="flex items-center justify-center">
              <SpinnerIcon class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
              Subiendo...
            </span>
          ) : (
            "Crear"
          )}
        </button>
      </Show>

      <Show when={uploadSuccess() && docId()}>
        <div class="flex gap-2 mt-4">
          <a
            href={`/edit/${docId()}`}
            class="w-full text-center py-2 px-4 rounded-md font-medium text-sm text-white bg-green-600 hover:bg-green-700 border border-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none transition-colors"
          >
            Ver
          </a>
          <button
            onClick={resetForm}
            class="w-full py-2 px-4 rounded-md font-medium text-sm text-white bg-zinc-600 hover:bg-zinc-700 border border-zinc-700 focus:ring-2 focus:ring-zinc-400 focus:outline-none transition-colors"
          >
            Nuevo
          </button>
        </div>
      </Show>
    </div>
  );
};

export default EthicalRouteDropzone;
