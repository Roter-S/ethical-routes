import type { APIRoute } from "astro";
import { auth, firestore } from "@lib/firebase/server";
import admin from "firebase-admin";
import { syncUserToFirestore } from "@lib/syncUser";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const { idToken }: { idToken?: string } = await request.json();
    if (!idToken) {
      return new Response(JSON.stringify({ error: "No token provided" }), {
        status: 400,
      });
    }

    const decoded = await auth.verifyIdToken(idToken);
    await syncUserToFirestore({
      uid: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || null,
    });

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    cookies.set("session", sessionCookie, {
      httpOnly: true,
      path: "/",
      maxAge: expiresIn / 1000,
      secure: import.meta.env.PROD,
    });

    return redirect("/dashboard", 302);
  } catch (err: any) {
    console.error("Login error:", err);
    return new Response(
      JSON.stringify({
        error: err.code || err.message || "Authentication failed",
      }),
      { status: 401 }
    );
  }
};
