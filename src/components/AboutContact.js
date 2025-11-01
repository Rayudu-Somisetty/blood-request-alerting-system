import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './About.css';

const AboutContact = () => {
  return (
    <section id="about-contact" className="about-section py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="text-center mb-5">
              <h2 className="section-title">
                <span className="highlight">About Us</span>
                <div className="subtitle">Blood Alert Information</div>
              </h2>
            </div>
            
            <div className="about-content">
              <div className="text-center py-5">
                <div className="alert alert-info border-0 bg-light rounded-3 shadow-sm">
                  <i className="bi bi-info-circle-fill text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
                  <h4 className="text-primary mb-2">Content Under Development</h4>
                  <p className="text-muted mb-0 fs-5">
                    <strong>Yet to be added</strong>
                  </p>
                  <small className="text-muted d-block mt-2">
                    Detailed information about our services and contact details will be available soon.
                  </small>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AboutContact;
