import { useState } from 'react';
import { CheckCircle, ShieldCheck, ShieldAlert, LogOut, Users, Car, MapPin, 
  LayoutDashboard, Bell, Truck, UserCircle, CreditCard, MessageSquare, 
  AlertCircle, Wallet, Home, ChevronRight, LogIn } from 'lucide-react';

const DRIVER_NAV_ITEMS = [
  { tab: 'overview',       icon: <LayoutDashboard size={18} />, label: 'Driver Overview' },
  { tab: 'drivers',        icon: <Car size={18} />,             label: 'Drivers' },
  { tab: 'driverProfile',  icon: <UserCircle size={18} />,      label: 'Driver Profile' },
  { tab: 'rides',          icon: <MapPin size={18} />,          label: 'Rides' },
  { tab: 'Location',       icon: <Truck size={18} />,           label: 'Location' },
  { tab: 'pending',        icon: <ShieldCheck size={18} />,     label: 'Verification Desk' },
  { tab: 'approved',       icon: <CheckCircle size={18} />,     label: 'Verified Fleet' },
  { tab: 'rejected',       icon: <ShieldAlert size={18} />,     label: 'Rejections' },
  { tab: 'notifications',  icon: <Bell size={18} />,            label: 'Notifications' },
];

const USER_NAV_ITEMS = [
  { tab: 'UserDashboard',  icon: <Users size={18} />,   label: 'User Overview' },
  { tab: 'Users',          icon: <Users size={18} />,   label: 'Users' },
  { tab: 'UserLogin',      icon: <LogIn size={18} />,   label: 'User Logins' },
  { tab: 'UserRides',      icon: <MapPin size={18} />,  label: 'User Rides' },
  { tab: 'feedbacks',      icon: <MessageSquare size={18} />, label: 'Ride Feedbacks' },
  { tab: 'complaints',     icon: <AlertCircle size={18} />, label: 'Complaints' },
  { tab: 'notification-logs', icon: <Bell size={18} />, label: 'Notification Logs' },
];

const USER_TABS = USER_NAV_ITEMS.map(i => i.tab);

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const [userFolderOpen, setUserFolderOpen] = useState(
    USER_TABS.includes(activeTab)
  );

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (USER_TABS.includes(tab)) setUserFolderOpen(true);
  };

  const navItemClass = (tab) =>
    `flex items-center gap-4 px-6 py-4 rounded-xl cursor-pointer transition-all ${
      activeTab === tab
        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
        : 'text-gray-500 hover:bg-white/5'
    }`;

  return (
    <aside className="w-72 bg-[#121215] border-r border-white/5 fixed h-full flex flex-col z-30">
      {/* Profile */}
      <div className="p-10 text-center border-b border-white/5">
        <div className="w-20 h-20 mx-auto rounded-2xl border-2 border-indigo-500/20 p-1 mb-4 overflow-hidden">
          <img src="https://shorturl.at/BXAbd" className="w-full h-full object-cover rounded-xl" alt="Admin" />
        </div>
        <h2 className="text-lg font-bold tracking-tight">Sharad Dubey</h2>
        <p className="text-[10px] uppercase text-indigo-400 font-black tracking-widest">Technical Head</p>
      </div>

      {/* Nav */}
      <nav className="mt-6 flex-1 px-4 space-y-1 overflow-y-auto">

        {/* Driver Items */}
        {DRIVER_NAV_ITEMS.map(({ tab, icon, label }) => (
          <div key={tab} onClick={() => handleTabClick(tab)} className={navItemClass(tab)}>
            {icon}
            <span className="text-sm font-semibold">{label}</span>
          </div>
        ))}

        {/* ── Users Folder ── */}
        <div
          onClick={() => setUserFolderOpen(prev => !prev)}
          className={`flex items-center justify-between px-6 py-4 rounded-xl cursor-pointer transition-all border ${
            userFolderOpen
              ? 'bg-violet-500/7 text-violet-400 border-violet-500/20'
              : 'text-gray-500 hover:bg-white/5 border-transparent'
          }`}
        >
          <div className="flex items-center gap-4">
            <Users size={18} />
            <span className="text-sm font-semibold">Users</span>
          </div>
          <ChevronRight
            size={14}
            className={`transition-transform duration-200 ${userFolderOpen ? 'rotate-90' : ''}`}
          />
        </div>

        {/* User Children */}
        {userFolderOpen && (
          <div className="pl-4 space-y-1">
            {USER_NAV_ITEMS.map(({ tab, icon, label }) => (
              <div
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl cursor-pointer transition-all text-[13px] font-semibold border ${
                  activeTab === tab
                    ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20'
                    : 'text-gray-500 hover:bg-white/5 border-transparent'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 flex-shrink-0" />
                {icon}
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-8 border-t border-white/5">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 text-red-500/60 text-xs font-bold uppercase tracking-widest hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={16} /> End Session
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;