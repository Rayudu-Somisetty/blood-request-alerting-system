const mongoose = require('mongoose');

// Blood Request Controller with Donor Notification System
class BloodRequestController {

    // Create a blood request and notify compatible donors
    async createBloodRequest(req, res) {
        try {
            const requestData = {
                ...req.body,
                _id: new mongoose.Types.ObjectId(),
                type: 'blood_request',
                status: 'active',
                fulfilled: false,
                source: 'public_form',
                createdAt: new Date(),
                donorResponses: []
            };
            
            console.log('🩸 Blood Request Received:', {
                patientName: requestData.patientName,
                bloodGroup: requestData.bloodGroup,
                urgencyLevel: requestData.urgencyLevel,
                hospitalName: requestData.hospitalName,
                unitsRequired: requestData.unitsRequired
            });
            
            // Simulate finding compatible donors (in real app, this would query the users collection)
            const compatibleDonors = await this.findCompatibleDonors(requestData.bloodGroup);
            console.log(`Found ${compatibleDonors.length} compatible donors for blood group ${requestData.bloodGroup}`);
            
            // Send notifications to compatible donors (simulated)
            const notificationResults = await this.notifyCompatibleDonors(requestData, compatibleDonors);
            
            // Emit real-time notification to admin portal
            const io = req.app.get('io');
            if (io) {
                io.to('admins').emit('new_blood_request', {
                    message: `New blood request: ${requestData.bloodGroup} for ${requestData.patientName}`,
                    data: requestData,
                    timestamp: new Date(),
                    urgency: requestData.urgencyLevel === 'critical' ? 'critical' : 
                            requestData.urgencyLevel === 'urgent' ? 'high' : 'normal'
                });
                
                // Also notify donors in real-time
                io.to('donors').emit('blood_request_notification', {
                    requestId: requestData._id,
                    bloodGroup: requestData.bloodGroup,
                    urgencyLevel: requestData.urgencyLevel,
                    patientName: requestData.patientName,
                    hospitalName: requestData.hospitalName,
                    unitsRequired: requestData.unitsRequired,
                    timestamp: new Date()
                });
                
                console.log('🔔 Real-time notifications sent to admins and donors');
            }
            
            res.status(201).json({
                success: true,
                message: 'Blood request submitted successfully. Compatible donors have been notified.',
                requestId: requestData._id,
                notificationsSent: notificationResults.notificationsSent,
                compatibleDonorsFound: compatibleDonors.length
            });
        } catch (error) {
            console.error('Blood request creation error:', error);
            res.status(400).json({ 
                success: false,
                message: 'Failed to submit blood request',
                error: error.message 
            });
        }
    }

    // Find compatible donors for a blood group
    async findCompatibleDonors(recipientBloodGroup) {
        const bloodCompatibility = {
            'A+': ['A+', 'A-', 'O+', 'O-'],
            'A-': ['A-', 'O-'],
            'B+': ['B+', 'B-', 'O+', 'O-'],
            'B-': ['B-', 'O-'],
            'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            'AB-': ['A-', 'B-', 'AB-', 'O-'],
            'O+': ['O+', 'O-'],
            'O-': ['O-']
        };

        const compatibleBloodGroups = bloodCompatibility[recipientBloodGroup] || [];
        
        // In a real application, this would query the users collection
        // For now, we'll return mock data
        const mockDonors = [
            { id: '1', name: 'John Doe', bloodGroup: 'O-', phone: '+911234567890', email: 'john@example.com' },
            { id: '2', name: 'Jane Smith', bloodGroup: 'A+', phone: '+919876543210', email: 'jane@example.com' },
            { id: '3', name: 'Bob Johnson', bloodGroup: 'B+', phone: '+915555555555', email: 'bob@example.com' },
            { id: '4', name: 'Alice Brown', bloodGroup: 'AB+', phone: '+917777777777', email: 'alice@example.com' },
            { id: '5', name: 'Charlie Wilson', bloodGroup: 'O+', phone: '+918888888888', email: 'charlie@example.com' }
        ];

        return mockDonors.filter(donor => 
            compatibleBloodGroups.includes(donor.bloodGroup)
        );
    }

    // Send notifications to compatible donors
    async notifyCompatibleDonors(requestData, compatibleDonors) {
        try {
            const notifications = [];
            
            for (const donor of compatibleDonors) {
                const notification = {
                    donorId: donor.id,
                    donorName: donor.name,
                    donorBloodGroup: donor.bloodGroup,
                    requestId: requestData._id,
                    recipientBloodGroup: requestData.bloodGroup,
                    patientName: requestData.patientName,
                    hospitalName: requestData.hospitalName,
                    urgencyLevel: requestData.urgencyLevel,
                    unitsRequired: requestData.unitsRequired,
                    message: this.createNotificationMessage(requestData, donor),
                    sentAt: new Date(),
                    status: 'sent'
                };
                
                notifications.push(notification);
                
                // In a real application, this would:
                // 1. Send push notifications
                // 2. Send SMS/email alerts
                // 3. Create in-app notifications
                console.log(`📱 Notification sent to ${donor.name} (${donor.bloodGroup})`);
            }
            
            return {
                success: true,
                notificationsSent: notifications.length,
                notifications: notifications
            };
        } catch (error) {
            console.error('Error sending donor notifications:', error);
            return {
                success: false,
                notificationsSent: 0,
                error: error.message
            };
        }
    }

