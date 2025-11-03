import React, { useEffect, useState } from 'react';
import DonationList from '../admin-components/donations/DonationList';
import DonationForm from '../admin-components/donations/DonationForm';
import firebaseService from '../firebase/firebaseService';

const Donations = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        thisMonth: 0,
        completed: 0,
        scheduled: 0
    });

    useEffect(() => {
        getDonations();
    }, []);

    const getDonations = async () => {
        try {
            setLoading(true);
            const data = await firebaseService.getDonations();
            
            if (data && data.length > 0) {
                setDonations(data);
                
                // Calculate stats
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                
                const statsData = {
                    total: data.length,
                    thisMonth: data.filter(donation => {
                        if (!donation.createdAt) return false;
                        const donationDate = new Date(donation.createdAt);
                        return donationDate.getMonth() === currentMonth && 
                               donationDate.getFullYear() === currentYear;
                    }).length,
                    completed: data.filter(donation => donation.status === 'completed').length,
                    scheduled: data.filter(donation => donation.status === 'scheduled').length
                };
                setStats(statsData);
            } else {
                setDonations([]);
                setStats({ total: 0, thisMonth: 0, completed: 0, scheduled: 0 });
            }
        } catch (error) {
            console.error('Error fetching donations:', error);
            setDonations([]);
            setStats({ total: 0, thisMonth: 0, completed: 0, scheduled: 0 });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col">
                    <h2 className="h3 text-black fw-bold mb-2">Manage Donations</h2>
                    <p className="text-muted">Track and manage blood donation records</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="row mb-4">
                <div className="col-xl-3 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <div className="bg-blue-100 p-3 rounded">
                                        <i className="bi bi-heart-fill text-blue-600 fs-4"></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="text-muted mb-1">Total Donations</h6>
                                    <h3 className="text-black mb-0">{stats.total}</h3>
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
                                        <i className="bi bi-calendar-month text-green-600 fs-4"></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="text-muted mb-1">This Month</h6>
                                    <h3 className="text-black mb-0">{stats.thisMonth}</h3>
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
                                    <h6 className="text-muted mb-1">Completed</h6>
                                    <h3 className="text-black mb-0">{stats.completed}</h3>
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
                                        <i className="bi bi-clock-fill text-yellow-600 fs-4"></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="text-muted mb-1">Scheduled</h6>
                                    <h3 className="text-black mb-0">{stats.scheduled}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <DonationForm onDonationAdded={getDonations} />
            <DonationList donations={donations} onRefresh={getDonations} />
        </div>
    );
};

export default Donations;