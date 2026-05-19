import { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Search, CheckCircle, Loader2, Route,
  XCircle, Users, Car, UserCheck, X, MapPin,
  Clock, IndianRupee, ArrowRight, Calendar, Badge
} from 'lucide-react';

/* ─── KYC Status Badge ─────────────────────────────────────────── */
const KycBadge = ({ status }) => {
  const map = {
    Approved:        { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
    Pending:         { color: 'bg-orange-500/10  text-orange-400  border-orange-500/20',  dot: 'bg-orange-400'  },
    Rejected:        { color: 'bg-red-500/10     text-red-400     border-red-500/20',     dot: 'bg-red-400'     },
    Owner_Step_Done: { color: 'bg-blue-500/10    text-blue-400    border-blue-500/20',    dot: 'bg-blue-400'    },
    'Not Submitted': { color: 'bg-gray-500/10    text-gray-500    border-gray-500/20',    dot: 'bg-gray-500'    },
  };
  const s = map[status] || map['Not Submitted'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {status === 'Owner_Step_Done' ? 'Owner Done' : (status || 'Not Submitted')}
    </span>
  );
};

/* ─── Ride Status Badge ────────────────────────────────────────── */
const RideBadge = ({ status }) => {
  const map = {
    completed:  { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    cancelled:  { color: 'bg-red-500/10     text-red-400     border-red-500/20'     },
    ongoing:    { color: 'bg-blue-500/10    text-blue-400    border-blue-500/20'    },
    accepted:   { color: 'bg-indigo-500/10  text-indigo-400  border-indigo-500/20'  },
    pending:    { color: 'bg-orange-500/10  text-orange-400  border-orange-500/20'  },
  };
  const s = map[status?.toLowerCase()] || { color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${s.color}`}>
      {status || '—'}
    </span>
  );
};

const LoadingRow = ({ cols }) => (
  <tr>
    <td colSpan={cols} className="py-32 text-center">
      <Loader2 className="animate-spin text-indigo-500 mx-auto" size={36} />
    </td>
  </tr>
);

const EmptyRow = ({ cols, msg }) => (
  <tr>
    <td colSpan={cols} className="px-8 py-24 text-center text-gray-600 font-bold uppercase tracking-[0.15em] text-xs">
      {msg}
    </td>
  </tr>
);

/* ═══════════════════════════════════════════════════════════════
   RIDES MODAL
═══════════════════════════════════════════════════════════════ */
const RidesModal = ({ driverId, driverName, apiFetch, showToast, onClose }) => {
  const [rides,    setRides]    = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        setError(null);

        // Production token use karo — login pe save kiya tha
        const prodToken = localStorage.getItem('prodToken');

        if (!prodToken) {
          setError('Production token nahi mila — dobara login karo');
          return;
        }

        const res = await fetch(
          `http://13.206.124.146:7000/api/admin/rides?driverId=${driverId}&limit=500`,
          {
            headers: {
              'Authorization': `Bearer ${prodToken}`,
              'Content-Type': 'application/json',
            },
          }
        ).then(r => r.json());

        console.log('[RidesModal] API response:', res);

        let allRides = [];
        if (Array.isArray(res))             allRides = res;
        else if (Array.isArray(res?.rides)) allRides = res.rides;
        else if (Array.isArray(res?.data))  allRides = res.data;

        if (res?.earnings      !== undefined) setEarnings(res.earnings);
        if (res?.totalEarnings !== undefined) setEarnings(res.totalEarnings);

        setRides(allRides);
      } catch (err) {
        console.error('[RidesModal] error:', err);
        setError(`Rides load nahi hui: ${err.message}`);
        showToast('Rides load nahi hui', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (driverId) fetchRides();
  }, [driverId]);

  const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—';

  const getPickup = (r) =>
    r.pickupAddress || r.pickup?.address || r.from?.address ||
    r.source?.address || r.source || r.startLocation?.address || '—';

  const getDrop = (r) =>
    r.dropAddress || r.drop?.address || r.destination?.address ||
    r.to?.address || r.endLocation?.address || '—';

  const getFare = (r) =>
    r.fare ?? r.totalFare ?? r.amount ?? r.price ?? r.driverEarnings ?? null;

  const getStatus = (r) => r.status || r.rideStatus || '—';
  const getDate   = (r) => r.createdAt || r.rideDate || r.startedAt || r.date || null;

  const completed = rides.filter(r => getStatus(r).toLowerCase() === 'completed').length;
  const cancelled = rides.filter(r => getStatus(r).toLowerCase() === 'cancelled').length;

  const totalFare = earnings !== null
    ? Number(earnings)
    : rides.reduce((sum, r) => {
        const f = getFare(r);
        return sum + (f !== null ? Number(f) || 0 : 0);
      }, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#0e0e12] border border-white/8 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl shadow-black/70">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 flex-shrink-0">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tighter text-white flex items-center gap-2">
              <Route size={18} className="text-indigo-400" />
              {driverName} — Rides
            </h2>
            <p className="text-gray-500 text-[10px] font-mono mt-0.5">{driverId}</p>
          </div>

          {!loading && !error && (
            <div className="flex gap-5 mr-4">
              <div className="text-center">
                <div className="text-xl font-black text-white">{rides.length}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-widest">Total</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-emerald-400">{completed}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-widest">Done</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-red-400">{cancelled}</div>
                <div className="text-[9px] text-gray-500 uppercase tracking-widest">Cancel</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-indigo-400">
                  ₹{totalFare.toLocaleString('en-IN')}
                </div>
                <div className="text-[9px] text-gray-500 uppercase tracking-widest">Earned</div>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="bg-white/5 hover:bg-red-500/20 hover:text-red-400 p-2 rounded-xl transition-all border border-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          {error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <XCircle size={36} className="text-red-500 mb-3" />
              <p className="text-red-400 font-bold text-sm">{error}</p>
              <p className="text-gray-600 text-xs mt-1">Driver ID: {driverId}</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[750px]">
              <thead className="bg-white/[0.02] text-indigo-400/50 text-[9px] uppercase font-black tracking-widest border-b border-white/5 sticky top-0">
                <tr>
                  <th className="px-5 py-4 text-center w-10">#</th>
                  <th className="px-5 py-4">Pickup</th>
                  <th className="px-5 py-4">Drop</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Fare</th>
                  <th className="px-5 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <LoadingRow cols={6} />
                ) : rides.length === 0 ? (
                  <EmptyRow cols={6} msg="Is driver ki koi ride nahi mili" />
                ) : rides.map((ride, i) => (
                  <tr key={ride._id || i} className="hover:bg-indigo-500/[0.02] transition-all">
                    <td className="px-5 py-4 text-center text-gray-700 font-mono text-xs">{i + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-1.5 max-w-[180px]">
                        <MapPin size={10} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-300 truncate" title={getPickup(ride)}>
                          {getPickup(ride)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-1.5 max-w-[180px]">
                        <MapPin size={10} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-300 truncate" title={getDrop(ride)}>
                          {getDrop(ride)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <RideBadge status={getStatus(ride)} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm font-black text-white font-mono">
                        {getFare(ride) !== null ? `₹${getFare(ride)}` : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap">
                        {fmt(getDate(ride))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-3 border-t border-white/5 flex-shrink-0">
          <p className="text-[9px] text-gray-600 uppercase tracking-widest text-center">
            {loading ? 'Loading...' : error ? 'Error loading rides' : `${rides.length} rides found`}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SHARED DRIVER TABLE
═══════════════════════════════════════════════════════════════ */
const DriverTable = ({ apiFetch, showToast, kycType }) => {
  const [records,    setRecords]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [ridesModal, setRidesModal] = useState(null);

  const fetchAll = async () => {
    try {
      const res = await apiFetch(`/admin/kyc/all?type=${kycType}&limit=1000`);
      let list = [];
      if (Array.isArray(res))               list = res;
      else if (Array.isArray(res?.data))    list = res.data;
      else if (Array.isArray(res?.drivers)) list = res.drivers;
      else if (Array.isArray(res?.kyc))     list = res.kyc;
      else if (Array.isArray(res?.records)) list = res.records;
      setRecords(list);
    } catch (err) {
      console.error('[Driver] fetchAll error:', err);
      showToast('Data load nahi hua', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setRecords([]);
    fetchAll();
  }, [kycType]);

  const approveKyc = async (driverId) => {
    try {
      await apiFetch(`/admin/kyc/${kycType}/approve/${driverId}`, { method: 'PUT' });
      showToast('KYC Approved ✅');
      fetchAll();
    } catch { showToast('KYC approve error', 'error'); }
  };

  const rejectKyc = async (driverId) => {
    const reason = prompt('Rejection reason likho:');
    if (!reason) return;
    try {
      await apiFetch(`/admin/kyc/${kycType}/reject/${driverId}`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });
      showToast('KYC Rejected ❌');
      fetchAll();
    } catch { showToast('KYC reject error', 'error'); }
  };

  const getName  = (r) => r.driverId?.name  || r.aadharName || r.ownerAadharName || r.driverAadharName || '—';
  const getEmail = (r) => r.driverId?.email || '—';
  const getPhone = (r) => r.driverId?.phone || '—';
  const getId    = (r) => {
    if (r.driverId?._id)                return r.driverId._id;
    if (typeof r.driverId === 'string') return r.driverId;
    return r._id;
  };

  const getStep = (r) => {
    if (kycType !== 'freelance') return null;
    const s = r.status;
    if (s === 'Approved' || s === 'Rejected' || r.driverStepComplete) return 'Both Steps ✓';
    if (s === 'Owner_Step_Done' || r.ownerStepComplete) return 'Step 1 Done';
    return '—';
  };

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return getName(r).toLowerCase().includes(q) || getEmail(r).toLowerCase().includes(q);
  });

  const isFreelance = kycType === 'freelance';
  const cols = isFreelance ? 8 : 7;

  return (
    <div>
      {ridesModal && (
        <RidesModal
          driverId={ridesModal.driverId}
          driverName={ridesModal.driverName}
          apiFetch={apiFetch}
          showToast={showToast}
          onClose={() => setRidesModal(null)}
        />
      )}

      <div className="flex justify-between items-center mb-5">
        <p className="text-gray-500 text-xs font-medium tracking-wide">
          {records.length} {isFreelance ? 'freelance' : 'owner'} drivers
        </p>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input
              type="text"
              placeholder="Naam ya email..."
              className="bg-[#16161a] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm w-60 focus:border-indigo-500 outline-none transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => { setRefreshing(true); fetchAll(); }}
            className="bg-[#16161a] p-2.5 rounded-xl border border-white/5 hover:bg-white/5 transition-colors"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-indigo-500' : 'text-gray-400'} />
          </button>
        </div>
      </div>

      <div className="bg-[#121215] rounded-2xl border border-white/5 shadow-2xl shadow-black/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-white/[0.02] text-indigo-400/50 text-[9px] uppercase font-black tracking-widest border-b border-white/5">
              <tr>
                <th className="px-5 py-4 text-center w-10">#</th>
                <th className="px-5 py-4">Naam</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4 text-center">KYC</th>
                {isFreelance && <th className="px-5 py-4 text-center">Step</th>}
                <th className="px-5 py-4 text-center">Approval</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <LoadingRow cols={cols} />
              ) : filtered.length === 0 ? (
                <EmptyRow cols={cols} msg={`Koi ${isFreelance ? 'freelance' : 'owner'} driver nahi mila`} />
              ) : filtered.map((rec, i) => {
                const driverId   = getId(rec);
                const kycStatus  = rec.status || 'Not Submitted';
                const isApproved = rec.driverId?.isApproved;
                const showKycActions = kycStatus === 'Pending' && (!isFreelance || rec.driverStepComplete);

                return (
                  <tr key={rec._id} className="group hover:bg-indigo-500/[0.02] transition-all">
                    <td className="px-5 py-5 text-center text-gray-700 font-mono text-xs">{i + 1}</td>
                    <td className="px-5 py-5">
                      <div className="font-bold text-sm capitalize truncate max-w-[130px]">{getName(rec)}</div>
                      <div className="text-[9px] text-gray-600 font-mono mt-0.5 uppercase">
                        {String(driverId).slice(-8)}
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <span className="text-xs text-gray-400 truncate block max-w-[160px]">{getEmail(rec)}</span>
                    </td>
                    <td className="px-5 py-5">
                      <span className="text-xs text-gray-400 font-mono">{getPhone(rec)}</span>
                    </td>
                    <td className="px-5 py-5 text-center">
                      <KycBadge status={kycStatus} />
                    </td>
                    {isFreelance && (
                      <td className="px-5 py-5 text-center">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                          {getStep(rec)}
                        </span>
                      </td>
                    )}
                    <td className="px-5 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border
                        ${isApproved
                          ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'
                          : 'bg-orange-500/5 text-orange-400 border-orange-500/20'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isApproved ? 'bg-emerald-500' : 'bg-orange-400'}`} />
                        {isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-5 text-right">
                      <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                          onClick={() => setRidesModal({ driverId, driverName: getName(rec) })}
                          className="flex items-center gap-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all whitespace-nowrap"
                        >
                          <Route size={11} /> Rides
                        </button>
                        {showKycActions && (
                          <>
                            <button
                              onClick={() => approveKyc(driverId)}
                              className="flex items-center gap-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all"
                            >
                              <UserCheck size={11} /> ✓
                            </button>
                            <button
                              onClick={() => rejectKyc(driverId)}
                              className="flex items-center gap-1 bg-red-600/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                            >
                              <XCircle size={11} /> ✗
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN DRIVERS COMPONENT
═══════════════════════════════════════════════════════════════ */
const Drivers = ({ apiFetch, showToast }) => {
  const [tab, setTab] = useState('owner');

  return (
    <div className="flex flex-col h-full">
      <header className="flex justify-between items-center mb-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Drivers</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">
            Owner &amp; Freelance — dono ki list
          </p>
        </div>
      </header>

      <div className="flex gap-1.5 mb-6 bg-[#121215] border border-white/5 rounded-xl p-1 w-fit flex-shrink-0">
        {[
          { key: 'owner',     label: 'Owner Drivers',     icon: Car   },
          { key: 'freelance', label: 'Freelance Drivers',  icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all
              ${tab === key
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <DriverTable
          key={tab}
          apiFetch={apiFetch}
          showToast={showToast}
          kycType={tab}
        />
      </div>
    </div>
  );
};

export default Drivers;