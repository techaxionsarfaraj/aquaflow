// ./models/customerModel.js

const pool = require('../config/db');

const customerTableQuery = `
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,    
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    street_address TEXT NOT NULL,
    area VARCHAR(255),
    town VARCHAR(100),
    city VARCHAR(100),
    pincode VARCHAR(20),
    customer_type ENUM('residential', 'commercial'),
    delivery_preference ENUM('morning', 'afternoon', 'evening', 'anytime') DEFAULT 'anytime',
    monthly_subscription BOOLEAN DEFAULT TRUE,    
    deposit_amount DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    notes TEXT,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,    
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

// -------------------------------
// Table creation function
// -------------------------------
async function createTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(customerTableQuery);
    connection.release();
    console.log('✅ Customer table checked/created');
  } catch (err) {
    console.error('❌ Error creating customer table:', err);
    throw err; // propagate error to initTables
  }
}

// -------------------------------
// CRUD Operations
// -------------------------------

// Get all customers
async function getAllCustomers() {
  const [rows] = await pool.query('SELECT * FROM customers');
  return rows;
}

// Get customer by ID
async function getCustomerById(id) {
  const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
  return rows[0] || null;
}

// Create new customer
async function createCustomer(data) {
  const [result] = await pool.query(
    `INSERT INTO customers 
    ( name, phone, email, street_address, area, town, city, pincode, customer_type, delivery_preference, monthly_subscription, deposit_amount, status, notes)
    VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.phone,
      data.email || null,
      data.street_address,
      data.area || null,
      data.town || null,
      data.city || null,
      data.pincode || null,
      data.customer_type || null,
      data.delivery_preference || 'anytime',
      data.monthly_subscription !== undefined ? data.monthly_subscription : true,      
      data.deposit_amount || 0.0,
      data.status || 'active',
      data.notes || null
    ]
  );
  return getCustomerById(result.insertId);
}

// Update customer
async function updateCustomer(id, data) {
  const [result] = await pool.query(
    `UPDATE customers SET       
      name = ?, 
      phone = ?, 
      email = ?, 
      street_address = ?, 
      area = ?, 
      town = ?, 
      city = ?, 
      pincode = ?, 
      customer_type = ?, 
      delivery_preference = ?, 
      monthly_subscription = ?,       
      deposit_amount = ?, 
      status = ?, 
      notes = ?, 
      updated_date = NOW()
    WHERE id = ?`,
    [      
      data.name,
      data.phone,
      data.email || null,
      data.street_address,
      data.area || null,
      data.town || null,
      data.city || null,
      data.pincode || null,
      data.customer_type || null,
      data.delivery_preference || 'anytime',
      data.monthly_subscription !== undefined ? data.monthly_subscription : true,      
      data.deposit_amount || 0.0,
      data.status || 'active',
      data.notes || null,
      id
    ]
  );
  return getCustomerById(id);
}

// Delete customer
async function deleteCustomer(id) {
  await pool.query('DELETE FROM customers WHERE id = ?', [id]);
  return { message: 'Customer deleted successfully' };
}

module.exports = {
  createTable,
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
