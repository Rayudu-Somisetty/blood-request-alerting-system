import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminPermissions } from '../utils/adminPermissions';
import firebaseService from '../firebase/firebaseService';

const BloodDrives = () => {
  const [bloodDrives, setBloodDrives] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    targetUnits: '',
    description: '',
    organizer: ''
  });
  const { currentUser } = useAuth();

  // Load campaigns on component mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const campaigns = await firebaseService.getBloodCampaigns();
      setBloodDrives(campaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!AdminPermissions.isAdmin(currentUser)) {
      alert('Only Admins can create campaigns');
      return;
    }

    try {
      setLoading(true);
      const campaignData = {
        ...formData,
        targetUnits: parseInt(formData.targetUnits),
        collectedUnits: 0,
        registeredDonors: 0,
        status: 'upcoming',
        createdBy: currentUser.email,
        createdAt: new Date()
      };

      await firebaseService.createBloodCampaign(campaignData);
      setShowModal(false);
      setFormData({
        name: '',
        location: '',
        date: '',
        startTime: '',
        endTime: '',
        targetUnits: '',
        description: '',
        organizer: ''
      });
      await loadCampaigns();
      alert('Campaign created successfully!');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      name: '',
      location: '',
      date: '',
      startTime: '',
      endTime: '',
      targetUnits: '',
      description: '',
      organizer: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-800 bg-green-100';
      case 'upcoming': return 'text-orange-800 bg-orange-100';
      case 'completed': return 'text-gray-800 bg-gray-100';
      case 'cancelled': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getProgressPercentage = (collected, target) => {
    return Math.min((collected / target) * 100, 100);
  };

  const getCampaignStatus = (campaign) => {
    const today = new Date();
    const campaignDate = new Date(campaign.date);
    
    if (campaignDate < today) {
      return 'completed';
    } else if (campaignDate.toDateString() === today.toDateString()) {
      return 'active';
    } else {
      return 'upcoming';
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="h3 text-black fw-bold mb-2">Manage Blood Campaigns</h2>
          <p className="text-muted">Organize and track blood donation campaigns</p>
        </div>
        <div className="col-auto">
          {AdminPermissions.isAdmin(currentUser) ? (
            <>
              <button 
                className="btn btn-danger me-2"
                onClick={() => setShowModal(true)}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Schedule Campaign
              </button>
              <button className="btn btn-outline-dark">
                <i className="bi bi-calendar-week me-2"></i>
                Calendar View
              </button>
            </>
          ) : (
            <small className="text-muted">Only Admins can create campaigns</small>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 p-3 rounded">
                    <i className="bi bi-calendar-check-fill text-green-600 fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Active Campaigns</h6>
                  <h3 className="text-black mb-0">
                    {bloodDrives.filter(drive => getCampaignStatus(drive) === 'active').length}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-orange-100 p-3 rounded">
                    <i className="bi bi-calendar-event-fill text-orange-600 fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Upcoming Campaigns</h6>
                  <h3 className="text-black mb-0">
                    {bloodDrives.filter(drive => getCampaignStatus(drive) === 'upcoming').length}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-red-100 p-3 rounded">
                    <i className="bi bi-people-fill text-red-600 fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Donors</h6>
                  <h3 className="text-black mb-0">
                    {bloodDrives.reduce((total, drive) => total + drive.registeredDonors, 0)}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-yellow-100 p-3 rounded">
                    <i className="bi bi-droplet-fill text-yellow-600 fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Units Collected</h6>
                  <h3 className="text-black mb-0">
                    {bloodDrives.reduce((total, drive) => total + drive.collectedUnits, 0)}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blood Campaigns Grid */}
      <div className="row">
        {bloodDrives.length === 0 ? (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-calendar-event text-muted" style={{fontSize: '3rem'}}></i>
                <h5 className="text-muted mt-3">No blood campaigns scheduled</h5>
                <p className="text-muted">
                  {AdminPermissions.isAdmin(currentUser) 
                    ? "Create and manage blood donation campaigns to organize community events"
                    : "Blood campaigns will appear here when scheduled by Admins"}
                </p>
                {AdminPermissions.isAdmin(currentUser) && (
                  <button 
                    className="btn btn-danger"
                    onClick={() => setShowModal(true)}
                  >
                    <i className="bi bi-plus-lg me-2"></i>
                    Schedule First Campaign
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          bloodDrives.map((drive) => (
            <div key={drive.id} className="col-lg-6 col-xl-4 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-bottom-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="card-title mb-0 text-black fw-bold">{drive.name}</h6>
                    <span className={`px-2 py-1 rounded small fw-semibold ${getStatusColor(getCampaignStatus(drive))}`}>
                      {getCampaignStatus(drive).charAt(0).toUpperCase() + getCampaignStatus(drive).slice(1)}
                    </span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-geo-alt-fill text-red-600 me-2"></i>
                      <small className="text-muted">{drive.location}</small>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-calendar-fill text-red-600 me-2"></i>
                      <small className="text-muted">
                        {new Date(drive.date).toLocaleDateString()} | {drive.startTime} - {drive.endTime}
                      </small>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person-fill text-red-600 me-2"></i>
                      <small className="text-muted">{drive.organizer}</small>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted">Collection Progress</small>
                      <small className="text-black fw-semibold">
                        {drive.collectedUnits}/{drive.targetUnits} units
                      </small>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-danger" 
                        style={{ width: `${getProgressPercentage(drive.collectedUnits, drive.targetUnits)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="border-end">
                        <h6 className="text-black mb-0">{drive.registeredDonors}</h6>
                        <small className="text-muted">Registered</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="border-end">
                        <h6 className="text-black mb-0">{drive.collectedUnits}</h6>
                        <small className="text-muted">Collected</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <h6 className="text-black mb-0">{Math.round(getProgressPercentage(drive.collectedUnits, drive.targetUnits))}%</h6>
                      <small className="text-muted">Complete</small>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-light border-top-0">
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-danger flex-grow-1">
                      <i className="bi bi-eye me-1"></i>
                      View Details
                    </button>
                    {AdminPermissions.isAdmin(currentUser) && (
                      <>
                        <button className="btn btn-sm btn-outline-dark">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-dark">
                          <i className="bi bi-share"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Campaign Creation Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Schedule New Blood Campaign</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">Campaign Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="organizer" className="form-label">Organizer *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="organizer"
                        name="organizer"
                        value={formData.organizer}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">Location *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label htmlFor="date" className="form-label">Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="startTime" className="form-label">Start Time *</label>
                      <input
                        type="time"
                        className="form-control"
                        id="startTime"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="endTime" className="form-label">End Time *</label>
                      <input
                        type="time"
                        className="form-control"
                        id="endTime"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="targetUnits" className="form-label">Target Blood Units *</label>
                    <input
                      type="number"
                      className="form-control"
                      id="targetUnits"
                      name="targetUnits"
                      value={formData.targetUnits}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Optional description about the campaign..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-danger"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-lg me-2"></i>
                        Create Campaign
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodDrives;
