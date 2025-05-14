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
  const cred = await signInWithPopup(auth, new GoogleAuthProvider());
  const idToken = await cred.user.getIdToken();

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) return await res.json();
  if (res.redirected) window.location.replace(res.url);
}

export default function LoginForm() {
  const [formData, setFormData] = createSignal<SuccessForm>();
  const [response] = createResource(formData, postFormData);
  const [clientErrors, setClientErrors] = createSignal<Errors>();

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
          onclick={googleSignIn}
          class="dark:bg-zinc-100 p-1.5 border border-zinc-300 dark:border-zinc-100 flex justify-center items-center gap-2 rounded-md mt-2 dark:text-zinc-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-auto"
            preserveAspectRatio="xMidYMid"
            viewBox="0 0 256 262"
          >
            <path
              fill="#4285F4"
              d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
            />
            <path
              fill="#34A853"
              d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
            />
            <path
              fill="#FBBC05"
              d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
            />
            <path
              fill="#EB4335"
              d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
            />
          </svg>
          <span>Inicie sesión con Google</span>
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
