import { auth } from "@lib/firebase/server";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ cookies }) => {
  const sessionCookie = cookies.get("session")?.value;
  if (sessionCookie) {
    try {
      const { uid } = await auth.verifySessionCookie(sessionCookie, true);
      await auth.revokeRefreshTokens(uid);
    } catch {
      console.error("Error revoking refresh tokens");
    }
  }

  cookies.set("session", "", {
    path: "/",
    expires: new Date(0),
  });

  return new Response(null, { status: 204 });
};
