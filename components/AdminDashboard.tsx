
import React, { useState } from 'react';
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

const MOCK_CHART_DATA = [
  { time: '00:00', vol: 4000 },
  { time: '04:00', vol: 3000 },
  { time: '08:00', vol: 5000 },
  { time: '12:00', vol: 2780 },
  { time: '16:00', vol: 4890 },
  { time: '20:00', vol: 2390 },
  { time: '23:59', vol: 6490 },
];

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'publishing'>('overview');
  const [loginLoading, setLoginLoading] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);

  const handleSimulatePublish = async () => {
    setSubmissionProgress(1);
    const steps = [20, 45, 75, 100];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 800));
      setSubmissionProgress(step);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsAuthenticated(true);
    setLoginLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 p-6">
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-8">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h2 className="text-white text-3xl font-black mb-10">Admin Terminal</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" placeholder="PIN" className="w-full bg-slate-800 border-none rounded-2xl p-5 text-white text-center text-3xl tracking-widest outline-none focus:ring-2 ring-indigo-500" maxLength={4} required />
            <button disabled={loginLoading} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">
              {loginLoading ? 'Checking...' : 'Enter Console'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto p-8 lg:p-12 animate-fadeIn">
      <div className="max-w-7xl mx-auto w-full space-y-10">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Mission Control</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">VASP Status: <span className="text-emerald-500">Active License</span></p>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ledger Sync: 100%</span>
          </div>
        </header>

        <nav className="flex gap-8 border-b border-slate-200">
           <NavTab active={activeTab === 'overview'} label="Vitality" onClick={() => setActiveTab('overview')} />
           <NavTab active={activeTab === 'publishing'} label="Store Release" onClick={() => setActiveTab('publishing')} />
           <NavTab active={activeTab === 'users'} label="Registry" onClick={() => setActiveTab('users')} />
        </nav>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <StatCard label="24h Liquidity" value="$1.24M" change="+12%" />
            <StatCard label="Security Index" value="99.2%" change="SAFE" />
            <StatCard label="API Nodes" value="12 Active" change="LIVE" />
            <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-100 h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={MOCK_CHART_DATA}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="time" hide />
                   <YAxis hide />
                   <Tooltip />
                   <Area type="monotone" dataKey="vol" stroke="#4f46e5" fill="#4f46e510" strokeWidth={3} />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'publishing' && (
          <div className="space-y-8 max-w-2xl">
             <div className="bg-slate-900 p-10 rounded-[3rem] text-white">
                <h3 className="text-2xl font-black mb-4">Production Audit</h3>
                <div className="space-y-4 mb-10">
                   <AuditRow label="Biometric Bridge" status="PASSED" />
                   <AuditRow label="Bani API Key (PROD)" status="VERIFIED" />
                   <AuditRow label="VASP License Check" status="LICENSED" />
                   <AuditRow label="Data Safety Map" status="COMPLETE" />
                </div>
                {submissionProgress > 0 ? (
                  <div className="space-y-4">
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all" style={{ width: `${submissionProgress}%` }}></div>
                    </div>
                    <p className="text-[10px] font-black uppercase text-indigo-400">Deploying Build v1.1.0 to Play Store...</p>
                  </div>
                ) : (
                  <button onClick={handleSimulatePublish} className="w-full bg-indigo-600 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                    Commit To Production Track
                  </button>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const NavTab = ({ active, label, onClick }: any) => (
  <button onClick={onClick} className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all ${active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-300'}`}>{label}</button>
);

const StatCard = ({ label, value, change }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex justify-between items-end">
       <h4 className="text-3xl font-black text-slate-900">{value}</h4>
       <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{change}</span>
    </div>
  </div>
);

const AuditRow = ({ label, status }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-800">
    <span className="text-xs font-bold text-slate-400">{label}</span>
    <span className="text-[10px] font-black text-emerald-400">{status}</span>
  </div>
);
