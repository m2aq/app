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
  try {
    const response = await withTimeout(
      fetch("https://ipwho.is/", { method: "GET", cache: "no-store" }),
      1200
    );
    if (!response.ok) throw new Error("geo request failed");
    const data = await response.json();
    if (!data || data.success === false) throw new Error("geo not available");

    return {
      country: data.country || null,
      region: data.region || null,
      city: data.city || null,
      latitude: typeof data.latitude === "number" ? data.latitude : null,
      longitude: typeof data.longitude === "number" ? data.longitude : null,
    };
  } catch {
    return {
      country: null,
      region: null,
      city: null,
      latitude: null,
      longitude: null,
    };
  }
}

export async function trackPageView(pathOverride?: string) {
  if (!metricsEnabled) return;

  try {
    const geo = await resolveGeoSnapshot();

    const payload = {
      path: pathOverride || currentPath(),
      page_title: document.title || null,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      latitude: geo.latitude,
      longitude: geo.longitude,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      language: navigator.language || null,
      user_agent: navigator.userAgent || null,
      device_type: getDeviceType(),
      referrer: document.referrer || null,
    };

    await supabase.from("analytics_visits").insert(payload);
  } catch {
    // Never block UX if metrics fail.
  }
}

export async function fetchRecentVisits(limit = 100): Promise<VisitRow[]> {
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
  const { error } = await supabase
    .from("booking_leads")
    .insert({
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      hunt: input.hunt,
      source_path: input.sourcePath,
      status: "lead_captured",
    });

  if (error) throw error;
  // RLS keeps SELECT admin-only, so public inserts should not request returned rows.
  return null;
}

export async function fetchBookingLeads(limit = 100): Promise<BookingLeadRow[]> {
  const { data, error } = await supabase
    .from("booking_leads")
    .select(
      "id,created_at,full_name,email,phone,hunt,source_path,status,payment_provider,payment_ref"
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
