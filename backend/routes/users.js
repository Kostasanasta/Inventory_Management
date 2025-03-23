// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private
router.get('/', auth, userController.getAllUsers);

// @route   PUT /api/users/:id/role
// @desc    Update user role (admin only)
// @access  Private
router.put('/:id/role', auth, userController.updateUserRole);

module.exports = router;