const DonationService = require('../models/DonationService');
const { sendEmail } = require('../utils/emailService');

// Create a new donation record
exports.createDonation = async (req, res) => {
    try {
        const donation = await DonationService.create(req.body);
        
        try {
            const donorEmail = donation.donorEmail || req.body.donorEmail;
            const donorName = donation.donorName || req.body.donorName;
            const confirmationMessage = `Dear ${donorName},\n\nThank you for your blood donation!\n\nDonation Details:\nBlood Type: ${donation.bloodType}\nQuantity: ${donation.quantity} units\nDate: ${new Date(donation.donationDate).toLocaleDateString()}\n\nYour donation helps save lives in our community.\n\nBest regards,\nBlood Alert Team`;
            
            if (donorEmail) {
                await sendEmail(
                    donorEmail,
                    'Donation Confirmation - Blood Alert System',
                    confirmationMessage
                );
            }
        } catch (emailError) {
            console.error('Failed to send donation confirmation email:', emailError.message);
        }
        
        res.status(201).json(donation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all donations
exports.getAllDonations = async (req, res) => {
    try {
        const result = await DonationService.getAll();
        res.status(200).json(result.donations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a donation by ID
exports.getDonationById = async (req, res) => {
    try {
        const donation = await DonationService.getById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }
        res.status(200).json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a donation record
exports.updateDonation = async (req, res) => {
    try {
        const donation = await DonationService.update(req.params.id, req.body);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }
        res.status(200).json(donation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a donation record
exports.deleteDonation = async (req, res) => {
    try {
        await DonationService.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get donation statistics
exports.getDonationStats = async (req, res) => {
    try {
        const stats = await DonationService.getStats();
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Public endpoint to provide supported blood types for forms
exports.getAvailableBloodTypes = async (req, res) => {
    try {
        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        res.status(200).json({
            success: true,
            data: bloodTypes
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};