    // Create notification message for donors
    createNotificationMessage(requestData, donor) {
        const isExactMatch = donor.bloodGroup === requestData.bloodGroup;
        const urgencyEmoji = {
            'critical': '🚨',
            'urgent': '⚠️',
            'normal': 'ℹ️'
        };
        
        const emoji = urgencyEmoji[requestData.urgencyLevel] || 'ℹ️';
        const matchType = isExactMatch ? 'EXACT MATCH' : 'COMPATIBLE';
        
        return `${emoji} BLOOD DONATION NEEDED - ${matchType}

Patient: ${requestData.patientName}
Blood Group Needed: ${requestData.bloodGroup}
Your Blood Group: ${donor.bloodGroup}
Units Required: ${requestData.unitsRequired}
Hospital: ${requestData.hospitalName}
Urgency: ${requestData.urgencyLevel.toUpperCase()}

${requestData.urgencyLevel === 'critical' ? 
    'CRITICAL: Immediate response needed!' : 
    requestData.urgencyLevel === 'urgent' ? 
    'URGENT: Response needed within 24-48 hours' : 
    'Your donation could save a life!'
}`;
    }

    // Handle donor response to blood request
    async handleDonorResponse(req, res) {
        try {
            const { requestId, donorId, response, message } = req.body;
            
            console.log('📋 Donor Response Received:', {
                requestId,
                donorId, 
                response,
                message
            });
            
            // In a real application, this would:
            // 1. Update the blood request with donor response
            // 2. Notify the requester if donor accepted
            // 3. Share contact details between parties
            
            const donorResponseData = {
                requestId,
                donorId,
                response, // 'accepted', 'declined', 'maybe'
                message,
                respondedAt: new Date(),
                contactShared: response === 'accepted'
            };
            
            // Simulate notifying requester if donor accepted
            if (response === 'accepted') {
                console.log('✅ Donor accepted! Sharing contact details...');
                
                // Send notification to requester
                const io = req.app.get('io');
                if (io) {
                    io.to('admins').emit('donor_accepted', {
                        message: `Donor has accepted blood request ${requestId}`,
                        donorResponse: donorResponseData,
                        timestamp: new Date()
                    });
                }
            }
            
            res.status(200).json({
                success: true,
                message: response === 'accepted' ? 
                    'Thank you for accepting! Your contact details have been shared with the requester.' :
                    'Your response has been recorded. Thank you for your time.',
                donorResponse: donorResponseData
            });
        } catch (error) {
            console.error('Donor response handling error:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to process donor response',
                error: error.message
            });
        }
    }

    // Get blood request by ID
    async getBloodRequestById(req, res) {
        try {
            const { requestId } = req.params;
            
            // In a real application, this would query the database
            // For now, return mock data
            const mockRequest = {
                _id: requestId,
                patientName: 'John Patient',
                bloodGroup: 'A+',
                unitsRequired: 2,
                urgencyLevel: 'urgent',
                hospitalName: 'City Hospital',
                status: 'active',
                fulfilled: false,
                donorResponses: [],
                createdAt: new Date()
            };
            
            res.status(200).json({
                success: true,
                data: mockRequest
            });
        } catch (error) {
            console.error('Get blood request error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch blood request',
                error: error.message
            });
        }
    }

    // Get all blood requests with filters
    async getBloodRequests(req, res) {
        try {
            const { status, bloodGroup, urgencyLevel, limit = 10 } = req.query;
            
            // Mock data - in real app, this would query database with filters
            let mockRequests = [
                {
                    _id: 'req1',
                    patientName: 'John Patient',
                    bloodGroup: 'A+',
                    unitsRequired: 2,
                    urgencyLevel: 'critical',
                    hospitalName: 'City Hospital',
                    status: 'active',
                    fulfilled: false,
                    createdAt: new Date()
                },
                {
                    _id: 'req2', 
                    patientName: 'Sarah Wilson',
                    bloodGroup: 'O-',
                    unitsRequired: 1,
                    urgencyLevel: 'urgent',
                    hospitalName: 'General Hospital',
                    status: 'active',
                    fulfilled: false,
                    createdAt: new Date()
                }
            ];
            
            // Apply filters
            if (status) {
                mockRequests = mockRequests.filter(req => req.status === status);
            }
            if (bloodGroup) {
                mockRequests = mockRequests.filter(req => req.bloodGroup === bloodGroup);
            }
            if (urgencyLevel) {
                mockRequests = mockRequests.filter(req => req.urgencyLevel === urgencyLevel);
            }
            
            // Apply limit
            mockRequests = mockRequests.slice(0, parseInt(limit));
            
            res.status(200).json({
                success: true,
                data: mockRequests,
                total: mockRequests.length
            });
        } catch (error) {
            console.error('Get blood requests error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch blood requests',
                error: error.message
            });
        }
    }

    // Update blood request status
    async updateBloodRequestStatus(req, res) {
        try {
            const { requestId } = req.params;
            const { status, fulfilled } = req.body;
            
            console.log(`Updating blood request ${requestId} status to:`, { status, fulfilled });
            
            res.status(200).json({
                success: true,
                message: 'Blood request status updated successfully',
                requestId,
                status,
                fulfilled
            });
        } catch (error) {
            console.error('Update blood request status error:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to update blood request status',
                error: error.message
            });
        }
    }
}

module.exports = new BloodRequestController();