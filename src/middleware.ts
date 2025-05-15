import { getUser, redirectToSignin } from "@lib/utils";
import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { url, cookies, locals } = context;
  const pathname = url.pathname;

  const publicRoutes = [
    "/",
    "/signin",
    "/signup",
    "/api/auth/login",
    "/api/auth/register",
  ];

  const adminRoutes = [
    "/users",
  ];

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || (route.endsWith("/") && route !== "/" && pathname.startsWith(route))
  );
  if (isPublicRoute) return next();

  const sessionCookie = cookies.get("session")?.value ?? null;
  if (!sessionCookie) return redirectToSignin();

  const user = await getUser(sessionCookie);
  if (!user) {
    cookies.delete("session", { path: "/" });
    return redirectToSignin();
  }
  locals.user = user;

  const isAdminPath = adminRoutes.some(adminRoute => pathname.startsWith(adminRoute));
  if (isAdminPath && !user.isAdmin) {
    return Response.redirect(new URL("/dashboard", url), 307);
  }

  if (pathname.startsWith("/dashboard")) {
    if (user.isAdmin) {
      return Response.redirect(new URL("/", url), 307);
    }
  }

  const response = await next();

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}; 