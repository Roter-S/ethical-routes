import {
  createSignal,
  Show,
  createResource,
  Suspense,
  Switch,
  Match,
} from "solid-js";
import type { z } from "zod";
import { registerSchema } from "@lib/schemas";
import { ErrorPlaceholder } from "@components/ErrorPlaceholder";
import { Error } from "@components/Error";

type Errors = z.typeToFlattenedError<
  z.inferFormattedError<typeof registerSchema>
>;

async function postFormData(formData: FormData) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json();
    return data;
  }

  if (res.redirected) {
    window.location.replace(res.url);
  }
}

export default function SignupForm() {
  const [formData, setFormData] = createSignal<FormData>();
  const [response] = createResource(formData, postFormData);
  const [clientErrors, setClientErrors] = createSignal<Errors>();

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    setClientErrors();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const result = registerSchema.safeParse(data);

    if (!result.success) {
      const errors = result.error.flatten() as Errors;
      setClientErrors(errors);
      return;
    }
    setFormData(data);
  }

  return (
    <form class="grid grid-cols-1 gap-3 w-full" onSubmit={submit}>
      <div class="grid grid-cols-1 gap-2">
        <label for="name" class="font-medium text-zinc-300 text-sm">
          Nombre
        </label>
        <input
          type="text"
          id="name"
          name="name"
          class="rounded-md py-1 px-3 bg-zinc-800 text-zinc-300 border border-zinc-700 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:bg-zinc-900 focus:ring-opacity-60"
        />
        <Show
          when={clientErrors()?.fieldErrors.name}
          fallback={<ErrorPlaceholder />}
        >
          <Error message={clientErrors()?.fieldErrors.name} />
        </Show>
      </div>
      <div class="grid grid-cols-1 gap-2">
        <label for="email" class="font-medium text-zinc-300 text-sm">
          Correo electrónico
        </label>
        <input
          type="text"
          id="email"
          name="email"
          class="rounded-md py-1 px-3 bg-zinc-800 text-zinc-300 border border-zinc-700 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:bg-zinc-900 focus:ring-opacity-60"
        />
        <Show
          when={clientErrors()?.fieldErrors.email}
          fallback={<ErrorPlaceholder />}
        >
          <Error message={clientErrors()?.fieldErrors.email} />
        </Show>
      </div>
      <div class="grid grid-cols-1 gap-2">
        <label for="password" class="font-medium text-zinc-300 text-sm">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          name="password"
          class="rounded-md py-1 px-3 bg-zinc-800 text-zinc-300 border border-zinc-700 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:bg-zinc-900 focus:ring-opacity-60"
        />
        <Show
          when={clientErrors()?.fieldErrors.password}
          fallback={<ErrorPlaceholder />}
        >
          <Error message={clientErrors()?.fieldErrors.password} />
        </Show>
      </div>
      <div class="grid grid-cols-1 gap-2">
        <label for="confirmPassword" class="font-medium text-zinc-300 text-sm">
          Confirmar contraseña
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          class="rounded-md py-1 px-3 bg-zinc-800 text-zinc-300 border border-zinc-700 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:bg-zinc-900 focus:ring-opacity-60"
        />
        <Show
          when={clientErrors()?.fieldErrors.confirmPassword}
          fallback={<ErrorPlaceholder />}
        >
          <Error message={clientErrors()?.fieldErrors.confirmPassword} />
        </Show>
      </div>
      <button
        class="bg-zinc-100 py-1.5 border border-zinc-100 rounded-md mt-2 text-black font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-600 focus:ring-offset-zinc-900"
        type="submit"
        disabled={response.loading}
      >
        <Show fallback="Registrarse" when={response.loading}>
          <svg
            class="animate-spin h-5 w-5 text-white mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8.009,8.009,0,0,1,12,20Z"
            />
            <path
              fill="currentColor"
              d="M10.14,2.93a10.007,10.007,0,0,1,.4.4l-.4-.4Z"
            />
          </svg>
          <span class="ml-2">Cargando...</span>
        </Show>
      </button>
      <Suspense>
        <Switch>
          <Match when={response()?.error === "auth/email-already-exists"}>
            <Error message="La dirección de correo electrónico ya está en uso por otra cuenta" />
          </Match>
          <Match when={response()?.error}>
            <Error message={response().error} />
          </Match>
        </Switch>
      </Suspense>
    </form>
  );
}
