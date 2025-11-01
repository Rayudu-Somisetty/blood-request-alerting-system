import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { AdminPermissions } from '../../utils/adminPermissions';
import { useNotifications } from '../../hooks/useNotifications';

const Header = ({ onToggleSidebar, onToggleMobileSidebar, sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { unreadCount } = useNotifications();

  const handleNotificationsClick = () => {
    navigate('/admin/notifications');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  return (
    <header className="main-header d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center">
        {/* Mobile Menu Toggle */}
        <div className="d-md-none d-flex flex-column align-items-center">
          <button
            className="btn btn-link text-red p-1 text-decoration-none"
            onClick={onToggleMobileSidebar}
            style={{ fontSize: '1.2rem', fontWeight: 'bold', lineHeight: '1' }}
          >
            ≡
          </button>
          <small className="text-muted" style={{ fontSize: '10px', marginTop: '-2px' }}>
            Menu
          </small>
        </div>

        {/* Desktop Sidebar Toggle */}
        <button
          className="btn btn-link d-none d-md-block text-red p-2 text-decoration-none"
          onClick={onToggleSidebar}
          style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
        >
          {sidebarCollapsed ? '≡' : '×'}
        </button>

        {/* Brand */}
        <div className="header-brand ms-2">
          <i className="bi bi-heart-pulse-fill me-2"></i>
          Blood Alert
        </div>
      </div>

      {/* Right Side */}
      <div className="d-flex align-items-center gap-3">
        {/* Notifications */}
        <div className="position-relative">
          <button 
            className="btn btn-link text-dark p-2"
            onClick={handleNotificationsClick}
            title={`View Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <i className="bi bi-bell fs-5"></i>
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {unreadCount >= 10 ? unreadCount : ''}
                <span className="visually-hidden">{unreadCount} unread notifications</span>
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="d-none d-lg-block">
          <div className="input-group" style={{ width: '300px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search users, donations..."
            />
            <button className="btn btn-outline-secondary" type="button">
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>

        {/* User Profile Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-link text-decoration-none p-0"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className="header-user">
              <div className="user-avatar">
                {getInitials(user?.name || user?.firstName + ' ' + user?.lastName)}
              </div>
              <div className="d-none d-md-block text-start">
                <div className="fw-semibold text-dark">
                  {user?.name || `${user?.firstName} ${user?.lastName}` || 'Admin'}
                </div>
                <small className="text-muted">
                  {user?.role || 'Administrator'}
                </small>
              </div>
              <i className="bi bi-chevron-down text-muted ms-2"></i>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <div className="dropdown-menu dropdown-menu-end show position-absolute" style={{ right: 0, top: '100%' }}>
              <div className="dropdown-header">
                <div className="fw-bold">{user?.name || `${user?.firstName} ${user?.lastName}` || 'Admin'}</div>
                <small className="text-muted">{user?.email || 'admin@gimsr.edu.in'}</small>
                <small className={`badge ${AdminPermissions.getAdminTypeBadgeClass(user)} mt-1`}>
                  {AdminPermissions.getAdminTypeDisplay(user)}
                </small>
              </div>
              <div className="dropdown-divider"></div>
              
              <button 
                className="dropdown-item"
                onClick={() => navigate('/admin/profile-settings')}
              >
                <i className="bi bi-person me-2 text-red"></i>
                Profile Settings
              </button>
              
              <button 
                className="dropdown-item"
                onClick={() => navigate('/admin/account-settings')}
              >
                <i className="bi bi-gear me-2 text-red"></i>
                Account Settings
              </button>
              
              <button className="dropdown-item">
                <i className="bi bi-question-circle me-2 text-red"></i>
                Help & Support
              </button>
              
              <div className="dropdown-divider"></div>
              
              <button className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;