import React, { useState, useEffect } from 'react';
import firebaseService from '../firebase/firebaseService';
import { Modal, Button, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';

const BloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    critical: 0,
    fulfilled: 0
  });
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    fetchRequestsData();
  }, []);

  const fetchRequestsData = async () => {
    try {
      setLoading(true);
      const requestsResult = await firebaseService.getBloodRequests();
      console.log('Blood requests from Firebase:', requestsResult);
      
      if (requestsResult && requestsResult.data && requestsResult.data.length > 0) {
        // Map the data to match component expectations
        const formattedRequests = requestsResult.data.map(request => ({
          id: request.id,
          patientName: request.patientName || 'Patient',
          bloodGroup: request.bloodGroup || 'Unknown',
          unitsRequired: request.unitsRequired || 1,
          urgency: request.urgencyLevel === 'critical' ? 'critical' : 
                  request.urgencyLevel === 'urgent' ? 'high' : 'medium',
          hospitalName: request.hospitalName || 'Hospital',
          contactPerson: request.contactPerson || 'Medical Team',
          contactPhone: request.contactPhone || 'N/A',
          contactEmail: request.contactEmail || 'N/A',
          requiredDate: request.requiredDate,
          timeRequired: request.timeRequired,
          medicalReason: request.medicalReason || 'Medical procedure',
          additionalNotes: request.additionalNotes || '',
          status: request.status || 'active',
          fulfilled: request.fulfilled || false,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
          hospital: request.hospitalName || 'Hospital',
          doctor: request.contactPerson || 'Medical Team',
          reason: request.medicalReason || 'Medical procedure'
        }));
        
        setRequests(formattedRequests);
        
        // Calculate stats
        const statsData = {
          total: formattedRequests.length,
          active: formattedRequests.filter(req => req.status === 'active').length,
          critical: formattedRequests.filter(req => req.urgency === 'critical' && req.status === 'active').length,
          fulfilled: formattedRequests.filter(req => req.status === 'completed' || req.fulfilled).length
        };
        setStats(statsData);
      } else {
        console.log('No blood requests found or invalid response:', requestsResult);
        setRequests([]);
        setStats({ total: 0, active: 0, critical: 0, fulfilled: 0 });
      }
      
    } catch (error) {
      console.error('Error fetching requests data:', error);
      setRequests([]);
      setStats({ total: 0, active: 0, critical: 0, fulfilled: 0 });
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-danger text-white';
      case 'high': return 'bg-warning text-dark';
      case 'medium': return 'bg-info text-white';
      case 'low': return 'bg-success text-white';
      default: return 'bg-secondary text-white';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bi-exclamation-triangle-fill';
      case 'high': return 'bi-exclamation-circle-fill';
      case 'medium': return 'bi-info-circle-fill';
      case 'low': return 'bi-check-circle-fill';
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

  // Handle view details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // Handle status change
  const handleStatusChange = (request) => {
    setSelectedRequest(request);
    setNewStatus(request.status || 'active');
    setStatusNotes('');
    setShowStatusModal(true);
  };

  // Update request status
  const handleUpdateStatus = async () => {
    try {
      const updateData = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...(statusNotes && { statusNotes: statusNotes })
      };

      await firebaseService.updateBloodRequest(selectedRequest.id, updateData);
      toast.success('Request status updated successfully');
      setShowStatusModal(false);
      fetchRequestsData(); // Refresh data
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    }
  };

  // Fulfill request
  const handleFulfillRequest = async (requestId) => {
    try {
      await firebaseService.updateBloodRequest(requestId, {
        status: 'completed',
        fulfilled: true,
        fulfilledAt: new Date().toISOString()
      });
      toast.success('Request marked as fulfilled');
      fetchRequestsData();
    } catch (error) {
      console.error('Error fulfilling request:', error);
      toast.error('Failed to fulfill request');
    }
  };

  // Reject request
  const handleRejectRequest = async (request) => {
    if (window.confirm(`Are you sure you want to reject this blood request for ${request.patientName}?`)) {
      try {
        await firebaseService.updateBloodRequest(request.id, {
          status: 'rejected',
          rejectedAt: new Date().toISOString()
        });
        toast.success('Request rejected successfully');
        fetchRequestsData();
      } catch (error) {
        console.error('Error rejecting request:', error);
        toast.error('Failed to reject request');
      }
    }
  };

  // Delete old requests (1 week old)
  const deleteOldRequests = async () => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const oldRequests = requests.filter(request => {
        const createdDate = new Date(request.createdAt);
        return createdDate < oneWeekAgo && (request.status === 'completed' || request.status === 'rejected');
      });

      for (const request of oldRequests) {
        await firebaseService.deleteBloodRequest(request.id);
      }

      if (oldRequests.length > 0) {
        toast.success(`Deleted ${oldRequests.length} old request(s)`);
        fetchRequestsData();
      }
    } catch (error) {
      console.error('Error deleting old requests:', error);
      toast.error('Failed to delete old requests');
    }
  };

  // Check for old requests on component mount
  useEffect(() => {
    if (!loading && requests.length > 0) {
      deleteOldRequests();
    }
  }, [loading]);

  const handleAction = (requestId, action) => {
    setRequests(requests.map(req => 
      req.id === requestId 
        ? { ...req, status: action }
        : req
    ));
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
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="h3 text-black fw-bold mb-2">Blood Requests Management</h2>
          <p className="text-muted">Manage and fulfill blood donation requests</p>
        </div>
        <div className="col-auto">
          <div className="d-flex gap-2">
            <select className="form-select">
              <option>All Urgency Levels</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className="form-select">
              <option>All Blood Groups</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-blue-100 p-3 rounded">
                    <i className="bi bi-list-ul text-blue-600 fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Requests</h6>
                  <h3 className="text-black mb-0">{stats.total}</h3>
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
                  <h6 className="text-muted mb-1">Active Requests</h6>
                  <h3 className="text-black mb-0">{stats.active}</h3>
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
                  <h6 className="text-muted mb-1">Critical Requests</h6>
                  <h3 className="text-black mb-0">{stats.critical}</h3>
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
                  <div className="bg-green-100 p-3 rounded">
                    <i className="bi bi-check-circle-fill text-green-600 fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Fulfilled</h6>
                  <h3 className="text-black mb-0">{stats.fulfilled}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="row">
        {requests.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-clipboard-heart text-muted" style={{fontSize: '3rem'}}></i>
                <h5 className="text-muted mt-3">No blood requests found</h5>
                <p className="text-muted">Blood requests from your website will appear here when submitted</p>
                <button className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create New Request
                </button>
              </div>
            </div>
          </div>
        ) : (
          requests.map((request) => {
            const { date, time } = formatDateTime(request.timeRequired);
            return (
              <div key={request.id} className="col-12 mb-3">
                <div className={`card border-0 shadow-sm ${isUrgent(request.timeRequired) ? 'border-start border-danger border-3' : ''}`}>
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-red-100 p-2 rounded me-3">
                            <i className="bi bi-person-fill text-red-600"></i>
                          </div>
                          <div>
                            <h6 className="text-black mb-1 fw-bold">{request.patientName}</h6>
                            <small className="text-muted">{request.hospital}</small>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-2">
                        <div className="text-center">
                          <span className="badge bg-red-100 text-red-800 fs-6">
                            {request.bloodGroup}
                          </span>
                          <div className="small text-muted mt-1">
                            {request.unitsRequired} unit{request.unitsRequired > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-2">
                        <div className="text-center">
                          <span className={`badge ${getUrgencyColor(request.urgency)}`}>
                            <i className={`bi ${getUrgencyIcon(request.urgency)} me-1`}></i>
                            {request.urgency.toUpperCase()}
                          </span>
                          {isUrgent(request.timeRequired) && (
                            <div className="small text-danger mt-1 fw-bold">
                              <i className="bi bi-clock-fill me-1"></i>
                              URGENT
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-md-2">
                        <div className="text-center">
                          <div className="text-black fw-semibold">{date}</div>
                          <div className="small text-muted">{time}</div>
                        </div>
                      </div>
                      
                      <div className="col-md-3">
                        <div className="d-flex gap-2 justify-content-end flex-wrap">
                          {request.status === 'active' && (
                            <>
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => handleFulfillRequest(request.id)}
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Fulfill
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRejectRequest(request)}
                              >
                                <i className="bi bi-x-circle me-1"></i>
                                Reject
                              </button>
                            </>
                          )}
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleViewDetails(request)}
                          >
                            <i className="bi bi-eye me-1"></i>
                            Details
                          </button>
                          <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleStatusChange(request)}
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Status
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {request.status !== 'pending' && (
                      <div className="row mt-2">
                        <div className="col-12">
                          <div className={`alert ${request.status === 'fulfilled' ? 'alert-success' : 'alert-danger'} mb-0 py-2`}>
                            <small>
                              <i className={`bi ${request.status === 'fulfilled' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`}></i>
                              This request has been {request.status}
                            </small>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Modal */}
                <div className="modal fade" id={`detailsModal${request.id}`} tabIndex="-1">
                  <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Request Details - {request.patientName}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                      </div>
                      <div className="modal-body">
                        <div className="row">
                          <div className="col-md-6">
                            <h6 className="text-black">Patient Information</h6>
                            <table className="table table-borderless">
                              <tbody>
                                <tr>
                                  <td className="text-muted">Name:</td>
                                  <td className="text-black fw-semibold">{request.patientName}</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Blood Group:</td>
                                  <td><span className="badge bg-red-100 text-red-800">{request.bloodGroup}</span></td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Units Required:</td>
                                  <td className="text-black">{request.unitsRequired}</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Urgency:</td>
                                  <td><span className={`badge ${getUrgencyColor(request.urgency)}`}>{request.urgency.toUpperCase()}</span></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="col-md-6">
                            <h6 className="text-black">Medical Information</h6>
                            <table className="table table-borderless">
                              <tbody>
                                <tr>
                                  <td className="text-muted">Hospital:</td>
                                  <td className="text-black">{request.hospital}</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Doctor:</td>
                                  <td className="text-black">{request.doctor}</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Reason:</td>
                                  <td className="text-black">{request.reason}</td>
                                </tr>
                                <tr>
                                  <td className="text-muted">Required Time:</td>
                                  <td className="text-black">{date} at {time}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-success" onClick={() => handleAction(request.id, 'fulfilled')}>
                          Fulfill Request
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Statistics */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0 text-black">Request Summary</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <h3 className="text-danger mb-1">{requests.filter(req => req.urgency === 'critical').length}</h3>
                  <small className="text-muted">Critical</small>
                </div>
                <div className="col-md-3">
                  <h3 className="text-warning mb-1">{requests.filter(req => req.urgency === 'high').length}</h3>
                  <small className="text-muted">High Priority</small>
                </div>
                <div className="col-md-3">
                  <h3 className="text-info mb-1">{requests.filter(req => req.urgency === 'medium').length}</h3>
                  <small className="text-muted">Medium Priority</small>
                </div>
                <div className="col-md-3">
                  <h3 className="text-success mb-1">{requests.filter(req => req.urgency === 'low').length}</h3>
                  <small className="text-muted">Low Priority</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Blood Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Patient Name</h6>
                <p className="mb-0 fw-semibold">{selectedRequest.patientName}</p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Blood Group</h6>
                <p className="mb-0">
                  <Badge bg="danger" className="fs-6">{selectedRequest.bloodGroup}</Badge>
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Units Required</h6>
                <p className="mb-0 fw-semibold">{selectedRequest.unitsRequired} units</p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Urgency Level</h6>
                <p className="mb-0">
                  <Badge className={getUrgencyColor(selectedRequest.urgency)}>
                    <i className={`bi ${getUrgencyIcon(selectedRequest.urgency)} me-1`}></i>
                    {selectedRequest.urgency.toUpperCase()}
                  </Badge>
                </p>
              </div>
              <div className="col-md-12 mb-3">
                <h6 className="text-muted mb-1">Hospital</h6>
                <p className="mb-0 fw-semibold">{selectedRequest.hospitalName || selectedRequest.hospital}</p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Contact Person</h6>
                <p className="mb-0">{selectedRequest.contactPerson || selectedRequest.doctor}</p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Contact Phone</h6>
                <p className="mb-0">
                  <i className="bi bi-telephone me-2"></i>
                  {selectedRequest.contactPhone}
                </p>
              </div>
              <div className="col-md-12 mb-3">
                <h6 className="text-muted mb-1">Medical Reason</h6>
                <p className="mb-0">{selectedRequest.medicalReason || selectedRequest.reason}</p>
              </div>
              {selectedRequest.additionalNotes && (
                <div className="col-md-12 mb-3">
                  <h6 className="text-muted mb-1">Additional Notes</h6>
                  <p className="mb-0">{selectedRequest.additionalNotes}</p>
                </div>
              )}
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Status</h6>
                <p className="mb-0">
                  <Badge bg={selectedRequest.status === 'completed' ? 'success' : 
                            selectedRequest.status === 'cancelled' ? 'danger' : 'primary'}>
                    {selectedRequest.status.toUpperCase()}
                  </Badge>
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Created At</h6>
                <p className="mb-0">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Request Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <div className="mb-3">
                <p className="mb-2">
                  <strong>Patient:</strong> {selectedRequest.patientName}
                </p>
                <p className="mb-0">
                  <strong>Blood Group:</strong> <Badge bg="danger">{selectedRequest.bloodGroup}</Badge>
                </p>
              </div>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>New Status <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Add notes about this status change..."
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateStatus}>
            <i className="bi bi-save me-2"></i>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BloodRequests;
