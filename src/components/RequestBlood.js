import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { FaHandHoldingMedical, FaUser, FaPhone, FaEnvelope, FaUpload, FaHospital } from 'react-icons/fa';
import firebaseService from '../firebase/firebaseService';
import './RequestBlood.css';

const RequestBlood = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    age: 18,
    gender: '',
    bloodGroup: '',
    unitsRequired: 1,
    urgencyLevel: '',
    phone: '',
    email: '',
    hospitalName: '',
    doctorName: '',
    medicalDocuments: '',
    medicalCondition: ''
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: 'critical', label: 'Critical (Within 24 hours)' },
    { value: 'urgent', label: 'Urgent (Within 3 days)' },
    { value: 'normal', label: 'Normal (Within a week)' }
  ];

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
    }, 7000);
  };

  const getRequiredByDate = () => {
    const now = new Date();
    switch (formData.urgencyLevel) {
      case 'critical':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      case 'urgent':
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.patientName || !formData.bloodGroup || !formData.phone || !formData.email || 
          !formData.hospitalName || !formData.doctorName || !formData.urgencyLevel || !formData.gender) {
        showAlert('danger', 'Please fill in all required fields.');
        setLoading(false);
        return;
      }

      // Prepare data for blood request API - using consistent field names
      const bloodRequestData = {
        // Patient Information
        patientName: formData.patientName,
        bloodGroup: formData.bloodGroup, // Standard field name
        bloodType: formData.bloodGroup, // Backup field name
        unitsRequired: parseInt(formData.unitsRequired),
        unitsNeeded: parseInt(formData.unitsRequired), // Backup field name
        
        // Urgency and timing
        urgencyLevel: formData.urgencyLevel,
        urgency: formData.urgencyLevel, // Backup field name
        requiredBy: getRequiredByDate().toISOString(),
        requiredDate: getRequiredByDate().toISOString(), // Backup field name
        timeRequired: getRequiredByDate().toISOString(), // Backup field name
        
        // Hospital and contact info
        hospitalName: formData.hospitalName,
        contactPerson: formData.doctorName,
        contactPhone: formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`,
        contactEmail: formData.email,
        
        // Medical information
        medicalReason: formData.medicalCondition,
        additionalNotes: `Doctor: ${formData.doctorName}. Additional medical information: ${formData.medicalCondition}`,
        
        // Status tracking
        status: 'active',
        fulfilled: false,
        urgentProcessing: formData.urgencyLevel === 'critical',
        
        // Donor details (nested for compatibility)
        donorDetails: {
          name: formData.patientName,
          email: formData.email,
          phone: formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`,
          age: parseInt(formData.age),
          gender: formData.gender,
          weight: parseFloat(formData.weight),
          bloodGroup: formData.bloodGroup
        }
      };

      console.log('Sending blood request:', bloodRequestData);

      // Submit using Firebase service
      const result = await firebaseService.createBloodRequest(bloodRequestData);
      console.log('Success response:', result);

      if (result.id) {
        let message = `✅ Blood request submitted successfully! Request ID: ${result.id}.\n\n`;
        
        message += `🩸 HOW IT WORKS: All registered users with compatible blood groups will be instantly notified about your request.\n\n`;
        
        if (formData.urgencyLevel === 'critical') {
          message += `🚨 CRITICAL REQUEST: Donors will see your urgent request and can respond immediately by clicking "I Can Donate". When they accept, both of you will receive each other's contact details (name, phone, email) to coordinate the donation directly.`;
        } else if (formData.urgencyLevel === 'urgent') {
          message += `⚠️ URGENT REQUEST: Donors will be notified about your request. When someone accepts to donate, you'll both receive each other's contact information to arrange the donation at ${formData.hospitalName}.`;
        } else {
          message += `📱 REQUEST SUBMITTED: Donors can view your request and choose to help. Once a donor accepts, you'll both exchange contact details (phone: ${formData.phone}) to coordinate the blood donation.`;
        }
        
        message += `\n\n💡 NEXT STEPS:\n• Keep your phone ${formData.phone} available\n• Willing donors will accept your request\n• You'll receive donor's contact details instantly\n• Contact them directly to arrange donation at ${formData.hospitalName}\n• Coordinate the time and complete the process`;
        
        showAlert('success', message);
        
        // Reset form after successful submission
        setFormData({
          patientName: '',
          age: 18,
          gender: '',
          weight: '',
          bloodGroup: '',
          unitsRequired: 1,
          urgencyLevel: '',
          phone: '',
          email: '',
          hospitalName: '',
          doctorName: '',
          medicalDocuments: '',
          medicalCondition: ''
        });

        // No redirect - user stays on the website, admin portal gets notified automatically
      }

    } catch (error) {
      console.error('Error submitting blood request:', error);
      showAlert('danger', 'Unable to submit your blood request at this time. Please call our emergency helpline immediately for urgent cases, or try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="request" className="request-section py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="text-center mb-5">
              <h2 className="section-title">
                <FaHandHoldingMedical className="me-3 text-danger" />
                <span className="highlight">Request Blood</span>
                <div className="subtitle">Connect with Donors Instantly</div>
              </h2>
              <p className="text-muted mt-3">
                Submit your blood requirement and we'll notify all registered donors with compatible blood types. 
                When a donor accepts, you'll both receive each other's contact details to coordinate the donation.
              </p>
            </div>

            {/* Alert for success/error messages */}
            {alert.show && (
              <Alert variant={alert.type} className="mb-4">
                {alert.message}
              </Alert>
            )}
            
            <Card className="request-form-card">
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaUser className="me-2 text-danger" />
                          Patient Name *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="patientName"
                          value={formData.patientName}
                          onChange={handleChange}
                          placeholder="Enter patient's full name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Patient Age *</Form.Label>
                        <Form.Range
                          name="age"
                          min="0"
                          max="100"
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
                          min="0"
                          max="100"
                          value={formData.age}
                          onChange={handleChange}
                          placeholder="Enter patient's age"
                          required
                        />
                        <Form.Text className="text-muted">
                          Enter patient's age (0-100 years)
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Gender */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Patient Gender *</Form.Label>
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

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Units Required *</Form.Label>
                        <Form.Control
                          type="number"
                          name="unitsRequired"
                          value={formData.unitsRequired}
                          onChange={handleChange}
                          min="1"
                          max="10"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Urgency Level *</Form.Label>
                    <Form.Select
                      name="urgencyLevel"
                      value={formData.urgencyLevel}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Urgency Level</option>
                      {urgencyLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </Form.Select>
                    {formData.urgencyLevel === 'critical' && (
                      <Form.Text className="text-danger">
                        <strong>🚨 CRITICAL: Emergency team will respond within 30 minutes!</strong>
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaPhone className="me-2 text-danger" />
                          Contact Phone *
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

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <FaHospital className="me-2 text-danger" />
                          Hospital Name *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="hospitalName"
                          value={formData.hospitalName}
                          onChange={handleChange}
                          placeholder="Name of hospital where blood is needed"
                          required
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Doctor Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="doctorName"
                          value={formData.doctorName}
                          onChange={handleChange}
                          placeholder="Attending doctor's name"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaUpload className="me-2 text-danger" />
                      Medical Documents
                    </Form.Label>
                    <Form.Control
                      type="file"
                      name="medicalDocuments"
                      onChange={handleChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                    />
                    <Form.Text className="text-muted">
                      Upload prescription, medical reports, or doctor's recommendation (JPG, PNG, or PDF)
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Medical Condition & Additional Information *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="medicalCondition"
                      value={formData.medicalCondition}
                      onChange={handleChange}
                      placeholder="Please describe the medical condition, reason for blood requirement, and any other relevant information..."
                      required
                    />
                  </Form.Group>

                  {/* Emergency Notice for Critical Requests */}
                  {formData.urgencyLevel === 'critical' && (
                    <Alert variant="danger" className="mb-3">
                      <strong>🚨 CRITICAL REQUEST NOTICE:</strong>
                      <br />• Our emergency team will contact you within 30 minutes
                      <br />• Please ensure your phone ({formData.phone}) is available
                      <br />• Have hospital details and doctor contact ready
                    </Alert>
                  )}

                  <div className="text-center">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className={`request-btn px-5 py-3 ${formData.urgencyLevel === 'critical' ? 'btn-danger' : ''}`}
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
                          <FaHandHoldingMedical className="me-2" />
                          {formData.urgencyLevel === 'critical' ? '🆘 Submit CRITICAL Request' : 'Submit Blood Request'}
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

export default RequestBlood;
