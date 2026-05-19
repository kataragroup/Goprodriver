import { useState, useEffect } from 'react';
import {
  X, ShieldCheck, FileText, User, Hash, Calendar,
  Car, MapPin, MessageSquare, ZoomIn, ZoomOut, Minimize2
} from 'lucide-react';
import InfoRow from './InfoRow';

const getAllImages = (item) => {
  if (!item) return [];
  const imgs = [];
  
  if (item.kycType === 'Owner_driver') {
    // Nested images object
    if (item.images?.aadharFront)   imgs.push(item.images.aadharFront);
    if (item.images?.aadharBack)    imgs.push(item.images.aadharBack);
    if (item.images?.panFront)      imgs.push(item.images.panFront);
    if (item.images?.licenceFront)  imgs.push(item.images.licenceFront);
    if (item.images?.licenceBack)   imgs.push(item.images.licenceBack);
    if (item.images?.profileImage)  imgs.push(item.images.profileImage);
    if (item.images?.rcImage)       imgs.push(item.images.rcImage);
    if (item.images?.insuranceImage) imgs.push(item.images.insuranceImage);
    // Fallback — flat fields
    if (item.aadhar?.frontImage  || item.aadharFront)  imgs.push(item.aadhar?.frontImage  || item.aadharFront);
    if (item.aadhar?.backImage   || item.aadharBack)   imgs.push(item.aadhar?.backImage   || item.aadharBack);
    if (item.pan?.frontImage     || item.panFront)     imgs.push(item.pan?.frontImage     || item.panFront);
    if (item.licence?.frontImage || item.licenceFront) imgs.push(item.licence?.frontImage || item.licenceFront);
    if (item.profileImage)                             imgs.push(item.profileImage);
    if (item.vehicleDocs?.rcImage || item.rcImage)     imgs.push(item.vehicleDocs?.rcImage || item.rcImage);
  } else {
    // Freelance
    if (item.images?.ownerSelfie)        imgs.push(item.images.ownerSelfie);
    if (item.images?.driverSelfie)       imgs.push(item.images.driverSelfie);
    if (item.images?.ownerAadharFront)   imgs.push(item.images.ownerAadharFront);
    if (item.images?.driverAadharFront)  imgs.push(item.images.driverAadharFront);
    if (item.images?.rcImage)            imgs.push(item.images.rcImage);
    // Fallback
    if (item.ownerSelfie)                                        imgs.push(item.ownerSelfie);
    if (item.driverSelfie)                                       imgs.push(item.driverSelfie);
    if (item.ownerAadhar?.frontImage  || item.ownerAadharFront)  imgs.push(item.ownerAadhar?.frontImage  || item.ownerAadharFront);
    if (item.driverAadhar?.frontImage || item.driverAadharFront) imgs.push(item.driverAadhar?.frontImage || item.driverAadharFront);
    if (item.vehicleDocs?.rcImage || item.rcImage)               imgs.push(item.vehicleDocs?.rcImage || item.rcImage);
  }
  
  return [...new Set(imgs)].filter(url => typeof url === 'string' && url.startsWith('http'));
};

