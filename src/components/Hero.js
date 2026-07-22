import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import firebaseService from '../firebase/firebaseService';

const Hero = () => {
  const [urgentRequests, setUrgentRequests] = useState([]);

  useEffect(() => {
    const fetchUrgentRequests = async () => {
      try {
        const result = await firebaseService.getBloodRequests();
        const requests = Array.isArray(result) ? result : result?.data || [];
        setUrgentRequests(requests.filter((request) => request.urgency === 'urgent' && request.status === 'active').slice(0, 3));
      } catch (error) {
        console.error('Error fetching urgent requests:', error);
      }
    };
    fetchUrgentRequests();
  }, []);

  return (
    <section className="py-4 py-md-5" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 60%, #fef2f2 100%)' }}>
      <Container>
        {urgentRequests.length > 0 && (
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 bg-danger text-white rounded-4 px-4 py-3 mb-4">
            <div><i className="bi bi-exclamation-circle-fill me-2"></i><strong>{urgentRequests.length} urgent request{urgentRequests.length > 1 ? 's' : ''}</strong> need a donor now.</div>
            <Button as={Link} to="/donate-blood" variant="light" size="sm" className="text-danger fw-bold">View requests</Button>
          </div>
        )}

        <Row className="align-items-center g-4 g-lg-5">
          <Col lg={6}>
            <span className="text-danger fw-semibold small text-uppercase">Blood Request Alerting System</span>
            <h1 className="display-5 fw-bold text-dark mt-2 mb-3">Be ready when someone needs your help.</h1>
            <p className="lead text-secondary mb-4">Find active blood requests, donate when you can, or create an urgent request for someone in need.</p>
            <div className="d-flex flex-wrap gap-3">
              <Button as={Link} to="/donate-blood" variant="danger" size="lg" className="px-4"><i className="bi bi-heart-fill me-2"></i>Find a request</Button>
              <Button as={Link} to="/request" variant="outline-danger" size="lg" className="px-4">Request blood</Button>
            </div>
          </Col>
          <Col lg={6} className="text-center">
            <div className="position-relative d-inline-block">
              <div className="position-absolute top-0 start-0 translate-middle rounded-circle bg-danger opacity-10" style={{ width: 120, height: 120 }}></div>
              <img src="/blood donation illustration.jpg" alt="A blood donor helping the community" className="img-fluid rounded-4 shadow-sm position-relative" style={{ maxHeight: 370, objectFit: 'cover' }} />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;
