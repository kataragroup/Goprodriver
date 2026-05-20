import { useState, useEffect } from 'react';
import {
  ArrowLeft, Loader2, XCircle, User, Car, FileText,
  MapPin, Phone, Mail, Calendar, CheckCircle, Clock,
  AlertCircle, Shield, Image as ImageIcon, UserCheck,
  RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';

/* ─── Helpers ──────────────────────────────────────────────────── */
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric'
}) : '—';

const BASE_URL = 'http://localhost:7000';

/* ─── KYC Status Badge ─────────────────────────────────────────── */
const KycBadge = ({ status, large }) => {
  const map = {
    Approved:        { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', icon: CheckCircle  },
    Pending:         { color: 'bg-orange-500/15  text-orange-400  border-orange-500/30',  icon: Clock        },
    Rejected:        { color: 'bg-red-500/15     text-red-400     border-red-500/30',     icon: XCircle      },
    Owner_Step_Done: { color: 'bg-blue-500/15    text-blue-400    border-blue-500/30',    icon: AlertCircle  },
    'Not Submitted': { color: 'bg-gray-500/15    text-gray-500    border-gray-500/30',    icon: Clock        },
  };
  const s = map[status] || map['Not Submitted'];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-black uppercase tracking-wider
      ${large ? 'text-xs' : 'text-[9px]'} ${s.color}`}>
      <Icon size={large ? 13 : 10} />
      {status === 'Owner_Step_Done' ? 'Owner Step Done' : (status || 'Not Submitted')}
    </span>
  );
};

/* ─── Section Card ─────────────────────────────────────────────── */
const Section = ({ title, icon: Icon, children, color = 'indigo', collapsible = false }) => {
  const [open, setOpen] = useState(true);
  const colors = {
    indigo: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
    violet: 'text-violet-400 border-violet-500/20 bg-violet-500/5',
    emerald:'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    orange: 'text-orange-400 border-orange-500/20 bg-orange-500/5',
    blue:   'text-blue-400   border-blue-500/20   bg-blue-500/5',
    rose:   'text-rose-400   border-rose-500/20   bg-rose-500/5',
  };
  const c = colors[color] || colors.indigo;

  return (
    <div className="bg-[#121215] border border-white/5 rounded-2xl overflow-hidden">
      <button
        onClick={() => collapsible && setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-6 py-4 border-b border-white/5 ${collapsible ? 'cursor-pointer hover:bg-white/[0.02]' : 'cursor-default'}`}
      >
        <div className={`flex items-center gap-2.5 text-xs font-black uppercase tracking-widest ${c.split(' ')[0]}`}>
          <div className={`p-1.5 rounded-lg border ${c.split(' ').slice(1).join(' ')}`}>
            <Icon size={13} />
          </div>
          {title}
        </div>
        {collapsible && (open ? <ChevronUp size={14} className="text-gray-600" /> : <ChevronDown size={14} className="text-gray-600" />)}
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
};

/* ─── Info Row ─────────────────────────────────────────────────── */
const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{label}</span>
    <span className="text-sm text-white font-medium">{value || '—'}</span>
  </div>
);

/* ─── Info Grid ────────────────────────────────────────────────── */
const InfoGrid = ({ items }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
    {items.map(({ label, value }) => (
      <InfoRow key={label} label={label} value={value} />
    ))}
  </div>
);

