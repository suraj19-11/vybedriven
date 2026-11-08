import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      // Instant pre-confirmed registration API for seamless builder onboarding
      if (url.pathname === "/api/auth/register" && request.method === "POST") {
        try {
          const body = (await request.json()) as {
            email?: string;
            password?: string;
            fullName?: string;
            phone?: string;
          };
          const { email, password, fullName, phone } = body;

          if (!email || !password) {
            return new Response(
              JSON.stringify({ error: "Email and password are required." }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const SUPABASE_URL =
            process.env.SUPABASE_URL || "https://awsbphlfpbwfrbhqxgdu.supabase.co";
          const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY;

          if (!SUPABASE_SECRET) {
            return new Response(
              JSON.stringify({ error: "Server authentication configuration pending." }),
              { status: 500, headers: { "Content-Type": "application/json" } }
            );
          }

          const { createClient } = await import("@supabase/supabase-js");
          const adminClient = createClient(SUPABASE_URL, SUPABASE_SECRET);

          const { data, error } = await adminClient.auth.admin.createUser({
            email: email.trim().toLowerCase(),
            password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName?.trim() || undefined,
              phone: phone?.trim() || undefined,
            },
          });

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          if (data.user) {
            try {
              await adminClient.from("profiles").upsert({
                id: data.user.id,
                display_name: fullName?.trim() || email.split("@")[0],
                phone: phone?.trim() || null,
                updated_at: new Date().toISOString(),
              });
            } catch (profileErr) {
              console.error("Profile creation warning:", profileErr);
            }
          }

          return new Response(
            JSON.stringify({ success: true, user: data.user }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        } catch (apiErr: unknown) {
          const msg = apiErr instanceof Error ? apiErr.message : "Internal Error";
          return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
