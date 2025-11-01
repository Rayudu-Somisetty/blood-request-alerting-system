const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const userController = require('../controllers/userController');
const { validateDonationRequest, validateUserRegistration } = require('../middleware/validation');

// Public endpoint for donation requests from main website
router.post('/donation-request', donationController.createPublicDonationRequest);

// Public endpoint for donor registration from main website
router.post('/donor-registration', validateUserRegistration, userController.createPublicDonorRegistration);

// Public endpoint for blood requirement requests
router.post('/blood-request', donationController.createBloodRequest);

// Public endpoint for campaign participation
router.post('/campaign-participation', donationController.createCampaignParticipation);

// Public endpoint to get available blood types (for forms)
router.get('/blood-types', donationController.getAvailableBloodTypes);

// Public endpoint to get upcoming blood drives (for main website display)
router.get('/blood-drives', donationController.getUpcomingBloodDrives);

// Webhook endpoint for external integrations
router.post('/webhook', donationController.handleWebhook);

module.exports = router;
