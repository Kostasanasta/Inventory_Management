// controllers/supplierController.js
const Supplier = require('../models/Supplier');
const Item = require('../models/Item');

exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    res.json(supplier);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, notes } = req.body;
    
    const supplier = await Supplier.create({
      name,
      email,
      phone,
      address,
      notes
    });
    
    res.status(201).json(supplier);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, notes } = req.body;
    
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    await supplier.update({
      name,
      email,
      phone,
      address,
      notes
    });
    
    res.json(supplier);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    // Check if supplier is linked to any items
    const items = await Item.findAll({
      where: { supplierId: req.params.id }
    });
    
    if (items.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete supplier with associated items',
        itemsCount: items.length
      });
    }
    
    await supplier.destroy();
    
    res.json({ message: 'Supplier removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};