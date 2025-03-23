// models/Item.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Supplier = require('./Supplier');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  reorderLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: {
      min: 0
    }
  }
});

// Define relationships
Item.belongsTo(Supplier, {
  foreignKey: 'supplierId',
  as: 'supplier'
});

module.exports = Item;