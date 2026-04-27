import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type LeadPayload = {
  full_name?: string;
  email?: string;
  phone?: string;
  hunt?: string;
  source_path?: string | null;
  timezone?: string | null;
  language?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
};

function normalizeCountry(input: string | null) {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;
  if (value.length === 2) {
    const code = value.toUpperCase();
    const map: Record<string, string> = {
      MX: "Mexico",
      US: "United States",
      CA: "Canada",
      ES: "Spain",
      AR: "Argentina",
      CL: "Chile",
      CO: "Colombia",
      PE: "Peru",
    };
    return map[code] || code;
  }
  return value;
}

function inferCountryFromLocale(language: string | null, timezone: string | null) {
  if (language) {
    const match = language.match(/[-_]([A-Za-z]{2})$/);
    if (match?.[1]) return normalizeCountry(match[1]);
  }
  if (timezone) {
    const tz = timezone.toLowerCase();
    if (tz.includes("mexico") || tz.includes("hermosillo") || tz.includes("monterrey")) return "Mexico";
    if (tz.includes("new_york") || tz.includes("los_angeles") || tz.includes("chicago")) return "United States";
    if (tz.includes("toronto") || tz.includes("vancouver")) return "Canada";
  }
  return null;
}

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

function getGeoFromHeaders(req: Request) {
  const country =
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("x-country-code") ||
    null;
  const region =
    req.headers.get("x-vercel-ip-country-region") ||
    req.headers.get("x-region-code") ||
    null;
  const city = req.headers.get("x-vercel-ip-city") || req.headers.get("x-city") || null;

  return {
    country,
    region,
    city,
    latitude: null as number | null,
    longitude: null as number | null,
  };
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

async function resolveGeoWithIpWho(ip: string) {
  const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error(`ipwho error ${response.status}`);
  const data = await response.json();
  if (!data || data.success === false) throw new Error("ipwho unavailable");
  return {
    country: data.country || null,
    region: data.region || null,
    city: data.city || null,
    latitude: typeof data.latitude === "number" ? data.latitude : null,
    longitude: typeof data.longitude === "number" ? data.longitude : null,
  };
}

async function resolveGeoWithIpApi(ip: string) {
  const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error(`ipapi error ${response.status}`);
  const data = await response.json();
  if (!data || data.error) throw new Error("ipapi unavailable");
  return {
    country: data.country_name || data.country || null,
    region: data.region || null,
    city: data.city || null,
    latitude: typeof data.latitude === "number" ? data.latitude : null,
    longitude: typeof data.longitude === "number" ? data.longitude : null,
  };
}

async function resolveGeoByIp(req: Request, ip: string | null) {
  const headerGeo = getGeoFromHeaders(req);
  if (headerGeo.country || headerGeo.region || headerGeo.city) {
    return headerGeo;
  }

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
    return await resolveGeoWithIpWho(ip as string);
  } catch {
    try {
      return await resolveGeoWithIpApi(ip as string);
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

    const payload = (await req.json()) as LeadPayload;
    const fullName = payload.full_name?.trim() || "";
    const email = payload.email?.trim() || "";
    const phone = payload.phone?.trim() || "";
    const hunt = payload.hunt?.trim() || "General Deposit";

    if (!fullName || !email || !phone) {
      return new Response(JSON.stringify({ error: "Missing lead fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip = getClientIp(req);
    const geo = await resolveGeoByIp(req, ip);
    const inferredCountry = inferCountryFromLocale(payload.language || null, payload.timezone || null);
    const finalCountry = normalizeCountry(geo.country) || inferredCountry;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const insertData = {
      full_name: fullName,
      email,
      phone,
      hunt,
      country: finalCountry,
      region: geo.region,
      city: geo.city,
      latitude: geo.latitude,
      longitude: geo.longitude,
      source_path: payload.source_path || null,
      status: "lead_captured",
    };

    const { error } = await supabase.from("booking_leads").insert(insertData);
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

