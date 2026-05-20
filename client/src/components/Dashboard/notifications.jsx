import { useState, useEffect } from 'react';
import { Bell, Send, RefreshCw, Loader2, Users, Car, CheckCheck, Search, X, CheckCircle2 } from 'lucide-react';

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Abhi';
  if (mins < 60) return `${mins}m pehle`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h pehle`;
  return `${Math.floor(hrs / 24)}d pehle`;
};

const safeFetch = async (url, options = {}) => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.warn('[Notifications] safeFetch: invalid or empty url', url);
    return null;
  }

  try {
    const token =
      localStorage.getItem('adminToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('admin_token') ||
      sessionStorage.getItem('adminToken') ||
      sessionStorage.getItem('token');


   const API_BASE = process.env.REACT_APP_API_URL || 'http://13.206.124.146:7000/api';
    const fullUrl = `${API_BASE}${url}`;

    try {
      new URL(fullUrl);
    } catch {
      console.warn(`[Notifications] safeFetch: malformed URL "${fullUrl}" — skipping`);
      return null;
    }

    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!res.ok) {
      console.warn(`[Notifications] safeFetch ${url} → HTTP ${res.status}`);
      return null;
    }

    try {
      return await res.json();
    } catch {
      console.warn(`[Notifications] safeFetch ${url} → JSON parse failed`);
      return null;
    }
  } catch (err) {
    console.error(`[Notifications] safeFetch error (${url}):`, err);
    return null;
  }
};

const PersonRow = ({ person, isSelected, onClick }) => (
  <div
    onClick={() => onClick(person)}
    className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-all border-l-2 ${
      isSelected ? 'bg-indigo-500/10 border-indigo-500' : 'hover:bg-white/[0.03] border-transparent'
    }`}
  >
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
      isSelected ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400'
    }`}>
      {(person.name || person.email || '?')[0].toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <div className={`text-sm font-bold capitalize truncate ${isSelected ? 'text-indigo-300' : 'text-gray-300'}`}>
        {person.name || '—'}
      </div>
      <div className="text-[10px] text-gray-600 truncate font-mono">
        {person.email || person.phone || person._id?.slice(-8)}
      </div>
    </div>
    {isSelected && <CheckCircle2 size={14} className="text-indigo-400 flex-shrink-0" />}
  </div>
);

const PeoplePanel = ({ title, icon, list, loading, selectedIds, onSelect, onSelectAll, allSelected, search, onSearch }) => (
  <div className="bg-[#121215] rounded-[1.5rem] border border-white/5 overflow-hidden flex flex-col">
    <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2 flex-shrink-0">
      <span className="text-indigo-400">{icon}</span>
      <span className="text-xs font-black uppercase tracking-widest text-indigo-400">{title}</span>
      <span className="ml-auto text-[10px] text-gray-600 font-mono">{list.length}</span>
      <button
        onClick={onSelectAll}
        className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border transition-all ${
          allSelected ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'border-white/5 text-gray-600 hover:text-gray-400'
        }`}
      >
        {allSelected ? 'Deselect All' : 'Select All'}
      </button>
    </div>

    <div className="px-4 py-2.5 border-b border-white/5 flex-shrink-0">
      <div className="relative">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-white/5 border border-white/5 rounded-lg py-2 pl-8 pr-3 text-xs outline-none focus:border-indigo-500 transition-all placeholder:text-gray-600"
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>
    </div>

    <div className="overflow-y-auto flex-1 max-h-52 divide-y divide-white/5">
      {loading ? (
        <div className="py-8 flex justify-center">
          <Loader2 size={20} className="animate-spin text-indigo-500" />
        </div>
      ) : list.length === 0 ? (
        <div className="py-8 text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest">
          Koi nahi mila
        </div>
      ) : list.map(person => (
        <PersonRow
          key={person._id}
          person={person}
          isSelected={selectedIds.includes(String(person._id))}
          onClick={onSelect}
        />
      ))}
    </div>
  </div>
);

