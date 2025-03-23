// routes/items.js
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET /api/items
// @desc    Get all items
// @access  Private
router.get('/', auth, itemController.getAllItems);

// @route   GET /api/items/:id
// @desc    Get item by ID
// @access  Private
router.get('/:id', auth, itemController.getItemById);

// @route   POST /api/items
// @desc    Create a new item
// @access  Private (MANAGER or ADMIN)
router.post('/', [auth, roleCheck('MANAGER')], itemController.createItem);

// @route   PUT /api/items/:id
// @desc    Update an item
// @access  Private (MANAGER or ADMIN)
router.put('/:id', [auth, roleCheck('MANAGER')], itemController.updateItem);

// @route   DELETE /api/items/:id
// @desc    Delete an item
// @access  Private (ADMIN only)
router.delete('/:id', [auth, roleCheck('ADMIN')], itemController.deleteItem);

module.exports = router;