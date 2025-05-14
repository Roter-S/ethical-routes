import { auth, firestore } from "@lib/firebase/server";
import { registerSchema } from "@lib/schemas";
import { syncUserToFirestore } from "@lib/syncUser";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const result = registerSchema.safeParse(formData);

  if (!result.success) {
    return new Response(JSON.stringify({ errors: result.error.flatten() }), {
      status: 400,
    });
  }

  const { email, password, name } = result.data;

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    await syncUserToFirestore({
      uid: userRecord.uid,
      email: userRecord.email ?? null,
      name,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.code || error.message }),
      { status: 400 }
    );
  }

  return redirect("/signin", 302);
};
