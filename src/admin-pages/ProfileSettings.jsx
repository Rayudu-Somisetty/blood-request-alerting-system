import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { AdminPermissions } from '../utils/adminPermissions';

const ProfileSettings = () => {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        department: '',
        bloodGroup: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                department: user.department || '',
                bloodGroup: user.bloodGroup || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                pincode: user.pincode || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await updateProfile(formData);
            if (result.success) {
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const getAdminTypeBadge = () => {
        const adminType = AdminPermissions.getAdminTypeDisplay(user);
        const badgeClass = AdminPermissions.getAdminTypeBadgeClass(user);
        return <span className={`badge ${badgeClass}`}>{adminType}</span>;
    };

    const getPermissionsList = () => {
        return AdminPermissions.getUserPermissions(user);
    };

    return (
        <div className="container-fluid px-4 py-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-black mb-0">Profile Settings</h4>
                {getAdminTypeBadge()}
            </div>

            <div className="row">
                {/* Profile Information */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="bi bi-person-circle me-2 text-red"></i>
                                Personal Information
                            </h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={user?.email || ''}
                                            disabled
                                            style={{ backgroundColor: '#f8f9fa' }}
                                        />
                                        <small className="text-muted">Email cannot be changed</small>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Department</label>
                                        <select
                                            className="form-select"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Department</option>
                                            <option value="Blood Bank">Blood Bank</option>
                                            <option value="Laboratory">Laboratory</option>
                                            <option value="Administration">Administration</option>
                                            <option value="Medical">Medical</option>
                                            <option value="IT Support">IT Support</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Blood Group</label>
                                        <select
                                            className="form-select"
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Blood Group</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Address</label>
                                    <textarea
                                        className="form-control"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows={3}
                                    ></textarea>
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">City</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">State</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Pincode</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check2 me-2"></i>
                                            Update Profile
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Admin Information */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="bi bi-shield-check me-2 text-red"></i>
                                Admin Information
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Admin Type</label>
                                <div>{getAdminTypeBadge()}</div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Email</label>
                                <div className="text-muted">{user?.email}</div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Account Created</label>
                                <div className="text-muted">
                                    {user?.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">Status</label>
                                <div>
                                    <span className={`badge ${user?.isActive ? 'bg-success' : 'bg-danger'}`}>
                                        {user?.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="bi bi-key me-2 text-red"></i>
                                Permissions
                            </h5>
                        </div>
                        <div className="card-body">
                            <ul className="list-unstyled mb-0">
                                {getPermissionsList().map((permission, index) => (
                                    <li key={index} className="mb-2">
                                        <i className="bi bi-check-circle text-success me-2"></i>
                                        {permission}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
