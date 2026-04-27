import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://agbujbvhczyrzowxrvxt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_g9ZrRRQycSvo9mEB2tSC5A_38oiPJHo";

export const metricsEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

type GeoSnapshot = {
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type VisitRow = {
  id: number;
  created_at: string;
  path: string;
  page_title: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  language: string | null;
  device_type: string | null;
  referrer: string | null;
};

export type BookingLeadRow = {
  id: number;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  hunt: string;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  source_path: string | null;
  status: string;
  payment_provider: string | null;
  payment_ref: string | null;
};

export type BookingLeadInput = {
  fullName: string;
  email: string;
  phone: string;
  hunt: string;
  sourcePath: string;
};

function getDeviceType() {
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad/.test(ua)) return "tablet";
  if (/mobi|android|iphone/.test(ua)) return "mobile";
  return "desktop";
}

function currentPath() {
  const hash = window.location.hash || "#/";
  const value = hash.replace(/^#/, "");
  return value || "/";
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("timeout")), timeoutMs);
    promise
      .then((data) => {
        clearTimeout(id);
        resolve(data);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });
}

async function resolveGeoSnapshot(): Promise<GeoSnapshot> {
  const language = navigator.language || null;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || null;

  const localeCountryCode = language?.match(/[-_]([A-Za-z]{2})$/)?.[1]?.toUpperCase() || null;
  const countryByCode: Record<string, string> = {
    MX: "Mexico",
    US: "United States",
    CA: "Canada",
    ES: "Spain",
    AR: "Argentina",
    CL: "Chile",
    CO: "Colombia",
    PE: "Peru",
  };

  let inferredCountry = localeCountryCode ? countryByCode[localeCountryCode] || localeCountryCode : null;
  if (!inferredCountry && timezone) {
    const tz = timezone.toLowerCase();
    if (tz.includes("mexico") || tz.includes("hermosillo") || tz.includes("monterrey")) inferredCountry = "Mexico";
    if (tz.includes("new_york") || tz.includes("los_angeles") || tz.includes("chicago")) inferredCountry = "United States";
    if (tz.includes("toronto") || tz.includes("vancouver")) inferredCountry = "Canada";
  }

  const fallbackGeo = {
    country: inferredCountry,
    region: null,
    city: null,
    latitude: null,
    longitude: null,
  };

  try {
    const response = await withTimeout(
      fetch("https://ipapi.co/json/", { headers: { accept: "application/json" } }),
      1600
    );
    if (!response.ok) return fallbackGeo;
    const data = await response.json();
    return {
      country: data.country_name || data.country || fallbackGeo.country,
      region: data.region || null,
      city: data.city || null,
      latitude: typeof data.latitude === "number" ? data.latitude : null,
      longitude: typeof data.longitude === "number" ? data.longitude : null,
    };
  } catch {
    return fallbackGeo;
  }
}

export async function trackPageView(pathOverride?: string) {
  if (!metricsEnabled) return;

  try {
    const path = pathOverride || currentPath();
    const payload = {
      path,
      page_title: document.title || null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      language: navigator.language || null,
      user_agent: navigator.userAgent || null,
      device_type: getDeviceType(),
      referrer: document.referrer || null,
    };

    // Preferred path: server-side Edge Function enriches country/city from request IP.
    const requestMetricsTrack = () =>
      fetch(`${SUPABASE_URL}/functions/v1/metrics-track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      });

    let fxResp = await withTimeout(requestMetricsTrack(), 12000);
    if (!fxResp.ok) {
      // Single retry for transient cold starts/network blips.
      fxResp = await withTimeout(requestMetricsTrack(), 12000);
    }
    if (!fxResp.ok) throw new Error(`metrics-track failed (${fxResp.status})`);
  } catch {
    // Keep data quality strict: if server-side geo capture fails, skip visit insert.
    // This avoids storing inferred city/region rows that look "real" but have null coords.
  }
}

export async function fetchRecentVisits(limit = 500): Promise<VisitRow[]> {
  const { data, error } = await supabase
    .from("analytics_visits")
    .select(
      "id,created_at,path,page_title,country,region,city,latitude,longitude,timezone,language,device_type,referrer"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as VisitRow[];
}

export async function adminSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function adminSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function isAdminSessionActive() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return false;
  return Boolean(data.session);
}

export async function saveBookingLead(input: BookingLeadInput): Promise<number | null> {
  try {
    const fxResp = await withTimeout(
      fetch(`${SUPABASE_URL}/functions/v1/lead-capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          full_name: input.fullName,
          email: input.email,
          phone: input.phone,
          hunt: input.hunt,
          source_path: input.sourcePath,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
          language: navigator.language || null,
          user_agent: navigator.userAgent || null,
          referrer: document.referrer || null,
        }),
      }),
      7000
    );

    if (!fxResp.ok) {
      const text = await fxResp.text().catch(() => "");
      throw new Error(`lead-capture failed (${fxResp.status}) ${text}`);
    }
    return null;
  } catch {
    // Fallback path: still store lead if Edge Function is not deployed/reachable.
    const geo = await resolveGeoSnapshot();
    const { error } = await supabase
      .from("booking_leads")
      .insert({
        full_name: input.fullName,
        email: input.email,
        phone: input.phone,
        hunt: input.hunt,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        latitude: geo.latitude,
        longitude: geo.longitude,
        source_path: input.sourcePath,
        status: "lead_captured",
      });

    if (error) throw error;
    // RLS keeps SELECT admin-only, so public inserts should not request returned rows.
    return null;
  }
}

export async function fetchBookingLeads(limit = 100): Promise<BookingLeadRow[]> {
  const { data, error } = await supabase
    .from("booking_leads")
    .select(
      "id,created_at,full_name,email,phone,hunt,country,region,city,latitude,longitude,source_path,status,payment_provider,payment_ref"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as BookingLeadRow[];
}

export async function updateBookingLeadStatus(
  leadId: number,
  status: "paypal_paid" | "stripe_redirected" | "payment_failed",
  paymentProvider?: "paypal" | "stripe",
  paymentRef?: string
) {
  const payload: Record<string, string> = { status };
  if (paymentProvider) payload.payment_provider = paymentProvider;
  if (paymentRef) payload.payment_ref = paymentRef;

  const { error } = await supabase.from("booking_leads").update(payload).eq("id", leadId);
  if (error) throw error;
}
