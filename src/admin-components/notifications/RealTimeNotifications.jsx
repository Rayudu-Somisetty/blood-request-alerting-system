import React, { useState } from 'react';
import useRealTimeNotifications from '../../hooks/useRealTimeNotifications';
import './RealTimeNotifications.css';

const RealTimeNotifications = () => {
  const { 
    notifications, 
    isConnected, 
    markAsRead, 
    clearNotifications, 
    unreadCount 
  } = useRealTimeNotifications();
  
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'donation_request':
        return '📋';
      case 'blood_request':
        return '🩸';
      default:
        return '🔔';
    }
  };

  const getNotificationClass = (notification) => {
    let className = 'notification-item';
    if (!notification.read) className += ' unread';
    if (notification.urgency === 'high') className += ' urgent';
    return className;
  };

  const toggleExpanded = (notificationIndex) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(notificationIndex)) {
      newExpanded.delete(notificationIndex);
    } else {
      newExpanded.add(notificationIndex);
    }
    setExpandedNotifications(newExpanded);
  };

  const formatNotificationDetails = (notification) => {
    const data = notification.data;
    
    if (data.type === 'donation_request') {
      return {
        name: data.donorName || 'Unknown Donor',
        bloodType: data.bloodType || 'Not specified',
        age: data.age || 'Not specified',
        unitsNeeded: 'Donation Offer',
        urgencyLevel: 'Normal',
        phone: data.phone || 'Not provided',
        type: 'donation',
        hospital: data.location || 'Not specified',
        doctor: 'N/A',
        reason: 'Blood Donation',
        timeRequired: data.preferredDate || new Date().toISOString(),
        additionalInfo: {
          email: data.email,
          location: data.location,
          preferredDate: data.preferredDate,
          medicalConditions: data.medicalConditions,
          consentGiven: data.consentGiven
        }
      };
    } else if (data.type === 'blood_request') {
      return {
        name: data.patientName || data.contactPerson || 'Unknown Patient',
        bloodType: data.bloodType || 'Not specified',
        age: data.patientAge || data.age || 'Not specified',
        unitsNeeded: data.unitsNeeded || 'Not specified',
        urgencyLevel: data.urgencyLevel || (notification.urgency === 'high' ? 'critical' : 'medium'),
        phone: data.contactPhone || data.phone || 'Not provided',
        type: 'request',
        hospital: data.hospitalName || 'Not specified',
        doctor: data.contactPerson || 'Not specified',
        reason: data.medicalReason || 'Medical need',
        timeRequired: data.requiredBy || new Date().toISOString(),
        additionalInfo: {
          email: data.email,
          hospitalName: data.hospitalName,
          contactPerson: data.contactPerson,
          requiredBy: data.requiredBy,
          medicalReason: data.medicalReason,
          location: data.location
        }
      };
    }
    
    return {
      name: 'Unknown',
      bloodType: 'Not specified',
      age: 'Not specified',
      unitsNeeded: 'Not specified',
      urgencyLevel: 'medium',
      phone: 'Not provided',
      type: 'unknown',
      hospital: 'Not specified',
      doctor: 'Not specified',
      reason: 'Not specified',
      timeRequired: new Date().toISOString(),
      additionalInfo: {}
    };
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-danger text-white';
      case 'high': return 'bg-warning text-dark';
      case 'medium': return 'bg-info text-white';
      case 'low': return 'bg-success text-white';
      case 'Normal': return 'bg-success text-white';
      default: return 'bg-secondary text-white';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bi-exclamation-triangle-fill';
      case 'high': return 'bi-exclamation-circle-fill';
      case 'medium': return 'bi-info-circle-fill';
      case 'low': return 'bi-check-circle-fill';
      case 'Normal': return 'bi-check-circle-fill';
      default: return 'bi-circle-fill';
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isUrgent = (timeRequired) => {
    const now = new Date();
    const required = new Date(timeRequired);
    const hoursLeft = (required - now) / (1000 * 60 * 60);
    return hoursLeft <= 24;
  };

  const handleAction = (notificationId, action) => {
    console.log(`${action} action for notification:`, notificationId);
    if (action === 'fulfill' || action === 'reject' || action === 'contact') {
      markAsRead(notificationId);
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="h3 text-black fw-bold mb-2">
            🔔 Active Blood Requests & Live Notifications
            {unreadCount > 0 && (
              <span className="badge bg-danger text-white ms-2">{unreadCount}</span>
            )}
          </h2>
          <p className="text-muted">Real-time blood requests and donation offers from your main website</p>
        </div>
        <div className="col-auto">
          <div className="d-flex gap-2 align-items-center">
            <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            {notifications.length > 0 && (
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={clearNotifications}
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="row">
        {notifications.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-bell text-muted" style={{fontSize: '3rem'}}></i>
                <h5 className="text-muted mt-3">No active requests</h5>
                <p className="text-muted">Waiting for new blood requests and donations from your website...</p>
              </div>
            </div>
          </div>
        ) : (
          notifications.map((notification, index) => {
            const details = formatNotificationDetails(notification);
            const isExpanded = expandedNotifications.has(index);
            const { date, time } = formatDateTime(details.timeRequired);
            
            return (
              <div key={index} className="col-12 mb-3">
                <div className={`card border-0 shadow-sm ${
                  isUrgent(details.timeRequired) || notification.urgency === 'high' 
                    ? 'border-start border-danger border-3' 
                    : ''
                } ${!notification.read ? 'bg-light border-primary border-2' : ''}`}>
                  <div className="card-body">
                    <div className="row align-items-center">
                      {/* Patient/Donor Info */}
                      <div className="col-md-3">
                        <div className="d-flex align-items-center">
                          <div className={`p-2 rounded me-3 ${
                            details.type === 'donation' ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'
                          }`}>
                            <i className={`${
                              details.type === 'donation' 
                                ? 'bi bi-heart-fill text-success' 
                                : 'bi bi-person-fill text-danger'
                            }`} style={{fontSize: '1.2rem'}}></i>
                          </div>
                          <div>
                            <h6 className="text-black mb-1 fw-bold">{details.name}</h6>
                            <small className="text-muted">{details.hospital}</small>
                            <div className="small text-muted">
                              <i className="bi bi-person me-1"></i>
                              Age: {details.age}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Blood Type & Units */}
                      <div className="col-md-2">
                        <div className="text-center">
                          <span className="badge bg-danger text-white fs-6 px-3 py-2">
                            {details.bloodType}
                          </span>
                          <div className="small text-muted mt-1">
                            {details.type === 'donation' 
                              ? 'Willing to donate' 
                              : `${details.unitsNeeded} unit${details.unitsNeeded > 1 ? 's' : ''}`
                            }
                          </div>
                        </div>
                      </div>
                      
                      {/* Urgency Level */}
                      <div className="col-md-2">
                        <div className="text-center">
                          <span className={`badge ${getUrgencyColor(details.urgencyLevel)}`}>
                            <i className={`bi ${getUrgencyIcon(details.urgencyLevel)} me-1`}></i>
                            {details.urgencyLevel.toUpperCase()}
                          </span>
                          {(isUrgent(details.timeRequired) || notification.urgency === 'high') && (
                            <div className="small text-danger mt-1 fw-bold">
                              <i className="bi bi-clock-fill me-1"></i>
                              URGENT
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Date & Time */}
                      <div className="col-md-2">
                        <div className="text-center">
                          <div className="text-black fw-semibold">{date}</div>
                          <div className="small text-muted">{time}</div>
                          <div className="small text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {formatTimestamp(notification.timestamp)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="col-md-3">
                        <div className="d-flex gap-2 justify-content-end">
                          {details.type === 'request' && (
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => handleAction(notification.data._id, 'fulfill')}
                            >
                              <i className="bi bi-check-circle me-1"></i>
                              Fulfill
                            </button>
                          )}
                          
                          {details.type === 'donation' && (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAction(notification.data._id, 'contact')}
                            >
                              <i className="bi bi-telephone me-1"></i>
                              Contact
                            </button>
                          )}
                          
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => toggleExpanded(index)}
                          >
                            <i className="bi bi-eye me-1"></i>
                            {isExpanded ? 'Hide' : 'Details'}
                          </button>
                          
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleAction(notification.data._id, 'reject')}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            {details.type === 'donation' ? 'Decline' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-top">
                        <div className="row">
                          <div className="col-md-6">
                            <h6 className="fw-bold text-primary mb-3">
                              <i className="bi bi-info-circle me-2"></i>
                              Contact Information
                            </h6>
                            <div className="mb-2">
                              <strong>Phone:</strong> 
                              <a href={`tel:${details.phone}`} className="text-decoration-none ms-2 btn btn-outline-primary btn-sm">
                                <i className="bi bi-telephone me-1"></i>
                                {details.phone}
                              </a>
                            </div>
                            {details.additionalInfo.email && (
                              <div className="mb-2">
                                <strong>Email:</strong> 
                                <a href={`mailto:${details.additionalInfo.email}`} className="text-decoration-none ms-2 btn btn-outline-primary btn-sm">
                                  <i className="bi bi-envelope me-1"></i>
                                  {details.additionalInfo.email}
                                </a>
                              </div>
                            )}
                            <div className="mb-2">
                              <strong>Doctor/Contact:</strong> <span className="text-muted">{details.doctor}</span>
                            </div>
                          </div>
                          
                          <div className="col-md-6">
                            <h6 className="fw-bold text-primary mb-3">
                              <i className="bi bi-clipboard-data me-2"></i>
                              Additional Details
                            </h6>
                            <div className="mb-2">
                              <strong>Reason:</strong> <span className="text-muted">{details.reason}</span>
                            </div>
                            
                            {details.additionalInfo.location && (
                              <div className="mb-2">
                                <strong>Location:</strong> <span className="text-muted">{details.additionalInfo.location}</span>
                              </div>
                            )}
                            
                            {details.additionalInfo.medicalConditions && (
                              <div className="mb-2">
                                <strong>Medical Conditions:</strong> <span className="text-muted">{details.additionalInfo.medicalConditions}</span>
                              </div>
                            )}
                            
                            {details.additionalInfo.requiredBy && (
                              <div className="mb-2">
                                <strong>Required By:</strong> <span className="text-muted">{new Date(details.additionalInfo.requiredBy).toLocaleString()}</span>
                              </div>
                            )}
                            
                            <div className="small text-muted mt-3">
                              <i className="bi bi-clock me-1"></i>
                              Request received: {formatTimestamp(notification.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RealTimeNotifications;
