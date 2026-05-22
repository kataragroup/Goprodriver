import { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, Users, UserCheck, UserX, Phone,
  Mail, MapPin, ChevronRight, X, Shield, ShieldOff,
  Loader2, Calendar, CreditCard, MessageSquare, AlertCircle,
  Wallet, Home, TrendingUp, Eye
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmt = (n) => (n !== undefined && n !== null ? String(n) : '—');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtAmount = (n) => n !== undefined && n !== null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

const Avatar = ({ name, size = 'md' }) => {
  const initials = name ? name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  const colors = [
    'bg-indigo-500/20 text-indigo-400',
    'bg-violet-500/20 text-violet-400',
    'bg-sky-500/20 text-sky-400',
    'bg-emerald-500/20 text-emerald-400',
    'bg-amber-500/20 text-amber-400',
    'bg-rose-500/20 text-rose-400',
  ];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  const sz = size === 'lg' ? 'w-14 h-14 text-lg' : 'w-9 h-9 text-xs';
  return (
    <div className={`${sz} ${color} rounded-xl flex items-center justify-center font-black flex-shrink-0`}>
      {initials}
    </div>
  );
};

const Badge = ({ children, color }) => {
  const map = {
    green:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red:    'bg-red-500/10 text-red-400 border-red-500/20',
    amber:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    gray:   'bg-white/5 text-gray-400 border-white/10',
  };
  return (
    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${map[color] || map.gray}`}>
      {children}
    </span>
  );
};

const Empty = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-2 opacity-30">
    <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{label}</p>
  </div>
);

// ─── Detail Modal ──────────────────────────────────────────────────────────
const UserDetailModal = ({ user, onClose, apiFetch, showToast, onRefresh }) => {
  const [tab,          setTab]          = useState('overview');
  const [payments,     setPayments]     = useState([]);
  const [wallet,       setWallet]       = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [addresses,    setAddresses]    = useState([]);
  const [feedback,     setFeedback]     = useState([]);
  const [complaints,   setComplaints]   = useState([]);
  const [loadingTab,   setLoadingTab]   = useState(false);
  const [blocking,     setBlocking]     = useState(false);

  const loadTab = useCallback(async (t) => {
    setLoadingTab(true);
    try {
      const uid = user._id;
      if (t === 'payments') {
        const r = await apiFetch(`/admin/users/${uid}/payments`);
        setPayments(Array.isArray(r) ? r : r?.data || []);
      }
      if (t === 'wallet') {
        const [w, tx] = await Promise.all([
          apiFetch(`/admin/users/${uid}/wallet`),
          apiFetch(`/admin/users/${uid}/wallet/transactions`),
        ]);
        setWallet(w);
        setTransactions(Array.isArray(tx) ? tx : tx?.data || []);
      }
      if (t === 'addresses') {
        const r = await apiFetch(`/admin/users/${uid}/address`);
        setAddresses(Array.isArray(r) ? r : r?.data || []);
      }
      if (t === 'feedback') {
        const r = await apiFetch(`/admin/users/${uid}/feedback`);
        setFeedback(Array.isArray(r) ? r : r?.data || []);
      }
      if (t === 'complaints') {
        const r = await apiFetch(`/admin/users/${uid}/complaints`);
        setComplaints(Array.isArray(r) ? r : r?.data || []);
      }
    } catch { /* silent */ }
    finally { setLoadingTab(false); }
  }, [user._id, apiFetch]);

  useEffect(() => {
    if (tab !== 'overview') loadTab(tab);
  }, [tab, loadTab]);

  const handleBlock = async () => {
    setBlocking(true);
    try {
      await apiFetch(`/admin/users/${user._id}/block`, { method: 'PATCH' });
      showToast(`User ${user.isBlocked ? 'unblock' : 'block'} ho gaya`);
      onRefresh();
      onClose();
    } catch {
      showToast('Action fail hua', 'error');
    } finally {
      setBlocking(false);
    }
  };

  const TABS = [
    { id: 'overview',   label: 'Overview',   icon: Eye },
    { id: 'payments',   label: 'Payments',   icon: CreditCard },
    { id: 'wallet',     label: 'Wallet',     icon: Wallet },
    { id: 'addresses',  label: 'Addresses',  icon: Home },
    { id: 'feedback',   label: 'Feedback',   icon: MessageSquare },
    { id: 'complaints', label: 'Complaints', icon: AlertCircle },
  ];

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="bg-[#111114] border border-white/8 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} size="lg" />
            <div>
              <h2 className="text-lg font-black tracking-tight capitalize">{user.name || '—'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge color={user.isBlocked ? 'red' : 'green'}>
                  {user.isBlocked ? 'Blocked' : 'Active'}
                </Badge>
                {user.phone && (
                  <span className="text-[11px] text-gray-500 font-mono">{user.phone}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBlock}
              disabled={blocking}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                user.isBlocked
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
              }`}
            >
              {blocking
                ? <Loader2 size={12} className="animate-spin" />
                : user.isBlocked ? <Shield size={12} /> : <ShieldOff size={12} />
              }
              {user.isBlocked ? 'Unblock' : 'Block'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-white/5 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
                tab === id
                  ? 'text-indigo-400 border-indigo-400 bg-indigo-500/5'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              <Icon size={12} />{label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingTab ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={24} className="animate-spin text-indigo-400" />
            </div>
          ) : (
            <>
              {/* Overview */}
              {tab === 'overview' && (
                <div className="space-y-3">
                  {[
                    { icon: Mail,     label: 'Email',  value: user.email },
                    { icon: Phone,    label: 'Phone',  value: user.phone },
                    { icon: Calendar, label: 'Joined', value: fmtDate(user.createdAt) },
                    { icon: MapPin,   label: 'City',   value: user.city || user.location },
                    { icon: Shield,   label: 'Status', value: user.isBlocked ? 'Blocked' : 'Active' },
                  ].map(({ icon: Icon, label, value }) => value ? (
                    <div key={label} className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0">
                        <Icon size={14} />
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-wider">{label}</p>
                        <p className="text-sm text-gray-200 font-medium mt-0.5">{fmt(value)}</p>
                      </div>
                    </div>
                  ) : null)}
                </div>
              )}

              {/* Payments */}
              {tab === 'payments' && (
                <div className="space-y-2">
                  {payments.length === 0 ? (
                    <Empty label="No payments found" />
                  ) : payments.map((p, i) => (
                    <div key={p._id || i} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-white">{p.description || p.type || 'Payment'}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-mono">{fmtDate(p.createdAt)}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-sm font-black text-emerald-400">{fmtAmount(p.amount)}</p>
                        <Badge color={p.status === 'success' ? 'green' : p.status === 'failed' ? 'red' : 'amber'}>
                          {p.status || 'pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Wallet */}
              {tab === 'wallet' && (
                <div className="space-y-4">
                  {wallet && (
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mb-1">Wallet Balance</p>
                        <p className="text-3xl font-black tracking-tighter text-white">
                          {fmtAmount(wallet.balance ?? wallet.totalBalance)}
                        </p>
                      </div>
                      <Wallet size={32} className="text-indigo-400/40" />
                    </div>
                  )}
                  <div className="space-y-2">
                    {transactions.length === 0 ? (
                      <Empty label="No transactions" />
                    ) : transactions.map((tx, i) => (
                      <div key={tx._id || i} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-white">{tx.description || tx.type || 'Transaction'}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 font-mono">{fmtDate(tx.createdAt)}</p>
                        </div>
                        <p className={`text-sm font-black ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {tx.type === 'credit' ? '+' : '-'}{fmtAmount(tx.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Addresses */}
              {tab === 'addresses' && (
                <div className="space-y-2">
                  {addresses.length === 0 ? (
                    <Empty label="No addresses saved" />
                  ) : addresses.map((a, i) => (
                    <div key={a._id || i} className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge color="indigo">{a.type || a.label || 'Address'}</Badge>
                      </div>
                      <p className="text-sm text-gray-200">{a.address || a.fullAddress || fmt(a)}</p>
                      {a.landmark && (
                        <p className="text-xs text-gray-500 mt-0.5">Near: {a.landmark}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Feedback */}
              {tab === 'feedback' && (
                <div className="space-y-2">
                  {feedback.length === 0 ? (
                    <Empty label="No feedback submitted" />
                  ) : feedback.map((f, i) => (
                    <div key={f._id || i} className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
                      <p className="text-sm text-gray-200">{f.message || f.text || f.feedback || '—'}</p>
                      <p className="text-[10px] text-gray-600 font-mono mt-1">{fmtDate(f.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Complaints */}
              {tab === 'complaints' && (
                <div className="space-y-2">
                  {complaints.length === 0 ? (
                    <Empty label="No complaints filed" />
                  ) : complaints.map((c, i) => (
                    <div key={c._id || i} className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <Badge color={c.status === 'resolved' ? 'green' : 'amber'}>
                          {c.status || 'open'}
                        </Badge>
                        <span className="text-[10px] text-gray-600 font-mono">{fmtDate(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-200">{c.message || c.description || c.complaint || '—'}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Users Page ───────────────────────────────────────────────────────
const UsersPage = ({ apiFetch, showToast }) => {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('all');
  const [selected,   setSelected]   = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/users');
      const list = Array.isArray(res) ? res : res?.data || res?.users || [];
      setUsers(list);
    } catch {
      showToast('Users load nahi hue', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiFetch, showToast]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await apiFetch('/admin/users');
      const list = Array.isArray(res) ? res : res?.data || res?.users || [];
      setUsers(list);
    } catch {
      showToast('Refresh fail hua', 'error');
    } finally {
      setRefreshing(false);
    }
  }, [apiFetch, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter(u => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all'     ? true :
      filter === 'active'  ? !u.isBlocked :
      filter === 'blocked' ?  u.isBlocked : true;
    return matchSearch && matchFilter;
  });

  const totalActive  = users.filter(u => !u.isBlocked).length;
  const totalBlocked = users.filter(u =>  u.isBlocked).length;

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">User Management</p>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">All Users</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">
            {loading ? 'Loading...' : `${users.length} total users registered`}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Users',   value: users.length,  icon: Users,     color: 'text-indigo-400',  bg: 'bg-indigo-500/10'  },
          { label: 'Active Users',  value: totalActive,   icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Blocked Users', value: totalBlocked,  icon: UserX,     color: 'text-red-400',     bg: 'bg-red-500/10'     },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#121215] border border-white/5 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-white/10 transition-colors">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tighter">
                {loading
                  ? <Loader2 size={16} className="animate-spin text-gray-600" />
                  : value
                }
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            placeholder="Name, phone ya email search karo..."
            className="w-full bg-[#121215] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500/50 outline-none transition-all text-gray-200 placeholder-gray-600"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-[#121215] border border-white/5 rounded-xl p-1">
          {['all', 'active', 'blocked'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                filter === f
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-[#121215] border border-white/5 rounded-2xl overflow-hidden">

        {/* Table Head */}
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_40px] gap-4 px-6 py-3 border-b border-white/5">
          {['User', 'Contact', 'Joined', 'Status', ''].map(h => (
            <p key={h} className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">{h}</p>
          ))}
        </div>

        {/* Rows */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 420px)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 size={24} className="animate-spin text-indigo-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 opacity-30">
              <Users size={32} className="text-gray-600" />
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest">
                {search ? 'Koi user nahi mila' : 'No users found'}
              </p>
            </div>
          ) : (
            filtered.map((user, i) => (
              <div
                key={user._id || i}
                onClick={() => setSelected(user)}
                className="grid grid-cols-[2fr_1.5fr_1fr_1fr_40px] gap-4 px-6 py-4 border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-all group last:border-0"
              >
                {/* Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={user.name} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white capitalize truncate">{user.name || '—'}</p>
                    <p className="text-[10px] text-gray-500 truncate font-mono">{user._id?.slice(-8) || ''}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-xs text-gray-300 font-medium truncate">{user.email || '—'}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{user.phone || '—'}</p>
                </div>

                {/* Joined */}
                <div className="flex items-center">
                  <p className="text-[11px] text-gray-500 font-mono">{fmtDate(user.createdAt)}</p>
                </div>

                {/* Status */}
                <div className="flex items-center">
                  <Badge color={user.isBlocked ? 'red' : 'green'}>
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </Badge>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <ChevronRight size={14} className="text-gray-700 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] text-gray-600 font-mono">
              Showing {filtered.length} of {users.length} users
            </p>
            <div className="flex items-center gap-1">
              <TrendingUp size={10} className="text-gray-700" />
              <p className="text-[10px] text-gray-600 font-mono">
                {((totalActive / (users.length || 1)) * 100).toFixed(0)}% active rate
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <UserDetailModal
          user={selected}
          onClose={() => setSelected(null)}
          apiFetch={apiFetch}
          showToast={showToast}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};

export default UsersPage;