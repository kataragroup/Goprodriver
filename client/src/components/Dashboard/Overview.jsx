import { Users, Car, MapPin, FileCheck } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 hover:border-white/10 transition-all">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">{label}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={16} />
      </div>
    </div>
    <div className="text-4xl font-black tracking-tighter text-white">{value ?? 0}</div>
    <div className="text-[11px] text-gray-600 font-medium">{sub}</div>
  </div>
);

const OverviewPage = ({ stats, kycCount, recentUsers = [], recentDrivers = [] }) => (
  <div>
    <header className="mb-10">
      <h1 className="text-3xl font-black tracking-tighter uppercase">Overview</h1>
      <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">Real-time platform snapshot</p>
    </header>

    {/* Stats */}
    <div className="grid grid-cols-4 gap-5 mb-10">
      <StatCard icon={Users}     label="Total Users"   value={stats.users}   color="bg-indigo-500/10 text-indigo-400"  sub="Registered users"  />
      <StatCard icon={Car}       label="Total Drivers"  value={stats.drivers} color="bg-emerald-500/10 text-emerald-400" sub="Active drivers"     />
      <StatCard icon={MapPin}    label="Total Rides"    value={stats.rides}   color="bg-orange-500/10 text-orange-400"  sub="All time rides"     />
      <StatCard icon={FileCheck} label="KYC Approved"   value={kycCount}      color="bg-purple-500/10 text-purple-400"  sub="Verified partners"  />
    </div>

    {/* Recent snapshots */}
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-[#121215] border border-white/5 rounded-2xl p-6">
        <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-5">Recent Users</p>
        <div className="space-y-3">
          {recentUsers.slice(0, 6).map((u) => (
            <div key={u._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm font-semibold text-gray-200 capitalize">{u.name || u.email || '—'}</p>
                <p className="text-[10px] text-gray-600 font-mono">{u._id?.slice(-10)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border
                ${u.isBlocked ? 'bg-red-500/5 text-red-400 border-red-500/20' : 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'}`}>
                {u.isBlocked ? 'Blocked' : 'Active'}
              </span>
            </div>
          ))}
          {recentUsers.length === 0 && <p className="text-xs text-gray-600">Koi user nahi mila</p>}
        </div>
      </div>

      <div className="bg-[#121215] border border-white/5 rounded-2xl p-6">
        <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-5">Recent Drivers</p>
        <div className="space-y-3">
          {recentDrivers.slice(0, 6).map((d) => (
            <div key={d._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm font-semibold text-gray-200 capitalize">{d.name || d.email || '—'}</p>
                <p className="text-[10px] text-gray-600 font-mono">{d._id?.slice(-10)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border
                ${d.isApproved ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/5 text-orange-400 border-orange-500/20'}`}>
                {d.isApproved ? 'Approved' : 'Pending'}
              </span>
            </div>
          ))}
          {recentDrivers.length === 0 && <p className="text-xs text-gray-600">Koi driver nahi mila</p>}
        </div>
      </div>
    </div>
  </div>
);

export default OverviewPage;