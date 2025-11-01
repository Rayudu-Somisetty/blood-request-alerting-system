const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { protect } = require('../middleware/auth');

// Route to get all donations
router.get('/', protect, donationController.getAllDonations);

// Route to create a new donation
router.post('/', protect, donationController.createDonation);

// Route to update a donation by ID
router.put('/:id', protect, donationController.updateDonation);

// Route to delete a donation by ID
router.delete('/:id', protect, donationController.deleteDonation);

// Route to get donation statistics
router.get('/stats', protect, donationController.getDonationStats);

module.exports = router;