import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-vh-100 py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="shadow-lg border-0">
              <Card.Header className="bg-danger text-white text-center py-4">
                <h2 className="mb-0 fw-bold">Privacy Policy</h2>
                <p className="mb-0 opacity-75">Blood Alert - Privacy Protection</p>
              </Card.Header>
              <Card.Body className="p-5">
                <div className="text-muted mb-3">Last updated: September 8, 2025</div>
                
                <h4 className="text-danger fw-bold mb-3">1. Information We Collect</h4>
                <p>We collect information you provide directly to us, such as when you:</p>
                <ul>
                  <li>Create an account or register as a donor/recipient</li>
                  <li>Update your profile information</li>
                  <li>Submit blood donation or request forms</li>
                  <li>Contact us for support</li>
                  <li>Participate in surveys or promotions</li>
                </ul>

                <h5 className="text-danger fw-bold mt-4 mb-2">Personal Information includes:</h5>
                <ul>
                  <li>Name, email address, phone number</li>
                  <li>Date of birth, gender, blood group</li>
                  <li>Address and location information</li>
                  <li>Medical history relevant to blood donation</li>
                  <li>Emergency contact information</li>
                </ul>

                <h4 className="text-danger fw-bold mb-3 mt-4">2. How We Use Your Information</h4>
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Match blood donors with recipients</li>
                  <li>Send notifications about blood donation opportunities</li>
                  <li>Communicate with you about your account or requests</li>
                  <li>Ensure the safety and security of our platform</li>
                  <li>Comply with legal requirements</li>
                </ul>

                <h4 className="text-danger fw-bold mb-3">3. Information Sharing and Disclosure</h4>
                <p>We may share your information in the following circumstances:</p>
                <ul>
                  <li><strong>With Healthcare Providers:</strong> When you request blood or make a donation</li>
                  <li><strong>Emergency Situations:</strong> To facilitate urgent blood requirements</li>
                  <li><strong>Legal Compliance:</strong> When required by law or to protect rights and safety</li>
                  <li><strong>Service Providers:</strong> With trusted partners who help operate our service</li>
                </ul>

                <h4 className="text-danger fw-bold mb-3">4. Data Security</h4>
                <p>
                  We implement appropriate security measures to protect your personal information against unauthorized access, 
                  alteration, disclosure, or destruction. This includes:
                </p>
                <ul>
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication measures</li>
                  <li>Staff training on data protection practices</li>
                </ul>

                <h4 className="text-danger fw-bold mb-3">5. Your Rights and Choices</h4>
                <p>You have the right to:</p>
                <ul>
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of non-essential communications</li>
                  <li>Request a copy of your data</li>
                  <li>Report concerns about data handling</li>
                </ul>

                <h4 className="text-danger fw-bold mb-3">6. Data Retention</h4>
                <p>
                  We retain your information for as long as necessary to provide our services and fulfill legal obligations. 
                  Donation records may be kept for medical and legal compliance purposes even after account deletion.
                </p>

                <h4 className="text-danger fw-bold mb-3">7. Cookies and Tracking Technologies</h4>
                <p>
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                  and improve our services. You can control cookie settings through your browser preferences.
                </p>

                <h4 className="text-danger fw-bold mb-3">8. Third-Party Services</h4>
                <p>
                  Our service may contain links to third-party websites or integrate with third-party services. 
                  We are not responsible for the privacy practices of these external services.
                </p>

                <h4 className="text-danger fw-bold mb-3">9. Children's Privacy</h4>
                <p>
                  Blood Alert is not intended for use by individuals under 18 years of age. 
                  We do not knowingly collect personal information from children under 18.
                </p>

                <h4 className="text-danger fw-bold mb-3">10. Changes to Privacy Policy</h4>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                  the new Privacy Policy on this page and updating the "Last updated" date.
                </p>

                <h4 className="text-danger fw-bold mb-3">11. Contact Us</h4>
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                  <br />
                  Email: <a href="mailto:privacy@bloodalert.com">privacy@bloodalert.com</a>
                  <br />
                  Phone: +91-1234567890
                  <br />
                  Address: Blood Alert HQ, Visakhapatnam, Andhra Pradesh
                </p>

                <div className="bg-light p-4 rounded mt-4">
                  <h5 className="text-danger fw-bold mb-3">
                    <i className="bi bi-shield-check me-2"></i>Our Commitment to Your Privacy
                  </h5>
                  <p className="mb-0">
                    Blood Alert is committed to protecting your privacy and ensuring the security of your personal information. 
                    We understand the sensitive nature of health data and take extra precautions to safeguard your information 
                    while enabling life-saving connections between donors and recipients.
                  </p>
                </div>

                <div className="text-center mt-5">
                  <Link to="/register" className="btn btn-danger me-3">
                    <i className="bi bi-arrow-left me-2"></i>Back to Registration
                  </Link>
                  <Link to="/" className="btn btn-outline-danger">
                    <i className="bi bi-house me-2"></i>Home Page
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Privacy;
