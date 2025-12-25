
import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { SmileIDStatus } from '../services/smileIDAdapter';

type AdminRole = 'SUPERADMIN' | 'FINANCE_ADMIN' | 'SUPPORT';
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
  { time: '08:00', vol: 2000, rev: 980 },
  { time: '12:00', vol: 2780, rev: 390 },
  { time: '16:00', vol: 1890, rev: 480 },
  { time: '20:00', vol: 2390, rev: 380 },
  { time: '23:59', vol: 3490, rev: 430 },
];

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'finance' | 'kyc' | 'audit' | 'settings'>('overview');
  const [isSystemFrozen, setIsSystemFrozen] = useState(false);
  const [markup, setMarkup] = useState(2.5);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [toast, setToast] = useState<AdminToast | null>(null);
  
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

  const [logs, setLogs] = useState<AuditLog[]>([
    { id: '1', timestamp: '10:45:22', actor: 'SYS', action: 'LEDGER_SYNC', status: 'info', details: 'PostgreSQL consistency check passed: 0 discrepancies.' },
    { id: '2', timestamp: '10:42:01', actor: 'admin_sarah', action: 'MARKUP_UPDATE', status: 'security', details: 'Global BTC markup increased to 2.5%.' },
    { id: '3', timestamp: '10:39:15', actor: 'usr_9912', action: 'LOGIN_FAILURE', status: 'alert', details: '3 failed PIN attempts from IP 192.168.1.42.' },
    { id: '4', timestamp: '10:30:05', actor: 'SUPER_ROOT', action: 'CONFIG_CHANGE', status: 'security', details: 'MFA enforcement enabled for all Admin sessions.' },
  ]);

  const handleToggleFreeze = () => {
    if (confirm(isSystemFrozen ? "Re-enable system-wide transactions?" : "EMERGENCY: Freeze all outbound transfers?")) {
      setIsSystemFrozen(!isSystemFrozen);
      showToast(isSystemFrozen ? "System unfrozen" : "EMERGENCY FREEZE ACTIVE", isSystemFrozen ? "success" : "error");
    }
  };

  const handleUserStatusToggle = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus: UserStatus = u.status === 'Suspended' ? 'Active' : 'Suspended';
        showToast(`${u.name} status updated to ${newStatus}`, newStatus === 'Active' ? 'success' : 'warning');
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const handleUserEdit = (user: AdminUser) => {
    showToast(`Opening configuration for ${user.name}`, "info");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center animate-fadeIn">
        <div className="bg-indigo-950 p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md border border-indigo-900/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-xl shadow-indigo-500/20 rotate-3">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h2 className="text-white text-3xl font-black tracking-tighter">Auth Required</h2>
            <p className="text-indigo-300/60 text-[10px] font-black uppercase tracking-widest mt-3">Enterprise Access Management</p>
          </div>
          
          <form onSubmit={(e: any) => { e.preventDefault(); if(e.target.pin.value === '1234') setIsAuthenticated(true); }} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Secure PIN</label>
              <input name="pin" type="password" placeholder="••••" className="w-full bg-indigo-900/40 border border-indigo-800 rounded-2xl p-5 text-white text-center text-3xl tracking-[0.8em] font-black placeholder:text-indigo-800 outline-none focus:border-indigo-500 transition-all" maxLength={4} />
            </div>
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-900/20 active:scale-95 transition-all">Authorize Session</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn font-sans pb-12 relative">
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-slideDown border ${
          toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 
          toast.type === 'error' ? 'bg-rose-600 border-rose-500 text-white' : 
          toast.type === 'warning' ? 'bg-amber-600 border-amber-500 text-white' :
          'bg-indigo-600 border-indigo-500 text-white'
        }`}>
          <i className={`fa-solid ${
            toast.type === 'success' ? 'fa-circle-check' : 
            toast.type === 'error' ? 'fa-triangle-exclamation' : 
            toast.type === 'warning' ? 'fa-ban' : 'fa-circle-info'
          }`}></i>
          <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Mission Control</h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">System status: <span className={maintenanceMode ? 'text-amber-500' : 'text-emerald-500'}>{maintenanceMode ? 'Maintenance' : 'Operational'}</span> • <span className="text-indigo-600 font-mono">v1.0.4-LTS</span></p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-5 py-3 rounded-2xl border flex items-center gap-3 transition-all ${isSystemFrozen ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isSystemFrozen ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest">{isSystemFrozen ? 'System Frozen' : 'Live Gateway'}</span>
          </div>
          <button 
            onClick={handleToggleFreeze} 
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${isSystemFrozen ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
          >
            {isSystemFrozen ? 'Release Freeze' : 'Emergency Halt'}
          </button>
        </div>
      </header>

      <div className="flex gap-10 border-b border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <Tab active={activeTab === 'overview'} label="Performance" onClick={() => setActiveTab('overview')} />
        <Tab active={activeTab === 'users'} label="User Hub" onClick={() => setActiveTab('users')} />
        <Tab active={activeTab === 'finance'} label="Finance & Spread" onClick={() => setActiveTab('finance')} />
        <Tab active={activeTab === 'kyc'} label="KYC Pipeline" onClick={() => setActiveTab('kyc')} />
        <Tab active={activeTab === 'audit'} label="Audit Stream" onClick={() => setActiveTab('audit')} />
        <Tab active={activeTab === 'settings'} label="System Configuration" onClick={() => setActiveTab('settings')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-slideUp">
              <div className="grid grid-cols-3 gap-6">
                <StatCard label="Total Volume" value="$1.24M" change="+12.4%" icon="fa-chart-line" />
                <StatCard label="Platform Revenue" value="$42.1K" change="+5.2%" icon="fa-sack-dollar" />
                <StatCard label="Active Nodes" value="8.9K" change="+18.1%" icon="fa-users" />
              </div>
              
              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-[400px]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">System Liquidity Flow</h3>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-indigo-600"><div className="w-2 h-2 rounded-full bg-indigo-600"></div> Total Volume</span>
                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-500"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Spread Revenue</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_CHART_DATA}>
                    <defs>
                      <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="vol" stroke="#4f46e5" fillOpacity={1} fill="url(#colorVol)" strokeWidth={3} />
                    <Area type="monotone" dataKey="rev" stroke="#10b981" fill="transparent" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden animate-slideUp shadow-sm">
               <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                 <div>
                   <h3 className="text-xl font-black tracking-tight">SmileID Verify Pipeline</h3>
                   <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Awaiting manual exception review</p>
                 </div>
                 <button onClick={() => showToast("Bulk approval process initiated", "info")} className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition shadow-lg shadow-indigo-100">Batch Approve</button>
               </div>
               <table className="w-full text-left">
                 <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                   <tr>
                     <th className="px-8 py-5 text-indigo-600">User Identity</th>
                     <th className="px-8 py-5">Verification ID</th>
                     <th className="px-8 py-5">Liveness</th>
                     <th className="px-8 py-5">Result</th>
                     <th className="px-8 py-5">Action</th>
                   </tr>
                 </thead>
                 <tbody className="text-xs font-bold divide-y divide-gray-50">
                    <KYCRow name="Summer Smith" id="usr_8812" type="NIN" liveness="98.2%" result="Success" onApprove={() => showToast("Summer Smith approved")} onReject={() => showToast("Summer Smith rejected", "error")} />
                    <KYCRow name="Morty Smith" id="usr_4412" type="BVN" liveness="42.1%" result="Low Confidence" warning onApprove={() => showToast("Morty Smith approved")} onReject={() => showToast("Morty Smith rejected", "error")} />
                    <KYCRow name="Jerry Smith" id="usr_0123" type="Drivers License" liveness="0.0%" result="Spoof Detected" danger onApprove={() => showToast("Jerry Smith approved")} onReject={() => showToast("Jerry Smith rejected", "error")} />
                 </tbody>
               </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden animate-slideUp shadow-sm">
               <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                 <h3 className="text-xl font-black tracking-tight">Enterprise Account Registry</h3>
                 <div className="flex gap-3">
                   <input type="text" placeholder="Search by ID, Email, or BVN..." className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-indigo-500 min-w-[240px] transition-all" />
                 </div>
               </div>
               <table className="w-full text-left">
                 <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                   <tr>
                     <th className="px-8 py-5 text-indigo-600">Identity Header</th>
                     <th className="px-8 py-5">Access Level</th>
                     <th className="px-8 py-5">KYC Tier</th>
                     <th className="px-8 py-5">Gateway Status</th>
                     <th className="px-8 py-5">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="text-xs font-bold divide-y divide-gray-50">
                    {users.map(user => (
                      <UserRow 
                        key={user.id} 
                        user={user} 
                        onEdit={() => handleUserEdit(user)} 
                        onToggleStatus={() => handleUserStatusToggle(user.id)} 
                      />
                    ))}
                 </tbody>
               </table>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-8 animate-slideUp">
               <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                 <h3 className="text-xl font-black mb-2 tracking-tight">Asset Markup Engine</h3>
                 <p className="text-gray-400 text-xs font-bold mb-10 uppercase tracking-widest">Global crypto-fiat spread configuration</p>
                 <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-6">
                     <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Active Spread Markup: {markup}%</label>
                     <input 
                      type="range" min="0" max="10" step="0.1" value={markup} 
                      onChange={(e) => setMarkup(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                     />
                     <div className="flex justify-between text-[9px] font-black text-gray-400">
                       <span>STABLE (0%)</span>
                       <span>STANDARD (2.5%)</span>
                       <span>MAX SPREAD (10%)</span>
                     </div>
                   </div>
                   <div className="bg-indigo-50/50 p-7 rounded-[2.5rem] border border-indigo-100 shadow-inner">
                     <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3">Profitability Analysis</p>
                     <div className="flex justify-between items-end">
                       <div>
                         <p className="text-2xl font-black text-gray-900">${(markup * 5.68).toFixed(1)}K</p>
                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Est. Daily Net Spread</p>
                       </div>
                       <button onClick={() => showToast(`Markup updated to ${markup}%`, "success")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-indigo-200">Commit Delta</button>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8 animate-slideUp">
              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black tracking-tight text-gray-900">Gateway Credentials</h3>
                  <button onClick={() => showToast("Rotating production keys...", "warning")} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Rotate Production Keys</button>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bani.africa LIVE API Key</label>
                      <div className="relative">
                        <input type="password" value="••••••••••••••••••••••••••••••" readOnly className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-xs font-mono tracking-widest" />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-indigo-600 transition"><i className="fa-solid fa-eye"></i></button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SmileID Integration Secret</label>
                      <div className="relative">
                        <input type="password" value="••••••••••••••••••••••••••••••" readOnly className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-xs font-mono tracking-widest" />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-indigo-600 transition"><i className="fa-solid fa-eye"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-black mb-8 tracking-tight text-gray-900">Operational & Security Polices</h3>
                <div className="space-y-4">
                  <SettingControl 
                    label="Real-time SmileID Monitoring" 
                    desc="Enable live feed for identity verification attempts" 
                    enabled={true} 
                  />
                  <SettingControl 
                    label="Enforce 2FA for Outbound Transfers" 
                    desc="Forces all non-internal transactions to verify via MFA" 
                    enabled={true} 
                  />
                  <SettingControl 
                    label="Automated High-Value Freeze" 
                    desc="Place a 2-hour hold on single transfers over $10k" 
                    enabled={true} 
                  />
                  <SettingControl 
                    label="Maintenance Mode" 
                    desc="Disable client-side exchange and funding gateways" 
                    enabled={maintenanceMode}
                    onToggle={() => {
                      setMaintenanceMode(!maintenanceMode);
                      showToast(maintenanceMode ? "System online" : "MAINTENANCE MODE ACTIVE", maintenanceMode ? "success" : "warning");
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-indigo-950 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden h-[300px] border border-indigo-900">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
             <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <i className="fa-solid fa-server"></i> System Heartbeat
             </h3>
             <div className="space-y-5">
               <HealthRow label="Bani Cloud Gateway" status="Live" />
               <HealthRow label="SmileID Verify API" status="Live" />
               <HealthRow label="PostgreSQL Cluster" status="Syncing" warning />
               <HealthRow label="Gemini AI Terminal" status="Live" />
             </div>
             <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest">Network Latency</span>
                <span className="text-xs font-mono font-black text-emerald-400">38ms</span>
             </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-gray-100 p-8 shadow-sm h-full flex flex-col">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex justify-between items-center">
              <span>Security Event Stream</span>
              <button onClick={() => { setLogs([]); showToast("Logs cleared", "info"); }} className="text-indigo-600 hover:underline">Flush Logs</button>
            </h3>
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide">
               {logs.map(log => (
                 <div key={log.id} className="flex gap-4">
                   <div className={`w-1 h-12 rounded-full shrink-0 ${log.status === 'security' ? 'bg-indigo-600' : log.status === 'alert' ? 'bg-rose-500' : 'bg-emerald-200'}`}></div>
                   <div>
                     <div className="flex items-center gap-2">
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded leading-none ${log.status === 'alert' ? 'bg-rose-50 text-rose-600' : log.status === 'security' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-500'}`}>{log.action}</span>
                       <span className="text-[8px] font-bold text-gray-300 font-mono">{log.timestamp}</span>
                     </div>
                     <p className="text-[10px] font-bold text-gray-700 mt-1.5 leading-relaxed">{log.details}</p>
                   </div>
                 </div>
               ))}
            </div>
            <button onClick={() => showToast("Exporting audit log...", "info")} className="w-full mt-8 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 transition border border-transparent hover:border-gray-200">Access Master Audit Log</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Tab = ({ active, label, onClick }: any) => (
  <button onClick={onClick} className={`pb-4 px-2 text-[11px] font-black uppercase tracking-widest border-b-4 transition-all ${active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-300 hover:text-gray-400 hover:border-gray-200'}`}>{label}</button>
);

