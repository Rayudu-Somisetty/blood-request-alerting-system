import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { FaTint, FaUser, FaPhone, FaEnvelope, FaUpload } from 'react-icons/fa';
import firebaseService from '../firebase/firebaseService';
import './DonateBlood.css';

const DonateBlood = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: 18,
    gender: '',
    bloodGroup: '',
    phone: '',
    email: '',
    photoId: null,
    lastDonation: '',
    medicalHistory: ''
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.bloodGroup || !formData.phone || !formData.email || !formData.gender) {
        showAlert('danger', 'Please fill in all required fields.');
        setLoading(false);
        return;
      }

      // Prepare data for your blood bank admin API
      const donationRequestData = {
        donorDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`,
          age: parseInt(formData.age),
          gender: formData.gender,
          bloodGroup: formData.bloodGroup
        },
        preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        lastDonation: formData.lastDonation,
        medicalConditions: formData.medicalHistory || 'None specified',
        consentGiven: true,
        location: 'To be determined', // You can make this dynamic
        donationType: 'voluntary'
      };

      console.log('Sending donation request:', donationRequestData);

      // Submit using Firebase service
      const result = await firebaseService.createDonation(donationRequestData);
      console.log('Success response:', result);

      if (result.id) {
        showAlert('success', 
          `Thank you ${formData.name}! Your donation request has been submitted successfully. ` +
          `Request ID: ${result.id}. Our medical team has been notified and will contact you within 24-48 hours to schedule your donation appointment.`
        );
        
        // Reset form after successful submission
        setFormData({
          name: '',
          age: 18,
          gender: '',
          bloodGroup: '',
          phone: '',
          email: '',
          photoId: null,
          lastDonation: '',
          medicalHistory: ''
        });

        // No redirect - user stays on the website
      }

    } catch (error) {
      console.error('Error submitting donation request:', error);
      showAlert('danger', 'Unable to submit your request at this time. Please check your internet connection and try again, or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="donate" className="donate-section py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="text-center mb-5">
              <h2 className="section-title">
                <FaTint className="me-3 text-danger" />
                <span className="highlight">Donate Blood</span>
                <div className="subtitle">Be a Hero, Save Lives</div>
              </h2>
            </div>

            {/* Alert for success/error messages */}
            {alert.show && (
              <Alert variant={alert.type} className="mb-4">
                {alert.message}
              </Alert>
            )}

            <Card className="donation-form-card">
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {/* Name */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaUser className="me-2 text-danger" />
                          Full Name *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    {/* Age */}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Age *</Form.Label>
                        <Form.Range
                          name="age"
                          min="18"
                          max="65"
                          value={formData.age}
                          onChange={handleChange}
                          className="age-slider mb-2"
                        />
                        <div className="age-display mb-2">
                          <span className="age-value">{formData.age} years</span>
                        </div>
                        <Form.Control
                          type="number"
                          name="age"
                          min="18"
                          max="65"
                          value={formData.age}
                          onChange={handleChange}
                          placeholder="Enter your age"
                          required
                        />
                        <Form.Text className="text-muted">
                          Age must be between 18-65 years
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                  {/* Gender */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Gender *</Form.Label>
                        <Form.Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  {/* Blood Group */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Blood Group *</Form.Label>
                        <Form.Select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Blood Group</option>
                          {bloodGroups.map(group => (
                            <option key={group} value={group}>{group}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  {/* Last Donation */}
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Months Since Last Blood Donation *</Form.Label>
                        <Form.Select
                          name="lastDonation"
                          value={formData.lastDonation}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select option</option>
                          <option value="never">Never donated before</option>
                          <option value="0-2">0-2 months ago</option>
                          <option value="3-4">3-4 months ago</option>
                          <option value="5-6">5-6 months ago</option>
                          <option value="7-12">7-12 months ago</option>
                          <option value="1-2years">1-2 years ago</option>
                          <option value="2+years">More than 2 years ago</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Minimum gap required between donations is 56 days (8 weeks)
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                  {/* Phone & Email */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaPhone className="me-2 text-danger" />
                          Phone Number *
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter 10-digit phone number"
                          pattern="[0-9]{10}"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaEnvelope className="me-2 text-danger" />
                          Email Address *
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="yourname@gmail.com"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  {/* Photo ID */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaUpload className="me-2 text-danger" />
                      Photo ID (Optional)
                    </Form.Label>
                    <Form.Control
                      type="file"
                      name="photoId"
                      onChange={handleChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                    />
                    <Form.Text className="text-muted">
                      Upload JPG, PNG, or PDF files only
                    </Form.Text>
                  </Form.Group>
                  {/* Medical History */}
                  <Form.Group className="mb-4">
                    <Form.Label>Medical History & Additional Information</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleChange}
                      placeholder="Please mention any tattoos, medical history, use of medications, or any other relevant information..."
                    />
                    <Form.Text className="text-muted">
                      Include information about tattoos, medical conditions, medications, or substance use
                    </Form.Text>
                  </Form.Group>
                  <div className="text-center">
                    <Button
                      type="submit"
                      size="lg"
                      className="donate-btn px-5 py-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            className="me-2"
                          />
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <FaTint className="me-2" />
                          Submit Donation Request
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default DonateBlood;
