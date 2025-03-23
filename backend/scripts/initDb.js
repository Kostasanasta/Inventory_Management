// backend/scripts/initDb.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/db');
const User = require('../models/User');
const Item = require('../models/Item');
const Supplier = require('../models/Supplier');

async function initDatabase() {
  try {
    // Sync all models with the database
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    });
    
    // Create normal user
    await User.create({
      name: 'Kostas',
      email: 'kostas',
      password: await bcrypt.hash('2004', salt),
      role: 'ADMIN'
    });
    
    // Create sample suppliers
    const supplier1 = await Supplier.create({
      name: 'Tech Supplies Inc.',
      email: 'contact@techsupplies.com',
      phone: '(555) 123-4567',
      address: '123 Tech Street, Silicon Valley, CA'
    });
    
    const supplier2 = await Supplier.create({
      name: 'Office Solutions Ltd.',
      email: 'info@officesolutions.com',
      phone: '(555) 987-6543',
      address: '456 Office Avenue, Business District, NY'
    });
    
    // Create sample items
    await Item.create({
      name: 'Laptop',
      description: 'High-performance laptop for business use',
      quantity: 25,
      reorderLevel: 5,
      supplierId: supplier1.id
    });
    
    await Item.create({
      name: 'Monitor',
      description: '24-inch LED monitor',
      quantity: 15,
      reorderLevel: 3,
      supplierId: supplier1.id
    });
    
    await Item.create({
      name: 'Office Chair',
      description: 'Ergonomic office chair',
      quantity: 10,
      reorderLevel: 2,
      supplierId: supplier2.id
    });
    
    await Item.create({
      name: 'Desk',
      description: 'Standard office desk',
      quantity: 8,
      reorderLevel: 2,
      supplierId: supplier2.id
    });
    
    console.log('Sample data created');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();