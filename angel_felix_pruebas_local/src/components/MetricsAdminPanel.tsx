import { useCallback, useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import {
  adminSignIn,
  adminSignOut,
  fetchBookingLeads,
  fetchRecentVisits,
  isAdminSessionActive,
  metricsEnabled,
  type BookingLeadRow,
  type VisitRow,
} from "@/lib/metricsClient";

const MAP_BOUNDS: [[number, number], [number, number]] = [
  [-75, -180],
  [85, 180],
];
const VISITS_PAGE_SIZE = 50;

const fmtDate = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

type GeoHotspot = {
  key: string;
  lat: number;
  lon: number;
  count: number;
  country: string;
  city: string;
};

const createPulseIcon = (count: number) => {
  const core = Math.min(16, 8 + Math.floor(count / 3));
  const ring = Math.min(36, 16 + count * 3);
  return L.divIcon({
    className: "af-geo-pulse-icon",
    html: `
      <div style="position:relative;width:${ring}px;height:${ring}px;transform:translate(-50%,-50%);">
        <span style="position:absolute;inset:0;border-radius:999px;background:rgba(34,211,238,.20);border:1px solid rgba(103,232,249,.85);animation:afPulse 1.8s ease-out infinite;"></span>
        <span style="position:absolute;left:50%;top:50%;width:${core}px;height:${core}px;border-radius:999px;transform:translate(-50%,-50%);background:rgba(103,232,249,.95);box-shadow:0 0 14px rgba(34,211,238,.95);border:1px solid rgba(255,255,255,.9);"></span>
      </div>
    `,
    iconSize: [ring, ring],
    iconAnchor: [ring / 2, ring / 2],
  });
};

const MetricsAdminPanel = () => {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<VisitRow[]>([]);
  const [leads, setLeads] = useState<BookingLeadRow[]>([]);
  const [loadError, setLoadError] = useState("");
  const [visibleVisitsCount, setVisibleVisitsCount] = useState(VISITS_PAGE_SIZE);

  useEffect(() => {
    isAdminSessionActive()
      .then((active) => setIsAuthed(active))
      .finally(() => setCheckingSession(false));
  }, []);

  const loadVisits = useCallback(async () => {
    if (!metricsEnabled) {
      setLoadError("Metrics are disabled because Supabase config is missing.");
      return;
    }

    try {
      setLoading(true);
      setLoadError("");
      const [visitsResult, leadsResult] = await Promise.all([fetchRecentVisits(500), fetchBookingLeads(150)]);
      setRows(visitsResult);
      setVisibleVisitsCount(VISITS_PAGE_SIZE);
      setLeads(leadsResult);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load visits.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthed) loadVisits();
  }, [isAuthed, loadVisits]);

  const summary = useMemo(() => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const total = rows.length;
    const last24h = rows.filter((r) => new Date(r.created_at).getTime() >= oneDayAgo).length;
    const uniqueCountries = new Set(rows.map((r) => r.country || "Unknown")).size;

    const countryCount = new Map<string, number>();
    rows.forEach((r) => {
      const country = r.country || "Unknown";
      countryCount.set(country, (countryCount.get(country) || 0) + 1);
    });

    let topCountry = "Unknown";
    let topCount = 0;
    countryCount.forEach((count, country) => {
      if (count > topCount) {
        topCount = count;
        topCountry = country;
      }
    });

    return { total, last24h, uniqueCountries, topCountry, topCount };
  }, [rows]);

  const leadsSummary = useMemo(() => {
    const total = leads.length;
    const captured = leads.filter((l) => l.status === "lead_captured").length;
    const paid = leads.filter((l) => l.status === "paypal_paid").length;
    const redirected = leads.filter((l) => l.status === "stripe_redirected").length;
    return { total, captured, paid, redirected };
  }, [leads]);

  const radarPoints = useMemo(() => {
    const buckets = new Map<string, GeoHotspot>();

    rows.forEach((row) => {
      if (typeof row.latitude !== "number" || typeof row.longitude !== "number") return;
      if (row.latitude < -90 || row.latitude > 90 || row.longitude < -180 || row.longitude > 180) return;

      const bucketLat = Math.round(row.latitude * 2) / 2;
      const bucketLon = Math.round(row.longitude * 2) / 2;
      const key = `${bucketLat}_${bucketLon}`;
      const country = row.country || "Unknown";
      const city = row.city || "Unknown";

      const existing = buckets.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        buckets.set(key, { key, lat: bucketLat, lon: bucketLon, count: 1, country, city });
      }
    });

    return Array.from(buckets.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 180);
  }, [rows]);

  const totalVisitsWithCoords = useMemo(
    () => rows.filter((row) => typeof row.latitude === "number" && typeof row.longitude === "number").length,
    [rows]
  );

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg("");
      await adminSignIn(email.trim(), password);
      setIsAuthed(true);
      setPassword("");
    } catch {
      setErrorMsg("Invalid admin credentials or insufficient permissions.");
    }
  };

  const exitAdmin = async () => {
    try {
      await adminSignOut();
    } catch {
      // noop
    }
    setIsAuthed(false);
    navigate("/");
  };

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm text-white/70">Checking admin session...</p>
        </div>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-md px-4 py-24">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-2xl">
            <h1 className="mb-1 text-2xl font-semibold">Admin Access</h1>
            <p className="mb-5 text-sm text-white/70">Metrics dashboard login</p>
            <form className="space-y-3" onSubmit={submitLogin}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              {errorMsg ? <p className="text-xs text-red-400">{errorMsg}</p> : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="rounded-lg border border-white/20 px-3 py-2 text-xs uppercase tracking-widest text-white/80"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-3 py-2 text-xs uppercase tracking-widest text-primary-foreground"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <style>{`
        @keyframes afPulse {
          0% { transform: scale(0.7); opacity: .85; }
          70% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.55); opacity: 0; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Visitor Metrics</h1>
            <p className="text-sm text-white/60">Anonymous traffic overview</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadVisits}
              className="rounded-lg border border-white/20 px-3 py-2 text-xs uppercase tracking-widest text-white/80"
            >
              Refresh
            </button>
            <button
              onClick={exitAdmin}
              className="rounded-lg bg-primary px-3 py-2 text-xs uppercase tracking-widest text-primary-foreground"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-widest text-white/50">Total</p>
            <p className="mt-1 text-2xl font-bold">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-widest text-white/50">Last 24h</p>
            <p className="mt-1 text-2xl font-bold">{summary.last24h}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-widest text-white/50">Countries</p>
            <p className="mt-1 text-2xl font-bold">{summary.uniqueCountries}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-widest text-white/50">Top Country</p>
            <p className="mt-1 text-lg font-semibold">
              {summary.topCountry} {summary.topCount > 0 ? `(${summary.topCount})` : ""}
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-widest text-white/50">Leads Total</p>
            <p className="mt-1 text-2xl font-bold">{leadsSummary.total}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-widest text-white/50">Lead Captured</p>
            <p className="mt-1 text-2xl font-bold">{leadsSummary.captured}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-widest text-white/50">Paid (PayPal)</p>
            <p className="mt-1 text-2xl font-bold">{leadsSummary.paid}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-widest text-white/50">Stripe Redirect</p>
            <p className="mt-1 text-2xl font-bold">{leadsSummary.redirected}</p>
          </div>
        </div>

        {loadError ? (
          <p className="mb-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {loadError}
          </p>
        ) : null}

        <div className="mb-5 rounded-xl border border-cyan-300/20 bg-gradient-to-br from-slate-950 to-slate-900 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">Global Radar</p>
              <p className="text-sm text-white/70">
                {radarPoints.length} hotspots from {totalVisitsWithCoords} visits with geolocation
              </p>
            </div>
            <p className="text-xs text-cyan-100/70">Pulse = clustered traffic intensity</p>
          </div>

          <div className="relative mt-3 h-[360px] overflow-hidden rounded-lg border border-cyan-200/15 bg-slate-950">
            <MapContainer
              className="h-full w-full"
              center={[20, 0]}
              zoom={2}
              minZoom={2}
              maxZoom={8}
              maxBounds={MAP_BOUNDS}
              worldCopyJump={true}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {radarPoints.map((point) => (
                <Marker key={point.key} position={[point.lat, point.lon]} icon={createPulseIcon(point.count)}>
                  <Tooltip direction="top" offset={[0, -8]} opacity={0.92}>
                    {point.country} · {point.city} ({point.count})
                  </Tooltip>
                </Marker>
              ))}
            </MapContainer>

            {radarPoints.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white/70">
                  No geolocation points yet.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/60">
              <tr>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Path</th>
                <th className="px-3 py-3">Country</th>
                <th className="px-3 py-3">City</th>
                <th className="px-3 py-3">Device</th>
                <th className="px-3 py-3">Language</th>
                <th className="px-3 py-3">Referrer</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-4 text-white/70" colSpan={7}>
                    Loading visits...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-white/70" colSpan={7}>
                    No visits recorded yet.
                  </td>
                </tr>
              ) : (
                rows.slice(0, visibleVisitsCount).map((row) => (
                  <tr key={row.id} className="border-t border-white/10">
                    <td className="px-3 py-3 text-white/80">{fmtDate(row.created_at)}</td>
                    <td className="px-3 py-3 text-white/90">{row.path}</td>
                    <td className="px-3 py-3 text-white/80">{row.country || "Unknown"}</td>
                    <td className="px-3 py-3 text-white/80">{row.city || "Unknown"}</td>
                    <td className="px-3 py-3 text-white/80">{row.device_type || "-"}</td>
                    <td className="px-3 py-3 text-white/80">{row.language || "-"}</td>
                    <td className="max-w-[16rem] truncate px-3 py-3 text-white/60">{row.referrer || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && rows.length > visibleVisitsCount ? (
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => setVisibleVisitsCount((prev) => prev + VISITS_PAGE_SIZE)}
              className="rounded-lg border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-white/80"
            >
              Load More (+50)
            </button>
          </div>
        ) : null}

        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/60">
              <tr>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Hunt</th>
                <th className="px-3 py-3">Country</th>
                <th className="px-3 py-3">City</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Provider</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-3 py-4 text-white/70" colSpan={9}>
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-white/70" colSpan={9}>
                    No booking leads yet.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-white/10">
                    <td className="px-3 py-3 text-white/80">{fmtDate(lead.created_at)}</td>
                    <td className="px-3 py-3 text-white/90">{lead.full_name}</td>
                    <td className="max-w-[12rem] truncate px-3 py-3 text-white/80">{lead.email}</td>
                    <td className="px-3 py-3 text-white/80">{lead.phone}</td>
                    <td className="px-3 py-3 text-white/80">{lead.hunt}</td>
                    <td className="px-3 py-3 text-white/80">{lead.country || "Unknown"}</td>
                    <td className="px-3 py-3 text-white/80">{lead.city || "Unknown"}</td>
                    <td className="px-3 py-3 text-white/80">{lead.status}</td>
                    <td className="px-3 py-3 text-white/80">{lead.payment_provider || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default MetricsAdminPanel;
