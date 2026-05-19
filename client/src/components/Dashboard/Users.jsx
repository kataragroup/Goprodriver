import { useState, useEffect } from 'react';
import { RefreshCw, Search, ShieldOff, Loader2 } from 'lucide-react';

const Users = ({ apiFetch, showToast }) => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]     = useState('');

  const fetchUsers = async () => {
    try {
      const data = await apiFetch('/admin/users'); // ✅ correct route
      if (Array.isArray(data)) setUsers(data);
    } catch { showToast('Users load nahi hue', 'error'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const blockUser = async (id) => {
    try {
      await apiFetch(`/admin/user/block/${id}`, { method: 'PUT' }); // ✅ correct route
      showToast('User block ho gaya');
      fetchUsers();
    } catch { showToast('Block karne mein error', 'error'); }
  };

  const filtered = users.filter(u =>
    (u.name || u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Users</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">{users.length} registered users</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="bg-[#16161a] border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-sm w-80 focus:border-indigo-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => { setRefreshing(true); fetchUsers(); }}
            className="bg-[#16161a] p-3.5 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin text-indigo-500' : 'text-gray-400'} />
          </button>
        </div>
      </header>

      <div className="bg-[#121215] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl shadow-black/50">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] text-indigo-400/50 text-[10px] uppercase font-black tracking-widest border-b border-white/5">
            <tr>
              <th className="px-10 py-6 text-center w-20">#</th>
              <th className="px-10 py-6">Naam</th>
              <th className="px-10 py-6">Email</th>
              <th className="px-10 py-6">Phone</th>
              <th className="px-10 py-6 text-center">Status</th>
              <th className="px-10 py-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="py-40 text-center"><Loader2 className="animate-spin text-indigo-500 mx-auto" size={40} /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-10 py-32 text-center text-gray-600 font-bold uppercase tracking-[0.2em] text-xs">Koi user nahi mila</td></tr>
            ) : filtered.map((u, i) => (
              <tr key={u._id} className="group hover:bg-indigo-500/[0.02] transition-all">
                <td className="px-10 py-8 text-center text-gray-700 font-mono text-xs italic">{i + 1}</td>
                <td className="px-10 py-8">
                  <div className="font-bold text-[16px] capitalize">{u.name || '—'}</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-1 opacity-60 uppercase">{u._id?.slice(-10)}</div>
                </td>
                <td className="px-10 py-8 text-sm text-gray-400">{u.email || '—'}</td>
                <td className="px-10 py-8 text-sm text-gray-400 font-mono">{u.phone || '—'}</td>
                <td className="px-10 py-8 text-center">
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                    ${u.isBlocked
                      ? 'bg-red-500/5 text-red-400 border-red-500/20'
                      : 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${u.isBlocked ? 'bg-red-400' : 'bg-emerald-500 animate-pulse'}`} />
                    {u.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    {!u.isBlocked && (
                      <button
                        onClick={() => blockUser(u._id)}
                        className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 transition-all shadow-lg shadow-red-900/20"
                      >
                        <ShieldOff size={13} /> Block
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;