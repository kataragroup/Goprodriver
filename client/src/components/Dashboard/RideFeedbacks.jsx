import React, { useState, useEffect } from 'react';
import { fetchRideFeedbacks } from '../../api/adminApi'; // Path check kar lijiye

const RideFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await fetchRideFeedbacks();
        if (response.data.success) {
          setFeedbacks(response.data.feedbacks);
        }
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
        setError("Feedback load karne mein koi issue aaya.");
      } finally {
        setLoading(false);
      }
    };

    getFeedbacks();
  }, []);

  // Average Rating Calculate karne ke liye logic
  const totalFeedbacks = feedbacks.length;
  const avgRating = totalFeedbacks > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks).toFixed(1) 
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600 font-medium">Loading Feedbacks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg max-w-md mx-auto mt-10 text-center" role="alert">
        <span className="font-medium">Error:</span> {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ride Feedbacks</h1>
        <p className="text-sm text-gray-500">Manage and view customer experiences and driver ratings.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Feedbacks</p>
            <h3 className="text-3xl font-bold text-gray-700 mt-1">{totalFeedbacks}</h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Average Rating</p>
            <h3 className="text-3xl font-bold text-gray-700 mt-1">{avgRating} <span className="text-xl text-yellow-500">★</span></h3>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {feedbacks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Abhi tak koi feedback nahi mila hai.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                {feedbacks.map((feedback) => (
                  <tr key={feedback._id} className="hover:bg-gray-50/70 transition-colors">
                    {/* User Name & Email Badge */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">{feedback.userId?.name || 'N/A'}</span>
                        <span className="text-xs text-gray-400">{feedback.userId?.email || 'N/A'}</span>
                      </div>
                    </td>
                    
                    {/* Rating Star Badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        feedback.rating >= 4 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {feedback.rating} ★
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {feedback.subject || 'General'}
                    </td>

                    {/* Message body */}
                    <td className="px-6 py-4 max-w-xs truncate text-gray-500" title={feedback.message}>
                      {feedback.message}
                    </td>

                    {/* Formatted Date */}
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(feedback.createdAt).toLocaleDateString('en-US', {
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

export default RideFeedbacks;