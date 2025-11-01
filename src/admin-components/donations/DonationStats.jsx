import React, { useEffect, useState } from 'react';
import { getDonationStats } from '../../admin-services/donationService';

const DonationStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDonationStats();
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Donation Statistics</h2>
            <ul>
                <li>Total Donations: {stats.totalDonations}</li>
                <li>Donors This Month: {stats.donorsThisMonth}</li>
                <li>Average Donation per Donor: {stats.averageDonation}</li>
            </ul>
        </div>
    );
};

export default DonationStats;