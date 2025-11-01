import React, { useState } from 'react';

const Requirements = () => {
  const [requirements, setRequirements] = useState([]);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'text-red-800 bg-red-100';
      case 'high': return 'text-orange-800 bg-orange-100';
      case 'medium': return 'text-yellow-800 bg-yellow-100';
      case 'low': return 'text-green-800 bg-green-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-orange-800 bg-orange-100';
      case 'fulfilled': return 'text-green-800 bg-green-100';
      case 'cancelled': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="h3 text-black fw-bold mb-2">Blood Requirements</h2>
          <p className="text-muted">Track and manage blood requests from hospitals</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-danger me-2">
            <i className="bi bi-plus-lg me-2"></i>
            New Request
          </button>
          <button className="btn btn-outline-dark">
            <i className="bi bi-funnel me-2"></i>
            Filter
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-red-100 p-3 rounded">
                    <i className="bi bi-exclamation-triangle-fill text-red-600 fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Critical Requests</h6>
                  <h3 className="text-black mb-0">
                    {requirements.filter(req => req.urgency === 'critical' && req.status === 'pending').length}
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
                    <i className="bi bi-clock-fill text-orange-600 fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Pending Requests</h6>
                  <h3 className="text-black mb-0">
                    {requirements.filter(req => req.status === 'pending').length}
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
                  <div className="bg-green-100 p-3 rounded">
                    <i className="bi bi-check-circle-fill text-green-600 fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Fulfilled Today</h6>
                  <h3 className="text-black mb-0">
                    {requirements.filter(req => req.status === 'fulfilled').length}
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
                  <h6 className="text-muted mb-1">Total Units</h6>
                  <h3 className="text-black mb-0">
                    {requirements.reduce((total, req) => total + req.unitsNeeded, 0)}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Table */}
      <div className="row">
        <div className="col">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0 text-black">Blood Requests</h5>
            </div>
            <div className="card-body p-0">
              {requirements.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-clipboard-heart text-muted" style={{fontSize: '3rem'}}></i>
                  <h5 className="text-muted mt-3">No blood requirements found</h5>
                  <p className="text-muted">Blood requirement requests will appear here when hospitals submit them</p>
                  <button className="btn btn-danger">
                    <i className="bi bi-plus-lg me-2"></i>
                    Create First Request
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 text-black">Patient</th>
                        <th className="border-0 text-black">Blood Type</th>
                        <th className="border-0 text-black">Units Needed</th>
                        <th className="border-0 text-black">Urgency</th>
                        <th className="border-0 text-black">Hospital</th>
                        <th className="border-0 text-black">Required By</th>
                        <th className="border-0 text-black">Status</th>
                        <th className="border-0 text-black">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requirements.map((req) => (
                        <tr key={req.id}>
                          <td>
                            <div>
                              <span className="fw-bold text-black">{req.patientName}</span>
                              <br />
                              <small className="text-muted">ID: {req.id}</small>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-red-100 p-2 rounded me-2">
                                <i className="bi bi-droplet-fill text-red-600"></i>
                              </div>
                              <span className="fw-bold text-black">{req.bloodType}</span>
                            </div>
                          </td>
                          <td>
                            <span className="text-black fw-semibold">{req.unitsNeeded} units</span>
                          </td>
                          <td>
                            <span className={`px-3 py-1 rounded-pill small fw-semibold ${getUrgencyColor(req.urgency)}`}>
                              {req.urgency.charAt(0).toUpperCase() + req.urgency.slice(1)}
                            </span>
                          </td>
                          <td>
                            <span className="text-black">{req.hospital}</span>
                          </td>
                          <td>
                            <span className="text-black">{new Date(req.requiredBy).toLocaleDateString()}</span>
                          </td>
                          <td>
                            <span className={`px-3 py-1 rounded-pill small fw-semibold ${getStatusColor(req.status)}`}>
                              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              {req.status === 'pending' && (
                                <button className="btn btn-sm btn-danger">
                                  <i className="bi bi-check-lg"></i>
                                </button>
                              )}
                              <button className="btn btn-sm btn-outline-dark">
                                <i className="bi bi-eye"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-dark">
                                <i className="bi bi-pencil"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requirements;
