// backend/models/productModel.js

const pool = require('../config/db');

const productTableQuery = `
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    type ENUM('20L_jar', '10L_jar', '5L_bottle', '1L_bottle') NOT NULL,
    description TEXT,
    price_per_unit DECIMAL(10,2) NOT NULL,
    deposit_required BOOLEAN DEFAULT TRUE,
    deposit_amount DECIMAL(10,2) DEFAULT 0.00,
    current_stock INT DEFAULT 0,
    minimum_stock INT DEFAULT 10,
    status ENUM('active','inactive') DEFAULT 'active'
);`;

async function createTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(productTableQuery);
    connection.release();
    console.log('✅ Product table checked/created');
  } catch (err) {
    console.error('❌ Error creating product table:', err);
    throw err;
  }
}

// CRUD Operations
async function getAllProducts() {
  const [rows] = await pool.query('SELECT * FROM products');
  return rows;
}

async function getProductById(id) {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createProduct(data) {  
  const [result] = await pool.query(
    `INSERT INTO products
     ( name, type, description, price_per_unit, deposit_required, deposit_amount, current_stock, minimum_stock, status)
     VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [      
      data.name,
      data.type,
      data.description || null,
      data.price_per_unit,
      data.deposit_required !== undefined ? data.deposit_required : true,
      data.deposit_amount || 0.0,
      data.current_stock || 0,
      data.minimum_stock || 10,
      data.status || 'active'
    ]
  );  
  return getProductById(result.insertId);
}

async function updateProduct(id, data) {
  await pool.query(
    `UPDATE products SET
      created_by = ?, name = ?, type = ?, description = ?, price_per_unit = ?, deposit_required = ?, deposit_amount = ?, current_stock = ?, minimum_stock = ?, status = ?, updated_date = NOW()
     WHERE id = ?`,
    [
      data.created_by || null,
      data.name,
      data.type,
      data.description || null,
      data.price_per_unit,
      data.deposit_required !== undefined ? data.deposit_required : true,
      data.deposit_amount || 0.0,
      data.current_stock || 0,
      data.minimum_stock || 10,
      data.status || 'active',
      id
    ]
  );
  return getProductById(id);
}

async function deleteProduct(id) {
  await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return { message: 'Product deleted successfully' };
}

module.exports = {
  createTable,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
