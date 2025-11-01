import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tab, Tabs, Badge, Table, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';
import Footer from './Footer';
import firebaseService from '../firebase/firebaseService';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bloodGroup: '',
    birthYear: '',
    phone: '',
    address: '',
    emergencyContact: '',
    weight: '',
    height: '',
    allergies: '',
    medications: '',
    chronicConditions: ''
  });

  // Helper functions for data processing
  const getFullName = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.name) {
      return user.name;
    }
    return 'N/A';
  };

  const calculateAge = (birthYear) => {
    if (!birthYear) return 'N/A';
    const currentYear = new Date().getFullYear();
    const age = currentYear - parseInt(birthYear);
    return age > 0 ? age : 'N/A';
  };

  const formatValue = (value, unit = '') => {
    if (!value || value === '' || value === 0) return 'N/A';
    return unit ? `${value} ${unit}` : value;
  };

  // Get user data from authentication context instead of mock data
  const [profileData, setProfileData] = useState({
    name: getFullName(user),
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    bloodGroup: user?.bloodGroup || '',
    birthYear: user?.birthYear || '',
    age: calculateAge(user?.birthYear),
    phone: user?.phone || '',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || '',
    registrationDate: user?.registrationDate || new Date().toISOString().split('T')[0],
    totalDonations: user?.totalDonations || 0,
    lastDonation: user?.lastDonation || 'No donations yet',
    nextEligibleDate: user?.nextEligibleDate || '',
    bloodRequests: user?.bloodRequests || 0,
    lifeSaved: user?.lifeSaved || 0,
    weight: user?.weight || '',
    height: user?.height || '',
    medicalHistory: {
      allergies: user?.allergies || ['None'],
      chronicConditions: user?.chronicConditions || [],
      currentMedications: user?.currentMedications || []
    },
    donationEligibility: {
      isEligible: user?.isEligible || true,
      reasons: user?.eligibilityReasons || [],
      nextEligibleDate: user?.nextEligibleDate || ''
    }
  });

  const [donationHistory, setDonationHistory] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's actual donation and request data
  useEffect(() => {
    if (user?.uid) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's donations and requests
      const [donationsResult, requestsResult] = await Promise.all([
        firebaseService.getDonations(),
        firebaseService.getBloodRequests()
      ]);

      // Filter donations and requests for this user
      const userDonations = donationsResult?.filter(donation => 
        donation.donorId === user.uid || donation.email === user.email
      ) || [];

      const userRequests = requestsResult?.filter(request => 
        request.userId === user.uid || request.contactEmail === user.email
      ) || [];

      setDonationHistory(userDonations);
      setRequestHistory(userRequests);

      // Update profile data with real statistics
      setProfileData(prev => ({
        ...prev,
        totalDonations: userDonations.filter(d => d.status === 'completed').length,
        bloodRequests: userRequests.length,
        lifeSaved: userDonations.filter(d => d.status === 'completed').length * 3, // Assume each donation can save up to 3 lives
        lastDonation: userDonations.length > 0 ? 
          new Date(userDonations[userDonations.length - 1].createdAt).toLocaleDateString() : 
          'No donations yet'
      }));

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize edit form with current profile data
    if (profileData.name || user) {
      setEditForm({
        firstName: profileData.firstName || user?.firstName || '',
        lastName: profileData.lastName || user?.lastName || '',
        bloodGroup: profileData.bloodGroup || '',
        birthYear: profileData.birthYear || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        emergencyContact: profileData.emergencyContact || '',
        weight: profileData.weight || '',
        height: profileData.height || '',
        allergies: profileData.medicalHistory?.allergies ? profileData.medicalHistory.allergies.join(', ') : '',
        medications: profileData.medicalHistory?.currentMedications ? profileData.medicalHistory.currentMedications.join(', ') : '',
        chronicConditions: profileData.medicalHistory?.chronicConditions ? profileData.medicalHistory.chronicConditions.join(', ') : ''
      });
    }
  }, [profileData, user]);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = () => {
    const updatedProfile = {
      ...profileData,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      name: editForm.firstName && editForm.lastName ? `${editForm.firstName} ${editForm.lastName}` : editForm.firstName || editForm.lastName || 'N/A',
      bloodGroup: editForm.bloodGroup,
      birthYear: editForm.birthYear,
      age: calculateAge(editForm.birthYear),
      phone: editForm.phone,
      address: editForm.address,
      emergencyContact: editForm.emergencyContact,
      weight: editForm.weight,
      height: editForm.height,
      medicalHistory: {
        ...profileData.medicalHistory,
        allergies: editForm.allergies ? editForm.allergies.split(', ').filter(item => item.trim()) : ['None'],
        currentMedications: editForm.medications ? editForm.medications.split(', ').filter(item => item.trim()) : [],
        chronicConditions: editForm.chronicConditions ? editForm.chronicConditions.split(', ').filter(item => item.trim()) : []
      }
    };
    
    setProfileData(updatedProfile);
    setShowEditModal(false);
    
    // Here you would typically save to database/Firebase
    // Example: await updateUserProfile(user.uid, updatedProfile);
  };

  const getBloodGroupBadgeColor = (bloodGroup) => {
    const colors = {
      'O+': 'success', 'O-': 'danger', 'A+': 'primary', 'A-': 'info',
      'B+': 'warning', 'B-': 'secondary', 'AB+': 'dark', 'AB-': 'light'
    };
    return colors[bloodGroup] || 'secondary';
  };

  const getCompatibleBloodGroups = (userBloodGroup) => {
    const compatibility = {
      'O-': { canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-'] },
      'O+': { canDonateTo: ['O+', 'A+', 'B+', 'AB+'], canReceiveFrom: ['O-', 'O+'] },
      'A-': { canDonateTo: ['A-', 'A+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'A-'] },
      'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+'] },
      'B-': { canDonateTo: ['B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'B-'] },
      'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'B-', 'B+'] },
      'AB-': { canDonateTo: ['AB-', 'AB+'], canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'] },
      'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] }
    };
    return compatibility[userBloodGroup] || { canDonateTo: [], canReceiveFrom: [] };
  };

  const getDaysUntilEligible = () => {
    if (!profileData.nextEligibleDate) return 0;
    const nextDate = new Date(profileData.nextEligibleDate);
    const today = new Date();
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <>
      <Navigation />
      <Container className="my-5">
        <Row>
          <Col lg={4} className="mb-4">
            {/* Profile Card */}
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <i className="bi bi-person-circle text-primary" style={{ fontSize: '4rem' }}></i>
                </div>
                <h4 className="mb-1">{formatValue(profileData.name)}</h4>
                <p className="text-muted mb-3">{formatValue(profileData.email)}</p>
                
                {/* Key Profile Details */}
                <div className="mb-3">
                  <div className="d-flex justify-content-center align-items-center mb-2">
                    <i className="bi bi-droplet-fill text-danger me-2"></i>
                    <Badge bg={getBloodGroupBadgeColor(profileData.bloodGroup)} className="me-2 fs-6">
                      {formatValue(profileData.bloodGroup)}
                    </Badge>
                    <small className="text-muted">Blood Group</small>
                  </div>
                  
                  <div className="d-flex justify-content-center align-items-center mb-2">
                    <i className="bi bi-person-badge text-info me-2"></i>
                    <span className="fw-semibold me-2">{typeof profileData.age === 'number' ? `${profileData.age} years` : formatValue(profileData.age)}</span>
                    <small className="text-muted">Age</small>
                  </div>

                  <div className="d-flex justify-content-center align-items-center mb-2">
                    <i className="bi bi-rulers text-secondary me-2"></i>
                    <span className="fw-semibold me-2">{formatValue(profileData.weight, 'kg')} | {formatValue(profileData.height, 'cm')}</span>
                    <small className="text-muted">Weight | Height</small>
                  </div>
                  
                  <div className="d-flex justify-content-center align-items-center mb-2">
                    <i className="bi bi-calendar-heart text-success me-2"></i>
                    <span className="fw-semibold me-2">{profileData.lastDonation}</span>
                    <small className="text-muted">Last Donation</small>
                  </div>
                  
                  <div className="d-flex justify-content-center align-items-center mb-2">
                    <i className="bi bi-clock text-warning me-2"></i>
                    <Badge bg={getDaysUntilEligible() === 0 ? 'success' : 'warning'} className="me-2">
                      {getDaysUntilEligible() === 0 ? 'Eligible Now!' : `${getDaysUntilEligible()} days`}
                    </Badge>
                    <small className="text-muted">Next Eligible</small>
                  </div>
                  
                  <div className="d-flex justify-content-center align-items-center">
                    <i className="bi bi-award text-primary me-2"></i>
                    <span className="fw-semibold me-2">{profileData.totalDonations} donations</span>
                    <small className="text-muted">Total Contributions</small>
                  </div>
                </div>

                {/* Blood Compatibility Quick View */}
                <div className="mb-3 p-2 bg-light rounded">
                  <h6 className="text-center text-primary mb-2">
                    <i className="bi bi-heart-pulse me-1"></i>Blood Compatibility
                  </h6>
                  <div className="row">
                    <div className="col-6 text-center">
                      <small className="text-success d-block">Can Donate To:</small>
                      <Badge bg="success" className="fs-6">
                        {profileData.bloodGroup ? getCompatibleBloodGroups(profileData.bloodGroup).canDonateTo.length : 0} Groups
                      </Badge>
                    </div>
                    <div className="col-6 text-center">
                      <small className="text-info d-block">Can Receive From:</small>
                      <Badge bg="info" className="fs-6">
                        {profileData.bloodGroup ? getCompatibleBloodGroups(profileData.bloodGroup).canReceiveFrom.length : 0} Groups
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Quick Stats */}
            <Card className="shadow-sm mt-3">
              <Card.Body>
                <h6 className="card-title mb-3">
                  <i className="bi bi-graph-up text-primary me-2"></i>
                  Impact Summary
                </h6>
                <div className="row text-center">
                  <div className="col-6">
                    <div className="p-2 border-end">
                      <div className="h3 text-danger mb-0">
                        <i className="bi bi-heart-fill me-1"></i>
                        {profileData.totalDonations}
                      </div>
                      <small className="text-muted">Total Donations</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2">
                      <div className="h3 text-success mb-0">
                        <i className="bi bi-people-fill me-1"></i>
                        {profileData.lifeSaved}
                      </div>
                      <small className="text-muted">Lives Impacted</small>
                    </div>
                  </div>
                </div>
                <hr className="my-3" />
                <div className="row text-center">
                  <div className="col-6">
                    <div className="p-1">
                      <div className="h6 text-info mb-0">{profileData.bloodRequests}</div>
                      <small className="text-muted">Blood Requests</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-1">
                      <div className="h6 text-warning mb-0">
                        {new Date().getFullYear() - new Date(profileData.registrationDate).getFullYear()}
                      </div>
                      <small className="text-muted">Years Active</small>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Membership Status */}
            <Card className="shadow-sm mt-3">
              <Card.Body>
                <h6 className="card-title mb-3">
                  <i className="bi bi-shield-check text-success me-2"></i>
                  Membership Status
                </h6>
                <div className="text-center">
                  <div className="mb-2">
                    <Badge bg="success" className="px-3 py-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Active Donor
                    </Badge>
                  </div>
                  <small className="text-muted d-block">
                    Member since {new Date(profileData.registrationDate).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </small>
                  <hr className="my-3" />
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">Donation Level:</small>
                    <Badge bg={profileData.totalDonations >= 10 ? 'warning' : profileData.totalDonations >= 5 ? 'info' : 'secondary'}>
                      {profileData.totalDonations >= 10 ? 'Gold' : profileData.totalDonations >= 5 ? 'Silver' : 'Bronze'}
                    </Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            {/* Main Content Tabs */}
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Profile Details</h5>
                  <Button 
                    variant="primary" 
                    onClick={handleEditProfile}
                    className="px-3"
                  >
                    <i className="bi bi-pencil me-2"></i>Edit Profile
                  </Button>
                </div>
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
                  <Tab eventKey="overview" title="Overview">
                    <Row>
                      <Col md={6}>
                        <Card className="border-0 bg-light mb-3">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="text-primary mb-0">
                                <i className="bi bi-person-fill me-2"></i>Personal Information
                              </h6>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={handleEditProfile}
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                            </div>
                            <p><strong>Name:</strong> {formatValue(profileData.name)}</p>
                            <p><strong>Age:</strong> {typeof profileData.age === 'number' ? `${profileData.age} years` : formatValue(profileData.age)}</p>
                            <p><strong>Weight:</strong> {formatValue(profileData.weight, 'kg')}</p>
                            <p><strong>Height:</strong> {formatValue(profileData.height, 'cm')}</p>
                            <p><strong>Phone:</strong> {formatValue(profileData.phone)}</p>
                            <p><strong>Address:</strong> {formatValue(profileData.address)}</p>
                            <p><strong>Emergency Contact:</strong> {formatValue(profileData.emergencyContact)}</p>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="border-0 bg-light mb-3">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="text-danger mb-0">
                                <i className="bi bi-droplet-half me-2"></i>Blood Information
                              </h6>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={handleEditProfile}
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                            </div>
                            <div className="mb-3">
                              <strong>Blood Group:</strong> 
                              <Badge bg={getBloodGroupBadgeColor(profileData.bloodGroup)} className="ms-2 fs-6">
                                {formatValue(profileData.bloodGroup)}
                              </Badge>
                            </div>
                            <p><strong>Last Donation:</strong> {formatValue(profileData.lastDonation)}</p>
                            <p><strong>Next Eligible:</strong> {formatValue(profileData.nextEligibleDate)}</p>
                            <p><strong>Total Donations:</strong> {profileData.totalDonations || 0}</p>
                            <p><strong>Eligibility Status:</strong> 
                              <Badge bg={getDaysUntilEligible() === 0 ? 'success' : 'warning'} className="ms-2">
                                {getDaysUntilEligible() === 0 ? 'Eligible Now!' : `${getDaysUntilEligible()} days remaining`}
                              </Badge>
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    {/* Blood Compatibility Section */}
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <h6 className="text-success mb-3">
                          <i className="bi bi-heart-pulse-fill me-2"></i>Blood Compatibility Chart
                        </h6>
                        <Row>
                          <Col md={6}>
                            <div className="p-3 bg-white rounded">
                              <h6 className="text-success mb-2">
                                <i className="bi bi-arrow-right-circle me-1"></i>Can Donate To:
                              </h6>
                              <div className="d-flex flex-wrap gap-1">
                                {profileData.bloodGroup ? getCompatibleBloodGroups(profileData.bloodGroup).canDonateTo.map((group, index) => (
                                  <Badge key={index} bg={getBloodGroupBadgeColor(group)} className="me-1 mb-1">
                                    {group}
                                  </Badge>
                                )) : <span className="text-muted">Blood group not specified</span>}
                              </div>
                              <small className="text-muted d-block mt-2">
                                {profileData.bloodGroup ? `You can help ${getCompatibleBloodGroups(profileData.bloodGroup).canDonateTo.length} blood group(s)` : 'Please specify your blood group'}
                              </small>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="p-3 bg-white rounded">
                              <h6 className="text-info mb-2">
                                <i className="bi bi-arrow-left-circle me-1"></i>Can Receive From:
                              </h6>
                              <div className="d-flex flex-wrap gap-1">
                                {profileData.bloodGroup ? getCompatibleBloodGroups(profileData.bloodGroup).canReceiveFrom.map((group, index) => (
                                  <Badge key={index} bg={getBloodGroupBadgeColor(group)} className="me-1 mb-1">
                                    {group}
                                  </Badge>
                                )) : <span className="text-muted">Blood group not specified</span>}
                              </div>
                              <small className="text-muted d-block mt-2">
                                {profileData.bloodGroup ? `You can receive from ${getCompatibleBloodGroups(profileData.bloodGroup).canReceiveFrom.length} blood group(s)` : 'Please specify your blood group'}
                              </small>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Tab>

                  <Tab eventKey="donations" title="Donation History">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6>My Donations ({donationHistory.length})</h6>
                      <Button 
                        as={Link} 
                        to="/donate" 
                        variant="danger" 
                        size="sm"
                      >
                        <i className="bi bi-plus-circle me-2"></i>Schedule Donation
                      </Button>
                    </div>
                    {donationHistory.length > 0 ? (
                      <Table responsive striped>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Location</th>
                            <th>Amount</th>
                            <th>Health Stats</th>
                            <th>Recipient</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donationHistory.map((donation) => (
                            <tr key={donation.id}>
                              <td>
                                <div className="fw-semibold">{donation.date}</div>
                              </td>
                              <td>{donation.location}</td>
                              <td>
                                <Badge bg="primary">{donation.amount}</Badge>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {donation.bloodPressure && `BP: ${donation.bloodPressure}`}<br/>
                                  {donation.hemoglobin && `Hb: ${donation.hemoglobin}`}<br/>
                                  {donation.weight && `Weight: ${donation.weight}`}
                                </small>
                              </td>
                              <td>
                                <small className="text-primary">{donation.recipient || 'N/A'}</small>
                              </td>
                              <td>
                                <Badge bg="success">{donation.status}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="text-center py-4">
                        <i className="bi bi-heart text-muted" style={{ fontSize: '3rem' }}></i>
                        <h6 className="mt-3">No Donations Yet</h6>
                        <p className="text-muted">Your donation history will appear here once you start donating.</p>
                        <Button 
                          as={Link} 
                          to="/donate" 
                          variant="danger"
                        >
                          <i className="bi bi-plus-circle me-2"></i>Schedule Your First Donation
                        </Button>
                      </div>
                    )}
                  </Tab>

                  <Tab eventKey="requests" title="Blood Requests">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6>My Requests ({requestHistory.length})</h6>
                      <Button 
                        as={Link} 
                        to="/request" 
                        variant="warning" 
                        size="sm"
                      >
                        <i className="bi bi-plus-circle me-2"></i>New Request
                      </Button>
                    </div>
                    {requestHistory.length > 0 ? (
                      <Table responsive striped>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Blood Group</th>
                            <th>Amount</th>
                            <th>Hospital</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requestHistory.map((request) => (
                            <tr key={request.id}>
                              <td>{request.date}</td>
                              <td>
                                <Badge bg={getBloodGroupBadgeColor(request.bloodGroup)}>
                                  {request.bloodGroup}
                                </Badge>
                              </td>
                              <td>{request.amount}</td>
                              <td>{request.hospital}</td>
                              <td>
                                <Badge bg="success">{request.status}</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="text-center py-4">
                        <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                        <p className="text-muted mt-2">No blood requests yet</p>
                      </div>
                    )}
                  </Tab>

                  <Tab eventKey="medical" title="Medical History">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">Medical Information</h6>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={handleEditProfile}
                      >
                        <i className="bi bi-pencil me-1"></i>Edit Medical Info
                      </Button>
                    </div>
                    <Row>
                      <Col md={6}>
                        <Card className="border-0 bg-light mb-3">
                          <Card.Body>
                            <h6 className="text-warning">
                              <i className="bi bi-exclamation-triangle me-2"></i>Allergies
                            </h6>
                            {profileData.medicalHistory.allergies.length > 0 ? (
                              <div>
                                {profileData.medicalHistory.allergies.map((allergy, index) => (
                                  <Badge key={index} bg="warning" text="dark" className="me-1 mb-1">
                                    {allergy}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-success">
                                <i className="bi bi-check-circle me-1"></i>No known allergies
                              </p>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="border-0 bg-light mb-3">
                          <Card.Body>
                            <h6 className="text-info">
                              <i className="bi bi-prescription2 me-2"></i>Current Medications
                            </h6>
                            {profileData.medicalHistory.currentMedications.length > 0 ? (
                              <ul className="list-unstyled">
                                {profileData.medicalHistory.currentMedications.map((medication, index) => (
                                  <li key={index} className="mb-1">
                                    <i className="bi bi-pill me-2 text-primary"></i>
                                    {medication}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-success">
                                <i className="bi bi-check-circle me-1"></i>No current medications
                              </p>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={12}>
                        <Card className="border-0 bg-light mb-3">
                          <Card.Body>
                            <h6 className="text-danger">
                              <i className="bi bi-heart-pulse me-2"></i>Chronic Conditions
                            </h6>
                            {profileData.medicalHistory.chronicConditions.length > 0 ? (
                              <ul className="list-unstyled">
                                {profileData.medicalHistory.chronicConditions.map((condition, index) => (
                                  <li key={index} className="mb-1">
                                    <i className="bi bi-dot text-danger"></i>
                                    {condition}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-success">
                                <i className="bi bi-check-circle me-1"></i>No chronic conditions reported
                              </p>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <h6 className="text-success mb-2">
                          <i className="bi bi-shield-check me-2"></i>Donation Eligibility
                        </h6>
                        <div className="d-flex align-items-center">
                          <Badge 
                            bg={profileData.donationEligibility.isEligible ? 'success' : 'danger'} 
                            className="me-2 p-2"
                          >
                            <i className={`bi ${profileData.donationEligibility.isEligible ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                            {profileData.donationEligibility.isEligible ? 'Eligible to Donate' : 'Not Eligible'}
                          </Badge>
                          {!profileData.donationEligibility.isEligible && (
                            <small className="text-muted">
                              Next eligible: {profileData.donationEligibility.nextEligibleDate}
                            </small>
                          )}
                        </div>
                        {profileData.donationEligibility.reasons.length > 0 && (
                          <div className="mt-2">
                            <small className="text-muted">Reasons:</small>
                            <ul className="small text-muted mb-0">
                              {profileData.donationEligibility.reasons.map((reason, index) => (
                                <li key={index}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    placeholder="Enter first name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    placeholder="Enter last name"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Blood Group</Form.Label>
                  <Form.Select
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Birth Year</Form.Label>
                  <Form.Control
                    type="number"
                    min="1924"
                    max="2006"
                    value={editForm.birthYear}
                    onChange={(e) => setEditForm({...editForm, birthYear: e.target.value})}
                    placeholder="e.g., 1990"
                  />
                  <Form.Text className="text-muted">
                    Age will be calculated automatically
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Weight (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    min="30"
                    max="300"
                    value={editForm.weight}
                    onChange={(e) => setEditForm({...editForm, weight: e.target.value})}
                    placeholder="e.g., 70"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Height (cm)</Form.Label>
                  <Form.Control
                    type="number"
                    min="100"
                    max="250"
                    value={editForm.height}
                    onChange={(e) => setEditForm({...editForm, height: e.target.value})}
                    placeholder="e.g., 175"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Contact</Form.Label>
                  <Form.Control
                    type="tel"
                    value={editForm.emergencyContact}
                    onChange={(e) => setEditForm({...editForm, emergencyContact: e.target.value})}
                    placeholder="Emergency contact number"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={editForm.address}
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    placeholder="Enter your address"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <hr className="my-4" />
            <h6 className="text-primary mb-3">Medical Information</h6>
            
            <Form.Group className="mb-3">
              <Form.Label>Allergies</Form.Label>
              <Form.Control
                type="text"
                placeholder="Separate multiple allergies with commas"
                value={editForm.allergies}
                onChange={(e) => setEditForm({...editForm, allergies: e.target.value})}
              />
              <Form.Text className="text-muted">
                Enter "None" if no allergies
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Current Medications</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="List current medications, separate with commas"
                value={editForm.medications}
                onChange={(e) => setEditForm({...editForm, medications: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Chronic Conditions</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="List any chronic conditions, separate with commas"
                value={editForm.chronicConditions}
                onChange={(e) => setEditForm({...editForm, chronicConditions: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveProfile}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  );
};

export default Profile;
