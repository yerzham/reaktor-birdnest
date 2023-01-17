import { serve } from "./deps.ts";
import { getViolations } from "./service/violation.ts";
import { websocketConnection } from "./websocket.ts";

const port = Number(Deno.env.get("BIRDNEST_REPORTER_PORT")) || Number(Deno.env.get("PORT")) || 3000;

await serve(async (req) => {
  const path = `/${req.url.split("/").slice(3).join("/")}`
  const method = req.method;

  switch (`${method} ${path}`) {
    case "GET /":
      return new Response(JSON.stringify({ name: "birdnest-reporter", version: "0.0.1" }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    case "GET /health":
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    case "GET /violations":
      return new Response(JSON.stringify(await getViolations() ), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    case "GET /socket":
      if (req.headers.get("upgrade") === "websocket") {
        return websocketConnection(req);
      }
      return new Response("Not found", { status: 404 });
    default:
      return new Response("Not found", { status: 404 });
  }
}, { port });