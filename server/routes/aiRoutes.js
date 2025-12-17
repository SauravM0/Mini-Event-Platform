const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST api/ai/generate-description
// @desc    Generate or enhance event description
// @access  Private
router.post('/generate-description', protect, aiController.generateDescription);

module.exports = router;
