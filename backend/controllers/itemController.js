// controllers/itemController.js
const Item = require('../models/Item');
const Supplier = require('../models/Supplier');

exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name']
        }
      ]
    });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.createItem = async (req, res) => {
  try {
    const { name, description, quantity, reorderLevel, supplierId } = req.body;
    
    const item = await Item.create({
      name,
      description,
      quantity,
      reorderLevel,
      supplierId
    });
    
    // Fetch the newly created item with its supplier
    const newItem = await Item.findByPk(item.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { name, description, quantity, reorderLevel, supplierId } = req.body;
    
    const item = await Item.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    await item.update({
      name,
      description,
      quantity,
      reorderLevel,
      supplierId
    });
    
    // Fetch the updated item with its supplier
    const updatedItem = await Item.findByPk(item.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.json(updatedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    await item.destroy();
    
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};