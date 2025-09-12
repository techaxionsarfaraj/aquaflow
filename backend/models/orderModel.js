// backend/models/orderModel.js
// backend/models/orderModel.js
const pool = require("../config/db");

// Orders table
const orderTableQuery = `
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,    
    customer_id BIGINT NOT NULL,    
    order_date DATE NOT NULL,
    delivery_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address TEXT,
    delivery_area VARCHAR(255),
    delivery_notes TEXT,
    status ENUM('pending','confirmed','out_for_delivery','delivered','cancelled') DEFAULT 'pending',
    payment_status ENUM('pending','partial','paid') DEFAULT 'pending',
    is_monthly_order BOOLEAN DEFAULT FALSE,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,    
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);`;

async function createTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(orderTableQuery);
    connection.release();
    console.log("✅ Orders table checked/created");
  } catch (err) {
    console.error("❌ Error creating orders table:", err);
    throw err;
  }
}

// -----------------------------
// CRUD with Customer JOIN
// -----------------------------

async function getAllOrders() {
  const [rows] = await pool.query(`
    SELECT o.*, 
           c.name AS customer_name,
           c.phone AS customer_phone,
           CONCAT(
             '[', 
             IFNULL(GROUP_CONCAT(
               JSON_OBJECT(
                 'product_id', oi.product_id,
                 'product_name', p.name,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price,
                 'total', oi.total
               )
             ), ''), 
             ']'
           ) AS products
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY o.id
    ORDER BY o.created_date DESC
  `);

  return rows.map(row => ({
    ...row,
    products: row.products ? JSON.parse(row.products) : []
  }));
}

async function getOrderById(id) {
  const [rows] = await pool.query(`
    SELECT o.*, 
           c.name AS customer_name,
           c.phone AS customer_phone,
           CONCAT(
             '[', 
             IFNULL(GROUP_CONCAT(
               JSON_OBJECT(
                 'product_id', oi.product_id,
                 'product_name', p.name,
                 'quantity', oi.quantity,
                 'unit_price', oi.unit_price,
                 'total', oi.total
               )
             ), ''), 
             ']'
           ) AS products
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.id = ?
    GROUP BY o.id
  `, [id]);

  if (!rows[0]) return null;

  const row = rows[0];
  row.products = row.products ? JSON.parse(row.products) : [];
  return row;
}

// -----------------------------
// Other CRUD functions remain same
// -----------------------------

async function createOrder(data) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      `INSERT INTO orders 
       (customer_id, order_date, delivery_date, total_amount, delivery_address, delivery_area, delivery_notes, status, payment_status, is_monthly_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.customer_id,
        data.order_date,
        data.delivery_date,
        data.total_amount,
        data.delivery_address || null,
        data.delivery_area || null,
        data.delivery_notes || null,
        data.status || "pending",
        data.payment_status || "pending",
        data.is_monthly_order || false
      ]
    );

    const orderId = result.insertId;

    if (Array.isArray(data.products)) {
      for (const item of data.products) {
        await connection.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.unit_price, item.total]
        );
      }
    }

    await connection.commit();
    return await getOrderById(orderId);
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
         customer_id=?, order_date=?, delivery_date=?, total_amount=?, delivery_address=?, delivery_area=?, delivery_notes=?, status=?, payment_status=?, is_monthly_order=?, updated_date=NOW()
       WHERE id=?`,
      [
        data.customer_id,
        data.order_date,
        data.delivery_date,
        data.total_amount,
        data.delivery_address || null,
        data.delivery_area || null,
        data.delivery_notes || null,
        data.status || "pending",
        data.payment_status || "pending",
        data.is_monthly_order || false,
        id
      ]
    );

    await connection.query(`DELETE FROM order_items WHERE order_id=?`, [id]);
    if (Array.isArray(data.products)) {
      for (const item of data.products) {
        await connection.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)`,
          [id, item.product_id, item.quantity, item.unit_price, item.total]
        );
      }
    }

    await connection.commit();
    return await getOrderById(id);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function deleteOrder(id) {
  await pool.query("DELETE FROM orders WHERE id = ?", [id]);
  return { message: "Order deleted successfully" };
}

module.exports = {
  createTable,
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
};
