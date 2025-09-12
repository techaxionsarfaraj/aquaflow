// backend/models/orderItemModel.js

const pool = require('../config/db');

const orderItemTableQuery = `
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,    
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);`;

async function createTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(orderItemTableQuery);
    connection.release();
    console.log('✅ OrderItems table checked/created');
  } catch (err) {
    console.error('❌ Error creating order_items table:', err);
    throw err;
  }
}

// CRUD
async function getAllItems() {
  const [rows] = await pool.query('SELECT * FROM order_items');
  return rows;
}

async function getItemById(id) {
  const [rows] = await pool.query('SELECT * FROM order_items WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createItem(data) {
  const [result] = await pool.query(
    `INSERT INTO order_items
    (order_id, product_id,  quantity, unit_price, total)
    VALUES (?, ?, ?, ?, ?)`,
    [
      data.order_id,
      data.product_id,      
      data.quantity,
      data.unit_price,
      data.total
    ]
  );
  return getItemById(result.insertId);
}

async function updateItem(id, data) {
  await pool.query(
    `UPDATE order_items SET
      order_id=?, product_id=?,  quantity=?, unit_price=?, total=?
      WHERE id=?`,
    [
      data.order_id,
      data.product_id,      
      data.quantity,
      data.unit_price,
      data.total,
      id
    ]
  );
  return getItemById(id);
}

async function deleteItem(id) {
  await pool.query('DELETE FROM order_items WHERE id = ?', [id]);
  return { message: 'Order item deleted successfully' };
}

module.exports = {
  createTable,
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};
