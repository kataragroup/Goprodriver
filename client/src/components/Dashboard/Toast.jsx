const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-8 right-8 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-bold shadow-2xl transition-all
      ${toast.type === 'error'
        ? 'bg-red-500/10 border-red-500/20 text-red-400'
        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
      {toast.msg}
    </div>
  );
};

export default Toast;