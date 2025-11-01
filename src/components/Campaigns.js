import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaCalendarAlt, FaUsers, FaBullhorn, FaHeart } from 'react-icons/fa';
import './Campaigns.css';

const Campaigns = () => {
  return (
    <section id="campaigns" className="campaigns-section py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="text-center mb-5">
              <h2 className="section-title">
                <FaBullhorn className="me-3 text-danger" />
                <span className="highlight">Blood Donation Campaigns</span>
                <div className="subtitle">Spreading Awareness, Saving Lives</div>
              </h2>
            </div>
            
            <div className="coming-soon-content">
              <Row className="align-items-center">
                <Col lg={6} className="text-center mb-4 mb-lg-0">
                  <div className="animation-container">
                    <div className="heart-animation">
                      <FaHeart className="heart-icon" />
                    </div>
                    <div className="pulse-ring"></div>
                    <div className="pulse-ring pulse-ring-delay"></div>
                  </div>
                </Col>
                
                <Col lg={6}>
                  <Card className="coming-soon-card">
                    <Card.Body className="text-center">
                      <h3 className="coming-soon-title">Coming Soon!</h3>
                      <p className="coming-soon-text">
                        We're working hard to bring you exciting blood donation campaigns 
                        and community outreach programs. Stay tuned for updates on upcoming 
                        events, drives, and initiatives.
                      </p>
                      
                      <div className="features-preview">
                        <div className="feature-item">
                          <FaCalendarAlt className="feature-icon" />
                          <span>Scheduled Blood Drives</span>
                        </div>
                        <div className="feature-item">
                          <FaUsers className="feature-icon" />
                          <span>Community Outreach</span>
                        </div>
                        <div className="feature-item">
                          <FaBullhorn className="feature-icon" />
                          <span>Awareness Programs</span>
                        </div>
                      </div>
                      
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Campaigns;
