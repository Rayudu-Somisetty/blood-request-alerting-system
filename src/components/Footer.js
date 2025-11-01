import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5">
      <Container>
        <Row>
          <Col md={4}>
            <h5>Blood Alert</h5>
            <p>Connecting donors with urgent blood requirements through smart alerts</p>
            <div className="social-links">
              <a href="https://www.facebook.com/GIMSRHopistal/" className="text-light me-3"><FaFacebook /></a>
              <a href="https://www.instagram.com/gimsr_hospital/?hl=en" className="text-light me-3"><FaInstagram /></a>
              <a href="https://www.linkedin.com/company/gimsr/?originalSubdomain=in" className="text-light"><FaLinkedin /></a>
            </div>
          </Col>
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/about" className="text-light">About Us</a></li>
              <li><a href="/donate" className="text-light">Donate Blood</a></li>
              <li><a href="/request" className="text-light">Request Blood</a></li>
              <li><a href="/contact" className="text-light">Contact Us</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Our Partners</h5>
            <div className="partner-logos">
              {/* Partner logos can be added here when available */}
              <div className="text-muted small">Partner organizations coming soon...</div>
            </div>
          </Col>
        </Row>
        <hr className="my-4" />
        <Row>
          <Col className="text-center">
            <p className="mb-0">&copy; 2025 Blood Alert. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
