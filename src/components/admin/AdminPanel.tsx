import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import AdminOrders from './AdminOrders';
import AdminDashboard from './AdminDashboard';
import AdminMenuManagement from './AdminMenuManagement';

const tabs = ['Dashboard', 'Orders', 'Menu'] as const;
type Tab = typeof tabs[number];

const AdminPanel = () => {
  const { dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="font-heading text-lg text-foreground">Admin Panel</h1>
          <button
            onClick={() => dispatch({ type: 'SET_ADMIN', isAdmin: false })}
            className="text-muted-foreground font-body text-sm hover:text-primary transition-colors"
          >
            ← Exit Admin
          </button>
        </div>
        {/* Tabs */}
        <div className="max-w-5xl mx-auto flex gap-1 mt-3">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-body text-sm font-medium transition-colors ${activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'Dashboard' && <AdminDashboard />}
        {activeTab === 'Orders' && <AdminOrders />}
        {activeTab === 'Menu' && <AdminMenuManagement />}
      </div>
    </div>
  );
};

export default AdminPanel;
