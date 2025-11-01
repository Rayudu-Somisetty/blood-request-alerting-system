import React, { useEffect, useState } from 'react';
import donationService from '../../admin-services/donationService';

const DonationList = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const data = await donationService.getAllDonations();
                setDonations(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDonations();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Donation List</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Donor Name</th>
                        <th>Donation Date</th>
                        <th>Blood Type</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {donations.map(donation => (
                        <tr key={donation._id}>
                            <td>{donation._id}</td>
                            <td>{donation.donorName}</td>
                            <td>{new Date(donation.donationDate).toLocaleDateString()}</td>
                            <td>{donation.bloodType}</td>
                            <td>{donation.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DonationList;