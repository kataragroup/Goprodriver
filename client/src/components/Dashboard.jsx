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
        if (Array.isArray(res))          return res;
        if (Array.isArray(res?.data))    return res.data;
        if (Array.isArray(res?.drivers)) return res.drivers;
        if (Array.isArray(res?.kyc))     return res.kyc;
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
      })));
    });
  }, []);

  // ── Handlers ──
  const handleTabChange       = (tab) => { setActiveTab(tab); if (tab !== 'rides') setDriverFilter(null); };
  const handleViewDriverRides = (id, name) => { setDriverFilter({ id, name }); setActiveTab('rides'); };
  const openRemarkModal       = (item, actionType) => setRemarkModal({ isOpen: true, item, actionType });
  const closeRemarkModal      = () => setRemarkModal({ isOpen: false, item: null, actionType: null });

  const handleRemarkSubmit = async (remark) => {
    const { item, actionType } = remarkModal;
    if (!item || !actionType) return;
    await approveOrReject({
      item, actionType, remark,
      onSuccess: () => {
        closeRemarkModal();
        showToast(`KYC ${actionType} ho gaya`);
        if (isModalOpen && selectedItem?._id === item._id)
          setSelectedItem(prev => ({ ...prev, adminNotes: remark, status: actionType }));
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
        return <Drivers apiFetch={apiFetch} showToast={showToast} onViewDriverRides={handleViewDriverRides} />;
      case 'rides':
        return <Rides apiFetch={apiFetch} showToast={showToast} driverFilter={driverFilter} onClearFilter={() => setDriverFilter(null)} />;
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
        <div
          className="fixed inset-0 z-[3000] bg-black/95 flex items-center justify-center p-12"
          onClick={() => setQuickZoomImage(null)}
        >
          <img src={quickZoomImage} className="max-h-full max-w-full rounded-2xl shadow-2xl border border-white/10" alt="Zoomed" />
          <button className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors bg-white/5 p-4 rounded-full">
            <X size={30} />
          </button>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
};

export default Dashboard;