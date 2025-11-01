import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { AdminPermissions } from '../utils/adminPermissions';

const AccountSettings = () => {
    const { user, firebaseService } = useAuth();
    const [loading, setLoading] = useState(false);
    const [adminUsers, setAdminUsers] = useState([]);
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [newAdminData, setNewAdminData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        department: 'Blood Bank'
    });
    const [changePasswordData, setChangePasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        loadAdminUsers();
    }, []);

    const loadAdminUsers = async () => {
        try {
            setLoading(true);
            const result = await firebaseService.getAdminUsers();
            if (result.success) {
                setAdminUsers(result.data);
            }
        } catch (error) {
            console.error('Failed to load admin users:', error);
            toast.error('Failed to load admin users');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        
        if (!AdminPermissions.canManageAdmins(user)) {
            toast.error('Only Admins can add new admins');
            return;
        }

        if (newAdminData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            const result = await firebaseService.createAdminUser(newAdminData);
            if (result.success) {
                toast.success('Admin user created successfully!');
                setNewAdminData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    phone: '',
                    department: 'Blood Bank'
                });
                setShowAddAdmin(false);
                loadAdminUsers();
            }
        } catch (error) {
            console.error('Failed to create admin:', error);
            toast.error(error.message || 'Failed to create admin user');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAdmin = async (adminId, adminEmail) => {
        if (!AdminPermissions.canManageAdmins(user)) {
            toast.error('Only Admins can delete admin users');
            return;
        }

        if (!AdminPermissions.canDeleteAdmin(user, { email: adminEmail, uid: adminId })) {
            toast.error('Cannot delete your own admin account');
            return;
        }

        if (window.confirm('Are you sure you want to delete this admin user?')) {
            try {
                setLoading(true);
                const result = await firebaseService.deleteAdminUser(adminId);
                if (result.success) {
                    toast.success('Admin user deleted successfully');
                    loadAdminUsers();
                }
            } catch (error) {
                console.error('Failed to delete admin:', error);
                toast.error(error.message || 'Failed to delete admin user');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (changePasswordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            const result = await firebaseService.changePassword(changePasswordData.newPassword);
            if (result.success) {
                toast.success('Password changed successfully!');
                setChangePasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            console.error('Failed to change password:', error);
            toast.error(error.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleNewAdminChange = (e) => {
        const { name, value } = e.target;
        setNewAdminData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setChangePasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="container-fluid px-4 py-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-black mb-0">Account Settings</h4>
                <span className="badge bg-info">
                    {adminUsers.length} Admin{adminUsers.length !== 1 ? 's' : ''} Total
                </span>
            </div>

            <div className="row">
                {/* Admin Management */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="bi bi-people me-2 text-red"></i>
                                Admin Users ({adminUsers.length})
                            </h5>
                            {AdminPermissions.canManageAdmins(user) && (
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => setShowAddAdmin(true)}
                                >
                                    <i className="bi bi-plus-circle me-1"></i>
                                    Add Admin
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            {loading && adminUsers.length === 0 ? (
                                <div className="text-center py-3">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Admin</th>
                                                <th>Email</th>
                                                <th>Type</th>
                                                <th>Department</th>
                                                <th>Status</th>
                                                {AdminPermissions.canManageAdmins(user) && <th>Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {adminUsers.map((admin) => (
                                                <tr key={admin.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2" 
                                                                 style={{ width: '40px', height: '40px' }}>
                                                                {`${admin.firstName?.[0] || ''}${admin.lastName?.[0] || ''}`}
                                                            </div>
                                                            <div>
                                                                <div className="fw-semibold">{admin.firstName} {admin.lastName}</div>
                                                                <small className="text-muted">{admin.phone}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{admin.email}</td>
                                                    <td>
                                                        <span className={`badge ${AdminPermissions.getAdminTypeBadgeClass({ adminType: admin.adminType })}`}>
                                                            {AdminPermissions.getAdminTypeDisplay({ adminType: admin.adminType })}
                                                        </span>
                                                    </td>
                                                    <td>{admin.department}</td>
                                                    <td>
                                                        <span className={`badge ${admin.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                                            {admin.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    {AdminPermissions.canManageAdmins(user) && (
                                                        <td>
                                                            {AdminPermissions.canDeleteAdmin(user, admin) && (
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                                                                    disabled={loading}
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Admin Form */}
                    {showAddAdmin && AdminPermissions.canManageAdmins(user) && (
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <i className="bi bi-person-plus me-2 text-red"></i>
                                    Add New Admin
                                </h5>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setShowAddAdmin(false)}
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleAddAdmin}>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">First Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="firstName"
                                                value={newAdminData.firstName}
                                                onChange={handleNewAdminChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Last Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="lastName"
                                                value={newAdminData.lastName}
                                                onChange={handleNewAdminChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                value={newAdminData.email}
                                                onChange={handleNewAdminChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                name="password"
                                                value={newAdminData.password}
                                                onChange={handleNewAdminChange}
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Phone</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                name="phone"
                                                value={newAdminData.phone}
                                                onChange={handleNewAdminChange}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Department</label>
                                            <select
                                                className="form-select"
                                                name="department"
                                                value={newAdminData.department}
                                                onChange={handleNewAdminChange}
                                            >
                                                <option value="Blood Bank">Blood Bank</option>
                                                <option value="Laboratory">Laboratory</option>
                                                <option value="Administration">Administration</option>
                                                <option value="Medical">Medical</option>
                                                <option value="IT Support">IT Support</option>
                                            </select>
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
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-plus-circle me-2"></i>
                                                Create Admin
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                {/* Password Change & Account Info */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="bi bi-lock me-2 text-red"></i>
                                Change Password
                            </h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleChangePassword}>
                                <div className="mb-3">
                                    <label className="form-label">Current Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="currentPassword"
                                        value={changePasswordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="newPassword"
                                        value={changePasswordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="confirmPassword"
                                        value={changePasswordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-warning w-100"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-shield-lock me-2"></i>
                                            Update Password
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="bi bi-info-circle me-2 text-red"></i>
                                Account Information
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="fw-bold">Your Admin Type</label>
                                <div>
                                    <span className={`badge ${AdminPermissions.getAdminTypeBadgeClass(user)}`}>
                                        {AdminPermissions.getAdminTypeDisplay(user)}
                                    </span>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="fw-bold">Total Admins</label>
                                <div className="h5 text-primary">{adminUsers.length}</div>
                            </div>
                            <div className="mb-3">
                                <label className="fw-bold">Admin Users</label>
                                <div className="h5 text-info">
                                    {adminUsers.filter(admin => admin.adminType === 'admin').length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
