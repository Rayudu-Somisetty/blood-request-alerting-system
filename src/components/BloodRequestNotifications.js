import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Badge, Alert, Spinner, Form } from 'react-bootstrap';
import { FaBell, FaTint, FaHeart, FaPhone, FaEnvelope, FaHospital, FaTrash } from 'react-icons/fa';
import firebaseService from '../firebase/firebaseService';
import { useAuth } from '../context/AuthContext';
import './BloodRequestNotifications.css';

const BloodRequestNotifications = ({ show, onHide }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [responding, setResponding] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const { user } = useAuth();

  useEffect(() => {
    if (show && user) {
      loadNotifications();
    }
  }, [show, user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log('🔔 Loading notifications for user:', user.uid);
      console.log('👤 User blood group:', user.bloodGroup);
      
      const result = await firebaseService.getUserNotificationsWithDetails(user.uid);
      console.log('📨 Received notifications result:', result);
      
      // Filter for blood request notifications only
      // Skip donor_accepted notifications as they don't have the required fields for display
      const bloodRequestNotifications = result.data
        .filter(notification => notification.type === 'blood_request')
        .sort((a, b) => {
          // Sort by urgency first (critical > urgent > normal)
          const urgencyOrder = { 'critical': 3, 'urgent': 2, 'normal': 1 };
          const urgencyA = urgencyOrder[a.urgencyLevel] || 1;
          const urgencyB = urgencyOrder[b.urgencyLevel] || 1;
          
          if (urgencyA !== urgencyB) {
            return urgencyB - urgencyA;
          }
          
          // Then sort by date (newest first)
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return dateB - dateA;
        });

      console.log('🩸 Blood request notifications count:', bloodRequestNotifications.length);
      console.log('📋 All notification types:', result.data.map(n => ({ id: n.id, type: n.type, userId: n.userId })));
      setNotifications(bloodRequestNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      showAlert('danger', 'Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleDonorResponse = async (notificationId, requestId, response, message = '') => {
    try {
      setResponding(notificationId);
      
      const result = await firebaseService.respondToBloodRequest(
        requestId,
        user.uid,
        response,
        message
      );

      showAlert('success', result.message);
      
      // Reload notifications to update the UI
      await loadNotifications();
      
    } catch (error) {
      console.error('Error responding to blood request:', error);
      showAlert('danger', error.message || 'Failed to respond. Please try again.');
    } finally {
      setResponding(null);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await firebaseService.deleteNotification(notificationId);
      showAlert('success', 'Notification deleted successfully');
      
      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      showAlert('danger', 'Failed to delete notification. Please try again.');
    }
  };

  const getUrgencyBadge = (urgencyLevel) => {
    const urgencyConfig = {
      'critical': { variant: 'danger', icon: '🚨', text: 'CRITICAL' },
      'urgent': { variant: 'warning', icon: '⚠️', text: 'URGENT' },
      'normal': { variant: 'primary', icon: 'ℹ️', text: 'NORMAL' }
    };
    
    const config = urgencyConfig[urgencyLevel] || urgencyConfig.normal;
    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        <span>{config.icon}</span>
        <span>{config.text}</span>
      </Badge>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getCompatibilityInfo = (donorBloodGroup, recipientBloodGroup) => {
    const isExactMatch = donorBloodGroup === recipientBloodGroup;
    return {
      isExactMatch,
      text: isExactMatch ? 'EXACT MATCH' : 'COMPATIBLE',
      className: isExactMatch ? 'text-success fw-bold' : 'text-info fw-bold'
    };
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title>
          <FaBell className="me-2" />
          Blood Donation Requests
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {alert.show && (
          <Alert variant={alert.type} className="mb-3">
            {alert.message}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="danger" />
            <div className="mt-2">Loading blood requests...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4">
            <FaHeart className="text-muted mb-3" style={{ fontSize: '3rem' }} />
            <h5 className="text-muted">No blood donation requests</h5>
            <p className="text-muted">You'll be notified when someone needs your blood type.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => {
              const compatibility = getCompatibilityInfo(
                notification.donorBloodGroup,
                notification.recipientBloodGroup
              );
              
              const hasResponded = notification.hasResponded;
              const userResponse = notification.userResponse;
              
              return (
                <Card key={notification.id} className="mb-3 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <FaTint className="text-danger" />
                        <span className="fw-bold">Blood Needed: {notification.recipientBloodGroup}</span>
                        <span className={compatibility.className}>({compatibility.text})</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {getUrgencyBadge(notification.urgencyLevel)}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="delete-notification-btn"
                          onClick={() => handleDeleteNotification(notification.id)}
                          title="Delete notification"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <small className="text-muted d-block">Patient:</small>
                        <strong>{notification.patientName}</strong>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block">Units Required:</small>
                        <strong>{notification.unitsRequired} unit(s)</strong>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <small className="text-muted d-flex align-items-center gap-1">
                          <FaHospital />
                          Hospital:
                        </small>
                        <span>{notification.hospitalName}</span>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block">Request Time:</small>
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>

                    {/* Response Status */}
                    {hasResponded ? (
                      <Alert 
                        variant={userResponse.response === 'accepted' ? 'success' : 
                                userResponse.response === 'declined' ? 'secondary' : 'info'}
                        className="mb-3"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <strong>
                            {userResponse.response === 'accepted' && '✅ You accepted this request'}
                            {userResponse.response === 'declined' && '❌ You declined this request'}
                            {userResponse.response === 'maybe' && '❓ You responded "Maybe"'}
                          </strong>
                        </div>
                        {userResponse.message && (
                          <small className="d-block mt-1">
                            Your message: "{userResponse.message}"
                          </small>
                        )}
                        {userResponse.response === 'accepted' && (
                          <small className="d-block mt-1 text-success">
                            Your contact details have been shared with the requester.
                          </small>
                        )}
                      </Alert>
                    ) : (
                      /* Response Buttons */
                      <div className="d-flex gap-2 flex-wrap">
                        <Button
                          variant="success"
                          size="sm"
                          disabled={responding === notification.id}
                          onClick={() => handleDonorResponse(
                            notification.id,
                            notification.bloodRequestId,
                            'accepted',
                            'I am available to donate blood. Please contact me.'
                          )}
                        >
                          {responding === notification.id ? (
                            <Spinner size="sm" className="me-1" />
                          ) : (
                            <FaHeart className="me-1" />
                          )}
                          I Can Donate
                        </Button>
                        
                        <Button
                          variant="outline-warning"
                          size="sm"
                          disabled={responding === notification.id}
                          onClick={() => handleDonorResponse(
                            notification.id,
                            notification.bloodRequestId,
                            'maybe',
                            'I might be available. Please let me know more details.'
                          )}
                        >
                          Maybe
                        </Button>
                        
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          disabled={responding === notification.id}
                          onClick={() => handleDonorResponse(
                            notification.id,
                            notification.bloodRequestId,
                            'declined',
                            'Sorry, I am not available at this time.'
                          )}
                        >
                          Can't Help
                        </Button>
                      </div>
                    )}

                    {/* Additional Info for Critical Cases */}
                    {notification.urgencyLevel === 'critical' && !hasResponded && (
                      <Alert variant="danger" className="mt-3 mb-0">
                        <small>
                          <strong>🚨 CRITICAL:</strong> This is an emergency situation. 
                          Immediate response needed to save a life!
                        </small>
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="outline-danger" onClick={loadNotifications}>
          Refresh
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BloodRequestNotifications;