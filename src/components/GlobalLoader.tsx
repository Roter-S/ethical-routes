import { createSignal, onMount } from "solid-js";

export default function GlobalLoader() {
  const [isLoading, setIsLoading] = createSignal(false);

  onMount(() => {
    // Mostrar loader al iniciar navegación
    document.addEventListener("astro:before-preparation", () => {
      setIsLoading(true);
    });

    // Ocultar loader cuando la navegación está completa
    document.addEventListener("astro:after-swap", () => {
      setIsLoading(false);
    });

    // Mostrar loader durante la recarga de página
    window.addEventListener("beforeunload", () => {
      setIsLoading(true);
    });

    // Si la página se está cargando inicialmente, mostrar el loader
    if (document.readyState !== "complete") {
      setIsLoading(true);
      window.addEventListener("load", () => {
        setIsLoading(false);
      });
    }
  });

  return (
    <div
      class="fixed inset-0 bg-black/10 dark:bg-black/30 backdrop-blur-[2px] z-50 flex items-center justify-center transition-all duration-300"
      classList={{ 
        "opacity-0 pointer-events-none": !isLoading(), 
        "opacity-100": isLoading() 
      }}
    >
      <div class="relative">
        <div class="w-16 h-16 border-2 border-violet-200/30 dark:border-violet-700/30 rounded-full">
          <div class="absolute inset-0 w-16 h-16 border-2 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
} 