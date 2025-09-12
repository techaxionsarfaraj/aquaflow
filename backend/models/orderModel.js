// backend/models/orderModel.js

const pool = require('../config/db');

// Orders table
const orderTableQuery = `
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    customer_id BIGINT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    order_date DATE NOT NULL,
    delivery_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address TEXT,
    delivery_area VARCHAR(255),
    delivery_notes TEXT,
    status ENUM('pending','confirmed','out_for_delivery','delivered','cancelled') DEFAULT 'pending',
    payment_status ENUM('pending','partial','paid') DEFAULT 'pending',
    is_monthly_order BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);`;


async function createTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(orderTableQuery);    
    connection.release();
    console.log('✅ Orders & Order_Items tables checked/created');
  } catch (err) {
    console.error('❌ Error creating orders/order_items table:', err);
    throw err;
  }
}

// CRUD with JOIN to products
async function getAllOrders() {
  const [rows] = await pool.query(
    `SELECT o.*, 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'product_id', oi.product_id,
                'product_name', p.name,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total', oi.total
              )
            ) as products
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN products p ON oi.product_id = p.id
     GROUP BY o.id
     ORDER BY o.created_date DESC`
  );
  return rows;
}

async function getOrderById(id) {
  const [rows] = await pool.query(
    `SELECT o.*, 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'product_id', oi.product_id,
                'product_name', p.name,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'total', oi.total
              )
            ) as products
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE o.id = ?
     GROUP BY o.id`,
    [id]
  );
  return rows[0] || null;
}

async function createOrder(data) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO orders 
      (created_by, customer_id, customer_name, order_date, delivery_date, total_amount, delivery_address, delivery_area, delivery_notes, status, payment_status, is_monthly_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.created_by || null,
        data.customer_id,
        data.customer_name,
        data.order_date,
        data.delivery_date,
        data.total_amount,
        data.delivery_address || null,
        data.delivery_area || null,
        data.delivery_notes || null,
        data.status || 'pending',
        data.payment_status || 'pending',
        data.is_monthly_order || false
      ]
    );

    const orderId = result.insertId;

    // Insert products into order_items
    if (Array.isArray(data.products)) {
      for (const item of data.products) {
        await connection.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price]
        );
      }
    }

    await connection.commit();
    return getOrderById(orderId);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function updateOrder(id, data) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE orders SET
        created_by=?, customer_id=?, customer_name=?, order_date=?, delivery_date=?, total_amount=?, delivery_address=?, delivery_area=?, delivery_notes=?, status=?, payment_status=?, is_monthly_order=?, updated_date=NOW()
        WHERE id=?`,
      [
        data.created_by || null,
        data.customer_id,
        data.customer_name,
        data.order_date,
        data.delivery_date,
        data.total_amount,
        data.delivery_address || null,
        data.delivery_area || null,
        data.delivery_notes || null,
        data.status || 'pending',
        data.payment_status || 'pending',
        data.is_monthly_order || false,
        id
      ]
    );

    // Clear and reinsert products
    await connection.query(`DELETE FROM order_items WHERE order_id=?`, [id]);
    if (Array.isArray(data.products)) {
      for (const item of data.products) {
        await connection.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
          [id, item.product_id, item.quantity, item.price]
        );
      }
    }

    await connection.commit();
    return getOrderById(id);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function deleteOrder(id) {
  await pool.query('DELETE FROM orders WHERE id = ?', [id]);
  return { message: 'Order deleted successfully' };
}

module.exports = {
  createTable,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
};
