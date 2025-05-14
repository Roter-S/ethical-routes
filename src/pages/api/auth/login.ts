import type { APIRoute } from "astro";
import { auth } from "@lib/firebase/server";
import { syncUserToFirestore } from "@lib/syncUser";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const { idToken }: { idToken?: string } = await request.json();
    if (!idToken) {
      return new Response(JSON.stringify({ error: "Token no proporcionado" }), {
        status: 400,
      });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    await syncUserToFirestore({
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || null,
    });

    const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: fiveDaysInMs,
    });

    cookies.set("session", sessionCookie, {
      httpOnly: true,
      path: "/",
      maxAge: fiveDaysInMs / 1000,
      secure: import.meta.env.PROD,
      sameSite: "lax",
    });

    return redirect("/dashboard", 302);
  } catch (error: any) {
    console.error("Error en el inicio de sesión:", error);
    const errorMessage = error.code || error.message || "Fallo en la autenticación";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 401 }
    );
  }
};
