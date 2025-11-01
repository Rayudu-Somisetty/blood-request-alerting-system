import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: 'bi-speedometer2',
      label: 'Dashboard',
      active: location.pathname === '/admin/dashboard'
    },
    {
      path: '/admin/users',
      icon: 'bi-people-fill',
      label: 'Users',
      active: location.pathname === '/admin/users'
    },
    {
      path: '/admin/blood-requests',
      icon: 'bi-exclamation-triangle',
      label: 'Requests',
      active: location.pathname === '/admin/blood-requests'
    },
    {
      path: '/admin/blood-donations',
      icon: 'bi-heart',
      label: 'Donations',
      active: location.pathname === '/admin/blood-donations'
    },
    {
      path: '/admin/blood-drives',
      icon: 'bi-calendar-event',
      label: 'Blood Campaigns',
      active: location.pathname === '/admin/blood-drives'
    }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="sidebar-container h-100">
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="d-flex align-items-center justify-content-between p-3">
            {!collapsed && (
              <div className="d-flex align-items-center">
                <i className="bi bi-heart-pulse-fill text-danger me-2" style={{ fontSize: '1.5rem' }}></i>
                <span className="sidebar-brand fw-bold">Blood Alert</span>
              </div>
            )}
            {collapsed && (
              <div className="text-center w-100">
                <i className="bi bi-heart-pulse-fill text-danger" style={{ fontSize: '1.5rem' }}></i>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav flex-grow-1">
          <ul className="nav nav-pills flex-column p-2">
            {menuItems.map((item) => (
              <li key={item.path} className="nav-item mb-1">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                  }
                  title={collapsed ? item.label : ''}
                >
                  <i className={`bi ${item.icon} me-2`}></i>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer p-3 border-top">
          <div className="d-flex align-items-center justify-content-center">
            {!collapsed && (
              <small className="text-muted">Blood Bank Admin v1.0</small>
            )}
            {collapsed && (
              <i className="bi bi-info-circle text-muted"></i>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
