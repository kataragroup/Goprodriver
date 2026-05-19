import React, { useState, useEffect } from 'react';
import { X, MessageSquare, User, MapPin, CreditCard, Truck, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const InspectionModal = ({ isOpen, onClose, data, onUpdate, apiBase }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_URL = apiBase || 'http://localhost:7000';

  useEffect(() => {
    if (data) {
      const allImages = getAllImages(data);
      if (allImages.length > 0) setSelectedImage(allImages[0].url);
      setAdminNotes(data.adminNotes || '');
      setRejectionReason('');
    }
    setZoomLevel(1);
  }, [data]);

  if (!isOpen || !data) return null;

  // Robust image extractor that handles nested and flat keys
  const getAllImages = (d) => {
    const imgs = [];
    const addImg = (label, url) => { if (url) imgs.push({ label, url }); };

    if (d.kycType === "Owner_driver") {
      addImg("Profile", d.profileImage);
      addImg("Aadhar Front", d.aadhar?.frontImage || d.aadharFront);
      addImg("Aadhar Back", d.aadhar?.backImage || d.aadharBack);
      addImg("PAN Front", d.pan?.frontImage || d.panFront);
      addImg("Licence Front", d.licence?.frontImage || d.licenceFront);
      addImg("Licence Back", d.licence?.backImage || d.licenceBack);
      addImg("RC Image", d.vehicleDocs?.rcImage || d.rcImage);
      addImg("Insurance", d.vehicleDocs?.insuranceImage || d.insuranceImage);
      addImg("PUC", d.vehicleDocs?.pucImage || d.pucImage);
      addImg("Agreement", d.currentAddress?.agreementImage || d.agreementImage);
      addImg("Light Bill", d.currentAddress?.lightbillImage || d.lightbillImage);
    } else {
      // Freelance
      addImg("Owner Selfie", d.ownerSelfie);
      addImg("Owner Aadhar Front", d.ownerAadhar?.frontImage || d.ownerAadharFront);
      addImg("Owner Aadhar Back", d.ownerAadhar?.backImage || d.ownerAadharBack);
      addImg("Owner PAN Front", d.ownerPan?.frontImage || d.ownerPanFront);
      addImg("Driver Selfie", d.driverSelfie);
      addImg("Driver Aadhar Front", d.driverAadhar?.frontImage || d.driverAadharFront);
      addImg("Driver Aadhar Back", d.driverAadhar?.backImage || d.driverAadharBack);
      addImg("Driver Licence Front", d.driverLicence?.frontImage || d.driverLicenceFront);
      addImg("Driver Licence Back", d.driverLicence?.backImage || d.driverLicenceBack);
      addImg("RC Image", d.vehicleDocs?.rcImage || d.rcImage);
      addImg("Insurance", d.vehicleDocs?.insuranceImage || d.insuranceImage);
      addImg("PUC", d.vehicleDocs?.pucImage || d.pucImage);
    }
    return imgs.filter(img => img.url);
  };

  const handleAction = async (status) => {
    // Ultra-robust driverId extraction
    const driverId = (data.driverId && typeof data.driverId === 'object') ? data.driverId._id : 
                    (data.driverId || data.userId || data.driver_id);

    if (!driverId || typeof driverId === 'object') {
      console.error("❌ Driver ID Missing in Modal Data:", data);
      return alert(`Error: Driver ID is missing. Data: ${JSON.stringify(data.driverId)}`);
    }
    if (status === 'Rejected' && !rejectionReason) return alert("Please provide a rejection reason.");

    setSubmitting(true);
    try {
      const type = data.kycType === "Owner_driver" ? "owner" : "freelance";
      const action = status === 'Approved' ? 'approve' : 'reject';
      const url = `${API_URL}/api/admin/kyc/${type}/${action}/${driverId}`;
      
      const res = await axios.put(url, {
        adminNotes,
        reason: rejectionReason || "Documents not clear"
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });

      if (res.data.success) {
        alert(`✅ KYC ${status} successfully!`);
        onUpdate();
        onClose();
      }
    } catch (err) {
      alert(`❌ Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderDataSection = (title, icon, fields) => (
    <div className="bg-[#1a1a1f] rounded-3xl p-6 border border-white/5 space-y-4 shadow-inner">
      <div className="flex items-center gap-3 border-b border-white/5 pb-3">
        {icon}
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">{title}</h4>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {fields.map((f, i) => (
          <div key={i} className="space-y-1">
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-wider">{f.label}</p>
            <p className="text-sm font-bold text-white/90 break-all leading-tight">
              {f.value && f.value !== 'undefined' ? f.value : <span className="text-gray-700 italic">Not Provided</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-[#121215] w-full max-w-7xl h-[95vh] rounded-[2.5rem] overflow-hidden flex flex-col border border-white/10 shadow-2xl">
        
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0d0d0f]">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600/20 p-3 rounded-2xl border border-indigo-500/20">
              <ShieldCircle size={22} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Inspection Desk</h2>
              <p className="text-[9px] text-indigo-400/60 mt-0.5 uppercase font-black tracking-[0.3em]">
                {data.kycType?.replace('_', ' ')} • {data._id.slice(-8)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all group">
            <X size={24} className="text-gray-500 group-hover:text-white" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Viewer */}
          <div className="flex-[7] bg-[#08080a] p-8 flex flex-col border-r border-white/5">
            <div className="flex-1 flex items-center justify-center rounded-[2.5rem] overflow-hidden border border-white/5 bg-black relative group shadow-2xl">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out"
                  style={{ transform: `scale(${zoomLevel})` }}
                  alt="KYC Document"
                />
              ) : (
                <div className="text-gray-800 font-black uppercase tracking-[0.3em] text-[10px]">Image Not Loaded</div>
              )}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <button onClick={() => setZoomLevel(z => Math.max(z-0.5, 0.5))} className="text-white/50 hover:text-white font-bold px-2">－</button>
                <div className="w-px h-4 bg-white/10" />
                <button onClick={() => setZoomLevel(1)} className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Reset</button>
                <div className="w-px h-4 bg-white/10" />
                <button onClick={() => setZoomLevel(z => Math.min(z+0.5, 5))} className="text-white/50 hover:text-white font-bold px-2">＋</button>
              </div>
            </div>

            <div className="mt-8 flex gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar no-scrollbar">
              {getAllImages(data).map((img, i) => (
                <div 
                  key={i}
                  onClick={() => { setSelectedImage(img.url); setZoomLevel(1); }}
                  className={`flex-shrink-0 w-20 h-20 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden
                    ${selectedImage === img.url ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20' : 'border-white/5 opacity-40 hover:opacity-100 hover:border-white/20'}`}
                >
                  <img src={img.url} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="flex-[5] p-10 overflow-y-auto bg-[#0f0f12] space-y-8 custom-scrollbar">
            
            <div className="flex items-center gap-6 mb-4">
              <div className="w-24 h-24 rounded-[2rem] border-2 border-indigo-500/10 p-1.5 bg-black/50 overflow-hidden shadow-2xl">
                <img src={data.profileImage || data.driverSelfie || data.ownerSelfie || "https://shorturl.at/fHJSX"} className="w-full h-full object-cover rounded-[1.6rem]" alt="" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white/90 capitalize tracking-tight leading-none">
                  {data.aadhar?.name || data.ownerAadhar?.name || data.driverAadhar?.name || data.driverAadharName || data.ownerAadharName || "Unnamed Partner"}
                </h3>
                <div className="flex items-center gap-2.5 mt-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'Approved' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{data.status}</span>
                </div>
              </div>
            </div>

            {data.kycType === "Owner_driver" ? (
              <>
                {renderDataSection("Aadhar Verification", <CreditCard size={18} />, [
                  { label: "Full Name", value: data.aadhar?.name || data.aadharName },
                  { label: "Aadhar No", value: data.aadhar?.number || data.aadharNumber },
                  { label: "Date of Birth", value: (data.aadhar?.dob || data.aadharDob)?.split('T')[0] },
                ])}
                {renderDataSection("PAN Details", <CreditCard size={18} />, [
                  { label: "PAN Name", value: data.pan?.name || data.panName },
                  { label: "PAN No", value: data.pan?.number || data.panNumber },
                ])}
                {renderDataSection("Driving Licence", <FileText size={18} />, [
                  { label: "Licence No", value: data.licence?.number || data.licenceNumber },
                  { label: "Expiry", value: (data.licenceExpiry || data.licenceExpiry)?.split('T')[0] },
                ])}
              </>
            ) : (
              <>
                {/* FREELANCE DETAILS */}
                {renderDataSection("Owner Identity", <User size={18} />, [
                  { label: "Owner Name", value: data.ownerAadhar?.name || data.ownerAadharName },
                  { label: "Owner Aadhar", value: data.ownerAadhar?.number || data.ownerAadharNumber },
                ])}
                {renderDataSection("Driver Identity", <CreditCard size={18} />, [
                  { label: "Driver Name", value: data.driverAadhar?.name || data.driverAadharName },
                  { label: "Driver Aadhar", value: data.driverAadhar?.number || data.driverAadharNumber },
                  { label: "Licence No", value: data.driverLicence?.number || data.driverLicenceNumber },
                  { label: "Licence Exp", value: (data.driverLicenceExpiry || data.driverLicenceExpiry)?.split('T')[0] },
                ])}
              </>
            )}

            {renderDataSection("Vehicle & Address", <Truck size={18} />, [
              { label: "Vehicle No", value: data.vehicle?.number || data.vehicleNumber },
              { label: "Brand/Model", value: `${data.vehicle?.brand || data.vehicleBrand || ''} ${data.vehicle?.model || data.vehicleModel || ''}` },
              { label: "City", value: data.currentAddress?.city || data.ownerAddress?.city || data.city },
              { label: "Pincode", value: data.currentAddress?.pincode || data.ownerAddress?.pincode || data.pincode },
            ])}

            <div className="pt-8 border-t border-white/5 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <MessageSquare size={14} className="text-indigo-500/50" /> Admin Internal Notes
                </label>
                <textarea 
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Type internal notes here..."
                  className="w-full bg-black/30 border border-white/5 rounded-2xl p-4 text-xs focus:border-indigo-500/50 outline-none transition-all min-h-[90px] text-gray-300"
                />
              </div>

              {data.status !== 'Approved' && (
                <div className="flex gap-4">
                  <div className="flex-[3] space-y-3">
                    <input 
                      type="text" 
                      placeholder="Rejection reason..." 
                      className="w-full bg-red-500/[0.03] border border-red-500/10 rounded-2xl p-4 text-xs outline-none focus:border-red-500/40 transition-all text-red-200"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <button 
                      onClick={() => handleAction('Rejected')}
                      disabled={submitting}
                      className="w-full py-4 bg-red-600/90 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-30"
                    >
                      {submitting ? 'Rejecting...' : 'Reject Profile'}
                    </button>
                  </div>
                  <div className="flex-[2]">
                    <button 
                      onClick={() => handleAction('Approved')}
                      disabled={submitting}
                      className="w-full h-full py-4 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-30 shadow-xl shadow-emerald-900/20"
                    >
                      <CheckCircle size={20} />
                      {submitting ? '...' : 'Approve'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShieldCircle = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <circle cx="12" cy="11" r="3" />
  </svg>
);

export default InspectionModal;