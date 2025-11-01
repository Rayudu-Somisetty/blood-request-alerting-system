const mongoose = require('mongoose');
const Donation = require('../models/Donation');

// Create a new donation record
exports.createDonation = async (req, res) => {
    try {
        const donation = new Donation(req.body);
        await donation.save();
        res.status(201).json(donation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all donations
exports.getAllDonations = async (req, res) => {
    try {
        const donations = await Donation.find();
        res.status(200).json(donations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a donation by ID
exports.getDonationById = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
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
        const donation = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
        const donation = await Donation.findByIdAndDelete(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get donation statistics
exports.getDonationStats = async (req, res) => {
    try {
        const totalDonations = await Donation.countDocuments();
        const bloodTypeStats = await Donation.aggregate([
            {
                $group: {
                    _id: '$bloodType',
                    count: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' }
                }
            }
        ]);
        
        res.status(200).json({
            totalDonations,
            bloodTypeStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUBLIC ENDPOINTS FOR MAIN WEBSITE INTEGRATION

// Create donation request from public form
exports.createPublicDonationRequest = async (req, res) => {
    try {
        const { donorName, email, phone, bloodType, preferredDate, location, medicalConditions, consentGiven } = req.body;
        
        // For demo mode, we'll just return success without saving to database
        // In production, you would save this to a temporary collection or process it differently
        
        console.log('📋 Public Donation Request Received:', {
            donorName,
            email,
            phone,
            bloodType,
            preferredDate,
            location,
            medicalConditions,
            consentGiven
        });
        
        // Simulate saving process
        const requestId = new mongoose.Types.ObjectId();
        const requestData = {
            _id: requestId,
            donorName,
            email,
            phone,
            bloodType,
            preferredDate,
            location,
            status: 'pending',
            timestamp: new Date(),
            type: 'donation_request'
        };
        
        // Emit real-time notification to admin portal
        const io = req.app.get('io');
        if (io) {
            io.to('admins').emit('new_donation_request', {
                message: `New donation request from ${donorName}`,
                data: requestData,
                timestamp: new Date()
            });
            console.log('🔔 Real-time notification sent to admins');
        }
        
        res.status(201).json({
            success: true,
            message: 'Donation request submitted successfully! We will contact you soon.',
            requestId: requestId,
            data: requestData
        });
    } catch (error) {
        console.error('Public donation request error:', error);
        res.status(400).json({ 
            success: false,
            message: 'Failed to submit donation request',
            error: error.message 
        });
    }
};

// Create blood request from public form
exports.createBloodRequest = async (req, res) => {
    try {
        const requestData = {
            ...req.body,
            type: 'blood_request',
            status: 'urgent',
            source: 'public_form',
            createdAt: new Date(),
            _id: new mongoose.Types.ObjectId()
        };
        
        console.log('🩸 Urgent Blood Request Received:', requestData);
        
        // Emit real-time notification to admin portal
        const io = req.app.get('io');
        if (io) {
            io.to('admins').emit('urgent_blood_request', {
                message: `URGENT: Blood request for ${requestData.bloodType} - ${requestData.unitsNeeded} units needed`,
                data: requestData,
                timestamp: new Date(),
                urgency: 'high'
            });
            console.log('🚨 URGENT notification sent to admins');
        }
        
        // In demo mode, we don't save to database
        // await bloodRequest.save();
        
        res.status(201).json({
            success: true,
            message: 'Blood request submitted successfully',
            requestId: requestData._id
        });
    } catch (error) {
        console.error('Blood request error:', error);
        res.status(400).json({ 
            success: false,
            message: 'Failed to submit blood request',
            error: error.message 
        });
    }
};

// Create campaign participation
exports.createCampaignParticipation = async (req, res) => {
    try {
        const participation = new Donation({
            ...req.body,
            type: 'campaign_participation',
            status: 'registered',
            source: 'public_form',
            createdAt: new Date()
        });
        
        await participation.save();
        
        res.status(201).json({
            success: true,
            message: 'Campaign participation registered successfully',
            participationId: participation._id
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: 'Failed to register for campaign',
            error: error.message 
        });
    }
};

// Get available blood types for forms
exports.getAvailableBloodTypes = async (req, res) => {
    try {
        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        res.status(200).json({
            success: true,
            bloodTypes
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch blood types',
            error: error.message 
        });
    }
};

// Get upcoming blood drives
exports.getUpcomingBloodDrives = async (req, res) => {
    try {
        // This would fetch from a BloodDrive model when implemented
        const upcomingDrives = [
            {
                id: 1,
                title: 'GIMSR Blood Drive 2025',
                date: '2025-08-15',
                location: 'GIMSR Hospital',
                description: 'Annual blood donation drive'
            }
        ];
        
        res.status(200).json({
            success: true,
            drives: upcomingDrives
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch blood drives',
            error: error.message 
        });
    }
};

// Handle webhooks from external services
exports.handleWebhook = async (req, res) => {
    try {
        const { type, data } = req.body;
        
        switch (type) {
            case 'donation_form':
                await this.createPublicDonationRequest({ body: data }, res);
                break;
            case 'blood_request':
                await this.createBloodRequest({ body: data }, res);
                break;
            default:
                res.status(400).json({ 
                    success: false,
                    message: 'Unknown webhook type' 
                });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Webhook processing failed',
            error: error.message 
        });
    }
};