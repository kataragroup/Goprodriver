import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Search, X, MapPin, Clock, IndianRupee, User, Route, TrendingUp } from 'lucide-react';

/* ─── Status Badge ─────────────────────────────────────────────── */
const RideStatusBadge = ({ status }) => {
  const map = {
    completed:  { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
    ongoing:    { color: 'bg-blue-500/10    text-blue-400    border-blue-500/20',    dot: 'bg-blue-400 animate-pulse'    },
    cancelled:  { color: 'bg-red-500/10     text-red-400     border-red-500/20',     dot: 'bg-red-400'     },
    pending:    { color: 'bg-orange-500/10  text-orange-400  border-orange-500/20',  dot: 'bg-orange-400'  },
    accepted:   { color: 'bg-indigo-500/10  text-indigo-400  border-indigo-500/20',  dot: 'bg-indigo-400'  },
  };
  const key = (status || '').toLowerCase();
  const s = map[key] || map['pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status || 'Unknown'}
    </span>
  );
};

/* ─── Loader / Empty helpers ───────────────────────────────────── */
const LoadingRow = ({ cols }) => (
  <tr>
    <td colSpan={cols} className="py-40 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 text-xs font-medium tracking-widest uppercase">Rides load ho rahi hain...</p>
      </div>
    </td>
  </tr>
);

const EmptyRow = ({ cols, msg }) => (
  <tr>
    <td colSpan={cols} className="px-10 py-32 text-center">
      <Route size={32} className="mx-auto mb-3 text-gray-700" />
      <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-xs">{msg}</p>
    </td>
  </tr>
);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const formatAmount = (amt) => {
  if (amt == null) return '—';
  return `₹${Number(amt).toFixed(0)}`;
};

const Rides = ({ apiFetch, showToast, driverFilter, onClearFilter }) => {
  const [rides,        setRides]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [driverStats,  setDriverStats]  = useState(null); // For earnings

  const fetchRides = useCallback(async () => {
    try {
      let allRides = [], page = 1, hasMore = true;

      // Agar driver filter hai toh Nawal ki earnings API use karein
      if (driverFilter?.id) {
          const res = await apiFetch(`/admin/drivers/${driverFilter.id}/earnings`);
          if (res?.success || res?.rides) {
            allRides = res.rides || [];
            setDriverStats({ earnings: res.earnings, count: res.count });
          }
      } else {
          // General rides fetch logic
          while (hasMore) {
            const endpoint = `/admin/rides?limit=100&page=${page}`;
            const res = await apiFetch(endpoint);

            const chunk = Array.isArray(res) ? res : (res?.rides ?? res?.data ?? []);
            allRides = [...allRides, ...chunk];

            hasMore = res?.pagination?.hasNextPage || (chunk.length === 100);
            page++;
            if (page > 20) break; 
          }
      }
      setRides(allRides);
    } catch (err) {
      console.error('[Rides] Fetch error:', err);
      showToast('Data load nahi hua', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [driverFilter?.id, apiFetch, showToast]);

  useEffect(() => {
    setLoading(true);
    setRides([]);
    setDriverStats(null);
    fetchRides();
  }, [fetchRides]);

  /* ── Extraction logic (Nawal ke backend structure ke liye) ── */
  const getPickup   = (r) => r.pickupLocation?.address || r.pickupAddress || '—';
  const getDrop     = (r) => r.dropLocation?.address   || r.dropAddress   || '—';
  const getUserName = (r) => r.userId?.name    || 'Guest User';
  const getDriverNm = (r) => r.driverId?.name  || 'Not Assigned';
  const getAmount   = (r) => r.fare            || r.amount || 0;
  const getStatus   = (r) => r.status          || 'pending';
  const getDate     = (r) => r.createdAt       || null;

  const filtered = rides.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = getPickup(r).toLowerCase().includes(q) || getUserName(r).toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || getStatus(r).toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <header className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            {driverFilter ? `${driverFilter.name} History` : 'Global Rides'}
          </h1>
          {driverFilter && driverStats && (
            <div className="flex gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    <TrendingUp size={12}/> Total Earned: {formatAmount(driverStats.earnings)}
                </span>
                <span className="text-gray-500 text-[10px] font-black uppercase bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                    Rides: {driverStats.count}
                </span>
            </div>
          )}
        </div>

        <div className="flex gap-3 items-center">
          {driverFilter && (
            <button onClick={onClearFilter} className="flex items-center gap-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-4 py-2.5 rounded-2xl text-xs font-black uppercase hover:bg-indigo-600 transition-all">
              <User size={13} /> {driverFilter.name} <X size={13} />
            </button>
          )}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={15} />
            <input
              type="text"
              placeholder="Search pickup/user..."
              className="bg-[#16161a] border border-white/5 rounded-2xl py-3 pl-11 pr-5 text-sm w-64 outline-none focus:border-indigo-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => { setRefreshing(true); fetchRides(); }} className="bg-[#16161a] p-3 rounded-2xl border border-white/5">
            <RefreshCw size={18} className={refreshing ? 'animate-spin text-indigo-500' : 'text-gray-400'} />
          </button>
        </div>
      </header>

      {/* Table Section */}
      <div className="bg-[#121215] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] text-indigo-400/50 text-[10px] uppercase font-black tracking-widest border-b border-white/5">
            <tr>
              <th className="px-8 py-5">Pickup</th>
              <th className="px-8 py-5">Drop</th>
              {!driverFilter && <th className="px-8 py-5">Driver</th>}
              <th className="px-8 py-5">Passenger</th>
              <th className="px-8 py-5 text-center">Status</th>
              <th className="px-8 py-5 text-center">Fare</th>
              <th className="px-8 py-5">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? <LoadingRow cols={driverFilter ? 6 : 7} /> : 
             filtered.length === 0 ? <EmptyRow cols={driverFilter ? 6 : 7} msg="No rides found" /> :
             filtered.map((ride) => (
              <tr key={ride._id} className="group hover:bg-indigo-500/[0.02] transition-all">
                <td className="px-8 py-6 text-sm text-gray-200 max-w-[200px] truncate">{getPickup(ride)}</td>
                <td className="px-8 py-6 text-sm text-gray-400 max-w-[200px] truncate">{getDrop(ride)}</td>
                {!driverFilter && <td className="px-8 py-6 text-sm text-indigo-300 font-medium">{getDriverNm(ride)}</td>}
                <td className="px-8 py-6 text-sm text-gray-400">{getUserName(ride)}</td>
                <td className="px-8 py-6 text-center"><RideStatusBadge status={getStatus(ride)} /></td>
                <td className="px-8 py-6 text-center font-bold text-emerald-400 font-mono">{formatAmount(getAmount(ride))}</td>
                <td className="px-8 py-6 text-xs text-gray-500">{formatDate(getDate(ride))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Rides;