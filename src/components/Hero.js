import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import firebaseService from '../firebase/firebaseService';

const Hero = () => {
  const [urgentRequests, setUrgentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUrgentRequests();
  }, []);

  const fetchUrgentRequests = async () => {
    try {
      const requestsResult = await firebaseService.getBloodRequests();
      
      if (requestsResult && requestsResult.length > 0) {
        const urgent = requestsResult.filter(request => 
          request.urgency === 'urgent' && 
          request.status === 'active'
        ).slice(0, 3); // Show max 3 urgent requests
        
        setUrgentRequests(urgent);
      }
    } catch (error) {
      console.error('Error fetching urgent requests:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-section bg-light py-5">
      <Container>
        {/* Urgent Requests Alert */}
        {!loading && urgentRequests.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger" className="text-center">
                <Alert.Heading className="h5">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  URGENT: {urgentRequests.length} Blood Request{urgentRequests.length > 1 ? 's' : ''} Need Your Help!
                </Alert.Heading>
                <div className="d-flex justify-content-center flex-wrap gap-3">
                  {urgentRequests.map(request => (
                    <span key={request.id} className="badge bg-white text-danger fs-6 p-2">
                      {request.bloodGroup} - {request.unitsRequired || 1} unit{(request.unitsRequired || 1) > 1 ? 's' : ''}
                    </span>
                  ))}
                </div>
                <Button 
                  as={Link} 
                  to="/donate-blood" 
                  variant="outline-danger" 
                  size="sm" 
                  className="mt-2"
                >
                  View Requests & Respond
                </Button>
              </Alert>
            </Col>
          </Row>
        )}

        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start">
            <h1 className="display-4 fw-bold mb-4">Get Alerted,<br />Save Lives Instantly</h1>
            <p className="lead mb-4">
              Receive instant alerts when someone needs your blood type. View blood requests in real-time and respond directly to help save lives.
              {!loading && urgentRequests.length > 0 && (
                <span className="text-danger fw-bold">
                  <br />🚨 {urgentRequests.length} urgent request{urgentRequests.length > 1 ? 's' : ''} waiting for donors right now!
                </span>
              )}
            </p>
            <Button 
              as={Link} 
              to="/donate-blood" 
              variant="danger" 
              size="lg" 
              className="rounded-pill px-4"
            >
              {urgentRequests.length > 0 ? 'View Requests & Help Now!' : 'View Blood Requests'}
            </Button>
          </Col>
          <Col md={6} className="mt-4 mt-md-0">
            <img
              src="/blood donation illustration.jpg"
              alt="Blood donation illustration"
              className="img-fluid"
              style={{ maxHeight: '400px', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Hero;
