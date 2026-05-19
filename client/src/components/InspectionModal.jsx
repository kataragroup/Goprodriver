import React, { useState, useEffect } from 'react';
import { X, MessageSquare, User, MapPin } from 'lucide-react';

const InspectionModal = ({ isOpen, onClose, data }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (data?.images) {
      const firstImage = Object.values(data.images || {})[0];
      setSelectedImage(firstImage);
    }
    setZoomLevel(1);
  }, [data]);

  if (!isOpen || !data) return null;

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 5));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setZoomLevel(1);

  const remark = data.adminNotes || data.reason || data.remark || data.pendingRemark || 
                 data.rejectionReason || "Koi remark nahi diya gaya";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-[#121215] w-full max-w-6xl h-[92vh] rounded-[2.5rem] overflow-hidden flex flex-col border border-white/10">
        
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0a0a0c]">
          <h2 className="text-3xl font-bold text-white">Inspection Details</h2>
          <button onClick={onClose} className="p-3 hover:bg-red-500/20 hover:text-red-400 rounded-2xl transition-all">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Image Section */}
          <div className="lg:col-span-7 bg-black p-8 flex flex-col">
            <div className="flex-1 flex items-center justify-center rounded-3xl overflow-hidden border border-white/10">
              {selectedImage && (
                <img 
                  src={selectedImage} 
                  className="max-h-full max-w-full object-contain"
                  style={{ transform: `scale(${zoomLevel})` }}
                  onClick={resetZoom}
                  alt="Document"
                />
              )}
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button onClick={zoomOut} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl">− Zoom</button>
              <button onClick={resetZoom} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl">Reset</button>
              <button onClick={zoomIn} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl">+ Zoom</button>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-5 p-8 overflow-auto">
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3">
                  <User size={32} className="text-indigo-400" />
                  <h3 className="text-3xl font-bold">
                    {data.driverAadharName || data.aadharName || data.ownerAadharName || "Unnamed Entity"}
                  </h3>
                </div>
                <p className="text-emerald-400 font-mono mt-2">{data.vehicleNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-sm">STATUS</p>
                  <p className="text-2xl font-bold text-orange-400">{data.status}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">CITY</p>
                  <p className="text-white text-xl flex items-center gap-2"><MapPin size={18}/>{data.city}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare size={22} className="text-indigo-400" />
                  <p className="text-gray-400 font-medium">ADMIN REMARK / INPUT MESSAGE</p>
                </div>
                <div className="bg-[#0a0a0c] border border-white/10 rounded-3xl p-6 min-h-[260px]">
                  <p className="text-gray-100 whitespace-pre-wrap text-[15px] leading-relaxed">
                    {remark}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 text-right">
          <button onClick={onClose} className="px-10 py-3.5 bg-white/10 hover:bg-white/20 rounded-2xl text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspectionModal;