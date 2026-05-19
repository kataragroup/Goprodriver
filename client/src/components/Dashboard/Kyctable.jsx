// ─── KYC Helpers ───────────────────────────────────────────────────────────
const getDisplayName = (item) =>
  item.aadhar?.name || item.ownerAadhar?.name || item.driverAadhar?.name ||
  item.driverAadharName || item.ownerAadharName || item.fullName || item.name || 'Partner Identity';

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

const KycTable = ({
  activeTab,
  data,
  loading,
  refreshing,
  setRefreshing,
  fetchData,
  searchQuery,
  setSearchQuery,
  setSelectedItem,
  setIsModalOpen,
  setQuickZoomImage,
  openRemarkModal,
}) => {
  const kycTab = ['pending', 'approved', 'rejected'].includes(activeTab) ? activeTab : null;

  const filteredKyc = kycTab
    ? data
        .filter(item => {
          const s = item.status || 'Pending';
          if (kycTab === 'pending')  return s === 'Pending' || s === 'Owner_Step_Done';
          if (kycTab === 'approved') return s === 'Approved';
          if (kycTab === 'rejected') return s === 'Rejected';
          return true;
        })
        .filter(item =>
          getDisplayName(item).toLowerCase().includes(searchQuery.toLowerCase())
        )
    : [];

  return (
    <div>
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            {activeTab === 'pending'
              ? 'Verification Desk'
              : activeTab === 'approved'
              ? 'Verified Fleet'
              : 'Rejections'}
          </h1>
          <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">
            Managing Real-time KYC Requests
          </p>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            className="bg-[#16161a] border border-white/5 rounded-2xl py-3.5 pl-6 pr-6 text-sm w-80 focus:border-indigo-500 outline-none transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => { setRefreshing(true); fetchData(); }}
            className="bg-[#16161a] p-3.5 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors"
          >
            <span className={`text-gray-400 ${refreshing ? 'animate-spin' : ''}`}>↻</span>
          </button>
        </div>
      </header>

      <div className="bg-[#121215] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl shadow-black/50">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] text-indigo-400/50 text-[10px] uppercase font-black tracking-widest border-b border-white/5">
            <tr>
              <th className="px-10 py-6 text-center w-20">#</th>
              <th className="px-10 py-6">Partner Name</th>
              <th className="px-10 py-6">Docs</th>
              <th className="px-10 py-6 text-center">Type</th>
              <th className="px-10 py-6">Status</th>
              <th className="px-10 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && !refreshing ? (
              <tr>
                <td colSpan={6} className="py-40 text-center text-gray-600">Loading...</td>
              </tr>
            ) : filteredKyc.length > 0 ? (
              filteredKyc.map((item, index) => {
                const images = getAllImages(item);
                return (
                  <tr key={item._id} className="group hover:bg-indigo-500/[0.02] transition-all">
                    <td className="px-10 py-8 text-center text-gray-700 font-mono text-xs italic">{index + 1}</td>
                    <td className="px-10 py-8">
                      <div className="font-bold text-[17px] capitalize">{getDisplayName(item)}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-1 opacity-60 uppercase">
                        {item._id.slice(-10)}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex -space-x-3">
                        {images.slice(0, 3).map((url, i) => (
                          <div
                            key={i}
                            className="w-12 h-12 rounded-xl border-4 border-[#121215] overflow-hidden cursor-zoom-in hover:scale-110 transition-all shadow-xl"
                            onClick={() => setQuickZoomImage(url)}
                          >
                            <img src={url} className="w-full h-full object-cover" alt="kyc" />
                          </div>
                        ))}
                        {images.length > 3 && (
                          <div className="w-12 h-12 rounded-xl border-4 border-[#121215] bg-indigo-600 flex items-center justify-center text-[10px] font-bold">
                            +{images.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className="text-[10px] font-black text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-tighter">
                        {item.kycType?.split('_')[0] || 'Owner'}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border
                        ${item.status === 'Approved' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'
                        : item.status === 'Rejected' ? 'bg-red-500/5 text-red-400 border-red-500/20'
                        : 'bg-orange-500/5 text-orange-400 border-orange-500/20'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'Approved' ? 'bg-emerald-500 animate-pulse'
                          : item.status === 'Rejected' ? 'bg-red-400'
                          : 'bg-orange-400'}`}
                        />
                        {item.status || 'Pending'}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        <button
                          onClick={() => { setSelectedItem(item); setIsModalOpen(true); }}
                          className="bg-white/5 p-3 rounded-xl hover:bg-indigo-600 hover:text-white text-gray-400 transition-all"
                        >
                          👁
                        </button>
                        {item.status !== 'Approved' && (
                          <button
                            onClick={() => openRemarkModal(item, 'Approved')}
                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20"
                          >
                            Approve
                          </button>
                        )}
                        {item.status !== 'Rejected' && (
                          <button
                            onClick={() => openRemarkModal(item, 'Rejected')}
                            className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 transition-all shadow-lg shadow-red-900/20"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-10 py-32 text-center text-gray-600 font-bold uppercase tracking-[0.2em] text-xs">
                  No Records Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KycTable;