const StatCard = ({ label, value, change, icon }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
        <i className={`fa-solid ${icon} text-lg`}></i>
      </div>
      <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100">{change}</span>
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
    <h4 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h4>
  </div>
);

const HealthRow = ({ label, status, warning }: any) => (
  <div className="flex justify-between items-center group">
    <span className="text-[10px] font-black text-indigo-300/60 uppercase tracking-widest group-hover:text-indigo-100 transition-colors">{label}</span>
    <span className={`text-[9px] font-black uppercase tracking-widest ${warning ? 'text-amber-500' : 'text-emerald-500'}`}>{status}</span>
  </div>
);

const SettingControl = ({ label, desc, enabled, onToggle }: any) => (
  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-gray-100 transition-colors">
    <div>
      <p className="text-xs font-black uppercase tracking-tight text-gray-900">{label}</p>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{desc}</p>
    </div>
    <button onClick={onToggle} className={`w-12 h-6 rounded-full transition-all relative shadow-inner ${enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${enabled ? 'left-7' : 'left-1'}`}></div>
    </button>
  </div>
);

const UserRow = ({ user, onEdit, onToggleStatus }: { user: AdminUser; onEdit: () => void; onToggleStatus: () => void }) => (
  <tr className="hover:bg-gray-50/50 transition-colors group">
    <td className="px-8 py-5">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xs font-black shadow-sm group-hover:scale-105 transition-transform">{user.name[0]}</div>
        <div>
          <p className="text-gray-900 font-black">{user.name}</p>
          <p className="text-[10px] font-mono text-gray-300 group-hover:text-indigo-400 transition-colors">{user.id}</p>
        </div>
      </div>
    </td>
    <td className="px-8 py-5">
      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 uppercase tracking-widest">{user.role}</span>
    </td>
    <td className="px-8 py-5">
       <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${user.tier === 3 ? 'bg-indigo-500' : user.tier === 2 ? 'bg-indigo-300' : 'bg-indigo-100'}`}></span>
          <span className="text-gray-500 uppercase font-black text-[10px]">Tier {user.tier}</span>
       </div>
    </td>
    <td className="px-8 py-5">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 animate-pulse' : user.status === 'Suspended' ? 'bg-rose-500' : 'bg-amber-400'}`}></div>
        <span className={`uppercase text-[10px] font-black ${user.status === 'Active' ? 'text-emerald-600' : user.status === 'Suspended' ? 'text-rose-600' : 'text-amber-600'}`}>{user.status}</span>
      </div>
    </td>
    <td className="px-8 py-5">
      <div className="flex gap-4">
        <button onClick={onEdit} className="text-gray-300 hover:text-indigo-600 transition-colors active:scale-90" title="Edit Configuration"><i className="fa-solid fa-pen-to-square"></i></button>
        <button onClick={onToggleStatus} className={`transition-colors active:scale-90 ${user.status === 'Suspended' ? 'text-emerald-500 hover:text-emerald-600' : 'text-gray-300 hover:text-rose-600'}`} title={user.status === 'Suspended' ? 'Unsuspend Account' : 'Suspend Account'}>
          <i className={`fa-solid ${user.status === 'Suspended' ? 'fa-unlock' : 'fa-ban'}`}></i>
        </button>
      </div>
    </td>
  </tr>
);

