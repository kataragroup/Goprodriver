import { useState, useEffect } from 'react';
import { Users2, MapPin, Activity, Loader2, TrendingUp, Car, FileCheck } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, color, loading }) => (
  <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-xl shadow-black/30 hover:border-white/10 transition-colors">
    <div className="flex items-center justify-between">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <TrendingUp size={14} className="text-gray-700" />
    </div>
    {loading ? (
      <Loader2 size={18} className="animate-spin text-gray-600" />
    ) : (
      <>
        <div>
          <p className="text-3xl font-black tracking-tighter">{value ?? '—'}</p>
          {sub && <p className="text-[10px] text-gray-500 font-mono mt-1">{sub}</p>}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{label}</p>
      </>
    )}
  </div>
);

const RecentRow = ({ label, value, dot }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${dot}`} />
      <span className="text-sm text-gray-300 font-medium">{label}</span>
    </div>
    <span className="text-xs text-gray-500 font-mono">{value}</span>
  </div>
);

const Dashboard = ({ apiFetch, showToast }) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, ridesRes] = await Promise.allSettled([
          apiFetch('/admin/users'),
          apiFetch('/admin/rides'),
        ]);

        const users = usersRes.status === 'fulfilled'
          ? (usersRes.value?.data || usersRes.value?.users || (Array.isArray(usersRes.value) ? usersRes.value : []))
          : [];

        const rides = ridesRes.status === 'fulfilled'
          ? (ridesRes.value?.data || (Array.isArray(ridesRes.value) ? ridesRes.value : []))
          : [];

        setStats({
          users:        users.length,
          blockedUsers: users.filter(u => u.isBlocked).length,
          totalRides:   rides.length,
          completed:    rides.filter(r => r.status === 'completed').length,
          ongoing:      rides.filter(r => r.status === 'ongoing').length,
          cancelled:    rides.filter(r => r.status === 'cancelled').length,
        });
      } catch {
        showToast?.('Stats load nahi hue', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    {
      icon: Users2,
      label: 'Total Users',
      value: stats.users,
      sub: `${stats.blockedUsers ?? 0} blocked`,
      color: 'bg-indigo-500/10 text-indigo-400',
    },
    {
      icon: MapPin,
      label: 'Total Rides',
      value: stats.totalRides,
      sub: `${stats.completed ?? 0} completed`,
      color: 'bg-violet-500/10 text-violet-400',
    },
    {
      icon: Car,
      label: 'Ongoing Rides',
      value: stats.ongoing,
      sub: 'Right now',
      color: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      icon: Activity,
      label: 'Cancelled',
      value: stats.cancelled,
      sub: 'All time',
      color: 'bg-rose-500/10 text-rose-400',
    },
  ];

  return (
    <div>
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Live</p>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">User Dashboard</h1>
        <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">
          Users aur rides ka overview
        </p>
      </header>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} loading={loading} />
        ))}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-2 gap-4">
        {/* Quick links */}
        <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 shadow-xl shadow-black/30">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">Quick Access</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users2,    label: 'Users',       color: 'text-indigo-400 bg-indigo-500/10'  },
              { icon: MapPin,    label: 'User Rides',  color: 'text-violet-400 bg-violet-500/10'  },
              { icon: Car,       label: 'Drivers',     color: 'text-emerald-400 bg-emerald-500/10'},
              { icon: FileCheck, label: 'KYC',         color: 'text-amber-400 bg-amber-500/10'    },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label}
                className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon size={15} />
                </div>
                <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 shadow-xl shadow-black/30">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">System Health</p>
          <div className="space-y-1">
            <RecentRow label="Auth Service"        value="Operational" dot="bg-emerald-400 animate-pulse" />
            <RecentRow label="Rides Service"       value="Operational" dot="bg-emerald-400 animate-pulse" />
            <RecentRow label="User Service"        value="Operational" dot="bg-emerald-400 animate-pulse" />
            <RecentRow label="Notification System" value="Operational" dot="bg-emerald-400 animate-pulse" />
            <RecentRow label="Database"            value="Operational" dot="bg-emerald-400 animate-pulse" />
            <RecentRow label="OTP Service"         value="Operational" dot="bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;