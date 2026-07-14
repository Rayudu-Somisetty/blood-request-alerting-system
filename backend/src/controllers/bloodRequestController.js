const { db, auth } = require('../config/firebase');
const { sendEmail } = require('../utils/emailService');

class BloodRequestController {

    async createBloodRequest(req, res) {
        try {
            const requestData = {
                ...req.body,
                type: 'blood_request',
                status: 'active',
                fulfilled: false,
                source: 'public_form',
                createdAt: new Date(),
                donorResponses: []
            };
            
            const requestRef = await db.collection('blood_requests').add(requestData);
            const createdRequest = { id: requestRef.id, ...requestData };

            const compatibleDonors = await this.findCompatibleDonors(requestData.bloodGroup);

            const io = req.app.get('io');
            if (io) {
                io.to('admins').emit('new_blood_request', {
                    message: `New blood request: ${requestData.bloodGroup} for ${requestData.patientName}`,
                    data: createdRequest,
                    timestamp: new Date(),
                    urgency: requestData.urgencyLevel === 'critical' ? 'critical' : 
                            requestData.urgencyLevel === 'urgent' ? 'high' : 'normal'
                });
                
                io.to('donors').emit('blood_request_notification', {
                    requestId: createdRequest.id,
                    bloodGroup: requestData.bloodGroup,
                    urgencyLevel: requestData.urgencyLevel,
                    patientName: requestData.patientName,
                    hospitalName: requestData.hospitalName,
                    unitsRequired: requestData.unitsRequired,
                    timestamp: new Date()
                });
            }

            res.status(201).json({
                success: true,
                message: 'Blood request submitted successfully. Compatible donors have been notified.',
                requestId: createdRequest.id,
                notificationsSent: compatibleDonors.length,
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
        
        const usersRef = db.collection('users').where('userType', '==', 'donor');
        const snapshot = await usersRef.get();
        
        const donors = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (compatibleBloodGroups.includes(data.bloodGroup)) {
                donors.push({ id: doc.id, ...data });
            }
        });

        return donors;
    }

    async notifyCompatibleDonors(requestData, compatibleDonors) {
        try {
            const notifications = [];
            
            for (const donor of compatibleDonors) {
                const notification = {
                    donorId: donor.id,
                    donorName: donor.name || `${donor.firstName} ${donor.lastName}`,
                    donorBloodGroup: donor.bloodGroup,
                    requestId: requestData.id,
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
                
                try {
                    const emailSubject = `${requestData.urgencyLevel === 'critical' ? '🚨 URGENT: ' : ''}Blood Donation Needed - ${requestData.bloodGroup}`;
                    if (donor.email) {
                        await sendEmail(
                            donor.email,
                            emailSubject,
                            this.createNotificationMessage(requestData, donor)
                        );
                    }
                } catch (emailError) {
                    console.error(`Failed to send email to ${donor.email}:`, emailError.message);
                }
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

    async handleDonorResponse(req, res) {
        try {
            const { requestId, donorId, response, message } = req.body;
            
            const donorResponseData = {
                requestId,
                donorId,
                response,
                message,
                respondedAt: new Date(),
                contactShared: response === 'accepted'
            };
            
            if (response === 'accepted') {
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

    async getBloodRequestById(req, res) {
        try {
            const { requestId } = req.params;
            const doc = await db.collection('blood_requests').doc(requestId).get();
            
            if (!doc.exists) {
                return res.status(404).json({
                    success: false,
                    message: 'Blood request not found'
                });
            }
            
            res.status(200).json({
                success: true,
                data: { id: doc.id, ...doc.data() }
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

    async getBloodRequests(req, res) {
        try {
            const { status, bloodGroup, urgencyLevel, limit = 10 } = req.query;
            let query = db.collection('blood_requests');

            if (status) query = query.where('status', '==', status);
            if (bloodGroup) query = query.where('bloodGroup', '==', bloodGroup);
            if (urgencyLevel) query = query.where('urgencyLevel', '==', urgencyLevel);

            const snapshot = await query.limit(parseInt(limit)).get();
            const requests = [];
            snapshot.forEach(doc => {
                requests.push({ id: doc.id, ...doc.data() });
            });

            res.status(200).json({
                success: true,
                data: requests,
                total: requests.length
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

    async updateBloodRequestStatus(req, res) {
        try {
            const { requestId } = req.params;
            const { status, fulfilled } = req.body;
            
            await db.collection('blood_requests').doc(requestId).update({
                status,
                fulfilled,
                updatedAt: new Date()
            });
            
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