const KYCRow = ({ name, id, type, liveness, result, warning, danger, onApprove, onReject }: any) => (
  <tr className="hover:bg-gray-50/50 transition-colors group">
    <td className="px-8 py-5">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xs font-black shadow-sm group-hover:scale-105 transition-transform">{name[0]}</div>
        <div>
          <p className="text-gray-900 font-black">{name}</p>
          <p className="text-[10px] font-mono text-gray-300">{id}</p>
        </div>
      </div>
    </td>
    <td className="px-8 py-5">
      <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-3 py-1 rounded-lg uppercase tracking-widest">{type}</span>
    </td>
    <td className="px-8 py-5">
       <div className="space-y-1">
         <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-400">
           <span>Match Score</span>
           <span className={danger ? 'text-rose-500' : warning ? 'text-amber-500' : 'text-emerald-500'}>{liveness}</span>
         </div>
         <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
           <div className={`h-full ${danger ? 'bg-rose-500' : warning ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: liveness }}></div>
         </div>
       </div>
    </td>
    <td className="px-8 py-5">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${danger ? 'bg-rose-500' : warning ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>
        <span className={`uppercase text-[10px] font-black ${danger ? 'text-rose-600' : warning ? 'text-amber-600' : 'text-emerald-600'}`}>{result}</span>
      </div>
    </td>
    <td className="px-8 py-5">
      <div className="flex gap-4">
        <button onClick={onApprove} className="text-gray-300 hover:text-emerald-600 transition-colors active:scale-90"><i className="fa-solid fa-check"></i></button>
        <button onClick={onReject} className="text-gray-300 hover:text-rose-600 transition-colors active:scale-90"><i className="fa-solid fa-xmark"></i></button>
      </div>
    </td>
  </tr>
);
