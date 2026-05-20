import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

import Sidebar         from './Dashboard/Sidebar';
import InspectionModal from './Dashboard/InspectionModal';
import RemarkModal     from './Dashboard/RemarkModal';
import Overview        from './Dashboard/Overview';
import Users           from './Dashboard/Users';
import Drivers         from './Dashboard/Driver';
import Rides           from './Dashboard/Rides';
import Notifications   from './Dashboard/notifications';
import KycTable        from './Dashboard/Kyctable';
import Toast           from './Dashboard/Toast';
import apiFetch        from './Dashboard/Apifetch';
import useKycData      from '../hooks/useKycData.js';
import Location        from './Dashboard/Location';
import DriverProfile   from './Dashboard/DriverProfile';

// ─── Main Dashboard ────────────────────────────────────────────────────────
const Dashboard = () => {
  const [activeTab,       setActiveTab]       = useState('overview');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [selectedItem,    setSelectedItem]    = useState(null);
  const [quickZoomImage,  setQuickZoomImage]  = useState(null);
  const [remarkModal,     setRemarkModal]     = useState({ isOpen: false, item: null, actionType: null });
  const [toast,           setToast]           = useState(null);
  const [driverFilter,    setDriverFilter]    = useState(null);
  const [stats,           setStats]           = useState({ users: 0, drivers: 0, rides: 0 });
  const [users,           setUsers]           = useState([]);
  const [drivers,         setDrivers]         = useState([]);
  const [profileTarget,   setProfileTarget]   = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const { data, loading, refreshing, setRefreshing, fetchData, approveOrReject } =
    useKycData(handleLogout);

  // ── Initial data fetch ──
  useEffect(() => {
    apiFetch('/admin/dashboard').then(d => {
      if (d?.users !== undefined) setStats(d);
    });

    apiFetch('/admin/users').then(d => {
      if (Array.isArray(d)) setUsers(d);
    });

    Promise.all([
      apiFetch('/admin/kyc/all?type=owner&limit=500'),
      apiFetch('/admin/kyc/all?type=freelance&limit=500'),
    ]).then(([ownerRes, freelanceRes]) => {
      const extract = (res) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.drivers)) return res.drivers;
        if (Array.isArray(res?.kyc)) return res.kyc;
        if (Array.isArray(res?.records)) return res.records;
        return [];
      };

      const seen = new Set();
      const unique = [...extract(ownerRes), ...extract(freelanceRes)].filter(r => {
        const id = String(r.driverId?._id || r.driverId || r._id);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      setDrivers(unique.map(r => ({
        _id:        r.driverId?._id   || r._id,
        name:       r.driverId?.name  || r.aadharName || r.ownerAadharName || r.driverAadharName || '—',
        email:      r.driverId?.email || '—',
        isApproved: r.driverId?.isApproved || false,
        kycType:    r.kycType || (r.ownerAadharName ? 'freelance' : 'owner'),
      })));
    });
  }, []);

  // ── Handlers ──
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'rides') setDriverFilter(null);
    if (tab === 'driverProfile') setProfileTarget(null);
  };

  const handleViewDriverRides = ({ id, name }) => {
    if (!id) {
      console.error("❌ Driver ID missing!");
      return;
    }
    const driverId = String(id);
    console.log(`🔍 Viewing rides for: ${name} (ID: ${driverId})`);

    setDriverFilter({ id: driverId, name: name || 'Unknown Driver' });
    setActiveTab('rides');
  };

  const handleViewProfile = ({ driverId, driverName, kycType }) => {
    setProfileTarget({ driverId, driverName, kycType });
    setActiveTab('driverProfile');
  };

  const openRemarkModal  = (item, actionType) => setRemarkModal({ isOpen: true, item, actionType });
  const closeRemarkModal = () => setRemarkModal({ isOpen: false, item: null, actionType: null });

  const handleRemarkSubmit = async (remark) => {
    const { item, actionType } = remarkModal;
    if (!item || !actionType) return;
    await approveOrReject({
      item, actionType, remark,
      onSuccess: () => {
        closeRemarkModal();
        showToast(`KYC ${actionType} ho gaya`);
      },
    });
  };

  // ── Page renderer ──
  const renderPage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Overview
            stats={stats}
            kycCount={data.filter(d => d.status === 'Approved').length}
            recentUsers={users}
            recentDrivers={drivers}
          />
        );

      case 'users':
        return <Users apiFetch={apiFetch} showToast={showToast} />;

      case 'drivers':
        return (
          <Drivers
            apiFetch={apiFetch}
            showToast={showToast}
            onViewDriverRides={handleViewDriverRides}
            onViewProfile={handleViewProfile}
          />
        );

      case 'driverProfile':
        return (
          <DriverProfilePage
            apiFetch={apiFetch}
            showToast={showToast}
            profileTarget={profileTarget}
            setProfileTarget={setProfileTarget}
            allDrivers={drivers}
          />
        );

      case 'rides':
        return (
          <Rides
            apiFetch={apiFetch}
            showToast={showToast}
            driverFilter={driverFilter}
            onClearFilter={() => setDriverFilter(null)}
          />
        );

      case 'notifications':
        return <Notifications apiFetch={apiFetch} showToast={showToast} />;

      case 'Location':
        return <Location apiFetch={apiFetch} showToast={showToast} />;

      default:
        return (
          <KycTable
            activeTab={activeTab}
            data={data}
            loading={loading}
            refreshing={refreshing}
            setRefreshing={setRefreshing}
            fetchData={fetchData}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setSelectedItem={setSelectedItem}
            setIsModalOpen={setIsModalOpen}
            setQuickZoomImage={setQuickZoomImage}
            openRemarkModal={openRemarkModal}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} onLogout={handleLogout} />

      <main className="ml-72 flex-1 p-12">
        {renderPage()}
      </main>

      <InspectionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedItem(null); }}
        data={selectedItem}
      />
      <RemarkModal
        isOpen={remarkModal.isOpen}
        onClose={closeRemarkModal}
        onSubmit={handleRemarkSubmit}
        actionType={remarkModal.actionType}
      />

      {quickZoomImage && (
        <div className="fixed inset-0 z-[3000] bg-black/95 flex items-center justify-center p-12" onClick={() => setQuickZoomImage(null)}>
          <img src={quickZoomImage} className="max-h-full max-w-full rounded-2xl shadow-2xl border border-white/10" alt="Zoomed" />
          <button className="absolute top-10 right-10 text-white/50 hover:text-white bg-white/5 p-4 rounded-full">
            <X size={30} />
          </button>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
};

// ─── Driver Profile Page Component ─────────────────────────────
const DriverProfilePage = ({ apiFetch, showToast, profileTarget, setProfileTarget, allDrivers }) => {
  const [search, setSearch] = useState('');

  if (profileTarget) {
    return (
      <DriverProfile
        driverId={profileTarget.driverId}
        driverName={profileTarget.driverName}
        kycType={profileTarget.kycType}
        apiFetch={apiFetch}
        showToast={showToast}
        onBack={() => setProfileTarget(null)}
      />
    );
  }

  const filtered = allDrivers.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Driver Profile</h1>
        <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">
          Driver search karo aur profile dekho
        </p>
      </header>

      <div className="relative mb-6 max-w-md">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Naam ya email se search karo..."
          className="w-full bg-[#121215] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-indigo-500 outline-none transition-all"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {search.trim() === '' ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center gap-3 opacity-30">
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Driver ka naam ya email likho</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center gap-3 opacity-40">
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Koi driver nahi mila</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 max-w-2xl">
          {filtered.map(d => (
            <button
              key={d._id}
              onClick={() => setProfileTarget({ driverId: d._id, driverName: d.name, kycType: d.kycType || 'owner' })}
              className="flex items-center justify-between bg-[#121215] border border-white/5 rounded-xl px-5 py-4 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group text-left"
            >
              <div>
                <div className="font-bold text-sm capitalize text-white">{d.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{d.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${d.isApproved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                  {d.isApproved ? 'Approved' : 'Pending'}
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {d.kycType || 'owner'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;