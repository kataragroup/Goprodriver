import { useState, useEffect } from 'react';
import { RefreshCw, Search, Loader2, MapPin, AlertCircle } from 'lucide-react';

const Rides = ({ apiFetch, showToast, driverFilter, onClearFilter }) => {
  const [allRides, setAllRides] = useState([]);   // Sab rides store karenge
  const [rides, setRides] = useState([]);         // Filtered rides
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch ALL rides once
  const fetchAllRides = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/rides');
      
      let data = [];
      if (Array.isArray(res)) data = res;
      else if (Array.isArray(res?.rides)) data = res.rides;
      else if (Array.isArray(res?.data)) data = res.data;

      setAllRides(data);
      console.log(`Total ${data.length} rides loaded from server`);
    } catch (err) {
      console.error(err);
      showToast('Rides load nahi ho paayi', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter rides of selected driver
  const filterDriverRides = () => {
    if (!driverFilter?.id || allRides.length === 0) {
      setRides([]);
      return;
    }

    const driverId = String(driverFilter.id);

    const filtered = allRides.filter(ride => {
      const rideDriverId = String(
        ride.driverId?._id || 
        ride.driverId || 
        ride.driver?.id || 
        ride.driver?._id || 
        ''
      );
      return rideDriverId === driverId;
    });

    setRides(filtered);
    console.log(`Filtered ${filtered.length} rides for driver ${driverFilter.name}`);
  };

  // Load all rides on component mount
  useEffect(() => {
    fetchAllRides();
  }, []);

  // Filter when driver changes
  useEffect(() => {
    filterDriverRides();
  }, [driverFilter, allRides]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllRides().finally(() => setRefreshing(false));
  };

  const filteredRides = rides.filter(ride => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (ride.pickup?.address || ride.pickup || '').toLowerCase().includes(q) ||
      (ride.drop?.address || ride.drop || '').toLowerCase().includes(q)
    );
  });

  if (!driverFilter) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="text-6xl mb-4">🚕</div>
        <h2 className="text-2xl font-bold">Driver Select Karein</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tighter uppercase">
              {driverFilter.name}
            </h1>
            <div className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-2xl text-sm font-black border border-emerald-500/30">
              {rides.length} RIDES
            </div>
          </div>
          <p className="text-gray-500 mt-1">Driver ID: {driverFilter.id}</p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Pickup, Drop search..."
              className="bg-[#16161a] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 w-80"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={handleRefresh}
            className="bg-[#16161a] p-3 rounded-xl border border-white/5 hover:bg-white/5"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <div className="bg-[#121215] rounded-2xl border border-white/5 flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={50} />
          </div>
        ) : rides.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <AlertCircle size={48} />
            <p className="mt-4">Is driver ne abhi tak koi ride nahi ki hai</p>
          </div>
        ) : (
          <div className="overflow-auto h-full">
            <table className="w-full">
              <thead className="sticky top-0 bg-[#121215] border-b border-white/10 z-10">
                <tr className="text-xs uppercase font-black tracking-widest text-gray-400">
                  <th className="px-6 py-5 text-left">Pickup</th>
                  <th className="px-6 py-5 text-left">Drop</th>
                  <th className="px-6 py-5 text-center">Date & Time</th>
                  <th className="px-6 py-5 text-center">Amount</th>
                  <th className="px-6 py-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRides.map((ride, i) => (
                  <tr key={ride._id || i} className="hover:bg-white/5">
                    <td className="px-6 py-5">{ride.pickup?.address || ride.pickup || '—'}</td>
                    <td className="px-6 py-5">{ride.drop?.address || ride.drop || '—'}</td>
                    <td className="px-6 py-5 text-center text-sm">
                      {ride.createdAt ? new Date(ride.createdAt).toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="px-6 py-5 text-center font-medium">₹{ride.amount || ride.fare || 0}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase
                        ${ride.status?.toLowerCase() === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                        {ride.status || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rides;