/* ─── Document Image ───────────────────────────────────────────── */
const DocImage = ({ label, url }) => {
  const [zoom, setZoom] = useState(false);
  const fullUrl = url ? (url.startsWith('http') ? url : `${BASE_URL}/${url}`) : null;

  return (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{label}</span>
        {fullUrl ? (
          <button
            onClick={() => setZoom(true)}
            className="relative group rounded-xl overflow-hidden border border-white/5 bg-[#0a0a0c] aspect-[3/2] hover:border-indigo-500/40 transition-all"
          >
            <img
              src={fullUrl}
              alt={label}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="hidden w-full h-full items-center justify-center flex-col gap-2 text-gray-700">
              <ImageIcon size={20} />
              <span className="text-[9px] uppercase tracking-widest">Load failed</span>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-[9px] font-black uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-lg transition-all">
                View
              </span>
            </div>
          </button>
        ) : (
          <div className="rounded-xl border border-white/5 bg-[#0a0a0c] aspect-[3/2] flex flex-col items-center justify-center gap-2 text-gray-700">
            <ImageIcon size={20} />
            <span className="text-[9px] uppercase tracking-widest">Not uploaded</span>
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {zoom && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-8"
          onClick={() => setZoom(false)}
        >
          <img
            src={fullUrl}
            alt={label}
            className="max-h-full max-w-full rounded-2xl shadow-2xl border border-white/10 object-contain"
          />
          <button
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all"
            onClick={() => setZoom(false)}
          >
            <XCircle size={22} className="text-white" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            {label}
          </div>
        </div>
      )}
    </>
  );
};

/* ─── Documents Grid ───────────────────────────────────────────── */
const DocsGrid = ({ docs }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {docs.map(({ label, url }) => (
      <DocImage key={label} label={label} url={url} />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   OWNER KYC VIEW
═══════════════════════════════════════════════════════════════ */
const OwnerKycView = ({ data }) => {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-5">

      {/* Personal / Aadhaar */}
      <Section title="Aadhaar Details" icon={User} color="indigo">
        <InfoGrid items={[
          { label: 'Name on Aadhaar',   value: data.aadharName   },
          { label: 'Aadhaar Number',    value: data.aadharNumber },
          { label: 'DOB (Aadhaar)',     value: fmt(data.aadharDob) },
        ]} />
      </Section>

      {/* PAN */}
      <Section title="PAN Details" icon={FileText} color="violet">
        <InfoGrid items={[
          { label: 'Name on PAN',  value: data.panName   },
          { label: 'PAN Number',   value: data.panNumber },
        ]} />
      </Section>

      {/* Licence */}
      <Section title="Driving Licence" icon={Shield} color="blue">
        <InfoGrid items={[
          { label: 'Licence Number', value: data.licenceNumber },
          { label: 'DOB (Licence)',  value: fmt(data.licenceDob) },
          { label: 'Type',           value: data.licenceType   },
          { label: 'Expiry',         value: fmt(data.licenceExpiry) },
        ]} />
      </Section>

      {/* Address */}
      <Section title="Address" icon={MapPin} color="emerald">
        <InfoGrid items={[
          { label: 'City',     value: data.city    },
          { label: 'Pincode',  value: data.pincode },
          { label: 'House No', value: data.houseno },
        ]} />
      </Section>

      {/* Vehicle */}
      <Section title="Vehicle Details" icon={Car} color="orange">
        <InfoGrid items={[
          { label: 'Type',           value: data.vehicleType   },
          { label: 'Brand',          value: data.vehicleBrand  },
          { label: 'Model',          value: data.vehicleModel  },
          { label: 'Reg. Number',    value: data.vehicleNumber },
        ]} />
      </Section>

      {/* Documents */}
      <Section title="Uploaded Documents" icon={ImageIcon} color="rose" collapsible>
        <DocsGrid docs={[
          { label: 'Aadhaar Front',  url: data.aadharFront     },
          { label: 'Aadhaar Back',   url: data.aadharBack      },
          { label: 'PAN Front',      url: data.panFront        },
          { label: 'Licence Front',  url: data.licenceFront    },
          { label: 'Licence Back',   url: data.licenceBack     },
          { label: 'Selfie',         url: data.profileImage    },
          { label: 'Agreement',      url: data.agreementImage  },
          { label: 'Light Bill',     url: data.lightbillImage  },
          { label: 'RC',             url: data.rcImage         },
          { label: 'Insurance',      url: data.insuranceImage  },
          { label: 'PUC',            url: data.pucImage        },
          { label: 'Road Tax',       url: data.roadTaxImage    },
          { label: 'Permit',         url: data.permitImage     },
          { label: 'Fitness',        url: data.fitnessImage    },
        ].filter(d => d.url)} />
      </Section>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FREELANCE KYC VIEW
═══════════════════════════════════════════════════════════════ */
const FreelanceKycView = ({ data }) => {
  if (!data) return null;
  return (
    <div className="flex flex-col gap-5">

      {/* Step indicator */}
      <div className="flex items-center gap-3 bg-[#121215] border border-white/5 rounded-2xl px-6 py-4">
        <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest
          ${data.ownerStepComplete ? 'text-emerald-400' : 'text-gray-600'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black
            ${data.ownerStepComplete ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-white/5 border border-white/10'}`}>
            1
          </div>
          Owner Step
        </div>
        <div className="flex-1 h-px bg-white/5" />
        <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest
          ${data.driverStepComplete ? 'text-emerald-400' : 'text-gray-600'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black
            ${data.driverStepComplete ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-white/5 border border-white/10'}`}>
            2
          </div>
          Driver Step
        </div>
      </div>

      {/* Owner Aadhaar */}
      <Section title="Owner — Aadhaar Details" icon={User} color="indigo">
        <InfoGrid items={[
          { label: 'Name on Aadhaar',   value: data.ownerAadharName   },
          { label: 'Aadhaar Number',    value: data.ownerAadharNumber },
          { label: 'DOB',               value: fmt(data.ownerAadharDob) },
        ]} />
      </Section>

      {/* Owner PAN */}
      <Section title="Owner — PAN Details" icon={FileText} color="violet">
        <InfoGrid items={[
          { label: 'Name on PAN',  value: data.ownerPanName   },
          { label: 'PAN Number',   value: data.ownerPanNumber },
        ]} />
      </Section>

      {/* Owner Address */}
      <Section title="Owner — Address" icon={MapPin} color="emerald">
        <InfoGrid items={[
          { label: 'City',    value: data.city    },
          { label: 'Pincode', value: data.pincode },
          { label: 'House',   value: data.houseno },
        ]} />
      </Section>

      {/* Vehicle */}
      <Section title="Vehicle Details" icon={Car} color="orange">
        <InfoGrid items={[
          { label: 'Type',        value: data.vehicleType   },
          { label: 'Brand',       value: data.vehicleBrand  },
          { label: 'Model',       value: data.vehicleModel  },
          { label: 'Reg. Number', value: data.vehicleNumber },
        ]} />
      </Section>

      {/* Driver details — only if step 2 done */}
      {data.driverStepComplete && (
        <>
          <Section title="Driver — Aadhaar Details" icon={User} color="blue">
            <InfoGrid items={[
              { label: 'Name on Aadhaar',   value: data.driverAadharName   },
              { label: 'Aadhaar Number',    value: data.driverAadharNumber },
              { label: 'DOB',               value: fmt(data.driverAadharDob) },
            ]} />
          </Section>

          <Section title="Driver — Driving Licence" icon={Shield} color="rose">
            <InfoGrid items={[
              { label: 'Licence Number', value: data.driverLicenceNumber },
              { label: 'DOB (Licence)',  value: fmt(data.driverLicenceDob) },
              { label: 'Type',           value: data.driverLicenceType   },
              { label: 'Expiry',         value: fmt(data.driverLicenceExpiry) },
            ]} />
          </Section>
        </>
      )}

      {/* Owner Documents */}
      <Section title="Owner Documents" icon={ImageIcon} color="violet" collapsible>
        <DocsGrid docs={[
          { label: 'Owner Aadhaar Front', url: data.ownerAadharFront },
          { label: 'Owner Aadhaar Back',  url: data.ownerAadharBack  },
          { label: 'Owner PAN',           url: data.ownerPanFront    },
          { label: 'Owner Selfie',        url: data.ownerSelfie      },
          { label: 'Agreement',           url: data.agreementImage   },
          { label: 'Light Bill',          url: data.lightbillImage   },
          { label: 'RC',                  url: data.rcImage          },
          { label: 'Insurance',           url: data.insuranceImage   },
          { label: 'PUC',                 url: data.pucImage         },
          { label: 'Road Tax',            url: data.roadTaxImage     },
          { label: 'Permit',              url: data.permitImage      },
          { label: 'Fitness',             url: data.fitnessImage     },
        ].filter(d => d.url)} />
      </Section>

      {/* Driver Documents — only if step 2 done */}
      {data.driverStepComplete && (
        <Section title="Driver Documents" icon={ImageIcon} color="rose" collapsible>
          <DocsGrid docs={[
            { label: 'Driver Aadhaar Front', url: data.driverAadharFront  },
            { label: 'Driver Aadhaar Back',  url: data.driverAadharBack   },
            { label: 'Driver Licence Front', url: data.driverLicenceFront },
            { label: 'Driver Licence Back',  url: data.driverLicenceBack  },
            { label: 'Driver Selfie',        url: data.driverSelfie       },
          ].filter(d => d.url)} />
        </Section>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN DRIVER PROFILE COMPONENT
   Props:
     driverId   — string
     driverName — string
     kycType    — 'owner' | 'freelance'
     apiFetch   — function
     showToast  — function
     onBack     — function → goes back to drivers list
═══════════════════════════════════════════════════════════════ */
const DriverProfile = ({ driverId, driverName, kycType, apiFetch, showToast, onBack }) => {
  const [kycData,    setKycData]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [actionBusy, setActionBusy] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch(`/admin/kyc/${kycType}/${driverId}`);
      // Response: { success, kycType, data: { ...kycDoc, driverId: { name, email, phone, ... } } }
      const kyc = res?.data || res;
      setKycData(kyc);
    } catch (err) {
      console.error('[DriverProfile] fetch error:', err);
      setError('KYC data load nahi hua');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (driverId) fetchProfile();
  }, [driverId, kycType]);

  const approveKyc = async () => {
    if (!window.confirm(`${driverName} ka KYC approve karna hai?`)) return;
    setActionBusy(true);
    try {
      await apiFetch(`/admin/kyc/${kycType}/approve/${driverId}`, { method: 'PUT' });
      showToast('KYC Approved ✅');
      fetchProfile();
    } catch { showToast('Approve failed', 'error'); }
    finally { setActionBusy(false); }
  };

  const rejectKyc = async () => {
    const reason = window.prompt('Rejection reason likho:');
    if (!reason) return;
    setActionBusy(true);
    try {
      await apiFetch(`/admin/kyc/${kycType}/reject/${driverId}`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });
      showToast('KYC Rejected ❌');
      fetchProfile();
    } catch { showToast('Reject failed', 'error'); }
    finally { setActionBusy(false); }
  };

  const driver     = kycData?.driverId || {};
  const kycStatus  = kycData?.status || 'Not Submitted';
  const isPending  = kycStatus === 'Pending' &&
    (kycType === 'owner' || kycData?.driverStepComplete);

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <header className="flex items-start justify-between mb-8 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="bg-[#121215] border border-white/5 hover:border-white/15 p-2.5 rounded-xl transition-all group"
          >
            <ArrowLeft size={16} className="text-gray-500 group-hover:text-white transition-colors" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tighter uppercase capitalize">
                {driverName || 'Driver Profile'}
              </h1>
              <KycBadge status={kycStatus} large />
            </div>
            <div className="flex items-center gap-4 mt-1.5">
              {driver.email && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Mail size={11} /> {driver.email}
                </span>
              )}
              {driver.phone && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Phone size={11} /> {driver.phone}
                </span>
              )}
              <span className="text-[9px] text-gray-700 font-mono uppercase">
                {kycType} driver · {String(driverId).slice(-10)}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => { setLoading(true); fetchProfile(); }}
            className="bg-[#121215] border border-white/5 hover:bg-white/5 p-2.5 rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-400' : 'text-gray-500'} />
          </button>

          {isPending && !actionBusy && (
            <>
              <button
                onClick={approveKyc}
                className="flex items-center gap-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
              >
                <CheckCircle size={13} /> Approve
              </button>
              <button
                onClick={rejectKyc}
                className="flex items-center gap-2 bg-red-600/10 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
              >
                <XCircle size={13} /> Reject
              </button>
            </>
          )}

          {actionBusy && (
            <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
              <Loader2 size={14} className="animate-spin" /> Processing...
            </div>
          )}
        </div>
      </header>

      {/* ── Rejection reason banner ── */}
      {kycStatus === 'Rejected' && kycData?.rejectionReason && (
        <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 flex-shrink-0">
          <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-0.5">Rejection Reason</p>
            <p className="text-sm text-red-300">{kycData.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* ── Admin notes banner ── */}
      {kycData?.adminNotes && (
        <div className="mb-6 flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-5 py-4 flex-shrink-0">
          <AlertCircle size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-0.5">Admin Notes</p>
            <p className="text-sm text-indigo-300">{kycData.adminNotes}</p>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <XCircle size={40} className="text-red-500" />
            <p className="text-red-400 font-bold text-sm">{error}</p>
            <button
              onClick={fetchProfile}
              className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Dobara try karo
            </button>
          </div>
        ) : !kycData ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 opacity-40">
            <User size={40} className="text-gray-600" />
            <p className="text-gray-600 text-sm font-bold uppercase tracking-widest">KYC data nahi mila</p>
          </div>
        ) : kycType === 'owner' ? (
          <OwnerKycView data={kycData} />
        ) : (
          <FreelanceKycView data={kycData} />
        )}
      </div>
    </div>
  );
};

export default DriverProfile;