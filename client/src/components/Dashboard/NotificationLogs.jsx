import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotificationLogs = async () => {
      try {
        setLoading(true);
        
        // 1.  valid admin/user token 
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        
        const response = await axios.get('http://localhost:7000/api/admin/notifications/getAll', {
          headers: {
            'Content-Type': 'application/json',
            // Bearer format standard check, fallback to raw token if already in Bearer format
            'Authorization': token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : ''
          }
        });

        console.log("=== AXIOS NOTIFICATION LOGS ===", response.data);

        // 3. Postman response schema mapping (.notifications structure)
        if (response.data && response.data.notifications) {
          setLogs(response.data.notifications);
        } else if (Array.isArray(response.data)) {
          setLogs(response.data);
        } else {
          setError("Unexpected response format");
        }
      } catch (err) {
        console.error("Axios API Error:", err);
        // Error handling backup string parsing
        const errorMsg = err.response?.data?.message || err.message || "Network Engine Failure";
        setError(`Auth validation gap: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-400 font-medium">Axios Data Stream Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md mx-auto mt-10 text-center">
        <span className="font-bold">Error Triggered:</span> {error}
        <p className="text-[11px] text-gray-500 mt-2">Note: Is endpoint par user-level auth lag raha hai, aapki active admin key scope se match nahi kar raha.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 p-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Notification History & Logs</h1>
        <p className="text-xs text-gray-500 font-medium mt-1">Incoming alerts and logs.</p>
      </div>

      <div className="bg-[#121215] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm font-medium">
            Authorized Successfully! But No Notifications Found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-[11px] font-black uppercase tracking-widest text-indigo-400">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Message / Context</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Dispatched At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-200">{log.userId?.name || 'Customer User'}</span>
                        <span className="text-xs text-gray-500 mt-0.5">{log.userId?.phone || 'Global Session'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-300 text-xs">{log.title || 'Notification'}</td>
                    <td className="px-6 py-4 max-w-xs text-gray-400 text-xs truncate" title={log.message}>{log.message}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {log.type || 'RIDE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.isRead ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {log.isRead ? 'READ' : 'UNREAD'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : 'N/A'}</td>
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

export default NotificationLogs;