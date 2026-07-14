const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const userController = require('../controllers/userController');
const { validateDonationRequest, validateUserRegistration } = require('../middleware/validation');

// Public endpoint for donor registration from main website
router.post('/donor-registration', validateUserRegistration, userController.createPublicDonorRegistration);

// Public endpoint to get available blood types (for forms)
router.get('/blood-types', donationController.getAvailableBloodTypes);

module.exports = router;
