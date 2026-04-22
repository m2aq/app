import { useCallback, useEffect, useMemo, useState } from "react";
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

const SECRET_CLICKS_REQUIRED = 5;
const SECRET_CLICK_WINDOW_MS = 1800;
const fmtDate = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const MetricsAdminPanel = () => {
  const [secretClicks, setSecretClicks] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<VisitRow[]>([]);
  const [leads, setLeads] = useState<BookingLeadRow[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let timer: number | null = null;
    const onSecretClick = () => {
      setSecretClicks((prev) => {
        const next = prev + 1;
        if (next >= SECRET_CLICKS_REQUIRED) {
          setShowLogin(true);
          setErrorMsg("");
          return 0;
        }
        return next;
      });

      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setSecretClicks(0), SECRET_CLICK_WINDOW_MS);
    };

    window.addEventListener("af-admin-secret-click", onSecretClick as EventListener);
    return () => {
      window.removeEventListener("af-admin-secret-click", onSecretClick as EventListener);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    isAdminSessionActive().then((active) => {
      if (active) {
        setIsAuthed(true);
      }
    });
  }, []);

  const loadVisits = useCallback(async () => {
    if (!metricsEnabled) {
      setLoadError("Metrics are disabled because Supabase config is missing.");
      return;
    }
    try {
      setLoading(true);
      setLoadError("");
      const [visitsResult, leadsResult] = await Promise.all([
        fetchRecentVisits(150),
        fetchBookingLeads(150),
      ]);
      setRows(visitsResult);
      setLeads(leadsResult);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load visits.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && isAuthed) {
      loadVisits();
    }
  }, [isOpen, isAuthed, loadVisits]);

  const summary = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

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

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg("");
      await adminSignIn(email.trim(), password);
      setIsAuthed(true);
      setShowLogin(false);
      setIsOpen(true);
      setPassword("");
    } catch {
      setErrorMsg("Invalid admin credentials or insufficient permissions.");
    }
  };

  const closeAll = async () => {
    try {
      if (isAuthed) await adminSignOut();
    } catch {
      // Ignore sign-out errors in UI close flow.
    }
    setShowLogin(false);
    setIsOpen(false);
    setIsAuthed(false);
    setEmail("");
    setPassword("");
    setErrorMsg("");
  };

  return (
    <>
      {showLogin && (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white shadow-2xl">
            <h3 className="mb-1 text-xl font-semibold">Admin Access</h3>
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
                  onClick={closeAll}
                  className="rounded-lg border border-white/20 px-3 py-2 text-xs uppercase tracking-widest text-white/80"
                >
                  Cancel
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
      )}

      {isOpen && isAuthed && (
        <div className="fixed inset-0 z-[11999] overflow-auto bg-black/80 px-4 py-8">
          <div className="mx-auto w-full max-w-6xl rounded-2xl border border-white/10 bg-zinc-950 p-5 text-white shadow-2xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">Visitor Metrics</h3>
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
                  onClick={closeAll}
                  className="rounded-lg bg-primary px-3 py-2 text-xs uppercase tracking-widest text-primary-foreground"
                >
                  Close
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
                    rows.map((row) => (
                      <tr key={row.id} className="border-t border-white/10">
                        <td className="px-3 py-3 text-white/80">{fmtDate(row.created_at)}</td>
                        <td className="px-3 py-3 text-white/90">{row.path}</td>
                        <td className="px-3 py-3 text-white/80">{row.country || "Unknown"}</td>
                        <td className="px-3 py-3 text-white/80">{row.city || "Unknown"}</td>
                        <td className="px-3 py-3 text-white/80">{row.device_type || "-"}</td>
                        <td className="px-3 py-3 text-white/80">{row.language || "-"}</td>
                        <td className="max-w-[16rem] truncate px-3 py-3 text-white/60">
                          {row.referrer || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/60">
                  <tr>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Phone</th>
                    <th className="px-3 py-3">Hunt</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Provider</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-3 py-4 text-white/70" colSpan={7}>
                        Loading leads...
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td className="px-3 py-4 text-white/70" colSpan={7}>
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
                        <td className="px-3 py-3 text-white/80">{lead.status}</td>
                        <td className="px-3 py-3 text-white/80">{lead.payment_provider || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MetricsAdminPanel;
