const express = require('express');
const router = express.Router();
const bloodRequestController = require('../controllers/bloodRequestController');

// POST /api/blood-requests - Create new blood request with donor notifications
router.post('/', bloodRequestController.createBloodRequest);

// GET /api/blood-requests - Get blood requests with filters
router.get('/', bloodRequestController.getBloodRequests);

// GET /api/blood-requests/:requestId - Get specific blood request
router.get('/:requestId', bloodRequestController.getBloodRequestById);

// PUT /api/blood-requests/:requestId/status - Update blood request status
router.put('/:requestId/status', bloodRequestController.updateBloodRequestStatus);

// POST /api/blood-requests/donor-response - Handle donor response
router.post('/donor-response', bloodRequestController.handleDonorResponse);

module.exports = router;