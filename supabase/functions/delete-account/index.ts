import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const BUCKET = "scrap-media";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function collectPaths(
  admin: ReturnType<typeof createClient>,
  prefix: string,
): Promise<string[]> {
  const out: string[] = [];
  const { data: entries, error } = await admin.storage.from(BUCKET).list(prefix, { limit: 1000 });
  if (error || !entries?.length) return out;
  for (const entry of entries) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id) out.push(path);
    else out.push(...(await collectPaths(admin, path)));
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  const url = Deno.env.get("SUPABASE_URL") || "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!token || !url || !anon || !service) return json({ error: "auth" }, 401);

  const userClient = createClient(url, anon, {
    global: { headers: { Authorization: "Bearer " + token } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) return json({ error: "auth" }, 401);

  const user = userData.user;
  if (user.is_anonymous || user.user_metadata?.browse === true) {
    return json({ error: "browse" }, 403);
  }

  const uid = user.id;
  const admin = createClient(url, service);

  const paths = await collectPaths(admin, uid);
  for (let i = 0; i < paths.length; i += 50) {
    const chunk = paths.slice(i, i + 50);
    await admin.storage.from(BUCKET).remove(chunk);
  }

  const { error: scrapErr } = await admin.from("scraps").delete().eq("user_id", uid);
  if (scrapErr) return json({ error: scrapErr.message }, 500);

  const { error: delErr } = await admin.auth.admin.deleteUser(uid);
  if (delErr) return json({ error: delErr.message }, 500);

  return json({ ok: true });
});
