import { useState } from 'react';
import { CheckCircle, ShieldCheck, ShieldAlert, LogOut, Users, Car, MapPin, LayoutDashboard, Bell, Truck } from 'lucide-react';

const NAV_ITEMS = [
  { tab: 'overview',       icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { tab: 'users',          icon: <Users size={18} />,           label: 'Users' },
  { tab: 'drivers',        icon: <Car size={18} />,             label: 'Drivers' },
  { tab: 'rides',          icon: <MapPin size={18} />,          label: 'Rides' },
  { tab: 'Location',       icon: <Truck size={18} />,           label: 'Location' },
  { tab: 'pending',        icon: <ShieldCheck size={18} />,     label: 'Verification Desk' },
  { tab: 'approved',       icon: <CheckCircle size={18} />,     label: 'Verified Fleet' },
  { tab: 'rejected',       icon: <ShieldAlert size={18} />,     label: 'Rejections' },
  { tab: 'notifications',  icon: <Bell size={18} />,            label: 'Notifications' },
];

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <aside className="w-72 bg-[#121215] border-r border-white/5 fixed h-full flex flex-col z-30">
      <div className="p-10 text-center border-b border-white/5">
        <div className="w-20 h-20 mx-auto rounded-2xl border-2 border-indigo-500/20 p-1 mb-4 overflow-hidden">
          <img src="https://shorturl.at/BXAbd" className="w-full h-full object-cover rounded-xl" alt="Admin" />
        </div>
        <h2 className="text-lg font-bold tracking-tight">Sharad Dubey</h2>
        <p className="text-[10px] uppercase text-indigo-400 font-black tracking-widest">Technical Head</p>
      </div>

      <nav className="mt-6 flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ tab, icon, label }) => (
          <div
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`flex items-center gap-4 px-6 py-4 rounded-xl cursor-pointer transition-all ${
              activeTab === tab
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-gray-500 hover:bg-white/5'
            }`}
          >
            {icon}
            <span className="text-sm font-semibold">{label}</span>
          </div>
        ))}
      </nav>

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