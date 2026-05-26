import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

import Sidebar         from './Dashboard/Sidebar';
import InspectionModal from './Dashboard/InspectionModal';
import RemarkModal     from './Dashboard/RemarkModal';
import Overview        from './Dashboard/Overview';
import Drivers         from './Dashboard/Driver';
import Rides           from './Dashboard/Rides';
import Notifications   from './Dashboard/notifications';
import KycTable        from './Dashboard/Kyctable';
import Toast           from './Dashboard/Toast';
import apiFetch        from './Dashboard/Apifetch';
import useKycData      from '../hooks/useKycData.js';
import Location        from './Dashboard/Location';
import DriverProfile   from './Dashboard/DriverProfile';
import Users           from './Dashboard/User/Users';
import UserDashboard   from './Dashboard/User/UserDashboard';
import UserLogin       from './Dashboard/User/UserLogin';
import UserRides       from './Dashboard/User/UserRides';
import AllFeedbacks    from '../components/Dashboard/AllFeedbacks'; 
import AllComplaints   from './Dashboard/AllComplaints';
import NotificationLogs from '../components/Dashboard/NotificationLogs';

const ComingSoon = ({ label }) => (
  <div className="flex flex-col items-center justify-center h-64 gap-3">
    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
      <span className="text-indigo-400 text-xl">🚧</span>
    </div>
    <p className="text-gray-500 text-xs font-black uppercase tracking-widest">
      {label} — Coming Soon
    </p>
  </div>
);

const Dashboard = () => {
  const [activeTab, setActiveTab]     = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem]   = useState(null);
  const [quickZoomImage, setQuickZoomImage] = useState(null);
  const [remarkModal, setRemarkModal] = useState({ isOpen: false, item: null, actionType: null });
  const [toast, setToast]             = useState(null);
  const [driverFilter, setDriverFilter] = useState(null);
  const [stats, setStats]             = useState({ users: 0, drivers: 0, rides: 0 });
  const [drivers, setDrivers]         = useState([]);
  const [profileTarget, setProfileTarget] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const { data, loading, refreshing, setRefreshing, fetchData, approveOrReject } = useKycData(handleLogout);

  useEffect(() => {
    // ── Stats: users + rides se compute karo, /admin/dashboard call nahi ──
    Promise.allSettled([
      apiFetch('/admin/users'),
      apiFetch('/admin/rides'),
    ]).then(([usersRes, ridesRes]) => {
      const userList = usersRes.status === 'fulfilled'
        ? (usersRes.value?.data || usersRes.value?.users || (Array.isArray(usersRes.value) ? usersRes.value : []))
        : [];
      const rideList = ridesRes.status === 'fulfilled'
        ? (ridesRes.value?.data || (Array.isArray(ridesRes.value) ? ridesRes.value : []))
        : [];

      setStats({
        users:   userList.length,
        rides:   rideList.length,
        drivers: 0, // KYC data se set hoga neeche
      });
    }).catch(() => {});

    // ── Drivers from KYC ──
    Promise.all([
      apiFetch('/admin/kyc/all?type=owner&limit=500'),
      apiFetch('/admin/kyc/all?type=freelance&limit=500'),
    ]).then(([ownerRes, freelanceRes]) => {
      const extract = (res) =>
        Array.isArray(res) ? res : res?.data || res?.drivers || res?.kyc || res?.records || [];

      const seen   = new Set();
      const unique = [...extract(ownerRes), ...extract(freelanceRes)].filter(r => {
        const id = String(r.driverId?._id || r.driverId || r._id);
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      const mapped = unique.map(r => ({
        _id:        r.driverId?._id || r._id,
        name:       r.driverId?.name || r.aadharName || r.ownerAadharName || r.driverAadharName || '—',
        email:      r.driverId?.email || '—',
        isApproved: r.driverId?.isApproved || false,
        kycType:    r.kycType || (r.ownerAadharName ? 'freelance' : 'owner'),
      }));

      setDrivers(mapped);
      // drivers count stats mein update karo
      setStats(prev => ({ ...prev, drivers: mapped.length }));
    }).catch(() => {});
  }, []);

  const handleTabChange = (tab) => setActiveTab(tab);

  const handleViewDriverRides = ({ id, name }) => {
    if (!id) return;
    setDriverFilter({ id: String(id), name: name || 'Unknown' });
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
      item,
      actionType,
      remark,
      onSuccess: () => {
        closeRemarkModal();
        showToast(`KYC ${actionType} ho gaya`);
      },
    });
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Overview
            stats={stats}
            kycCount={data.filter(d => d.status === 'Approved').length}
            recentDrivers={drivers}
          />
        );
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
      case 'UserDashboard':
        return <UserDashboard apiFetch={apiFetch} showToast={showToast} />;
      case 'Users':
        return <Users apiFetch={apiFetch} showToast={showToast} />;
      case 'UserLogin':
        return <UserLogin showToast={showToast} />;
      case 'UserRides':
        return <UserRides apiFetch={apiFetch} showToast={showToast} />;
      case 'feedbacks':
        return <AllFeedbacks apiFetch={apiFetch} showToast={showToast} />;
      case 'complaints':
        return <AllComplaints apiFetch={apiFetch} showToast={showToast} />;
      case 'notification-logs':
        return <NotificationLogs apiFetch={apiFetch} />;

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
          <img
            src={quickZoomImage}
            className="max-h-full max-w-full rounded-2xl shadow-2xl border border-white/10"
            alt="Zoomed"
          />
          <button
            className="absolute top-10 right-10 text-white/50 hover:text-white bg-white/5 p-4 rounded-full"
            onClick={() => setQuickZoomImage(null)}
          >
            <X size={30} />
          </button>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
};

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
      {/* existing DriverProfilePage JSX */}
    </div>
  );
};

export default Dashboard;