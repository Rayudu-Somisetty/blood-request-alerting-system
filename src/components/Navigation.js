import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Dropdown, Badge } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import firebaseService from '../firebase/firebaseService';
import BloodRequestNotifications from './BloodRequestNotifications';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotificationCount();
      // Set up real-time updates every 30 seconds
      const interval = setInterval(loadNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const loadNotificationCount = async () => {
    try {
      const result = await firebaseService.getNotifications(user.uid);
      const bloodRequestNotifications = result.data
        .filter(notification => 
          notification.type === 'blood_request' && 
          !notification.read && 
          !notification.responded
        );
      setUnreadCount(bloodRequestNotifications.length);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
    // Mark notifications as read when opened
    setTimeout(loadNotificationCount, 1000);
  };

  return (
    <>
      <Navbar bg="light" expand="lg" sticky="top" className="shadow-sm">
        <Container>
          <span className="fw-bold h4 mb-0" style={{ color: '#dc3545', pointerEvents: 'none', userSelect: 'none' }}>
            Blood Alert
          </span>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/home" active={location.pathname === "/home"}>Home</Nav.Link>
            <Nav.Link as={Link} to="/campaigns" active={location.pathname === "/campaigns"}>Campaigns</Nav.Link>
            <Nav.Link as={Link} to="/donate-blood" active={location.pathname === "/donate-blood"} className="text-danger">Donate Blood</Nav.Link>
            <Nav.Link as={Link} to="/request" active={location.pathname === "/request"} className="text-danger">Request Blood</Nav.Link>
            <Nav.Link as={Link} to="/about" active={location.pathname === "/about" || location.pathname === "/contact"}>About Us</Nav.Link>
            
            {/* Conditional Login/Profile Button */}
            {isAuthenticated ? (
              <>
                {/* Notification Bell for All Users */}
                <Nav.Link
                  onClick={handleNotificationClick}
                  className="position-relative text-danger"
                  style={{ cursor: 'pointer' }}
                >
                  <FaBell size={20} />
                  {unreadCount > 0 && (
                    <Badge 
                      bg="danger" 
                      pill 
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Nav.Link>
                
                <Dropdown align="end">
                  <Dropdown.Toggle 
                    variant="link" 
                    id="profile-dropdown"
                    className="nav-link text-decoration-none p-0 border-0 bg-transparent dropdown-toggle-no-caret"
                    style={{ boxShadow: 'none' }}
                    bsPrefix="btn"
                  >
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person-circle text-primary" style={{ fontSize: '1.5rem' }}></i>
                    </div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">
                      <i className="bi bi-person me-2"></i>My Profile
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleNotificationClick}>
                      <FaBell className="me-2" />
                      Blood Requests
                      {unreadCount > 0 && (
                        <Badge bg="danger" className="ms-2">
                          {unreadCount}
                        </Badge>
                      )}
                    </Dropdown.Item>
                    {user?.isAdmin && (
                      <Dropdown.Item as={Link} to="/admin/dashboard">
                        <i className="bi bi-gear me-2"></i>Admin Panel
                      </Dropdown.Item>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <Nav.Link as={Link} to="/login" active={location.pathname === "/login"} className="text-primary fw-bold">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    
    {/* Blood Request Notifications Modal */}
    {isAuthenticated && (
      <BloodRequestNotifications
        show={showNotifications}
        onHide={() => setShowNotifications(false)}
      />
    )}
  </>
  );
};

export default Navigation;
