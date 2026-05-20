import { useState, useEffect, useCallback, useRef } from 'react';
import apiFetch from '../components/Dashboard/Apifetch';   // ← Important
import { socket } from '../utils/socket';

const useKycData = (handleLogout) => {
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const handleLogoutRef = useRef(handleLogout);

  useEffect(() => { 
    handleLogoutRef.current = handleLogout; 
  }, [handleLogout]);

  const getToken = () => localStorage.getItem('adminToken') || 
                         localStorage.getItem('token');

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      // ✅ Ab apiFetch use kar rahe hain (Live server pe jayega)
      const res = await apiFetch('/admin/kyc/all');
      
      const records = res?.data ?? res ?? [];
      setData(Array.isArray(records) ? records : []);
      
      console.log('[useKycData] KYC Data Loaded:', records.length);
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

    if (!driverId || typeof driverId === 'object') {
      alert('Error: Driver ID missing.');
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      setRefreshing(true);
      const action = actionType === 'Approved' ? 'approve' : 'reject';
      const type   = item.kycType === 'Owner_driver' ? 'owner' : 'freelance';

      // ✅ apiFetch use kiya
      const response = await apiFetch(
        `/admin/kyc/${type}/${action}/${driverId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: remark, adminNotes: remark })
        }
      );

      if (response?.success) {
        await fetchData();
        if (onSuccess) onSuccess();
        alert('KYC ' + actionType + ' Successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Error: ' + (err.message || 'Action failed'));
    } finally {
      setRefreshing(false);
    }
  };

  return { data, loading, refreshing, setRefreshing, fetchData, approveOrReject };
};

export default useKycData;