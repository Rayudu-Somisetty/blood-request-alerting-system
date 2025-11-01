import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import RealTimeNotifications from '../admin-components/notifications/RealTimeNotifications';
import firebaseService from '../firebase/firebaseService';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    pendingRequests: 0,
    emergencyRequests: 0,
    emergencyDetails: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch basic stats
      const statsResult = await firebaseService.getStats();
      const statsData = statsResult.data;
      
      // Fetch blood requests to get detailed emergency info
      const requestsResult = await firebaseService.getBloodRequests();
      const allRequests = requestsResult || [];
      
      // Filter emergency and pending requests
      const emergencyRequests = allRequests.filter(request => 
        request.urgency === 'urgent' && request.status === 'active'
      );
      const pendingRequests = allRequests.filter(request => 
        request.status === 'active' || request.status === 'pending'
      );
      
      // Fetch recent donations and users for activity
      const [donationsResult, usersResult] = await Promise.all([
        firebaseService.getDonations(),
        firebaseService.getUsers()
      ]);
      
      // Generate recent activity from recent donations and user registrations
      const recentActivity = [];
      
      // Add recent donations
      if (donationsResult && donationsResult.length > 0) {
        donationsResult
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .forEach(donation => {
            recentActivity.push({
              id: `donation_${donation.id}`,
              type: 'donation',
              user: `New blood donation scheduled`,
              time: new Date(donation.createdAt).toLocaleDateString()
            });
          });
      }
      
      // Add recent user registrations
      if (usersResult && usersResult.length > 0) {
        usersResult
          .filter(user => user.role !== 'admin') // Only regular users
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2)
          .forEach(user => {
            recentActivity.push({
              id: `user_${user.id}`,
              type: 'user_registration',
              user: `${user.firstName || user.name || 'New user'} registered as donor`,
              time: new Date(user.createdAt).toLocaleDateString()
            });
          });
      }
      
      // Add emergency requests to activity
      emergencyRequests.slice(0, 2).forEach(request => {
        recentActivity.push({
          id: `emergency_${request.id}`,
          type: 'emergency_request',
          user: `Emergency request for ${request.patientName} - ${request.bloodGroup}`,
          time: new Date(request.createdAt).toLocaleDateString(),
          urgency: request.urgency
        });
      });
      
      // Sort all activities by date
      recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
      
      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalDonations: statsData.completedDonations || 0,
        pendingRequests: pendingRequests.length,
        emergencyRequests: emergencyRequests.length,
        emergencyDetails: emergencyRequests.map(request => ({
          id: request.id,
          patientName: request.patientName || 'Patient',
          bloodGroup: request.bloodGroup,
          unitsNeeded: request.unitsRequired || 1,
          urgency: request.urgency === 'urgent' ? 'Critical' : 'High',
          timeRemaining: calculateTimeRemaining(request.requiredDate),
          hospital: request.hospitalName || 'Hospital',
          requestedBy: request.contactPerson || 'Medical Team'
        })),
        recentActivity: recentActivity.slice(0, 5)
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalUsers: 0,
        totalDonations: 0,
        pendingRequests: 0,
        emergencyRequests: 0,
        emergencyDetails: [],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeRemaining = (requiredDate) => {
    if (!requiredDate) return 'Unknown';
    
    try {
      const required = new Date(requiredDate);
      const now = new Date();
      const diff = required - now;
      
      if (diff < 0) return 'Overdue';
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days} day(s)`;
      if (hours > 0) return `${hours} hour(s)`;
      
      return 'Less than 1 hour';
    } catch {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Welcome Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="h3 text-black fw-bold mb-2">
            Welcome back, {user?.firstName || 'Admin'}! 👋
          </h2>
          <p className="text-muted">Here's an overview of your admin portal</p>
        </div>
      </div>

      {/* Real-time Notifications */}
      <div className="row mb-4">
        <div className="col">
          <RealTimeNotifications />
        </div>
      </div>

      {/* Key Statistics Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-blue-100 p-3 rounded">
                    <i className="bi bi-people-fill text-blue-600 fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Registered Users</h6>
                  <h3 className="text-black mb-0">{stats.totalUsers.toLocaleString()}</h3>
                  <small className="text-muted">
                    <i className="bi bi-info-circle"></i> Real-time data
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-orange-100 p-3 rounded">
                    <i className="bi bi-heart-fill text-orange-600 fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Donations</h6>
                  <h3 className="text-black mb-0">{stats.totalDonations.toLocaleString()}</h3>
                  <small className="text-muted">
                    <i className="bi bi-info-circle"></i> Real-time data
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-yellow-100 p-3 rounded">
                    <i className="bi bi-clock-fill text-yellow-600 fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Pending Requests</h6>
                  <h3 className="text-black mb-0">{stats.pendingRequests}</h3>
                  <small className="text-muted">
                    <i className="bi bi-info-circle"></i> Current status
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-red-100 p-3 rounded">
                    <i className="bi bi-exclamation-triangle-fill text-red-600 fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Emergency Requests</h6>
                  <h3 className="text-black mb-0">{stats.emergencyRequests}</h3>
                  <small className="text-muted">
                    <i className="bi bi-info-circle"></i> Current status
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Requests Alert */}
      {stats.emergencyRequests > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger border-0 shadow-sm" role="alert">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="alert-heading mb-1">Emergency Blood Requests Active!</h6>
                  <p className="mb-2">
                    There are <strong>{stats.emergencyRequests} urgent blood requests</strong> that require immediate attention.
                  </p>
                  <div className="d-flex gap-2">
                    <button className="btn btn-danger btn-sm">
                      <i className="bi bi-eye me-1"></i>
                      View Emergency Requests
                    </button>
                    <button className="btn btn-outline-danger btn-sm">
                      <i className="bi bi-telephone me-1"></i>
                      Alert Blood Banks
                    </button>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Requests Details */}
      {stats.emergencyRequests > 0 && stats.emergencyDetails && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-danger text-white">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <h5 className="mb-0 fw-bold">Active Emergency Blood Requests</h5>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 fw-bold">Patient</th>
                        <th className="border-0 fw-bold">Blood Group</th>
                        <th className="border-0 fw-bold">Units Needed</th>
                        <th className="border-0 fw-bold">Urgency</th>
                        <th className="border-0 fw-bold">Time Remaining</th>
                        <th className="border-0 fw-bold">Hospital</th>
                        <th className="border-0 fw-bold">Requested By</th>
                        <th className="border-0 fw-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.emergencyDetails.map((request) => (
                        <tr key={request.id}>
                          <td className="fw-bold text-dark">{request.patientName}</td>
                          <td>
                            <span className="badge bg-primary text-white px-2 py-1">
                              {request.bloodGroup}
                            </span>
                          </td>
                          <td className="fw-bold">{request.unitsNeeded} units</td>
                          <td>
                            <span className={`badge px-2 py-1 ${
                              request.urgency === 'Critical' 
                                ? 'bg-danger text-white' 
                                : 'bg-warning text-dark'
                            }`}>
                              {request.urgency}
                            </span>
                          </td>
                          <td className="text-danger fw-bold">{request.timeRemaining}</td>
                          <td className="text-muted">{request.hospital}</td>
                          <td className="text-muted">{request.requestedBy}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <button className="btn btn-success btn-sm">
                                <i className="bi bi-check-circle me-1"></i>
                                Fulfill
                              </button>
                              <button className="btn btn-outline-primary btn-sm">
                                <i className="bi bi-eye me-1"></i>
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="row">
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom-0 pb-0">
              <h5 className="card-title text-black fw-bold mb-0">Recent Activity</h5>
            </div>
            <div className="card-body">
              {stats.recentActivity.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-clock-history text-muted" style={{fontSize: '2rem'}}></i>
                  <h6 className="text-muted mt-2">No recent activity</h6>
                  <p className="text-muted small">Recent system activities will appear here</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="list-group-item px-0 py-3 border-0 border-bottom">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <div className={`p-2 rounded ${
                            activity.type === 'user_registration' ? 'bg-blue-100' :
                            activity.type === 'donation' ? 'bg-red-100' :
                            activity.type === 'user_update' ? 'bg-yellow-100' :
                            activity.type === 'emergency_request' ? 'bg-red-100' :
                            'bg-green-100'
                          }`}>
                            <i className={`${
                              activity.type === 'user_registration' ? 'bi bi-person-plus text-blue-600' :
                              activity.type === 'donation' ? 'bi bi-heart text-red-600' :
                              activity.type === 'user_update' ? 'bi bi-pencil text-yellow-600' :
                              activity.type === 'emergency_request' ? 'bi bi-exclamation-triangle-fill text-red-600' :
                              'bi bi-clipboard-check text-green-600'
                            } fs-6`}></i>
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h6 className={`mb-1 ${activity.type === 'emergency_request' ? 'text-red-600 fw-bold' : 'text-black'}`}>
                            {activity.type === 'user_registration' && 'New User Registration'}
                            {activity.type === 'donation' && 'New Donation'}
                            {activity.type === 'user_update' && 'User Profile Updated'}
                            {activity.type === 'donation_request' && 'Donation Request'}
                            {activity.type === 'emergency_request' && (
                              <span>
                                <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                Emergency Blood Request
                                {activity.urgency === 'critical' && (
                                  <span className="badge bg-danger text-white ms-2 small">CRITICAL</span>
                                )}
                                {activity.urgency === 'high' && (
                                  <span className="badge bg-warning text-dark ms-2 small">HIGH</span>
                                )}
                              </span>
                            )}
                          </h6>
                          <p className="mb-1 text-muted">{activity.user}</p>
                          <small className={activity.type === 'emergency_request' ? 'text-red-600 fw-bold' : 'text-muted'}>
                            {activity.time}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom-0 pb-0">
              <h5 className="card-title text-black fw-bold mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-red">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Emergency Request
                </button>
                <button className="btn btn-outline-red">
                  <i className="bi bi-person-plus me-2"></i>
                  Add New User
                </button>
                <button className="btn btn-outline-red">
                  <i className="bi bi-heart me-2"></i>
                  Record Donation
                </button>
                <button className="btn btn-outline-red">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;