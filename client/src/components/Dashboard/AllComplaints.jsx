import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AllComplaints = ({ apiFetch, showToast }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:7000/api/admin/complaints/getAll')
      .then((res) => {
        if (res.data && res.data.complaints) {
          setComplaints(res.data.complaints);
        } else if (Array.isArray(res.data)) {
          setComplaints(res.data);
        } else {
          setError("Complaints data format unexpected.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Complaints Fetch Error:", err);
        setError("Complaints load karne mein dikkat aayi.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-400 font-medium">Loading Complaints Desk...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md mx-auto mt-10 text-center">
        <span className="font-bold">Error:</span> {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Complaints Desk</h1>
        <p className="text-xs text-gray-500 font-medium mt-1">Monitor users status or issues here...</p>
      </div>

      <div className="bg-[#121215] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        {complaints.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm font-medium">
            No complaints available. 🎉
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] font-black uppercase tracking-widest text-indigo-400">
                  <th className="px-6 py-4">Complainant</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Raised On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {complaints.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-200">{item.userId?.name || 'Anonymous'}</span>
                        <span className="text-xs text-gray-500 mt-0.5">{item.userId?.phone || 'No Contact'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs text-gray-400 text-xs leading-relaxed" title={item.description}>
                      {item.description || 'No description provided.'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        item.status === 'RESOLVED'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {item.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
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

export default AllComplaints;