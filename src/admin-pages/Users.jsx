import React, { useState, useEffect } from 'react';
import firebaseService from '../firebase/firebaseService';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bloodGroup: '',
    status: 'Active',
    city: '',
    state: '',
    address: ''
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const statuses = ['Active', 'Inactive', 'Pending'];

  // Load users from Firebase
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await firebaseService.getUsers();
      
      // Extract the data array from the response
      const userData = response.data || [];
      
      // Filter out admin users - only show regular users/donors
      const nonAdminUsers = userData.filter(user => 
        user.userType !== 'admin' && 
        user.role !== 'admin' &&
        !user.email?.includes('admin@') // Additional safety check
      );
      
      // Ensure userData is an array
      const userArray = Array.isArray(nonAdminUsers) ? nonAdminUsers : [];
      
      // Map Firebase data to match the expected format
      const mappedUsers = userArray.map(user => ({
        id: user.id,
        name: user.fullName || user.name || 'N/A',
        email: user.email || 'N/A',
        phone: user.phone || 'N/A',
        bloodGroup: user.bloodGroup || 'N/A',
        location: user.address || user.location || 'N/A',
        status: user.status || 'Active',
        totalDonations: user.totalDonations || 0,
        lastDonation: user.lastDonation || null,
        userType: user.userType || 'donor',
        createdAt: user.createdAt
      }));
      
      setUsers(mappedUsers);
      setFilteredUsers(mappedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Filter by blood group
    if (selectedBloodGroup !== 'all') {
      filtered = filtered.filter(user => user.bloodGroup === selectedBloodGroup);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        user.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [selectedBloodGroup, selectedStatus, searchTerm, users]);

  const getBloodGroupSummary = () => {
    const summary = {};
    bloodGroups.forEach(group => {
      summary[group] = users.filter(user => 
        user.bloodGroup === group && 
        user.status === 'Active' && 
        user.bloodGroup !== 'N/A'
      ).length;
    });
    return summary;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active': return 'bg-success';
      case 'Inactive': return 'bg-secondary';
      case 'Pending': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  const bloodGroupSummary = getBloodGroupSummary();

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      phone: user.phone || '',
      bloodGroup: user.bloodGroup || '',
      status: user.status || 'Active',
      city: user.location || '',
      state: user.state || '',
      address: user.address || ''
    });
    setShowEditModal(true);
  };

  // Handle delete user
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await firebaseService.deleteUser(selectedUser.id);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Save edited user
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        name: `${editFormData.firstName} ${editFormData.lastName}`,
        fullName: `${editFormData.firstName} ${editFormData.lastName}`,
        phone: editFormData.phone,
        bloodGroup: editFormData.bloodGroup,
        status: editFormData.status,
        location: editFormData.city,
        city: editFormData.city,
        state: editFormData.state,
        address: editFormData.address
      };
      
      await firebaseService.updateUser(selectedUser.id, updateData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  // Handle add new user
  const handleAddUser = () => {
    setEditFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bloodGroup: '',
      status: 'Active',
      city: '',
      state: '',
      address: ''
    });
    setShowAddModal(true);
  };

  // Save new user
  const handleSaveNewUser = async (e) => {
    e.preventDefault();
    try {
      const newUserData = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        name: `${editFormData.firstName} ${editFormData.lastName}`,
        fullName: `${editFormData.firstName} ${editFormData.lastName}`,
        email: editFormData.email,
        phone: editFormData.phone,
        bloodGroup: editFormData.bloodGroup,
        status: editFormData.status,
        location: editFormData.city,
        city: editFormData.city,
        state: editFormData.state,
        address: editFormData.address,
        userType: 'donor',
        role: 'user',
        totalDonations: 0,
        isActive: true,
        isVerified: false
      };
      
      // Note: This would need a proper user creation method
      toast.info('Please use the registration page to create new users');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <i className="bi bi-people-fill text-primary me-2"></i>
              User Management
            </h2>
            <div>
              <button className="btn btn-outline-secondary me-2" onClick={loadUsers} disabled={loading}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </button>
              <button className="btn btn-primary" onClick={handleAddUser}>
                <i className="bi bi-person-plus me-2"></i>
                Add New User
              </button>
            </div>
          </div>
          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Blood Group Summary Cards */}
      <div className="row mb-4">
        <div className="col-12">
          <h5 className="mb-3">Blood Group Availability</h5>
          <div className="row">
            {bloodGroups.map(group => (
              <div key={group} className="col-lg-3 col-md-6 mb-3">
                <div 
                  className={`card h-100 border-0 shadow-sm ${selectedBloodGroup === group ? 'border-primary' : ''}`}
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: selectedBloodGroup === group ? 'scale(1.02)' : 'scale(1)',
                    borderWidth: selectedBloodGroup === group ? '2px' : '0px'
                  }}
                  onClick={() => {
                    if (selectedBloodGroup === group) {
                      setSelectedBloodGroup('all');
                    } else {
                      setSelectedBloodGroup(group);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBloodGroup !== group) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBloodGroup !== group) {
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <div className="card-body text-center">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          backgroundColor: selectedBloodGroup === group ? '#007bff' : (bloodGroupSummary[group] > 0 ? '#28a745' : '#dc3545'),
                          fontSize: '14px',
                          transition: 'background-color 0.3s ease'
                        }}
                      >
                        {group}
                      </div>
                    </div>
                    <h6 className="card-title mb-1">{bloodGroupSummary[group]} Users</h6>
                    <small className={selectedBloodGroup === group ? 'text-primary fw-semibold' : 'text-muted'}>
                      {selectedBloodGroup === group ? 'Click to clear filter' : 'Active Donors'}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-2">
          <select
            className="form-select"
            value={selectedBloodGroup}
            onChange={(e) => setSelectedBloodGroup(e.target.value)}
          >
            <option value="all">All Blood Groups</option>
            {bloodGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
        <div className="col-lg-3 col-md-6 mb-2">
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search users by name, email, phone, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">
                Registered Users ({filteredUsers.length})
              </h6>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h5 className="text-muted mt-3">Loading users...</h5>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-people text-muted" style={{fontSize: '3rem'}}></i>
                  <h5 className="text-muted mt-3">No users found</h5>
                  <p className="text-muted">
                    {users.length === 0 
                      ? "Registered users will appear here when they sign up through your website"
                      : "No users match your current filters. Try adjusting your search criteria."
                    }
                  </p>
                  {users.length === 0 && (
                    <button className="btn btn-primary">
                      <i className="bi bi-person-plus me-2"></i>
                      Add First User
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0">User Details</th>
                        <th className="border-0">Blood Group</th>
                        <th className="border-0">Contact Info</th>
                        <th className="border-0">Status</th>
                        <th className="border-0">Donation History</th>
                        <th className="border-0">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td className="py-3">
                            <div>
                              <div className="fw-semibold">{user.name}</div>
                              <small className="text-muted">{user.email}</small>
                              {user.userType && (
                                <div>
                                  <span className="badge bg-info text-white small mt-1">
                                    {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3">
                            {user.bloodGroup && user.bloodGroup !== 'N/A' ? (
                              <span 
                                className="badge rounded-pill px-3 py-2 text-white fw-semibold"
                                style={{ backgroundColor: '#dc3545', fontSize: '12px' }}
                              >
                                {user.bloodGroup}
                              </span>
                            ) : (
                              <span className="text-muted small">Not specified</span>
                            )}
                          </td>
                          <td className="py-3">
                            <div>
                              <div>
                                <i className="bi bi-telephone me-1"></i>
                                {user.phone !== 'N/A' ? user.phone : 'Not provided'}
                              </div>
                              <small className="text-muted">
                                <i className="bi bi-geo-alt me-1"></i>
                                {user.location !== 'N/A' ? user.location : 'Not provided'}
                              </small>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <div>
                              <div className="fw-semibold">{user.totalDonations || 0} times</div>
                              <small className="text-muted">
                                {user.lastDonation ? `Last: ${user.lastDonation}` : 'No donations yet'}
                              </small>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="btn-group" role="group">
                              <button 
                                className="btn btn-sm btn-outline-primary" 
                                title="View Details"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowViewModal(true);
                                }}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-secondary" 
                                title="Edit"
                                onClick={() => handleEditUser(user)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger" 
                                title="Delete"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <i className="bi bi-trash"></i>
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

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveEdit}>
          <Modal.Body>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    required
                    disabled
                  />
                  <Form.Text className="text-muted">Email cannot be changed</Form.Text>
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Blood Group <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={editFormData.bloodGroup}
                    onChange={(e) => setEditFormData({...editFormData, bloodGroup: e.target.value})}
                    required
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Status <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    required
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({...editFormData, state: e.target.value})}
                  />
                </Form.Group>
              </div>
              <div className="col-md-12 mb-3">
                <Form.Group>
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                  />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <i className="bi bi-save me-2"></i>
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-3">
            <i className="bi bi-exclamation-triangle-fill text-warning" style={{fontSize: '3rem'}}></i>
          </div>
          <h5>Are you sure you want to delete this user?</h5>
          <p className="text-muted mb-0">
            {selectedUser && (
              <>
                <strong>{selectedUser.name}</strong>
                <br />
                {selectedUser.email}
              </>
            )}
          </p>
          <p className="text-danger mt-3">
            <small>This action cannot be undone!</small>
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <i className="bi bi-trash me-2"></i>
            Yes, Delete User
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add User Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveNewUser}>
          <Modal.Body>
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              New users should register through the public registration page. This form is for manual admin entry only.
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>First Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Last Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Blood Group <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={editFormData.bloodGroup}
                    onChange={(e) => setEditFormData({...editFormData, bloodGroup: e.target.value})}
                    required
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                  />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <i className="bi bi-person-plus me-2"></i>
              Add User
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View User Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Full Name</h6>
                <p className="mb-0 fw-semibold">{selectedUser.name}</p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Email</h6>
                <p className="mb-0">{selectedUser.email}</p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Phone</h6>
                <p className="mb-0">
                  <a href={`tel:${selectedUser.phone}`} className="text-decoration-none">
                    <i className="bi bi-telephone me-2"></i>
                    {selectedUser.phone}
                  </a>
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Blood Group</h6>
                <p className="mb-0">
                  <span className="badge bg-danger fs-6">{selectedUser.bloodGroup}</span>
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Location</h6>
                <p className="mb-0">{selectedUser.location}</p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Status</h6>
                <p className="mb-0">
                  <span className={`badge ${getStatusBadgeClass(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Total Donations</h6>
                <p className="mb-0 fw-semibold">{selectedUser.totalDonations} times</p>
              </div>
              <div className="col-md-6 mb-3">
                <h6 className="text-muted mb-1">Last Donation</h6>
                <p className="mb-0">{selectedUser.lastDonation || 'No donations yet'}</p>
              </div>
              <div className="col-md-12 mb-3">
                <h6 className="text-muted mb-1">User Type</h6>
                <p className="mb-0 text-capitalize">{selectedUser.userType}</p>
              </div>
              {selectedUser.createdAt && (
                <div className="col-md-12 mb-3">
                  <h6 className="text-muted mb-1">Member Since</h6>
                  <p className="mb-0">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              setShowViewModal(false);
              handleEditUser(selectedUser);
            }}
          >
            <i className="bi bi-pencil me-2"></i>
            Edit User
          </Button>
          <Button 
            variant="danger" 
            onClick={() => {
              setShowViewModal(false);
              handleDeleteUser(selectedUser);
            }}
          >
            <i className="bi bi-trash me-2"></i>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Users;

