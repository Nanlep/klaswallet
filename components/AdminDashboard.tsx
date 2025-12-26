
import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

type UserStatus = 'Active' | 'Suspended' | 'Pending';

interface AdminUser {
  id: string;
  name: string;
  role: 'MERCHANT' | 'INDIVIDUAL' | 'ADMIN';
  tier: number;
  status: UserStatus;
  lastLogin: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  status: 'info' | 'security' | 'alert';
  details: string;
}

interface AdminToast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const MOCK_CHART_DATA = [
  { time: '00:00', vol: 4000, rev: 240 },
  { time: '04:00', vol: 3000, rev: 139 },
  { time: '08:00', vol: 5000, rev: 980 },
  { time: '12:00', vol: 2780, rev: 390 },
  { time: '16:00', vol: 4890, rev: 780 },
  { time: '20:00', vol: 2390, rev: 380 },
  { time: '23:59', vol: 6490, rev: 930 },
];

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'finance' | 'kyc' | 'audit' | 'publishing'>('overview');
  const [isSystemFrozen, setIsSystemFrozen] = useState(false);
  const [markup, setMarkup] = useState(2.5);
  const [toast, setToast] = useState<AdminToast | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  
  const [users, setUsers] = useState<AdminUser[]>([
    { id: 'usr_9012', name: "Rick Sanchez", role: "MERCHANT", tier: 3, status: "Active", lastLogin: "2m ago" },
    { id: 'usr_4412', name: "Morty Smith", role: "INDIVIDUAL", tier: 1, status: "Pending", lastLogin: "1h ago" },
    { id: 'usr_2291', name: "Beth Smith", role: "ADMIN", tier: 2, status: "Active", lastLogin: "Just now" },
    { id: 'usr_0123', name: "Jerry Smith", role: "MERCHANT", tier: 2, status: "Suspended", lastLogin: "3d ago" },
  ]);

  const showToast = (message: string, type: AdminToast['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSimulatePublish = async () => {
    setIsSubmitting(true);
    setSubmissionProgress(0);
    
    const steps = [
      "Optimizing ProGuard rules...",
      "Compiling native bridges...",
      "Signing AAB with Production Key...",
      "Verifying Google Play API Policy...",
      "Uploading to Internal Track..."
    ];

    for (let i = 0; i < steps.length; i++) {
      showToast(steps[i], "info");
      setSubmissionProgress((i + 1) * 20);
      await new Promise(r => setTimeout(r, 1200));
    }

    setIsSubmitting(false);
    showToast("Production Build LIVE - Pending Google Review");
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pin = (e.currentTarget.elements.namedItem('pin') as HTMLInputElement).value;
    setLoginLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (pin === '1234') { 
      setIsAuthenticated(true);
      showToast("Master Session Initialized");
    } else {
      showToast("Access Denied", "error");
    }
    setLoginLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-indigo-950/20 backdrop-blur-xl border border-indigo-500/20 p-12 rounded-[4rem] shadow-2xl w-full max-w-md text-center">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl mx-auto mb-8 shadow-2xl shadow-indigo-500/40">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h2 className="text-white text-4xl font-black tracking-tighter mb-2">KlasAdmin</h2>
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-10">Production Gateway Access</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <input name="pin" type="password" placeholder="••••" className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-6 text-white text-center text-4xl tracking-[0.5em] font-black placeholder:text-slate-800 focus:border-indigo-500 outline-none transition-all" maxLength={4} required />
            <button disabled={loginLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center">
              {loginLoading ? <ActivitySpinner /> : 'Unlock Console'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 lg:p-12 animate-fadeIn font-sans">
      {toast && (
        <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[200] px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4 animate-slideDown border ${
          toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 
          toast.type === 'error' ? 'bg-rose-600 border-rose-500 text-white' : 
          'bg-indigo-600 border-indigo-500 text-white'
        }`}>
          <i className="fa-solid fa-circle-check"></i>
          <span className="text-[11px] font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-black tracking-tighter text-slate-900">Mission Control</h1>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">v1.1.0 RC</span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Institutional Asset Gateway • Live in Lagos, NG</p>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className={`flex-1 lg:flex-none px-6 py-4 rounded-3xl border flex items-center gap-4 transition-all ${isSystemFrozen ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
              <div className={`w-3 h-3 rounded-full ${isSystemFrozen ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
              <span className="text-[11px] font-black uppercase tracking-widest">{isSystemFrozen ? 'Global Halt' : 'Nodes Active'}</span>
            </div>
          </div>
        </header>

        <div className="flex gap-10 border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-hide pb-4">
          <Tab active={activeTab === 'overview'} label="Health" onClick={() => setActiveTab('overview')} />
          <Tab active={activeTab === 'users'} label="Registry" onClick={() => setActiveTab('users')} />
          <Tab active={activeTab === 'finance'} label="Spread" onClick={() => setActiveTab('finance')} />
          <Tab active={activeTab === 'kyc'} label="Verified" onClick={() => setActiveTab('kyc')} />
          <Tab active={activeTab === 'publishing'} label="Store Release" onClick={() => setActiveTab('publishing')} />
          <Tab active={activeTab === 'audit'} label="Security Logs" onClick={() => setActiveTab('audit')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-10">
            {activeTab === 'overview' && (
              <div className="space-y-10 animate-slideUp">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <StatCard label="Monthly Vol" value="$12.4M" change="+24%" icon="fa-chart-area" />
                  <StatCard label="Security Score" value="98/100" change="SAFE" icon="fa-shield-check" />
                  <StatCard label="App Installs" value="4.2K" change="+8%" icon="fa-download" />
                </div>
                
                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_CHART_DATA}>
                      <defs>
                        <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="vol" stroke="#4f46e5" fillOpacity={1} fill="url(#colorVol)" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'publishing' && (
              <div className="space-y-10 animate-slideUp">
                <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-12">
                      <div>
                        <h3 className="text-3xl font-black mb-2">Google Play Launchpad</h3>
                        <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Target: Production Internal Track</p>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 text-[11px] font-black uppercase tracking-widest">Ready for Submission</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                      <AuditCheck label="VASP License Verify" status="PASSED" icon="fa-file-certificate" />
                      <AuditCheck label="HSM Key Rotation" status="ACTIVE" icon="fa-key" />
                      <AuditCheck label="Bani API Production" status="CONNECTED" icon="fa-link" />
                      <AuditCheck label="Play Store Assets" status="GENERATED" icon="fa-image" />
                    </div>

                    <div className="space-y-6">
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${submissionProgress}%` }}></div>
                      </div>
                      <button 
                        disabled={isSubmitting}
                        onClick={handleSimulatePublish}
                        className="w-full bg-white text-slate-950 py-7 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4"
                      >
                        {isSubmitting ? <ActivitySpinner color="#000" /> : <><i className="fa-brands fa-google-play text-xl"></i> Final Build & Submit</>}
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Play Store Data Safety Mapping</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <DataSafetyCard label="Financial Info" details="Collection mandatory for transactions" />
                    <DataSafetyCard label="Device ID" details="Required for security bridging" />
                    <DataSafetyCard label="Contact Info" details="Used for P2P discovery" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
               <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm animate-slideUp">
                 <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                   <h3 className="text-2xl font-black tracking-tighter">Global Identity Registry</h3>
                 </div>
                 <table className="w-full text-left">
                   <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <tr>
                       <th className="px-10 py-6">Identity</th>
                       <th className="px-10 py-6">Tier</th>
                       <th className="px-10 py-6">Status</th>
                       <th className="px-10 py-6 text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="text-xs font-bold divide-y divide-slate-50">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-6">
                            <p className="text-slate-900 font-black">{u.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{u.role}</p>
                          </td>
                          <td className="px-10 py-6 text-indigo-600">Level {u.tier}</td>
                          <td className="px-10 py-6">
                            <span className={`px-3 py-1.5 rounded-lg uppercase text-[10px] font-black ${u.status === 'Active' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>{u.status}</span>
                          </td>
                          <td className="px-10 py-6 text-right">
                             <button className="text-slate-300 hover:text-indigo-600 transition-colors"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                          </td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Service Vitality</h3>
               <div className="space-y-6">
                 <VitalityRow label="Ledger DB" status="SYNCED" />
                 <VitalityRow label="Bani Cloud" status="LIVE" />
                 <VitalityRow label="SmileID API" status="LIVE" />
                 <VitalityRow label="Gemini AI" status="LIVE" />
               </div>
            </div>

            <div className="bg-indigo-600 p-10 rounded-[3.5rem] text-white shadow-xl">
               <i className="fa-solid fa-file-shield text-3xl mb-6"></i>
               <h4 className="text-xl font-black mb-2">VASP Licensing</h4>
               <p className="text-indigo-100 text-[11px] font-bold leading-relaxed mb-6">NG-VASP-2024-429-A verified. AML/CFT screening active via SmileID integration.</p>
               <button className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-6 py-3 rounded-xl hover:bg-white/30 transition">View Certificate</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivitySpinner = ({ color = "#fff" }: any) => (
  <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin`} style={{ borderColor: `${color}44`, borderTopColor: color }}></div>
);

const Tab = ({ active, label, onClick }: any) => (
  <button onClick={onClick} className={`pb-6 px-2 text-[12px] font-black uppercase tracking-widest border-b-4 transition-all ${active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-300 hover:text-slate-500'}`}>{label}</button>
);

const StatCard = ({ label, value, change, icon }: any) => (
  <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
    <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-8">
      <i className={`fa-solid ${icon} text-2xl`}></i>
    </div>
    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <div className="flex items-end justify-between">
      <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h4>
      <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl">{change}</span>
    </div>
  </div>
);

const AuditCheck = ({ label, status, icon }: any) => (
  <div className="flex items-center justify-between bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
    <div className="flex items-center gap-4">
      <i className={`fa-solid ${icon} text-slate-400`}></i>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{label}</span>
    </div>
    <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/50 px-2.5 py-1.5 rounded-lg">{status}</span>
  </div>
);

const DataSafetyCard = ({ label, details }: any) => (
  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
    <h5 className="text-[11px] font-black text-slate-900 uppercase mb-2">{label}</h5>
    <p className="text-[10px] font-bold text-slate-500 leading-relaxed">{details}</p>
  </div>
);

const VitalityRow = ({ label, status }: any) => (
  <div className="flex justify-between items-center">
    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <span className="text-[10px] font-black text-emerald-600 flex items-center gap-2">
      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> {status}
    </span>
  </div>
);
