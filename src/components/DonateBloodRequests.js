import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaTint, FaHospital, FaMapMarkerAlt, FaCalendarAlt, FaHeart, FaFilter } from 'react-icons/fa';
import firebaseService from '../firebase/firebaseService';
import { useAuth } from '../context/AuthContext';
import './DonateBloodRequests.css';

const DonateBloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const { user } = useAuth();

  // Filter states
  const [filters, setFilters] = useState({
    bloodGroup: '',
    urgencyLevel: '',
    location: ''
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'critical', label: 'Critical' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'normal', label: 'Normal' }
  ];

  useEffect(() => {
    loadBloodRequests();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadBloodRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, filters]);

  const loadBloodRequests = async () => {
    try {
      setLoading(true);
      const result = await firebaseService.getBloodRequests({ status: 'active' });
      
      if (result && result.data) {
        // Exclude requests made by current user
        const otherRequests = result.data.filter(req => req.requesterId !== user?.uid);
        setRequests(otherRequests);
      }
    } catch (error) {
      console.error('Error loading blood requests:', error);
      showAlert('danger', 'Failed to load blood requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Filter by blood group
    if (filters.bloodGroup) {
      filtered = filtered.filter(req => req.bloodGroup === filters.bloodGroup);
    }

    // Filter by urgency level
    if (filters.urgencyLevel) {
      filtered = filtered.filter(req => req.urgencyLevel === filters.urgencyLevel);
    }

    // Filter by location (search in hospital name)
    if (filters.location) {
      filtered = filtered.filter(req => 
        req.hospitalName?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Sort by urgency and date
    filtered.sort((a, b) => {
      const urgencyOrder = { 'critical': 3, 'urgent': 2, 'normal': 1 };
      const urgencyA = urgencyOrder[a.urgencyLevel] || 1;
      const urgencyB = urgencyOrder[b.urgencyLevel] || 1;
      
      if (urgencyA !== urgencyB) {
        return urgencyB - urgencyA;
      }
      
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    setFilteredRequests(filtered);
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      bloodGroup: '',
      urgencyLevel: '',
      location: ''
    });
  };

  const handleDonorResponse = async (requestId, response) => {
    try {
      setResponding(requestId);
      
      const result = await firebaseService.respondToBloodRequest(
        requestId,
        user.uid,
        response,
        response === 'accepted' ? 'I am available to donate blood. Please contact me.' : 'Sorry, I am not available at this time.'
      );

      showAlert('success', result.message);
      
      // Reload requests to update the UI
      await loadBloodRequests();
      
    } catch (error) {
      console.error('Error responding to blood request:', error);
      showAlert('danger', error.message || 'Failed to respond. Please try again.');
    } finally {
      setResponding(null);
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
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const hasUserResponded = (request) => {
    return request.donorResponses?.some(response => response.donorId === user?.uid);
  };

  const getUserResponse = (request) => {
    return request.donorResponses?.find(response => response.donorId === user?.uid);
  };

  return (
    <section className="donate-blood-requests-section py-5">
      <Container>
        <div className="text-center mb-5">
          <h2 className="section-title">
            <FaTint className="me-3 text-danger" />
            <span className="highlight">Donate Blood - Active Requests</span>
            <div className="subtitle">Help Save Lives by Responding to Blood Requests</div>
          </h2>
        </div>

        {/* Alert */}
        {alert.show && (
          <Alert variant={alert.type} className="mb-4" dismissible onClose={() => setAlert({ show: false })}>
            {alert.message}
          </Alert>
        )}

        {/* Filters Section */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="bg-danger text-white">
            <FaFilter className="me-2" />
            <strong>Filter Blood Requests</strong>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Blood Group</Form.Label>
                  <Form.Select
                    value={filters.bloodGroup}
                    onChange={(e) => handleFilterChange('bloodGroup', e.target.value)}
                  >
                    <option value="">All Blood Groups</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Urgency Level</Form.Label>
                  <Form.Select
                    value={filters.urgencyLevel}
                    onChange={(e) => handleFilterChange('urgencyLevel', e.target.value)}
                  >
                    <option value="">All Urgency Levels</option>
                    {urgencyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Location (Hospital)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by hospital name..."
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button 
                  variant="outline-secondary" 
                  className="mb-3 w-100"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
            <div className="mt-3">Loading blood requests...</div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card className="text-center py-5">
            <Card.Body>
              <FaHeart className="text-muted mb-3" style={{ fontSize: '3rem' }} />
              <h5 className="text-muted">No Blood Requests Found</h5>
              <p className="text-muted">
                {requests.length === 0 
                  ? "There are no active blood requests at the moment."
                  : "No requests match your filters. Try adjusting the filters above."}
              </p>
            </Card.Body>
          </Card>
        ) : (
          <>
            <div className="mb-3 text-muted">
              Showing {filteredRequests.length} of {requests.length} active request{requests.length !== 1 ? 's' : ''}
            </div>
            
            <Row>
              {filteredRequests.map((request) => {
                const responded = hasUserResponded(request);
                const userResponse = getUserResponse(request);
                
                return (
                  <Col lg={6} key={request.id} className="mb-4">
                    <Card className="h-100 shadow-sm blood-request-card">
                      <Card.Header className={`d-flex justify-content-between align-items-center ${request.urgencyLevel === 'critical' ? 'bg-danger text-white' : 'bg-light'}`}>
                        <div className="d-flex align-items-center gap-2">
                          <FaTint className={request.urgencyLevel === 'critical' ? 'text-white' : 'text-danger'} />
                          <strong>Blood Needed: {request.bloodGroup}</strong>
                        </div>
                        {getUrgencyBadge(request.urgencyLevel)}
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <Row>
                            <Col xs={6}>
                              <small className="text-muted">Patient:</small>
                              <div><strong>{request.patientName}</strong></div>
                            </Col>
                            <Col xs={6}>
                              <small className="text-muted">Units Required:</small>
                              <div><strong>{request.unitsRequired} unit(s)</strong></div>
                            </Col>
                          </Row>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex align-items-start gap-2 mb-2">
                            <FaHospital className="text-danger mt-1" />
                            <div>
                              <small className="text-muted d-block">Hospital:</small>
                              <span>{request.hospitalName}</span>
                            </div>
                          </div>
                          
                          <div className="d-flex align-items-start gap-2">
                            <FaCalendarAlt className="text-danger mt-1" />
                            <div>
                              <small className="text-muted d-block">Requested:</small>
                              <span>{formatDate(request.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {request.medicalReason && (
                          <div className="mb-3">
                            <small className="text-muted d-block">Medical Reason:</small>
                            <p className="mb-0 small">{request.medicalReason}</p>
                          </div>
                        )}

                        {/* Response Status or Buttons */}
                        {responded ? (
                          <Alert 
                            variant={userResponse.response === 'accepted' ? 'success' : 'secondary'}
                            className="mb-0"
                          >
                            <strong>
                              {userResponse.response === 'accepted' && '✅ You accepted this request'}
                              {userResponse.response === 'declined' && '❌ You declined this request'}
                              {userResponse.response === 'maybe' && '❓ You responded "Maybe"'}
                            </strong>
                            {userResponse.response === 'accepted' && (
                              <small className="d-block mt-1">
                                Your contact details have been shared with the requester.
                              </small>
                            )}
                          </Alert>
                        ) : (
                          <div className="d-flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              disabled={responding === request.id}
                              onClick={() => handleDonorResponse(request.id, 'accepted')}
                              className="flex-grow-1"
                            >
                              {responding === request.id ? (
                                <Spinner size="sm" className="me-1" />
                              ) : (
                                <FaHeart className="me-1" />
                              )}
                              I Can Donate
                            </Button>
                            
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              disabled={responding === request.id}
                              onClick={() => handleDonorResponse(request.id, 'declined')}
                            >
                              Can't Help
                            </Button>
                          </div>
                        )}

                        {request.urgencyLevel === 'critical' && !responded && (
                          <Alert variant="danger" className="mt-3 mb-0 small">
                            <strong>🚨 CRITICAL:</strong> Immediate response needed to save a life!
                          </Alert>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </>
        )}
      </Container>
    </section>
  );
};

export default DonateBloodRequests;
