import React, { useState } from 'react';
import { Modal, Button, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import firebaseService from '../../firebase/firebaseService';

const DonationList = ({ donations = [], onRefresh }) => {
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [statusNotes, setStatusNotes] = useState('');

    // Handle status update
    const handleStatusUpdate = (donation) => {
        setSelectedDonation(donation);
        setNewStatus(donation.status || 'scheduled');
        setStatusNotes('');
        setShowStatusModal(true);
    };

    // Handle view details
    const handleViewDetails = (donation) => {
        setSelectedDonation(donation);
        setShowDetailsModal(true);
    };

    // Save status update
    const handleSaveStatus = async () => {
        try {
            await firebaseService.updateDonation(selectedDonation.id, {
                status: newStatus,
                ...(statusNotes && { statusNotes })
            });
            toast.success('Donation status updated successfully');
            setShowStatusModal(false);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Error updating donation:', error);
            toast.error('Failed to update donation status');
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            scheduled: { bg: 'primary', icon: 'calendar-check' },
            completed: { bg: 'success', icon: 'check-circle-fill' },
            cancelled: { bg: 'danger', icon: 'x-circle-fill' },
            pending: { bg: 'warning', icon: 'clock-fill' }
        };
        
        const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
        
        return (
            <Badge bg={config.bg}>
                <i className={`bi bi-${config.icon} me-1`}></i>
                {status || 'Pending'}
            </Badge>
        );
    };

    if (!donations || donations.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                <h5 className="text-muted mt-3">No donations found</h5>
                <p className="text-muted">Donation records will appear here</p>
            </div>
        );
    }

    return (
        <>
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead className="table-light">
                        <tr>
                            <th>Donor Details</th>
                            <th>Blood Group</th>
                            <th>Donation Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donations.map(donation => (
                            <tr key={donation.id}>
                                <td>
                                    <div className="fw-semibold">
                                        {donation.donorDetails?.name || donation.donorName || 'N/A'}
                                    </div>
                                    <small className="text-muted">
                                        {donation.donorDetails?.email || donation.email || 'N/A'}
                                    </small>
                                </td>
                                <td>
                                    <Badge bg="danger" className="fs-6">
                                        {donation.donorDetails?.bloodGroup || donation.bloodGroup || 'N/A'}
                                    </Badge>
                                </td>
                                <td>
                                    {donation.donationDate || donation.createdAt
                                        ? new Date(donation.donationDate || donation.createdAt).toLocaleDateString()
                                        : 'N/A'}
                                </td>
                                <td>
                                    {getStatusBadge(donation.status)}
                                </td>
                                <td>
                                    <div className="btn-group" role="group">
                                        <button 
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleViewDetails(donation)}
                                            title="View Details"
                                        >
                                            <i className="bi bi-eye"></i>
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => handleStatusUpdate(donation)}
                                            title="Update Status"
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Status Update Modal */}
            <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Donation Status</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDonation && (
                        <>
                            <div className="mb-3">
                                <p className="mb-1">
                                    <strong>Donor:</strong> {selectedDonation.donorDetails?.name || selectedDonation.donorName}
                                </p>
                                <p className="mb-0">
                                    <strong>Blood Group:</strong> <Badge bg="danger">
                                        {selectedDonation.donorDetails?.bloodGroup || selectedDonation.bloodGroup}
                                    </Badge>
                                </p>
                            </div>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        required
                                    >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="pending">Pending</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Notes (Optional)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Add notes about this status change..."
                                        value={statusNotes}
                                        onChange={(e) => setStatusNotes(e.target.value)}
                                    />
                                </Form.Group>
                            </Form>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveStatus}>
                        <i className="bi bi-save me-2"></i>
                        Update Status
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Donation Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDonation && (
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <h6 className="text-muted mb-1">Donor Name</h6>
                                <p className="mb-0 fw-semibold">
                                    {selectedDonation.donorDetails?.name || selectedDonation.donorName || 'N/A'}
                                </p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h6 className="text-muted mb-1">Blood Group</h6>
                                <p className="mb-0">
                                    <Badge bg="danger" className="fs-6">
                                        {selectedDonation.donorDetails?.bloodGroup || selectedDonation.bloodGroup || 'N/A'}
                                    </Badge>
                                </p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h6 className="text-muted mb-1">Email</h6>
                                <p className="mb-0">{selectedDonation.donorDetails?.email || selectedDonation.email || 'N/A'}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h6 className="text-muted mb-1">Phone</h6>
                                <p className="mb-0">{selectedDonation.donorDetails?.phone || selectedDonation.phone || 'N/A'}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h6 className="text-muted mb-1">Donation Date</h6>
                                <p className="mb-0">
                                    {selectedDonation.donationDate || selectedDonation.createdAt
                                        ? new Date(selectedDonation.donationDate || selectedDonation.createdAt).toLocaleString()
                                        : 'N/A'}
                                </p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <h6 className="text-muted mb-1">Status</h6>
                                <p className="mb-0">{getStatusBadge(selectedDonation.status)}</p>
                            </div>
                            {selectedDonation.medicalConditions && (
                                <div className="col-md-12 mb-3">
                                    <h6 className="text-muted mb-1">Medical Conditions</h6>
                                    <p className="mb-0">{selectedDonation.medicalConditions}</p>
                                </div>
                            )}
                            {selectedDonation.statusNotes && (
                                <div className="col-md-12 mb-3">
                                    <h6 className="text-muted mb-1">Status Notes</h6>
                                    <p className="mb-0">{selectedDonation.statusNotes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default DonationList;