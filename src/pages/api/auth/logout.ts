import { auth } from "@lib/firebase/server";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const sessionCookieValue = cookies.get("session")?.value;

  if (sessionCookieValue) {
    try {
      const decodedClaims = await auth.verifySessionCookie(sessionCookieValue, true);
      await auth.revokeRefreshTokens(decodedClaims.uid);
    } catch (error) {
      console.error("Error durante la verificación de la cookie de sesión o la revocación de tokens:", error);
    }
  }

  cookies.delete("session", {
    path: "/",
  });


  return new Response(null, { status: 204 });
};
