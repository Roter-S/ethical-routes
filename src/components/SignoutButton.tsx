import { auth } from "@lib/firebase/client";
import { signOut } from "firebase/auth";

interface SignoutButtonProps {
  class?: string;
}

export default function SignoutButton({
  class: _class = "",
}: SignoutButtonProps) {
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });

      await signOut(auth);

      document.cookie.split(";").forEach((c) => {
        const cookieString = c
          .trim()
          .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
        document.cookie = cookieString;
      });
    } catch (error) {
      console.error("Error durante el proceso de cierre de sesión:", error);
    } finally {
      window.location.replace("/signin");
    }
  };

  return (
    <button
      onClick={handleSignOut}
      class={`border border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400 hover:text-zinc-700 hover:border-zinc-600 dark:hover:text-zinc-100 dark:hover:border-zinc-100 transition-all px-3 sm:px-4 py-1.5 sm:py-1 rounded-md text-sm sm:text-base font-medium ${_class}`}
      aria-label="Cerrar sesión"
    >
      <span class="hidden sm:inline">Cerrar sesión</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 sm:hidden"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
    </button>
  );
}
