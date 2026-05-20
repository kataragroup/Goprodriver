import { useState, useEffect } from 'react';
import {
  RefreshCw, Search, Loader2, Route,
  ExternalLink, Car, Users
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
   SHARED DRIVER TABLE
═══════════════════════════════════════════════════════════════ */
const DriverTable = ({ apiFetch, showToast, kycType, onViewProfile, onViewRides }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    try {
      setRefreshing(true);
      const res = await apiFetch(`/admin/kyc/all?type=${kycType}&limit=1000`);
      
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.drivers)) list = res.drivers;
      else if (Array.isArray(res?.kyc)) list = res.kyc;
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
    fetchAll();
  }, [kycType]);

  const getName = (r) => r.driverId?.name || r.aadharName || r.ownerAadharName || r.driverAadharName || '—';
  const getEmail = (r) => r.driverId?.email || '—';
  const getPhone = (r) => r.driverId?.phone || '—';
  const getId = (r) => r.driverId?._id || r._id;

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return getName(r).toLowerCase().includes(q) || getEmail(r).toLowerCase().includes(q);
  });

  const isFreelance = kycType === 'freelance';
  const cols = isFreelance ? 8 : 7;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="text-gray-500 text-xs font-medium tracking-wide">
          {records.length} {isFreelance ? 'Freelance' : 'Owner'} Drivers
        </p>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input
              type="text"
              placeholder="Naam ya email..."
              className="bg-[#16161a] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm w-60 focus:border-indigo-500 outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={fetchAll}
            className="bg-[#16161a] p-2.5 rounded-xl border border-white/5 hover:bg-white/5 transition-colors"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-indigo-500' : 'text-gray-400'} />
          </button>
        </div>
      </div>

      <div className="bg-[#121215] rounded-2xl border border-white/5 shadow-2xl shadow-black/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
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
              ) : (
                filtered.map((rec, i) => {
                  const driverId = getId(rec);
                  const driverName = getName(rec);

                  return (
                    <tr key={rec._id || i} className="group hover:bg-indigo-500/[0.02] transition-all">
                      <td className="px-5 py-5 text-center text-gray-700 font-mono text-xs">{i + 1}</td>

                      <td className="px-5 py-5">
                        <button
                          onClick={() => onViewProfile({ driverId, driverName, kycType })}
                          className="text-left hover:text-indigo-400 transition-colors"
                        >
                          <div className="font-bold text-sm capitalize">{driverName}</div>
                          <div className="text-[9px] text-gray-600 font-mono">{String(driverId).slice(-8)}</div>
                        </button>
                      </td>

                      <td className="px-5 py-5 text-xs text-gray-400">{getEmail(rec)}</td>
                      <td className="px-5 py-5 text-xs text-gray-400 font-mono">{getPhone(rec)}</td>
                      <td className="px-5 py-5 text-center"><KycBadge status={rec.status || 'Not Submitted'} /></td>
                      
                      {isFreelance && (
                        <td className="px-5 py-5 text-center text-[9px] text-gray-400">
                          {rec.driverStepComplete ? 'Both Steps ✓' : 'Step 1 Done'}
                        </td>
                      )}

                      <td className="px-5 py-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border
                          ${rec.driverId?.isApproved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                          {rec.driverId?.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-right">
                        <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => onViewProfile({ driverId, driverName, kycType })}
                            className="flex items-center gap-1 bg-violet-600/20 text-violet-400 border border-violet-500/30 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-violet-600 hover:text-white"
                          >
                            <ExternalLink size={11} /> Profile
                          </button>

                          <button
                            onClick={() => onViewRides({ id: driverId, name: driverName })}
                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all active:scale-95"
                          >
                            <Route size={12} /> Rides
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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
const Drivers = ({ apiFetch, showToast, onViewProfile, onViewDriverRides }) => {
  const [tab, setTab] = useState('owner');

  return (
    <div className="flex flex-col h-full">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Drivers</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">
            Owner &amp; Freelance Drivers
          </p>
        </div>
      </header>

      <div className="flex gap-1.5 mb-6 bg-[#121215] border border-white/5 rounded-xl p-1 w-fit">
        {[
          { key: 'owner', label: 'Owner Drivers', icon: Car },
          { key: 'freelance', label: 'Freelance Drivers', icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all
              ${tab === key ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <DriverTable
        key={tab}
        apiFetch={apiFetch}
        showToast={showToast}
        kycType={tab}
        onViewProfile={onViewProfile}
        onViewRides={onViewDriverRides}
      />
    </div>
  );
};

export default Drivers;