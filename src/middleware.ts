import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  const host = context.request.headers.get("host") || "";
  const url = new URL(context.request.url);

  if (host.startsWith("capybets.") && url.pathname === "/") {
    return context.redirect("/capybets", 302);
  }

  return next();
});
