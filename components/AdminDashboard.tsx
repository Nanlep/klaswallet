
import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { GeminiService } from '../services/geminiService';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'publishing' | 'console'>('overview');
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleLogs, setConsoleLogs] = useState<string[]>(['System initialized...', 'VASP License Verified: NG-VASP-2024-429-A']);
  const [releaseNotes, setReleaseNotes] = useState('');
  const gemini = new GeminiService();

  const handleSimulatePublish = async () => {
    setSubmissionProgress(1);
    const notes = await gemini.generateReleaseNotes("1.1.0", ["Biometric Login", "Gemini Advisor", "Bani.africa V3"]);
    setReleaseNotes(notes);
    const steps = [20, 45, 75, 100];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 600));
      setSubmissionProgress(step);
    }
  };

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;
    setConsoleLogs(prev => [...prev, `> ${consoleInput}`, 'Executing diagnostic...']);
    setConsoleInput('');
    setTimeout(() => {
      setConsoleLogs(prev => [...prev, 'OK: All nodes responding within 45ms.']);
    }, 1000);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 p-6">
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-8 shadow-xl shadow-indigo-500/20">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h2 className="text-white text-3xl font-black mb-10 tracking-tighter">KlasAdmin</h2>
          <form onSubmit={(e) => { e.preventDefault(); setIsAuthenticated(true); }} className="space-y-6">
            <input type="password" placeholder="••••" className="w-full bg-slate-800 border-none rounded-2xl p-5 text-white text-center text-3xl tracking-widest outline-none focus:ring-2 ring-indigo-500" maxLength={4} required />
            <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">Unlock Console</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto p-8 lg:p-12 animate-fadeIn font-sans">
      <div className="max-w-7xl mx-auto w-full space-y-10">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl">
              <i className="fa-solid fa-terminal"></i>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Master Console</h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Enterprise Instance #291</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Nodes: 128 Online</div>
             <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-black uppercase">v1.1.0 RC</div>
          </div>
        </header>

        <nav className="flex gap-10 border-b border-slate-200">
           <NavTab active={activeTab === 'overview'} label="System Health" onClick={() => setActiveTab('overview')} />
           <NavTab active={activeTab === 'console'} label="Live Terminal" onClick={() => setActiveTab('console')} />
           <NavTab active={activeTab === 'publishing'} label="Distribution" onClick={() => setActiveTab('publishing')} />
        </nav>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <StatCard label="Ledger Balance" value="₦4.2B" change="+2.4%" />
              <StatCard label="KYC Pipeline" value="842" change="PENDING" />
              <StatCard label="Settlements" value="99.9%" change="HEALTHY" />
              <StatCard label="Active Sessions" value="2.1K" change="+15%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <ServiceBadge name="Bani.africa Gateway" status="LIVE" latency="45ms" />
              <ServiceBadge name="SmileID Verification" status="LIVE" latency="120ms" />
              <ServiceBadge name="Gemini AI Node" status="LIVE" latency="1.2s" />
              <ServiceBadge name="Ledger DB Cluster" status="SYNC" latency="4ms" />
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={MOCK_CHART_DATA}>
                   <defs>
                     <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                   <YAxis hide />
                   <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                   <Area type="monotone" dataKey="vol" stroke="#4f46e5" fill="url(#colorVol)" strokeWidth={4} />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'console' && (
          <div className="bg-slate-900 rounded-[3rem] overflow-hidden flex flex-col h-[600px] shadow-2xl">
             <div className="bg-slate-800 p-6 flex justify-between items-center">
                <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                   <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                   <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-slate-400 text-[10px] font-black uppercase">SSH Root@KlasWallet-NG</span>
             </div>
             <div className="flex-1 p-8 overflow-y-auto font-mono text-sm space-y-2 text-indigo-400">
                {consoleLogs.map((log, i) => (
                  <div key={i} className={log.startsWith('>') ? 'text-white' : ''}>{log}</div>
                ))}
             </div>
             <form onSubmit={handleConsoleSubmit} className="p-6 bg-slate-950 border-t border-slate-800">
                <input 
                  value={consoleInput}
                  onChange={(e) => setConsoleInput(e.target.value)}
                  placeholder="System command..." 
                  className="w-full bg-transparent text-white font-mono outline-none"
                  autoFocus
                />
             </form>
          </div>
        )}

        {activeTab === 'publishing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             <div className="bg-slate-900 p-12 rounded-[4rem] text-white space-y-10">
                <h3 className="text-3xl font-black">Google Play Launch</h3>
                <div className="space-y-6">
                   <AuditRow label="Production API" status="ACTIVE" />
                   <AuditRow label="Key Signing" status="VERIFIED" />
                   <AuditRow label="Data Disclosure" status="AUDITED" />
                </div>
                
                {submissionProgress > 0 ? (
                  <div className="space-y-6">
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${submissionProgress}%` }}></div>
                    </div>
                    <p className="text-[10px] font-black uppercase text-indigo-400">Deploying Version 1.1.0...</p>
                  </div>
                ) : (
                  <button onClick={handleSimulatePublish} className="w-full bg-indigo-600 py-6 rounded-3xl font-black uppercase text-sm tracking-widest shadow-2xl active:scale-95 transition-all">
                    Initiate Production Push
                  </button>
                )}
             </div>

             <div className="bg-white p-12 rounded-[4rem] border border-slate-100 space-y-8">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Store Content (AI Generated)</h4>
                {releaseNotes ? (
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{releaseNotes}"</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                    <i className="fa-solid fa-wand-magic-sparkles text-4xl mb-4"></i>
                    <p className="text-[10px] font-black uppercase">Content ready on push</p>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ServiceBadge = ({ name, status, latency }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{name}</p>
      <p className="text-[10px] font-bold text-slate-900 mt-1">{latency}</p>
    </div>
    <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${status === 'LIVE' || status === 'SYNC' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
      {status}
    </div>
  </div>
);

const NavTab = ({ active, label, onClick }: any) => (
  <button onClick={onClick} className={`pb-6 px-2 text-[11px] font-black uppercase tracking-widest border-b-4 transition-all ${active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-300 hover:text-slate-500'}`}>{label}</button>
);

const StatCard = ({ label, value, change }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex justify-between items-end">
       <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h4>
       <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-1.5 rounded-xl">{change}</span>
    </div>
  </div>
);

const AuditRow = ({ label, status }: any) => (
  <div className="flex justify-between items-center py-4 border-b border-slate-800">
    <span className="text-sm font-bold text-slate-400">{label}</span>
    <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/50 px-3 py-1.5 rounded-lg">{status}</span>
  </div>
);
