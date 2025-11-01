import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();

  // Get first name from full name
  const getFirstName = (user) => {
    if (user?.firstName) return user.firstName;
    if (user?.name) return user.name.split(' ')[0];
    return 'User';
  };

  const getFullName = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.name) {
      return user.name;
    }
    return 'Not provided';
  };

  const calculateAge = (birthYear) => {
    if (!birthYear) return 'Not provided';
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(birthYear);
    return age > 0 ? `${age} years` : 'Not provided';
  };

  const formatValue = (value, unit = '') => {
    if (!value || value === '' || value === 0) return 'Not provided';
    return unit ? `${value} ${unit}` : value;
  };

  return (
    <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">
                  <i className="bi bi-person-circle me-2"></i>
                  User Dashboard
                </h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <h5>Welcome, {getFirstName(user)}!</h5>
                    <div className="row mt-3">
                      <div className="col-md-6">
                        <p className="mb-2">
                          <strong>Name:</strong> {getFullName(user)}
                        </p>
                        <p className="mb-2">
                          <strong>Blood Group:</strong> 
                          <span className="badge bg-danger ms-2">{formatValue(user?.bloodGroup)}</span>
                        </p>
                        <p className="mb-2">
                          <strong>Age:</strong> {calculateAge(user?.birthYear)}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-2">
                          <strong>Weight:</strong> {formatValue(user?.weight, 'kg')}
                        </p>
                        <p className="mb-2">
                          <strong>Last Donation:</strong> {formatValue(user?.lastDonation)}
                        </p>
                        <p className="mb-2">
                          <strong>Email:</strong> {formatValue(user?.email)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => {
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        window.location.href = '/';
                      }}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </div>
                </div>
                
                <hr />
                
                <div className="row justify-content-center">
                  <div className="col-md-4">
                    <div className="card bg-light">
                      <div className="card-body text-center">
                        <i className="bi bi-heart-fill text-danger" style={{fontSize: '2rem'}}></i>
                        <h6 className="mt-2">Donate Blood</h6>
                        <p className="text-muted">View & respond to blood requests</p>
                        <Link to="/donate-blood" className="btn btn-outline-danger btn-sm">View Requests</Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="card bg-light">
                      <div className="card-body text-center">
                        <i className="bi bi-bell-fill text-warning" style={{fontSize: '2rem'}}></i>
                        <h6 className="mt-2">My Notifications</h6>
                        <p className="text-muted">View blood request alerts</p>
                        <button className="btn btn-outline-warning btn-sm">View Notifications</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="card bg-light">
                      <div className="card-body text-center">
                        <i className="bi bi-person-gear text-info" style={{fontSize: '2rem'}}></i>
                        <h6 className="mt-2">Profile Settings</h6>
                        <p className="text-muted">Update your information</p>
                        <Link to="/profile" className="btn btn-outline-info btn-sm">View Profile</Link>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h6>Quick Actions</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    <Link to="/donate-blood" className="btn btn-danger">
                      <i className="bi bi-heart-pulse me-2"></i>
                      Donate Blood
                    </Link>
                    <Link to="/request" className="btn btn-warning">
                      <i className="bi bi-heart-pulse-fill me-2"></i>
                      Request Blood
                    </Link>
                    <Link to="/campaigns" className="btn btn-info">
                      <i className="bi bi-megaphone me-2"></i>
                      Join Campaign
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default UserDashboard;
