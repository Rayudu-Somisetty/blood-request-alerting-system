import React, { useState, useEffect } from 'react';

const BloodDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonationsData();
  }, []);

  const fetchDonationsData = async () => {
    try {
      // TODO: Replace with actual API call to fetch real donation data
      setDonations([]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching donations data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-dark';
      case 'cancelled': return 'bg-danger text-white';
      case 'in_progress': return 'bg-info text-white';
      default: return 'bg-secondary text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'bi-check-circle-fill';
      case 'pending': return 'bi-clock-fill';
      case 'cancelled': return 'bi-x-circle-fill';
      case 'in_progress': return 'bi-arrow-clockwise';
      default: return 'bi-circle-fill';
    }
  };

  const getDonationTypeColor = (type) => {
    switch (type) {
      case 'whole_blood': return 'bg-red-100 text-red-800';
      case 'plasma': return 'bg-yellow-100 text-yellow-800';
      case 'platelet': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDonationType = (type) => {
    switch (type) {
      case 'whole_blood': return 'Whole Blood';
      case 'plasma': return 'Plasma';
      case 'platelet': return 'Platelet';
      default: return type;
    }
  };

  const isToday = (date) => {
    const today = new Date().toDateString();
    const appointmentDate = new Date(date).toDateString();
    return today === appointmentDate;
  };

  const handleStatusUpdate = (donationId, newStatus) => {
    setDonations(donations.map(donation => 
      donation.id === donationId 
        ? { ...donation, status: newStatus, unitsCollected: newStatus === 'completed' ? 1 : 0 }
        : donation
    ));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="h3 text-black fw-bold mb-2">Blood Donations Management</h2>
          <p className="text-muted">Track and manage blood donation appointments and status</p>
        </div>
        <div className="col-auto">
          <div className="d-flex gap-2">
            <select className="form-select">
              <option>All Status</option>
              <option>Pending</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <select className="form-select">
              <option>All Blood Groups</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>
        </div>
      </div>

      {/* Donations List */}
      <div className="row">
        {donations.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-heart text-muted" style={{fontSize: '3rem'}}></i>
                <h5 className="text-muted mt-3">No donation appointments found</h5>
                <p className="text-muted">Blood donation appointments from your website will appear here</p>
                <button className="btn btn-primary">
                  <i className="bi bi-calendar-plus me-2"></i>
                  Schedule First Appointment
                </button>
              </div>
            </div>
          </div>
        ) : (
          donations.map((donation) => (
            <div key={donation.id} className="col-12 mb-3">
              <div className={`card border-0 shadow-sm ${isToday(donation.appointmentDate) ? 'border-start border-primary border-3' : ''}`}>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-red-100 p-2 rounded me-3">
                          <i className="bi bi-person-heart text-red-600"></i>
                        </div>
                        <div>
                          <h6 className="text-black mb-1 fw-bold">{donation.donorName}</h6>
                          <small className="text-muted">{donation.email}</small>
                          <div className="small text-muted">{donation.contactNumber}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-2">
                      <div className="text-center">
                        <span className="badge bg-red-100 text-red-800 fs-6 mb-1">
                          {donation.bloodGroup}
                        </span>
                        <div className={`badge ${getDonationTypeColor(donation.donationType)} d-block`}>
                          {formatDonationType(donation.donationType)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-2">
                      <div className="text-center">
                        <div className="text-black fw-semibold">
                          {new Date(donation.appointmentDate).toLocaleDateString()}
                        </div>
                        <div className="small text-muted">{donation.appointmentTime}</div>
                        {isToday(donation.appointmentDate) && (
                          <div className="small text-primary fw-bold mt-1">
                            <i className="bi bi-calendar-check me-1"></i>
                            TODAY
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-md-2">
                      <div className="text-center">
                        <span className={`badge ${getStatusColor(donation.status)}`}>
                          <i className={`bi ${getStatusIcon(donation.status)} me-1`}></i>
                          {donation.status.toUpperCase().replace('_', ' ')}
                        </span>
                        {donation.status === 'completed' && (
                          <div className="small text-success mt-1">
                            {donation.unitsCollected} unit collected
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="d-flex gap-2 justify-content-end">
                        {donation.status === 'pending' && (
                          <>
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => handleStatusUpdate(donation.id, 'completed')}
                            >
                              <i className="bi bi-check-circle me-1"></i>
                              Complete
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleStatusUpdate(donation.id, 'cancelled')}
                            >
                              <i className="bi bi-x-circle me-1"></i>
                              Cancel
                            </button>
                          </>
                        )}
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          data-bs-toggle="modal"
                          data-bs-target={`#detailsModal${donation.id}`}
                        >
                          <i className="bi bi-eye me-1"></i>
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Modal */}
              <div className="modal fade" id={`detailsModal${donation.id}`} tabIndex="-1">
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Donation Details - {donation.donorName}</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h6 className="text-black">Donor Information</h6>
                          <table className="table table-borderless">
                            <tbody>
                              <tr>
                                <td className="text-muted">Name:</td>
                                <td className="text-black fw-semibold">{donation.donorName}</td>
                              </tr>
                              <tr>
                                <td className="text-muted">Age:</td>
                                <td className="text-black">{donation.age} years</td>
                              </tr>
                              <tr>
                                <td className="text-muted">Blood Group:</td>
                                <td><span className="badge bg-red-100 text-red-800">{donation.bloodGroup}</span></td>
                              </tr>
                              <tr>
                                <td className="text-muted">Contact:</td>
                                <td className="text-black">{donation.contactNumber}</td>
                              </tr>
                              <tr>
                                <td className="text-muted">Email:</td>
                                <td className="text-black">{donation.email}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="col-md-6">
                          <h6 className="text-black">Donation Information</h6>
                          <table className="table table-borderless">
                            <tbody>
                              <tr>
                                <td className="text-muted">Appointment:</td>
                                <td className="text-black">
                                  {new Date(donation.appointmentDate).toLocaleDateString()} at {donation.appointmentTime}
                                </td>
                              </tr>
                              <tr>
                                <td className="text-muted">Donation Type:</td>
                                <td><span className={`badge ${getDonationTypeColor(donation.donationType)}`}>
                                  {formatDonationType(donation.donationType)}
                                </span></td>
                              </tr>
                              <tr>
                                <td className="text-muted">Status:</td>
                                <td><span className={`badge ${getStatusColor(donation.status)}`}>
                                  {donation.status.toUpperCase().replace('_', ' ')}
                                </span></td>
                              </tr>
                              <tr>
                                <td className="text-muted">Last Donation:</td>
                                <td className="text-black">{new Date(donation.lastDonation).toLocaleDateString()}</td>
                              </tr>
                              <tr>
                                <td className="text-muted">Medical History:</td>
                                <td className="text-black">{donation.medicalHistory}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                      {donation.status === 'pending' && (
                        <button 
                          type="button" 
                          className="btn btn-success"
                          onClick={() => handleStatusUpdate(donation.id, 'completed')}
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Statistics */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0 text-black">Donation Summary</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <h3 className="text-success mb-1">{donations.filter(d => d.status === 'completed').length}</h3>
                  <small className="text-muted">Completed</small>
                </div>
                <div className="col-md-3">
                  <h3 className="text-warning mb-1">{donations.filter(d => d.status === 'pending').length}</h3>
                  <small className="text-muted">Pending</small>
                </div>
                <div className="col-md-3">
                  <h3 className="text-info mb-1">{donations.filter(d => isToday(d.appointmentDate)).length}</h3>
                  <small className="text-muted">Today's Appointments</small>
                </div>
                <div className="col-md-3">
                  <h3 className="text-black mb-1">{donations.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.unitsCollected, 0)}</h3>
                  <small className="text-muted">Total Units Collected</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodDonations;
