import React, { useState, useEffect, useCallback } from 'react';

// 1. Standalone SearchInput Component
const SearchInput = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-violet-500 transition-all w-56"
  />
);

// 2. Standalone Refresh Button Component
const RefreshBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all"
  >
    ↻ Refresh
  </button>
);

// 3. Main Single Component
const AllFeedbacks = ({ apiFetch }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Data load karne ka function
  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch('/feedback/ride-feedbacks')
      .then((data) => {
        console.log("Admin Authorized Data:", data);
        if (data && data.feedbacks) {
          setFeedbacks(data.feedbacks);
        } else if (Array.isArray(data)) {
          setFeedbacks(data);
        } else if (data && data.data && Array.isArray(data.data)) {
          setFeedbacks(data.data);
        } else {
          setError("Feedback records ka format match nahi hua.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setError("Authorization fail ya data loading issue.");
        setLoading(false);
      });
  }, [apiFetch]);

  // Initial load hook
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Search filter logic
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const name = fb.userId?.name?.toLowerCase() || '';
    const subject = fb.subject?.toLowerCase() || '';
    const message = fb.message?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();

    return name.includes(search) || subject.includes(search) || message.includes(search);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-400 font-medium">Loading Feedbacks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md mx-auto mt-10 text-center flex flex-col items-center gap-3">
        <div><span className="font-bold">System Status:</span> {error}</div>
        <RefreshBtn onClick={loadData} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Top Header Section with Controls aligned side-by-side */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Ride Feedbacks</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">System automated protected data feed.</p>
        </div>

        {/* Search and Refresh rendering input buttons here */}
        <div className="flex items-center gap-3">
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Search feedbacks..." 
          />
          <RefreshBtn onClick={loadData} />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#121215] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        {filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm font-medium">
            {searchTerm ? "No matching feedbacks found." : "Not Registered any Feedbacks in the system."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] font-black uppercase tracking-widest text-indigo-400">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {filteredFeedbacks.map((fb) => (
                  <tr key={fb._id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-200">{fb.userId?.name || 'Customer'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-xl text-xs bg-yellow-500/10 text-yellow-500 font-bold">{fb.rating} ★</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-semibold">{fb.subject || 'General'}</td>
                    <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{fb.message}</td>
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

export default AllFeedbacks;