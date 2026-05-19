import { useState, useEffect } from 'react';
import { X, MessageSquare, Send, Loader2 } from 'lucide-react';

const RemarkModal = ({ isOpen, onClose, onSubmit, actionType }) => {
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setRemark('');
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isApprove = actionType === 'Approved';

  const handleSubmit = async () => {
    if (!remark.trim()) return;
    setSubmitting(true);
    await onSubmit(remark.trim());
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0e0e11] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] bg-[#09090b]">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center
              ${isApprove ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <MessageSquare size={15} className={isApprove ? 'text-emerald-400' : 'text-red-400'} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">
                {isApprove ? 'Approve KYC' : 'Reject KYC'}
              </h3>
              <p className="text-[10px] text-gray-500 font-medium">Remark likhna zaroori hai</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-500 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-2">
              Admin Remark *
            </label>
            <textarea
              autoFocus
              rows={4}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder={isApprove
                ? 'Jaise: Documents verified, sab theek hai...'
                : 'Jaise: Aadhar image blur hai, dobara upload karein...'}
              className="w-full bg-[#16161a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none resize-none focus:border-indigo-500/60 transition-all leading-relaxed"
            />
          </div>
          <div className={`rounded-xl px-4 py-3 text-xs font-medium leading-relaxed
            ${isApprove
              ? 'bg-emerald-500/5 border border-emerald-500/20 text-emerald-400/80'
              : 'bg-red-500/5 border border-red-500/20 text-red-400/80'}`}>
            {isApprove
              ? '✅ Yeh KYC Approved ho jayega aur driver ko notification milegi.'
              : '❌ Yeh KYC Rejected ho jayega. Driver apne documents dobara submit kar sakta hai.'}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.07] bg-[#09090b] flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!remark.trim() || submitting}
            className={`px-6 py-2.5 rounded-xl text-white text-xs font-black uppercase flex items-center gap-2 transition-all
              ${!remark.trim() || submitting ? 'opacity-40 cursor-not-allowed' : ''}
              ${isApprove
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/30'
                : 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/30'}`}
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {submitting ? 'Submitting...' : isApprove ? 'Approve Karo' : 'Reject Karo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemarkModal;