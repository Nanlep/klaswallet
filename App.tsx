
import React, { useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { MobilePreview } from './components/MobilePreview';
import { Sidebar } from './components/Sidebar';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'admin' | 'mobile'>('admin');

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div className="flex justify-center">
              <MobilePreview />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
