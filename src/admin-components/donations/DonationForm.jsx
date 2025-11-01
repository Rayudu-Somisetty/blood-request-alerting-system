import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import donationService from '../../admin-services/donationService';

const DonationForm = ({ donation }) => {
    const [formData, setFormData] = useState({
        donorName: donation ? donation.donorName : '',
        bloodType: donation ? donation.bloodType : '',
        donationDate: donation ? donation.donationDate : '',
        quantity: donation ? donation.quantity : '',
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (donation) {
                await donationService.updateDonation(donation._id, formData);
            } else {
                await donationService.createDonation(formData);
            }
            navigate('/donations');
        } catch (error) {
            console.error('Error saving donation:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Donor Name:</label>
                <input
                    type="text"
                    name="donorName"
                    value={formData.donorName}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Blood Type:</label>
                <input
                    type="text"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Donation Date:</label>
                <input
                    type="date"
                    name="donationDate"
                    value={formData.donationDate}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>Quantity (in liters):</label>
                <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit">{donation ? 'Update Donation' : 'Add Donation'}</button>
        </form>
    );
};

export default DonationForm;