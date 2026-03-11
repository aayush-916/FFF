import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AdminLayout = () => {
  // Desktop Sidebar State (expanded by default)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Mobile Sidebar Drawer State (hidden by default)
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans selection:bg-indigo-100">
      
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={sidebarOpen} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />
      
      {/* Main App Area */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        
        {/* Top Navbar */}
        <Navbar 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          toggleMobile={() => setMobileOpen(true)} 
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          <div className="absolute inset-0">
            <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default AdminLayout;