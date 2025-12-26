
import React from 'react';

interface SidebarProps {
  activeTab: 'admin' | 'mobile';
  onTabChange: (tab: 'admin' | 'mobile') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="w-64 bg-indigo-950 text-white flex flex-col shadow-2xl relative z-50">
      <div className="p-8 flex items-center space-x-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <i className="fa-solid fa-wallet text-indigo-950 text-2xl"></i>
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter">KlasWallet</h1>
          <div className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Secure Cloud</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-8 space-y-3">
        <button
          onClick={() => onTabChange('admin')}
          className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${
            activeTab === 'admin' 
            ? 'bg-indigo-800 text-white shadow-lg shadow-black/20 translate-x-1' 
            : 'text-indigo-300/60 hover:text-indigo-100 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center space-x-4">
            <i className={`fa-solid fa-gauge-high transition-transform ${activeTab === 'admin' ? 'scale-110' : ''}`}></i>
            <span className="text-xs font-black uppercase tracking-widest">Admin Portal</span>
          </div>
          {activeTab === 'admin' && <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>}
        </button>
        
        <button
          onClick={() => onTabChange('mobile')}
          className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${
            activeTab === 'mobile' 
            ? 'bg-indigo-800 text-white shadow-lg shadow-black/20 translate-x-1' 
            : 'text-indigo-300/60 hover:text-indigo-100 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center space-x-4">
            <i className={`fa-solid fa-mobile-screen-button transition-transform ${activeTab === 'mobile' ? 'scale-110' : ''}`}></i>
            <span className="text-xs font-black uppercase tracking-widest">App Preview</span>
          </div>
          {activeTab === 'mobile' && <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>}
        </button>
      </nav>
      
      <div className="p-8 border-t border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">System Health</span>
          <span className="text-[10px] font-black text-emerald-500">99.9%</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="w-[99.9%] h-full bg-emerald-500 rounded-full"></div>
        </div>
        <div className="mt-8 text-[9px] font-bold text-indigo-300/30 uppercase tracking-tighter">
          <p>© 2024 KlasWallet Inc.</p>
          <p className="mt-1 flex items-center">
            <i className="fa-solid fa-code-branch mr-1.5"></i>
            Production v1.0.4-LTS
          </p>
        </div>
      </div>
    </div>
  );
};