const Notifications = ({ apiFetch, showToast }) => {
  const [notifications, setNotifications] = useState([]);
  const [notifLoading,  setNotifLoading]  = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [sending,       setSending]       = useState(false);

  const [userList,       setUserList]       = useState([]);
  const [driverList,     setDriverList]     = useState([]);
  const [usersLoading,   setUsersLoading]   = useState(true);
  const [driversLoading, setDriversLoading] = useState(true);

  const [userSearch,   setUserSearch]   = useState('');
  const [driverSearch, setDriverSearch] = useState('');

  const [selectedUserIds,   setSelectedUserIds]   = useState([]);
  const [selectedDriverIds, setSelectedDriverIds] = useState([]);

  const [form, setForm] = useState({ type: 'broadcast', title: '', body: '' });

  const fetchUsers = async () => {
    setUsersLoading(true);
    const res = await safeFetch('/admin/users?limit=1000');
    const list = Array.isArray(res) ? res : (res?.data || res?.users || []);
    setUserList(list);
    setUsersLoading(false);
  };

  const fetchDrivers = async () => {
    setDriversLoading(true);
    const [ownerRes, freelanceRes] = await Promise.all([
      safeFetch('/admin/kyc/all?type=owner&limit=1000'),
      safeFetch('/admin/kyc/all?type=freelance&limit=1000'),
    ]);

    const extract = (res) => {
      if (!res) return [];
      if (Array.isArray(res))          return res;
      if (Array.isArray(res?.data))    return res.data;
      if (Array.isArray(res?.drivers)) return res.drivers;
      if (Array.isArray(res?.kyc))     return res.kyc;
      if (Array.isArray(res?.records)) return res.records;
      return [];
    };

    const all = [...extract(ownerRes), ...extract(freelanceRes)];
    const seen = new Set();
    const unique = all.filter(r => {
      const id = String(r.driverId?._id || r.driverId || r._id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    setDriverList(unique.map(r => ({
      _id:   r.driverId?._id   || r._id,
      name:  r.driverId?.name  || r.aadharName || r.ownerAadharName || r.driverAadharName || '—',
      email: r.driverId?.email || '—',
      phone: r.driverId?.phone || '—',
    })));

    setDriversLoading(false);
  };

  const fetchNotifications = async () => {
    setNotifLoading(true);
    let data = null;

    data = await safeFetch('/admin/notifications');
    if (!data) data = await safeFetch('/notifications/all');
    if (!data) data = await safeFetch('/notifications/my');

    if (Array.isArray(data))             setNotifications(data);
    else if (Array.isArray(data?.data))  setNotifications(data.data);
    else                                 setNotifications([]);

    setNotifLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUsers();
    fetchDrivers();
    fetchNotifications();
  }, []);

  const filteredUsers = userList.filter(p =>
    (p.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredDrivers = driverList.filter(p =>
    (p.name || '').toLowerCase().includes(driverSearch.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(driverSearch.toLowerCase())
  );

  const allUsersSelected   = userList.length > 0   && userList.every(u => selectedUserIds.includes(String(u._id)));
  const allDriversSelected = driverList.length > 0 && driverList.every(d => selectedDriverIds.includes(String(d._id)));

  const toggleUser   = (p) => { const id = String(p._id); setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); };
  const toggleDriver = (p) => { const id = String(p._id); setSelectedDriverIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); };
  const toggleAllUsers   = () => setSelectedUserIds(allUsersSelected ? [] : userList.map(u => String(u._id)));
  const toggleAllDrivers = () => setSelectedDriverIds(allDriversSelected ? [] : driverList.map(d => String(d._id)));

  const markAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.isRead);
      await Promise.all(unread.map(n => safeFetch(`/notifications/read/${n._id}`, { method: 'PUT' })));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('Sab read mark ho gaya');
    } catch { showToast('Error aaya', 'error'); }
  };

  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      showToast('Title aur message dono bharo', 'error');
      return;
    }

    if (form.type === 'broadcast') {
      setSending(true);
      try {
        const res = await apiFetch('/notifications/broadcast-all', {
          method: 'POST',
          body: JSON.stringify({ title: form.title, body: form.body, data: {} }),
        });
        if (res?.success !== false) {
          showToast('Sabko notification bhej di! 🚀');
          setForm(f => ({ ...f, title: '', body: '' }));
          fetchNotifications();
        } else {
          showToast(res?.message || 'Kuch gadbad hui', 'error');
        }
      } catch { showToast('Send nahi hua', 'error'); }
      finally { setSending(false); }

    } else {
      const total = selectedUserIds.length + selectedDriverIds.length;
      if (total === 0) { showToast('Kam se kam ek select karo', 'error'); return; }
      setSending(true);
      try {
        await Promise.all([
          ...selectedUserIds.map(id =>
            apiFetch('/notifications/send', {
              method: 'POST',
              body: JSON.stringify({ title: form.title, body: form.body, data: {}, recipientId: id, recipientType: 'user' }),
            })
          ),
          ...selectedDriverIds.map(id =>
            apiFetch('/notifications/send', {
              method: 'POST',
              body: JSON.stringify({ title: form.title, body: form.body, data: {}, recipientId: id, recipientType: 'driver' }),
            })
          ),
        ]);
        showToast(`${total} logo ko notification bhej di! 🚀`);
        setForm(f => ({ ...f, title: '', body: '' }));
        setSelectedUserIds([]);
        setSelectedDriverIds([]);
        fetchNotifications();
      } catch { showToast('Send nahi hua', 'error'); }
      finally { setSending(false); }
    }
  };

  const unreadCount   = notifications.filter(n => !n.isRead).length;
  const selectedCount = selectedUserIds.length + selectedDriverIds.length;

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Notifications</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">
            {unreadCount > 0 ? `${unreadCount} unread` : 'Sab read ho gaye'} • {userList.length} users • {driverList.length} drivers
          </p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 bg-[#16161a] border border-white/5 px-5 py-3 rounded-2xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <CheckCheck size={15} /> Mark All Read
            </button>
          )}
          <button onClick={() => { setRefreshing(true); fetchNotifications(); }} className="bg-[#16161a] p-3.5 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
            <RefreshCw size={20} className={refreshing ? 'animate-spin text-indigo-500' : 'text-gray-400'} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-[#121215] rounded-[2rem] border border-white/5 p-8 shadow-2xl shadow-black/50">
          <h2 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-6">Notification Bhejo</h2>

          <div className="flex bg-white/5 rounded-xl p-1 mb-5">
            {['broadcast', 'individual'].map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  form.type === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                }`}>
                {t === 'broadcast' ? 'Broadcast (Sabko)' : 'Individual'}
              </button>
            ))}
          </div>

          {form.type === 'individual' ? (
            <div className={`mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold ${
              selectedCount > 0 ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-white/5 border-white/5 text-gray-600'
            }`}>
              <CheckCircle2 size={13} />
              {selectedCount > 0 ? `${selectedUserIds.length} user + ${selectedDriverIds.length} driver selected` : 'Neeche se select karo →'}
              {selectedCount > 0 && (
                <button onClick={() => { setSelectedUserIds([]); setSelectedDriverIds([]); }} className="ml-auto text-gray-500 hover:text-red-400 transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-emerald-500/5 border-emerald-500/10 text-xs font-bold text-emerald-400">
              <Bell size={13} /> Sabhi {userList.length} users aur {driverList.length} drivers ko jayegi
            </div>
          )}

          <div className="mb-4">
            <label className="text-[10px] uppercase font-black tracking-widest text-gray-600 mb-2 block">Title</label>
            <input type="text" placeholder="Notification ka title..."
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-gray-600"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>

          <div className="mb-6">
            <label className="text-[10px] uppercase font-black tracking-widest text-gray-600 mb-2 block">Message</label>
            <textarea rows={4} placeholder="Notification ka message..."
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 transition-all placeholder:text-gray-600 resize-none"
              value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
          </div>

          <button onClick={handleSend} disabled={sending}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/30">
            {sending
              ? <><Loader2 size={15} className="animate-spin" /> Bhej raha hai...</>
              : <><Send size={15} /> {form.type === 'broadcast' ? 'Sabko Bhejo' : `${selectedCount > 0 ? selectedCount + ' logo ko ' : ''}Bhejo`}</>}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <PeoplePanel title="Users" icon={<Users size={14} />}
            list={filteredUsers} loading={usersLoading}
            selectedIds={form.type === 'individual' ? selectedUserIds : userList.map(u => String(u._id))}
            onSelect={form.type === 'individual' ? toggleUser : () => {}}
            onSelectAll={toggleAllUsers} allSelected={allUsersSelected}
            search={userSearch} onSearch={setUserSearch} />

          <PeoplePanel title="Drivers (Owner + Freelance)" icon={<Car size={14} />}
            list={filteredDrivers} loading={driversLoading}
            selectedIds={form.type === 'individual' ? selectedDriverIds : driverList.map(d => String(d._id))}
            onSelect={form.type === 'individual' ? toggleDriver : () => {}}
            onSelectAll={toggleAllDrivers} allSelected={allDriversSelected}
            search={driverSearch} onSearch={setDriverSearch} />
        </div>
      </div>

      <div className="bg-[#121215] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl shadow-black/50">
        <div className="px-8 py-5 border-b border-white/5 flex items-center gap-3">
          <Bell size={15} className="text-indigo-400" />
          <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Recent Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{unreadCount} new</span>
          )}
        </div>
        <div className="divide-y divide-white/5 max-h-[40vh] overflow-y-auto">
          {notifLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center text-gray-600 font-bold uppercase tracking-[0.2em] text-xs">Koi notification nahi</div>
          ) : notifications.map(n => (
            <div key={n._id} className={`px-8 py-5 flex items-start gap-4 transition-all ${!n.isRead ? 'bg-indigo-500/[0.03]' : 'hover:bg-white/[0.02]'}`}>
              <div className="mt-1.5 flex-shrink-0">
                <div className={`w-2 h-2 rounded-full ${!n.isRead ? 'bg-indigo-400 animate-pulse' : 'bg-white/10'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <p className={`text-sm font-bold leading-snug ${!n.isRead ? 'text-white' : 'text-gray-300'}`}>{n.title || 'No Title'}</p>
                  <span className="text-[10px] text-gray-600 font-mono flex-shrink-0">{n.createdAt ? timeAgo(n.createdAt) : '—'}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.body || n.message || '—'}</p>
                {n.type && (
                  <span className="inline-block mt-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-400/60 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded-md">{n.type}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;