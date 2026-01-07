import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex h-screen bg-bg font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <AdminTopbar 
          isCollapsed={isCollapsed} 
          title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} 
        />
        
        {/* The active page renders here */}
        <main className="flex-1 overflow-y-auto p-6 mt-16 scrollbar-thin scrollbar-thumb-gray-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;