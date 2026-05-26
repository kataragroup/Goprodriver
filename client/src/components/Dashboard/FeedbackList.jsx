import React, { useState, useEffect } from 'react';
import { fetchRideFeedbacks } from '../../api/adminApi'; 

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getFeedbacks = async () => {
      try {
        setLoading(true);
        const data = await fetchRideFeedbacks();
        if (data.success) {
          setFeedbacks(data.feedbacks);
        }
      } catch (err) {
        setError("Feedback load karne mein dikkat aayi.");
      } finally {
        setLoading(false);
      }
    };

    getFeedbacks();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading feedbacks...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ride Feedbacks ({feedbacks.length})</h2>
      
      {feedbacks.length === 0 ? (
        <p>No feedback available.</p>
      ) : (
        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">User Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Message</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((feedback) => (
                <tr key={feedback._id} className="bg-white border-b hover:bg-gray-50">
                  {/* Optional chaining (?.) */}
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {feedback.userId?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">{feedback.userId?.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-yellow-500 font-semibold">{feedback.rating} ★</td>
                  <td className="px-6 py-4">{feedback.subject}</td>
                  <td className="px-6 py-4">{feedback.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;