const InspectionModal = ({ isOpen, onClose, data }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel]         = useState(1);
  const [imageError, setImageError]       = useState(false);

  useEffect(() => {
    if (data) {
      const images = getAllImages(data);
      setSelectedImage(images[0] || null);
      setZoomLevel(1);
      setImageError(false);
    }
  }, [data]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const images       = getAllImages(data);
  const displayName  = data.aadharName || data.ownerAadharName || data.driverAadharName || data.aadhar?.name || data.fullName || data.name || 'Unknown';
  const aadharNumber = data.aadharNumber || data.aadhar?.number || data.ownerAadhar?.number || '—';
  const dob          = data.aadharDob || data.aadhar?.dob ||  data.ownerAadhar?.dob || '—';
  const kycLabel     = data.kycType?.replace(/_/g, ' ') || 'KYC';
  const shortId      = (data._id || '').slice(-7).toUpperCase();
  const remark       = data.adminNotes || data.reason || data.remark || data.rejectionReason || data.pendingRemark || null;

  const statusClass  = data.status === 'Approved' ? 'text-emerald-400' : data.status === 'Rejected' ? 'text-red-400' : 'text-amber-400';
  const dotClass     = data.status === 'Approved' ? 'bg-emerald-400' : data.status === 'Rejected' ? 'bg-red-400' : 'bg-amber-400 animate-pulse';
  const remarkBorder = data.status === 'Approved' ? 'border-emerald-500/20 bg-emerald-500/5' : data.status === 'Rejected' ? 'border-red-500/20 bg-red-500/5' : 'border-white/10 bg-white/5';
  const remarkText   = data.status === 'Approved' ? 'text-emerald-300/80' : data.status === 'Rejected' ? 'text-red-300/80' : 'text-gray-300';

  const zoomIn    = () => setZoomLevel(p => Math.min(p + 0.25, 5));
  const zoomOut   = () => setZoomLevel(p => Math.max(p - 0.25, 0.5));
  const resetZoom = () => setZoomLevel(1);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#0a0a0c] w-full max-w-6xl h-[90vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#050508] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck size={16} className="text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold tracking-tight text-white">Inspection Desk</h2>
              <p className="text-[10px] font-medium text-indigo-400/80 truncate">{kycLabel} · #{shortId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* LEFT — Image Viewer */}
          <div className="w-3/5 shrink-0 flex flex-col bg-black/40 border-r border-white/10 p-4 gap-4 min-h-0 overflow-hidden">
            <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden border border-white/10 bg-[#030305] flex items-center justify-center group">
              {imageError || !selectedImage ? (
                <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                  <FileText size={32} className="opacity-40" />
                  <p className="text-sm">No image available</p>
                </div>
              ) : (
                <img
                  src={selectedImage}
                  alt="Document preview"
                  onClick={resetZoom}
                  onError={() => setImageError(true)}
                  className="max-w-full max-h-full object-contain cursor-zoom-in transition-transform duration-200 ease-out"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
                />
              )}
              {!imageError && selectedImage && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/70 backdrop-blur-md rounded-lg border border-white/10 p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button onClick={zoomOut} className="p-1.5 rounded hover:bg-white/10 text-gray-300 transition-colors"><ZoomOut size={16} /></button>
                  <span className="px-2 text-xs font-mono text-gray-400 select-none min-w-[3rem] text-center">{Math.round(zoomLevel * 100)}%</span>
                  <button onClick={zoomIn} className="p-1.5 rounded hover:bg-white/10 text-gray-300 transition-colors"><ZoomIn size={16} /></button>
                  <button onClick={resetZoom} className="p-1.5 rounded hover:bg-white/10 text-gray-300 transition-colors"><Minimize2 size={16} /></button>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto shrink-0 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedImage(url); setZoomLevel(1); setImageError(false); }}
                    className={`w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all hover:scale-105
                      ${selectedImage === url ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={url} alt={`doc-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Details */}
          <div className="flex-1 min-w-0 overflow-y-auto p-5 flex flex-col gap-5 bg-[#0a0a0c]">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User size={14} className="text-indigo-400 shrink-0" />
                <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Partner Identity</span>
              </div>
              <h3 className="text-lg font-bold text-white break-words">{displayName}</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
                <span className={`text-[10px] font-bold tracking-widest uppercase ${statusClass}`}>{data.status || 'Pending'}</span>
              </div>
            </div>

            <div className="h-px bg-white/10" />

            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 space-y-4">
              <p className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">Aadhar Verification</p>
              <InfoRow icon={<Hash size={12} className="text-gray-500 shrink-0" />} label="Aadhar Number" value={aadharNumber} mono />
              <InfoRow icon={<Calendar size={12} className="text-gray-500 shrink-0" />} label="Date of Birth" value={dob} />
            </div>

            {(data.vehicleNumber || data.city) && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                {data.vehicleNumber && <InfoRow icon={<Car size={12} className="text-gray-500 shrink-0" />} label="Vehicle Number" value={data.vehicleNumber} mono />}
                {data.city && <InfoRow icon={<MapPin size={12} className="text-gray-500 shrink-0" />} label="City" value={data.city} />}
              </div>
            )}

            {remark ? (
              <div className={`border rounded-xl p-4 ${remarkBorder}`}>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={13} className="text-gray-500 shrink-0" />
                  <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Admin Remark</p>
                </div>
                <p className={`text-sm leading-relaxed break-words ${remarkText}`}>{remark}</p>
              </div>
            ) : (
              <div className="border border-white/5 rounded-xl p-4 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={13} className="text-gray-600 shrink-0" />
                  <p className="text-[10px] font-bold tracking-widest text-gray-600 uppercase">Admin Remark</p>
                </div>
                <p className="text-xs text-gray-600 italic">Koi remark nahi diya gaya abhi tak.</p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#050508] flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/15 transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspectionModal;