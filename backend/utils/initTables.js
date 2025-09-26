// ./utils/initTables.js

const customerModel = require('../models/customerModel');
const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');
const paymentModel = require('../models/paymentModel');
const userModel = require('../models/userModel');

async function initTables() {
  try {
    await customerModel.createTable();
    await productModel.createTable();
    await orderModel.createTable();    
    await paymentModel.createTable();
    await userModel.createTable();
    console.log('✅ All tables initialized');
  } catch (err) {
    console.error('❌ Table initialization failed:', err);
    process.exit(1);
  }
}

module.exports = initTables;
