import { auth } from "@lib/firebase/server";
import { differenceInCalendarDays } from "date-fns";

export async function getUser(cookie: string) {
  try {
    const decodedIdToken = await auth.verifySessionCookie(cookie, true);
    const user = await auth.getUser(decodedIdToken.uid);
    return user;
  } catch (error) {
    return null;
  }
}

export function formatDate(
  ts: Date | { seconds: number; nanoseconds: number }
): string {
  const date = ts instanceof Date ? ts : new Date(ts.seconds * 1000);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function redirectToSignin(): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/signin",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
