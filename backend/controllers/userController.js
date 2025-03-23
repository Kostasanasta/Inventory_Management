// controllers/userController.js
const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    // Only ADMIN can see all users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    // Only ADMIN can update roles
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { role } = req.body;
    
    // Validate role
    if (!['USER', 'MANAGER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from changing their own role
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }
    
    await user.update({ role });
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};