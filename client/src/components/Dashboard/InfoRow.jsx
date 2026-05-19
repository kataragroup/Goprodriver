const InfoRow = ({ icon, label, value, mono }) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{label}</span>
    </div>
    <p className={`text-sm font-semibold text-gray-200 break-all leading-snug ${mono ? 'font-mono tracking-wide' : ''}`}>
      {value || '—'}
    </p>
  </div>
);

export default InfoRow;