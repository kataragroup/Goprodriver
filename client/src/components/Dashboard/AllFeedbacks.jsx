import React, { useState, useEffect } from 'react';

const AllFeedbacks = ({ apiFetch }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    // centralized Admin Endpoint call
    apiFetch('/ride-feedbacks') 
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
      <div className="p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md mx-auto mt-10 text-center">
        <span className="font-bold">System Status:</span> {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Ride Feedbacks</h1>
        <p className="text-xs text-gray-500 font-medium mt-1">System automated protected data feed.</p>
      </div>

      <div className="bg-[#121215] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        {feedbacks.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm font-medium">
            Database me abhi koi feedback records registered nahi hain.
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
                {feedbacks.map((fb) => (
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