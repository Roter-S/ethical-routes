import { auth } from "@lib/firebase/client";
import { signOut } from "firebase/auth";

export default function SignoutButton() {
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });

      await signOut(auth);

      document.cookie.split(";").forEach((c) => {
        const cookieString = c.trim().replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
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
      class="border border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-500 hover:text-zinc-700 hover:border-zinc-600 font-normal dark:hover:text-zinc-100 dark:hover:border-zinc-100 transition-all px-4 py-1 rounded-md"
    >
      Cerrar sesión
    </button>
  );
}
