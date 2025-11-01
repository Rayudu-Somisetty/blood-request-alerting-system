import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleSidebarMobile = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="position-relative">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarVisible ? 'show' : ''}`}>
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={toggleSidebar}
        />
      </div>

      {/* Main Content */}
      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Header */}
        <Header 
          onToggleSidebar={toggleSidebar}
          onToggleMobileSidebar={toggleSidebarMobile}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        {/* Page Content */}
        <main className="flex-grow-1" style={{ paddingBottom: '80px' }}>
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {sidebarVisible && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 999 }}
          onClick={toggleSidebarMobile}
        ></div>
      )}
    </div>
  );
};

export default Layout;