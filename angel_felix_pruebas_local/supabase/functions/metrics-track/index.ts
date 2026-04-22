import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type VisitPayload = {
  path?: string;
  page_title?: string | null;
  timezone?: string | null;
  language?: string | null;
  user_agent?: string | null;
  device_type?: string | null;
  referrer?: string | null;
};

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

function isPublicIp(ip: string | null) {
  if (!ip) return false;
  if (ip.includes(":")) return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("127.")) return false;
  if (ip.startsWith("172.")) {
    const part = Number(ip.split(".")[1] || "0");
    if (part >= 16 && part <= 31) return false;
  }
  return true;
}

async function resolveGeoByIp(ip: string | null) {
  if (!isPublicIp(ip)) {
    return {
      country: null as string | null,
      region: null as string | null,
      city: null as string | null,
      latitude: null as number | null,
      longitude: null as number | null,
    };
  }

  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip as string)}`, {
      headers: { accept: "application/json" },
    });
    if (!response.ok) throw new Error(`geo provider error ${response.status}`);
    const data = await response.json();
    if (!data || data.success === false) throw new Error("geo provider unavailable");

    return {
      country: data.country || null,
      region: data.region || null,
      city: data.city || null,
      latitude: typeof data.latitude === "number" ? data.latitude : null,
      longitude: typeof data.longitude === "number" ? data.longitude : null,
    };
  } catch {
    return {
      country: null as string | null,
      region: null as string | null,
      city: null as string | null,
      latitude: null as number | null,
      longitude: null as number | null,
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase env vars" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const payload = (await req.json()) as VisitPayload;
    const ip = getClientIp(req);
    const geo = await resolveGeoByIp(ip);

    const insertData = {
      path: payload.path || "/",
      page_title: payload.page_title || null,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      latitude: geo.latitude,
      longitude: geo.longitude,
      timezone: payload.timezone || null,
      language: payload.language || null,
      user_agent: payload.user_agent || req.headers.get("user-agent") || null,
      device_type: payload.device_type || null,
      referrer: payload.referrer || req.headers.get("referer") || null,
    };

    const { error } = await supabase.from("analytics_visits").insert(insertData);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unexpected error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

