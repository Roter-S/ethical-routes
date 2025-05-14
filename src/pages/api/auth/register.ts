import type { APIRoute } from "astro";
import { auth } from "@lib/firebase/server";
import { registerSchema } from "@lib/schemas";
import { syncUserToFirestore } from "@lib/syncUser";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const validationResult = registerSchema.safeParse(formData);

  if (!validationResult.success) {
    return new Response(
      JSON.stringify({ errors: validationResult.error.flatten().fieldErrors }),
      { status: 400 }
    );
  }

  const { email, password, name } = validationResult.data;

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    await syncUserToFirestore({
      uid: userRecord.uid,
      email: userRecord.email ?? null,
      name: userRecord.displayName ?? name,
    });

    return redirect("/signin", 302);

  } catch (error: any) {
    let statusCode = 400;
    let errorMessage = "Error en el registro.";

    if (error.code === "auth/email-already-exists") {
      statusCode = 409;
      errorMessage = "Esta dirección de correo electrónico ya está en uso.";
    } else if (error.code) {
      errorMessage = error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error("Error en el registro:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
    });
  }
};
