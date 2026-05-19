import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Car, MapPin, Search, CheckCircle2, Clock, XCircle, Loader2, User } from 'lucide-react';

/* ─── Status config ────────────────────────────────────────────── */
const STATUS = {
  approved: { label: 'Approved', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400', pin: '#34d399' },
  pending:  { label: 'Pending',  bg: 'bg-orange-500/10',  text: 'text-orange-400',  border: 'border-orange-500/20',  dot: 'bg-orange-400',  pin: '#fb923c' },
  rejected: { label: 'Rejected', bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20',     dot: 'bg-red-400',     pin: '#f87171' },
  busy:     { label: 'Busy',     bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20',    dot: 'bg-blue-400',    pin: '#60a5fa' },
};

const getStatus = (s) => STATUS[s?.toLowerCase()] || STATUS.pending;

const StatusBadge = ({ status }) => {
  const s = getStatus(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
};

/* ─── Leaflet Map ──────────────────────────────────────────────── */
const VehicleMap = ({ Location, drivers, selectedId, onSelect }) => {
  const mapRef    = useRef(null);
  const mapObj    = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const loadLeaflet = () => new Promise((resolve) => {
      if (window.L) { resolve(window.L); return; }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve(window.L);
      document.head.appendChild(script);
    });

    loadLeaflet().then((L) => {
      if (mapObj.current || !mapRef.current) return;

      mapObj.current = L.map(mapRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(mapObj.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapObj.current);

      addAllMarkers(L, Location, drivers);
    });

    return () => {
      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; }
    };
  }, []);

  useEffect(() => {
    if (!window.L || !mapObj.current) return;
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};
    addAllMarkers(window.L, Location, drivers);
  }, [Location, drivers]);

  useEffect(() => {
    if (!selectedId || !mapObj.current) return;
    const vehicle = Location.find(v => v._id === selectedId);
    if (!vehicle?.Location?.coordinates?.length) return;
    const [lng, lat] = vehicle.Location.coordinates;
    mapObj.current.flyTo([lat, lng], 14, { duration: 1.2 });
    markersRef.current[selectedId]?.openPopup();
  }, [selectedId]);

  const addAllMarkers = (L, vList, dList) => {
    if (!mapObj.current) return;

    // ── Vehicle markers ──
    vList.forEach(v => {
      const coords = v.Location?.coordinates;
      if (!coords || coords.length < 2 || (coords[0] === 0 && coords[1] === 0)) return;
      const [lng, lat] = coords;
      const pinColor = getStatus(v.status).pin;

      const icon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:32px;height:40px">
          <svg viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:40px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5))">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z" fill="${pinColor}"/>
            <circle cx="16" cy="16" r="7" fill="#0a0a0c"/>
            <circle cx="16" cy="16" r="4" fill="${pinColor}"/>
          </svg>
        </div>`,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(mapObj.current);
      marker.bindPopup(`
        <div style="background:#121215;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 14px;min-width:180px;color:#fff;font-family:monospace">
          <div style="font-size:11px;color:#6b7280;margin-bottom:2px">🚗 VEHICLE</div>
          <div style="font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">${v.brand} ${v.model}</div>
          <div style="font-size:10px;color:#6b7280;margin-bottom:8px">${v.plateNumber}</div>
          <div style="display:flex;gap:6px;align-items:center">
            <span style="width:6px;height:6px;border-radius:50%;background:${pinColor};display:inline-block"></span>
            <span style="font-size:9px;font-weight:800;text-transform:uppercase;color:${pinColor}">${v.status || 'pending'}</span>
          </div>
          <div style="margin-top:6px;font-size:10px;color:#6b7280">₹${v.pricePerDay}/day • ${v.type || '—'}</div>
        </div>
      `, { className: 'dark-popup' });

      marker.on('click', () => onSelect(v._id));
      markersRef.current[v._id] = marker;
    });

    // ── Driver markers ──
    dList.forEach(d => {
      const coords = d.Location?.coordinates;
      if (!coords || coords.length < 2 || (coords[0] === 0 && coords[1] === 0)) return;
      const [lng, lat] = coords;
      // FIX: isOnline may be absent from API — default to false
      const isOnline = d.isOnline ?? false;
      const dotColor = isOnline ? '#60a5fa' : '#6b7280';

      const icon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:24px;height:24px">
          ${isOnline ? `<div style="position:absolute;inset:0;border-radius:50%;background:${dotColor};opacity:0.3;animation:ping 1.5s ease-in-out infinite"></div>` : ''}
          <div style="position:absolute;inset:4px;border-radius:50%;background:${dotColor};border:2px solid #0a0a0c;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14],
      });

      // FIX: lastSeen may be absent
      const lastSeen = d.lastSeen
        ? new Date(d.lastSeen).toLocaleTimeString('en-IN')
        : 'N/A';

      const marker = L.marker([lat, lng], { icon }).addTo(mapObj.current);
      marker.bindPopup(`
        <div style="background:#121215;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 14px;min-width:180px;color:#fff;font-family:monospace">
          <div style="font-size:11px;color:#6b7280;margin-bottom:2px">👤 DRIVER</div>
          <div style="font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">${d.name || '—'}</div>
          <div style="font-size:10px;color:#6b7280;margin-bottom:6px">${[d.phone, d.email].filter(Boolean).join(' · ') || '—'}</div>
          <div style="display:flex;gap:6px;align-items:center">
            <span style="width:6px;height:6px;border-radius:50%;background:${dotColor};display:inline-block"></span>
            <span style="font-size:9px;font-weight:800;text-transform:uppercase;color:${dotColor}">${isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <div style="margin-top:6px;font-size:10px;color:#6b7280">Last seen: ${lastSeen}</div>
        </div>
      `, { className: 'dark-popup' });

      markersRef.current[`driver_${d._id}`] = marker;
    });

    // Fit bounds
    const allCoords = [
      ...vList.filter(v => v.Location?.coordinates?.length === 2 && v.Location.coordinates[0] !== 0)
               .map(v => [v.Location.coordinates[1], v.Location.coordinates[0]]),
      ...dList.filter(d => d.Location?.coordinates?.length === 2 && d.Location.coordinates[0] !== 0)
               .map(d => [d.Location.coordinates[1], d.Location.coordinates[0]]),
    ];
    if (allCoords.length > 0) {
      mapObj.current.fitBounds(allCoords, { padding: [40, 40], maxZoom: 12 });
    }
  };

  return (
    <>
      <style>{`
        .dark-popup .leaflet-popup-content-wrapper,
        .dark-popup .leaflet-popup-tip { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
        .dark-popup .leaflet-popup-content { margin: 0 !important; }
        .leaflet-container { background: #0a0a0c !important; }
        .leaflet-control-zoom a { background: #121215 !important; color: #6b7280 !important; border-color: rgba(255,255,255,0.08) !important; }
        .leaflet-control-zoom a:hover { background: #1e1e24 !important; color: #fff !important; }
        .leaflet-control-attribution { display: none !important; }
        @keyframes ping { 0%,100%{transform:scale(1);opacity:0.3} 50%{transform:scale(1.8);opacity:0} }
      `}</style>
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '1rem' }} />
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN Location COMPONENT
═══════════════════════════════════════════════════════════════ */
const Location = ({ apiFetch, showToast }) => {
  const [Location,     setLocation]     = useState([]);
  const [drivers,      setDrivers]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId,   setSelectedId]   = useState(null);
  const [activeList,   setActiveList]   = useState('Location');
  const intervalRef = useRef(null);

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [vRes, dRes] = await Promise.all([
        apiFetch('/admin/Location?limit=1000'),
        apiFetch('/admin/drivers/live'),
      ]);

      // Vehicles
      let vList = [];
      if (Array.isArray(vRes))               vList = vRes;
      else if (Array.isArray(vRes?.data))    vList = vRes.data;
      else if (Array.isArray(vRes?.Location)) vList = vRes.Location;
      setLocation(vList);

      // FIX: handle { drivers: [...] } shape — already present, confirmed working
      let dList = [];
      if (Array.isArray(dRes))               dList = dRes;
      else if (Array.isArray(dRes?.data))    dList = dRes.data;
      else if (Array.isArray(dRes?.drivers)) dList = dRes.drivers;
      setDrivers(dList);

    } catch (err) {
      console.error('[Location] fetch error:', err);
      if (!silent) showToast('Data load nahi hua', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
    intervalRef.current = setInterval(() => fetchAll(true), 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/admin/Location/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      showToast(`Vehicle ${status} kar di ✅`);
      fetchAll(true);
    } catch { showToast('Status update nahi hua', 'error'); }
  };

  const filteredLocation = Location.filter(v => {
    const q = search.toLowerCase();
    const matchSearch =
      (v.brand || '').toLowerCase().includes(q) ||
      (v.model || '').toLowerCase().includes(q) ||
      (v.plateNumber || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || (v.status || 'pending') === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredDrivers = drivers.filter(d => {
    const q = search.toLowerCase();
    return (
      (d.name  || '').toLowerCase().includes(q) ||
      (d.phone || '').toLowerCase().includes(q) ||
      (d.email || '').toLowerCase().includes(q)
    );
  });

  const mappableLocation = Location.filter(v =>
    v.Location?.coordinates?.length === 2 &&
    !(v.Location.coordinates[0] === 0 && v.Location.coordinates[1] === 0)
  );

  const mappableDrivers = drivers.filter(d =>
    d.Location?.coordinates?.length === 2 &&
    !(d.Location.coordinates[0] === 0 && d.Location.coordinates[1] === 0)
  );

  // FIX: isOnline may be absent — use ?? false
  const onlineDrivers = drivers.filter(d => d.isOnline ?? false).length;

  const counts = Location.reduce((acc, v) => {
    const s = v.status || 'pending';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const statusOptions = [
    { key: 'all',      label: 'All',      count: Location.length },
    { key: 'approved', label: 'Approved', count: counts.approved || 0 },
    { key: 'pending',  label: 'Pending',  count: counts.pending  || 0 },
    { key: 'rejected', label: 'Rejected', count: counts.rejected || 0 },
    { key: 'busy',     label: 'Busy',     count: counts.busy     || 0 },
  ];

  const selectedVehicle = Location.find(v => v._id === selectedId);

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <header className="flex justify-between items-start mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Location</h1>
          <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">
            {mappableLocation.length} Location on map •
            <span className="text-blue-400 ml-1">{drivers.length} drivers</span>
            {onlineDrivers > 0 && <span className="text-emerald-400 ml-1">• {onlineDrivers} online</span>}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#16161a] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm w-48 focus:border-indigo-500 outline-none transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => { setRefreshing(true); fetchAll(); }}
            className="bg-[#16161a] p-2.5 rounded-xl border border-white/5 hover:bg-white/5 transition-colors"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-indigo-500' : 'text-gray-400'} />
          </button>
        </div>
      </header>

      {/* ── Status Pills ── */}
      {activeList === 'Location' && (
        <div className="flex gap-2 mb-4 flex-shrink-0 flex-wrap">
          {statusOptions.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                ${statusFilter === key
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/20'
                  : 'bg-[#121215] text-gray-500 border-white/5 hover:text-gray-300'}`}
            >
              {label}
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${statusFilter === key ? 'bg-white/20' : 'bg-white/5'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-5 gap-5 flex-1 min-h-0" style={{ height: '65vh' }}>

        {/* LEFT — Map */}
        <div className="col-span-3 bg-[#121215] rounded-2xl border border-white/5 overflow-hidden relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="animate-spin text-indigo-500" size={36} />
            </div>
          ) : (mappableLocation.length === 0 && mappableDrivers.length === 0) ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <MapPin size={32} className="text-gray-700" />
              <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Koi Location data nahi</p>
            </div>
          ) : (
            <VehicleMap
              Location={mappableLocation}
              drivers={mappableDrivers}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}

          {/* Selected vehicle overlay */}
          {selectedVehicle && (
            <div className="absolute bottom-4 left-4 right-4 bg-[#0a0a0c]/90 backdrop-blur border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                <Car size={16} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white uppercase tracking-tight truncate">
                  {selectedVehicle.brand} {selectedVehicle.model}
                </p>
                <p className="text-[10px] text-gray-500 font-mono">{selectedVehicle.plateNumber}</p>
              </div>
              <StatusBadge status={selectedVehicle.status} />
              <button onClick={() => setSelectedId(null)} className="text-gray-600 hover:text-white transition-colors text-xs">✕</button>
            </div>
          )}

          {/* Map legend */}
          <div className="absolute top-3 left-3 bg-[#0a0a0c]/80 backdrop-blur px-3 py-2 rounded-lg border border-white/5 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              <span className="text-[9px] font-bold text-gray-400">{mappableLocation.length} Location</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
              <span className="text-[9px] font-bold text-gray-400">{drivers.length} drivers</span>
            </div>
            <p className="text-[8px] text-gray-600 mt-0.5">Auto-refresh: 30s</p>
          </div>
        </div>

        {/* RIGHT — List */}
        <div className="col-span-2 bg-[#121215] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
          {/* Tab switcher */}
          <div className="flex border-b border-white/5 flex-shrink-0">
            <button
              onClick={() => setActiveList('Location')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5
                ${activeList === 'Location' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <Car size={11} /> Location ({filteredLocation.length})
            </button>
            <button
              onClick={() => setActiveList('drivers')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5
                ${activeList === 'drivers' ? 'text-blue-400 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <User size={11} /> Drivers ({filteredDrivers.length})
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={28} />
              </div>
            ) : activeList === 'Location' ? (

              /* ── Vehicle list ── */
              filteredLocation.length === 0 ? (
                <div className="py-16 text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest">Koi vehicle nahi mila</div>
              ) : filteredLocation.map(v => {
                const hasLocation = v.Location?.coordinates?.length === 2 && v.Location.coordinates[0] !== 0;
                const isSelected = selectedId === v._id;
                return (
                  <div
                    key={v._id}
                    onClick={() => hasLocation && setSelectedId(isSelected ? null : v._id)}
                    className={`px-4 py-3.5 border-b border-white/5 transition-all
                      ${hasLocation ? 'cursor-pointer' : 'cursor-default'}
                      ${isSelected ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : 'hover:bg-white/[0.02]'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-indigo-600' : 'bg-white/5'}`}>
                        <Car size={14} className={isSelected ? 'text-white' : 'text-gray-500'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-black uppercase truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                            {v.brand} {v.model}
                          </p>
                          <StatusBadge status={v.status} />
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{v.plateNumber}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-gray-600">{v.type || '—'} • {v.year || '—'}</span>
                          <span className="text-[10px] text-emerald-400 font-bold">₹{v.pricePerDay}/day</span>
                          {hasLocation
                            ? <span className="text-[9px] text-indigo-400 flex items-center gap-0.5"><MapPin size={9} /> Map pe</span>
                            : <span className="text-[9px] text-gray-700">No Location</span>
                          }
                        </div>
                      </div>
                    </div>
                    {v.status === 'pending' && (
                      <div className="flex gap-2 mt-2.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => updateStatus(v._id, 'approved')}
                          className="flex-1 flex items-center justify-center gap-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          <CheckCircle2 size={10} /> Approve
                        </button>
                        <button
                          onClick={() => updateStatus(v._id, 'rejected')}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-600/10 text-red-400 border border-red-500/20 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                        >
                          <XCircle size={10} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })

            ) : (

              /* ── Driver list ── */
              filteredDrivers.length === 0 ? (
                <div className="py-16 text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest">Koi driver nahi mila</div>
              ) : filteredDrivers.map(d => {
                const hasLocation = d.Location?.coordinates?.length === 2 && d.Location.coordinates[0] !== 0;
                // FIX: isOnline absent from API → default false
                const isOnline = d.isOnline ?? false;
                return (
                  <div key={d._id} className="px-4 py-3.5 border-b border-white/5 hover:bg-white/[0.02] transition-all">
                    <div className="flex items-start gap-3">
                      <div className="relative w-8 h-8 flex-shrink-0 mt-0.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOnline ? 'bg-blue-600/20' : 'bg-white/5'}`}>
                          <User size={14} className={isOnline ? 'text-blue-400' : 'text-gray-600'} />
                        </div>
                        {isOnline && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-[#121215]"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-black text-gray-200 uppercase truncate">{d.name || '—'}</p>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border
                            ${isOnline
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                              : 'text-gray-600 bg-white/5 border-white/5'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        {/* FIX: phone/email — show whatever is available */}
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {[d.phone, d.email].filter(Boolean).join(' · ') || '—'}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          {hasLocation
                            ? <span className="text-[9px] text-blue-400 flex items-center gap-0.5"><MapPin size={9} /> Tracked</span>
                            : <span className="text-[9px] text-gray-700">No location</span>
                          }
                          {/* FIX: lastSeen — only render if field exists */}
                          {d.lastSeen && (
                            <span className="text-[9px] text-gray-600">
                              {new Date(d.lastSeen).toLocaleTimeString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;