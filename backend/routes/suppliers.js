// routes/suppliers.js
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET /api/suppliers
// @desc    Get all suppliers
// @access  Private
router.get('/', auth, supplierController.getAllSuppliers);

// @route   GET /api/suppliers/:id
// @desc    Get supplier by ID
// @access  Private
router.get('/:id', auth, supplierController.getSupplierById);

// @route   POST /api/suppliers
// @desc    Create a new supplier
// @access  Private (MANAGER or ADMIN)
router.post('/', [auth, roleCheck('MANAGER')], supplierController.createSupplier);

// @route   PUT /api/suppliers/:id
// @desc    Update a supplier
// @access  Private (MANAGER or ADMIN)
router.put('/:id', [auth, roleCheck('MANAGER')], supplierController.updateSupplier);

// @route   DELETE /api/suppliers/:id
// @desc    Delete a supplier
// @access  Private (ADMIN only)
router.delete('/:id', [auth, roleCheck('ADMIN')], supplierController.deleteSupplier);

module.exports = router;