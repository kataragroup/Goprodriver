import { useState, useEffect, useCallback } from "react";
import { apiFetch, fmtDate } from "../../../utils/userApiFetch";

// ── Helpers ───────────────────────────────────────────────────────────────────

const getAddr = (field) => {
  if (!field) return '—';
  if (typeof field === 'string') return field;
  return field.address || field.location || field.name || JSON.stringify(field);
};

const Avatar = ({ name }) => {
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = ["bg-violet-500", "bg-indigo-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500"];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    pending:   "bg-amber-500/15 text-amber-300 border-amber-500/25",
    accepted:  "bg-blue-500/15 text-blue-300 border-blue-500/25",
    ongoing:   "bg-violet-500/15 text-violet-300 border-violet-500/25",
    completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    cancelled: "bg-red-500/15 text-red-300 border-red-500/25",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border capitalize ${map[status] || "bg-white/5 text-white/40 border-white/10"}`}>
      {status || "—"}
    </span>
  );
};

const SkeletonRow = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-5 py-3.5">
        <div className="h-3 bg-white/5 rounded animate-pulse" />
      </td>
    ))}
  </tr>
);

const SearchInput = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-violet-500 transition-all w-56"
  />
);

const RefreshBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all"
  >
    ↻ Refresh
  </button>
);

const PageHeader = ({ title, subtitle, children }) => (
  <div className="flex items-center justify-between gap-4 flex-wrap">
    <div>
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <p className="text-xs text-white/30 mt-0.5">{subtitle}</p>
    </div>
    <div className="flex items-center gap-3">{children}</div>
  </div>
);

const EmptyState = ({ message }) => (
  <tr>
    <td colSpan={99} className="px-5 py-16 text-center text-white/20 text-sm">{message}</td>
  </tr>
);

const Table = ({ headers, children }) => (
  <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {headers.map(h => (
              <th key={h} className="px-5 py-3.5 text-[11px] font-semibold text-white/25 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">{children}</tbody>
      </table>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const STATUSES = ["all", "pending", "accepted", "ongoing", "completed", "cancelled"];

export default function UserRides({ apiFetch: _apiFetch, showToast }) {
  const [rides, setRides]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [q, setQ]             = useState("");
  const [status, setStatus]   = useState("all");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const d = await apiFetch("/admin/rides");
      if (d.success) setRides(d.data || []);
      else setError(d.message || "Rides load karne mein error");
    } catch (e) {
      setError("Server se connect nahi ho paya: " + e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rides.filter((r) => {
    const pickup = getAddr(r.pickup);
    const drop   = getAddr(r.drop);
    const matchQ = [pickup, drop, r.user?.fullName, r.user?.phone]
      .join(" ").toLowerCase().includes(q.toLowerCase());
    const matchS = status === "all" || r.status === status;
    return matchQ && matchS;
  });

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "all" ? rides.length : rides.filter(r => r.status === s).length;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="User Rides" subtitle={`${rides.length} total rides`}>
        <SearchInput value={q} onChange={setQ} placeholder="Search rides..." />
        <RefreshBtn onClick={load} />
      </PageHeader>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              status === s
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "bg-white/5 text-white/35 border border-white/10 hover:text-white hover:bg-white/10"
            }`}>
            {s === "all" ? "All" : s} <span className="opacity-50 ml-1">{counts[s]}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <Table headers={["#", "User", "Pickup", "Drop", "Status", "Fare", "Driver", "Date"]}>
        {loading ? (
          Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
        ) : filtered.length === 0 ? (
          <EmptyState message="Koi ride nahi mili" />
        ) : (
          filtered.map((r, idx) => (
            <tr key={r._id} className="hover:bg-white/[0.025] transition-colors">
              <td className="px-5 py-3.5 text-white/20 text-xs w-10">{idx + 1}</td>

              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <Avatar name={r.user?.fullName} />
                  <div>
                    <p className="text-white font-medium text-xs leading-none">{r.user?.fullName || "—"}</p>
                    <p className="text-white/30 text-[11px] mt-0.5 font-mono">{r.user?.phone || "—"}</p>
                  </div>
                </div>
              </td>

              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-white/70 text-xs max-w-[140px] truncate">{getAddr(r.pickup)}</span>
                </div>
              </td>

              <td className="px-5 py-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                  <span className="text-white/70 text-xs max-w-[140px] truncate">{getAddr(r.drop)}</span>
                </div>
              </td>

              <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>

              <td className="px-5 py-3.5">
                {r.fare ? (
                  <span className="text-emerald-400 text-xs font-semibold">₹{r.fare}</span>
                ) : (
                  <span className="text-white/20 text-xs">—</span>
                )}
              </td>

              <td className="px-5 py-3.5">
                {r.driver?.fullName ? (
                  <span className="text-sky-400 text-xs">{r.driver.fullName}</span>
                ) : (
                  <span className="text-white/20 text-xs">Not assigned</span>
                )}
              </td>

              <td className="px-5 py-3.5 text-white/30 text-xs whitespace-nowrap">{fmtDate(r.createdAt)}</td>
            </tr>
          ))
        )}
      </Table>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-white/20 text-right">
          {filtered.length} of {rides.length} rides
        </p>
      )}
    </div>
  );
}