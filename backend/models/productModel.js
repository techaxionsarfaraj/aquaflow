// backend/models/productModel.js

const pool = require("../config/db");

const productTableQuery = `
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    price_per_unit DECIMAL(10,2) NOT NULL,
    description TEXT,
    total_stock INT DEFAULT 0,
    current_stock INT DEFAULT 0,    
    status ENUM('active','inactive') DEFAULT 'active',
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

async function createTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(productTableQuery);
    connection.release();
    console.log("✅ Product table checked/created");
  } catch (err) {
    console.error("❌ Error creating product table:", err);
    throw err;
  }
}

// Get all products
async function getAllProducts() {
  const [rows] = await pool.query("SELECT * FROM products");
  return rows;
}
// Get product by ID
async function getProductById(id) {
  const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
  return rows[0] || null;
}
// Create new product
async function createProduct(data) {
  const [result] = await pool.query(
    `INSERT INTO products
     ( name, type,  price_per_unit, description, total_stock, current_stock,  status)
     VALUES ( ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.type,
      data.price_per_unit,
      data.description || null,
      data.total_stock || 0,
      data.current_stock || 0,
      data.status || "active",
    ]
  );
  return getProductById(result.insertId);
}
// Update product
async function updateProduct(id, data) {
  await pool.query(
    `UPDATE products SET
       name = ?, type = ?, price_per_unit = ?, description = ?, current_stock = ?, total_stock = ?, status = ?, updated_date = NOW()
     WHERE id = ?`,
    [
      data.name,
      data.type,
      data.price_per_unit,
      data.description || null,
      data.current_stock || 0,
      data.total_stock || 0,
      data.status || "active",
      id,
    ]
  );
  return getProductById(id);
}
// Delete product
async function deleteProduct(id) {
  await pool.query("DELETE FROM products WHERE id = ?", [id]);
  return { message: "Product deleted successfully" };
}

module.exports = {
  createTable,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
