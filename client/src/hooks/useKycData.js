import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { socket } from '../utils/socket';

const useKycData = (handleLogout) => {
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const handleLogoutRef = useRef(handleLogout);

  useEffect(() => { handleLogoutRef.current = handleLogout; }, [handleLogout]);

  const getToken = () => localStorage.getItem('adminToken');

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get('/admin/kyc/all');
      const records = res.data?.data ?? res.data ?? [];
      setData(Array.isArray(records) ? records : []);
    } catch (err) {
      console.error('[useKycData] Fetch Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    socket.connect();
    socket.on('kycUpdate', fetchData);
    return () => { socket.off('kycUpdate', fetchData); };
  }, [fetchData]);

  const approveOrReject = async ({ item, actionType, remark, onSuccess }) => {
    const driverId = (item.driverId && typeof item.driverId === 'object')
      ? item.driverId._id
      : (item.driverId || item.userId || item.driver_id || item._id);

    if (!driverId || typeof driverId === 'object') { alert('Error: Driver ID missing.'); return; }

    const token = getToken();
    if (!token) return;

    try {
      setRefreshing(true);
      const action = actionType === 'Approved' ? 'approve' : 'reject';
      const type   = item.kycType === 'Owner_driver' ? 'owner' : 'freelance';
      const response = await axios.put(
        `/admin/kyc/${type}/${action}/${driverId}`,
        { reason: remark, adminNotes: remark }
      );
      if (response.data?.success) {
        await fetchData();
        if (onSuccess) onSuccess();
        alert('KYC ' + actionType + ' Successfully!');
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message || 'Action failed'));
    } finally {
      setRefreshing(false);
    }
  };

  return { data, loading, refreshing, setRefreshing, fetchData, approveOrReject };
};

export default useKycData;