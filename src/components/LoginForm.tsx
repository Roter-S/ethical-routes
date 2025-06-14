import {
  createSignal,
  Show,
  createResource,
  Suspense,
  Switch,
  Match,
} from "solid-js";
import {
  signInWithEmailAndPassword,
  inMemoryPersistence,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { loginSchema } from "@lib/schemas";
import { firebaseClientApp } from "@lib/firebase/client";
import type { z } from "zod";
import { ErrorPlaceholder } from "@components/ErrorPlaceholder";
import { Error } from "@components/Error";
import LoadingButton from "./ButtonLoading";
import GoogleIcon from "@components/icons/GoogleIcon";

type Errors = z.typeToFlattenedError<z.inferFormattedError<typeof loginSchema>>;
type SuccessForm = z.infer<typeof loginSchema>;
const auth = getAuth(firebaseClientApp);
const DEFAULT_CREDENTIALS = {
  email: "",
  password: "",
};

auth.setPersistence(inMemoryPersistence);

async function postFormData({
  email,
  password,
}: SuccessForm): Promise<{ error?: string }> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { error: errorData.message || "Ocurrió un error" };
    }
    if (res.redirected) window.location.replace(res.url);
    return {};
  } catch (err: any) {
    return { error: err.message || "Se produjo un error inesperado" };
  }
}

async function googleSignIn() {
  try {
    const cred = await signInWithPopup(auth, new GoogleAuthProvider());
    const idToken = await cred.user.getIdToken();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Error en el inicio de sesión con Google");
    }
    
    if (res.redirected) {
      // Mostrar el loader antes de la redirección
      document.dispatchEvent(new Event("astro:before-preparation"));
      window.location.replace(res.url);
    }
  } catch (error: any) {
    console.error("Error en el inicio de sesión con Google:", error);
    return { error: error.message || "Error en el inicio de sesión con Google" };
  }
}

export default function LoginForm() {
  const [formData, setFormData] = createSignal<SuccessForm>();
  const [response] = createResource(formData, postFormData);
  const [clientErrors, setClientErrors] = createSignal<Errors>();
  const [isGoogleLoading, setIsGoogleLoading] = createSignal(false);

  const [email, setEmail] = createSignal(DEFAULT_CREDENTIALS.email);
  const [password, setPassword] = createSignal(DEFAULT_CREDENTIALS.password);

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    setClientErrors();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const result = loginSchema.safeParse(data);

    if (!result.success) {
      setClientErrors(result.error.flatten() as Errors);
      return;
    }
    setFormData(result.data);
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      await googleSignIn();
    } catch (error: any) {
      console.error("Error en el inicio de sesión con Google:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <form class="grid grid-cols-1 gap-3 w-full" onSubmit={submit}>
      <div class="grid grid-cols-1 gap-2">
        <label
          for="email"
          class="font-medium dark:text-zinc-300 text-zinc-900 text-sm"
        >
          Correo Electrónico
        </label>
        <input
          type="text"
          id="email"
          name="email"
          class="rounded-md py-1 px-3 dark:bg-zinc-800 dark:text-zinc-300 border bg-zinc-50 border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:bg-zinc-900 focus:bg-white focus:ring-opacity-60"
          value={email()}
          onInput={(e) => setEmail(e.currentTarget.value)}
        />
        <Show
          when={clientErrors()?.fieldErrors.email}
          fallback={<ErrorPlaceholder />}
        >
          <Error message={clientErrors()?.fieldErrors.email} />
        </Show>
      </div>
      <div class="grid grid-cols-1 gap-2">
        <label
          for="password"
          class="font-medium dark:text-zinc-300 text-zinc-900 text-sm"
        >
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          name="password"
          class="rounded-md py-1 px-3 dark:bg-zinc-800 dark:text-zinc-300 border bg-zinc-50 border-zinc-300 dark:border-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:bg-zinc-900 focus:bg-white focus:ring-opacity-60"
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
        />
        <Show
          when={clientErrors()?.fieldErrors.password}
          fallback={<ErrorPlaceholder />}
        >
          <Error message={clientErrors()?.fieldErrors.password} />
        </Show>
      </div>
      <LoadingButton
        type="submit"
        loading={response.loading}
        disabled={response.loading}
        class="dark:bg-zinc-100 bg-zinc-900 border-zinc-900 py-1.5 border dark:border-zinc-100 rounded-md mt-2 dark:text-zinc-900 text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-zinc-900"
      >
        Iniciar Sesión
      </LoadingButton>
      <div>
        <hr class="h-0 border-t mt-4 dark:border-zinc-600 border-zinc-300"></hr>
        <p class="-mt-2.5 text-xs text-center dark:text-zinc-400 text-zinc-500">
          <span class="dark:bg-zinc-900 bg-zinc-100 px-4">O con</span>
        </p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-1 gap-2 sm:gap-4">
        <button
          onclick={handleGoogleSignIn}
          disabled={isGoogleLoading()}
          class="dark:bg-zinc-100 p-1.5 border border-zinc-300 dark:border-zinc-100 flex justify-center items-center gap-2 rounded-md mt-2 dark:text-zinc-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          <GoogleIcon class="h-5 w-auto" />
          <span>{isGoogleLoading() ? "Cargando..." : "Continuar con Google"}</span>
        </button>
      </div>
      <Suspense>
        <Switch>
          <Match when={response.error?.code === "auth/wrong-password"}>
            <Error message="Your password is incorrect" />
          </Match>
          <Match when={response.error?.code === "auth/user-not-found"}>
            <Error message="You don't have an account with this email" />
          </Match>
          <Match when={response()?.error}>
            <Error message={response()?.error} />
          </Match>
        </Switch>
      </Suspense>
    </form>
  );
}
