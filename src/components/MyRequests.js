import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Spinner, Table, Button, Modal } from 'react-bootstrap';
import { FaTint, FaHospital, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import firebaseService from '../firebase/firebaseService';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';
import Footer from './Footer';
import './RequestBlood.css'; // Reuse existing styles

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDonorModal, setShowDonorModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadMyRequests();
      // Refresh every 30 seconds to check for new donor responses
      const interval = setInterval(loadMyRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadMyRequests = async () => {
    try {
      setLoading(true);
      const result = await firebaseService.getBloodRequests();
      
      if (result && result.data) {
        // Filter requests made by current user
        const myRequests = result.data.filter(req => req.requesterId === user?.uid);
        
        // Sort by creation date (newest first)
        myRequests.sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
          const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
          return bDate - aDate;
        });
        
        setRequests(myRequests);
      }
    } catch (error) {
      console.error('Error loading my requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getUrgencyColor = (urgencyLevel) => {
    switch (urgencyLevel) {
      case 'critical':
        return 'danger';
      case 'urgent':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getAcceptedDonors = (request) => {
    return (request.donorResponses || []).filter(response => response.response === 'accepted');
  };

  const getAllResponses = (request) => {
    return request.donorResponses || [];
  };

  const handleViewDonors = (request) => {
    setSelectedRequest(request);
    setShowDonorModal(true);
  };

  const handleCloseDonorModal = () => {
    setShowDonorModal(false);
    setSelectedRequest(null);
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <Container className="my-5 text-center">
          <Spinner animation="border" variant="danger" />
          <p className="mt-3">Loading your blood requests...</p>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <section className="request-section py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">
              <FaTint className="me-3 text-danger" />
              <span className="highlight">My Blood Requests</span>
              <div className="subtitle">Track Your Blood Request and Donor Responses</div>
            </h2>
          </div>

          {requests.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <FaTint className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                <h5 className="text-muted">No Blood Requests Yet</h5>
                <p className="text-muted">You haven't submitted any blood requests.</p>
                <Button variant="danger" href="/request">
                  Submit a Blood Request
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {requests.map((request) => {
                const acceptedDonors = getAcceptedDonors(request);
                const allResponses = getAllResponses(request);
                
                return (
                  <Col lg={12} key={request.id} className="mb-4">
                    <Card className={`shadow-sm border-${getUrgencyColor(request.urgencyLevel)} border-start border-4`}>
                      <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                        <div>
                          <h5 className="mb-1">
                            <Badge bg={getUrgencyColor(request.urgencyLevel)} className="me-2">
                              {request.urgencyLevel?.toUpperCase() || 'NORMAL'}
                            </Badge>
                            Blood Type: {request.bloodGroup}
                          </h5>
                          <small className="text-muted">
                            Patient: {request.patientName}
                          </small>
                        </div>
                        <Badge 
                          bg={request.status === 'active' ? 'success' : 'secondary'}
                          className="px-3 py-2"
                        >
                          {request.status?.toUpperCase() || 'ACTIVE'}
                        </Badge>
                      </Card.Header>

                      <Card.Body>
                        <Row>
                          {/* Request Details */}
                          <Col md={6}>
                            <h6 className="text-primary mb-3">
                              <FaHospital className="me-2" />
                              Request Details
                            </h6>
                            
                            <div className="mb-2">
                              <strong>Hospital:</strong> {request.hospitalName || 'N/A'}
                            </div>
                            <div className="mb-2">
                              <strong>Units Required:</strong> {request.unitsRequired || 1} unit(s)
                            </div>
                            <div className="mb-2">
                              <strong>Required By:</strong> {request.requiredDate || 'ASAP'}
                            </div>
                            <div className="mb-2">
                              <strong>Contact Phone:</strong> {request.phone || request.contactPhone || 'N/A'}
                            </div>
                            <div className="mb-2">
                              <strong>Contact Email:</strong> {request.email || request.contactEmail || 'N/A'}
                            </div>
                            <div className="mb-2">
                              <strong>Submitted:</strong> {formatDate(request.createdAt)}
                            </div>
                            {request.medicalReason && (
                              <div className="mb-2">
                                <strong>Medical Reason:</strong> {request.medicalReason}
                              </div>
                            )}
                          </Col>

                          {/* Donor Responses */}
                          <Col md={6}>
                            <h6 className="text-success mb-3">
                              <FaCheckCircle className="me-2" />
                              Donor Responses ({acceptedDonors.length})
                            </h6>

                            {acceptedDonors.length === 0 ? (
                              <Alert variant="info">
                                <small>
                                  <strong>No donors have accepted yet.</strong>
                                  <br />
                                  We've notified all compatible donors about your request. 
                                  You'll see their contact details here when someone accepts.
                                </small>
                              </Alert>
                            ) : (
                              <>
                                <Alert variant="success">
                                  <strong>🎉 Great News!</strong>
                                  <br />
                                  {acceptedDonors.length} donor(s) have accepted your request!
                                </Alert>

                                {/* Show first donor's details */}
                                {acceptedDonors.slice(0, 1).map((donor, index) => (
                                  <Card key={index} className="mb-2 border-success">
                                    <Card.Body className="py-2">
                                      <div className="d-flex align-items-center mb-2">
                                        <FaUser className="text-success me-2" />
                                        <strong>{donor.donorName}</strong>
                                        <Badge bg="success" className="ms-2">
                                          {donor.donorBloodGroup}
                                        </Badge>
                                      </div>
                                      <div className="small">
                                        <div className="mb-1">
                                          <FaPhone className="text-muted me-2" />
                                          <a href={`tel:${donor.donorPhone}`}>{donor.donorPhone}</a>
                                        </div>
                                        <div className="mb-1">
                                          <FaEnvelope className="text-muted me-2" />
                                          <a href={`mailto:${donor.donorEmail}`}>{donor.donorEmail}</a>
                                        </div>
                                        {donor.message && (
                                          <div className="mt-2 p-2 bg-light rounded">
                                            <small>
                                              <strong>Message:</strong> {donor.message}
                                            </small>
                                          </div>
                                        )}
                                      </div>
                                    </Card.Body>
                                  </Card>
                                ))}

                                {acceptedDonors.length > 1 && (
                                  <Button 
                                    variant="outline-success" 
                                    size="sm" 
                                    className="w-100 mt-2"
                                    onClick={() => handleViewDonors(request)}
                                  >
                                    View All {acceptedDonors.length} Donors
                                  </Button>
                                )}
                              </>
                            )}

                            {allResponses.length > acceptedDonors.length && (
                              <div className="mt-2">
                                <small className="text-muted">
                                  Total responses: {allResponses.length} 
                                  ({allResponses.filter(r => r.response === 'declined').length} declined, 
                                  {allResponses.filter(r => r.response === 'maybe').length} maybe)
                                </small>
                              </div>
                            )}
                          </Col>
                        </Row>
                      </Card.Body>

                      <Card.Footer className="bg-light">
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            Request ID: {request.id}
                          </small>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleViewDonors(request)}
                          >
                            View All Responses
                          </Button>
                        </div>
                      </Card.Footer>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Container>
      </section>

      {/* Donor Details Modal */}
      <Modal show={showDonorModal} onHide={handleCloseDonorModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCheckCircle className="text-success me-2" />
            Donor Responses
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <div className="mb-4">
                <h6>Request Details</h6>
                <p className="mb-1">
                  <strong>Blood Group:</strong> {selectedRequest.bloodGroup} | 
                  <strong className="ms-2">Units:</strong> {selectedRequest.unitsRequired || 1} | 
                  <strong className="ms-2">Patient:</strong> {selectedRequest.patientName}
                </p>
                <p className="mb-0">
                  <strong>Hospital:</strong> {selectedRequest.hospitalName}
                </p>
              </div>

              {/* Accepted Donors */}
              {getAcceptedDonors(selectedRequest).length > 0 && (
                <div className="mb-4">
                  <h6 className="text-success">
                    ✅ Accepted ({getAcceptedDonors(selectedRequest).length})
                  </h6>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Blood Group</th>
                        <th>Contact</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAcceptedDonors(selectedRequest).map((donor, index) => (
                        <tr key={index}>
                          <td>{donor.donorName}</td>
                          <td>
                            <Badge bg="success">{donor.donorBloodGroup}</Badge>
                          </td>
                          <td>
                            <div className="small">
                              <div>📞 <a href={`tel:${donor.donorPhone}`}>{donor.donorPhone}</a></div>
                              <div>📧 <a href={`mailto:${donor.donorEmail}`}>{donor.donorEmail}</a></div>
                            </div>
                          </td>
                          <td>
                            <small>{donor.message || 'No message'}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* Other Responses */}
              {getAllResponses(selectedRequest).filter(r => r.response !== 'accepted').length > 0 && (
                <div>
                  <h6 className="text-muted">
                    Other Responses ({getAllResponses(selectedRequest).filter(r => r.response !== 'accepted').length})
                  </h6>
                  <Table striped size="sm">
                    <thead>
                      <tr>
                        <th>Response</th>
                        <th>Blood Group</th>
                        <th>Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAllResponses(selectedRequest)
                        .filter(r => r.response !== 'accepted')
                        .map((response, index) => (
                          <tr key={index}>
                            <td>
                              <Badge 
                                bg={response.response === 'maybe' ? 'warning' : 'secondary'}
                              >
                                {response.response}
                              </Badge>
                            </td>
                            <td>{response.donorBloodGroup}</td>
                            <td>
                              <small>{response.message || 'No message'}</small>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {getAllResponses(selectedRequest).length === 0 && (
                <Alert variant="info">
                  No donor responses yet. Compatible donors have been notified about your request.
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDonorModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  );
};

export default MyRequests;
