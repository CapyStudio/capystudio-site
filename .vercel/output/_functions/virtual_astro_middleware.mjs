import { a6 as defineMiddleware, af as sequence } from './chunks/sequence_CF29xqYr.mjs';
import 'piccolore';
import 'clsx';

const onRequest$1 = defineMiddleware((context, next) => {
  const host = context.request.headers.get("host") || "";
  const url = new URL(context.request.url);
  if (host.startsWith("capybets.") && url.pathname === "/") {
    return context.redirect("/capybets", 302);
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
