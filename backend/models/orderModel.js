// backend/models/orderModel.js
const pool = require("../config/db");

// Orders table
const orderTableQuery = `
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,    
    customer_id BIGINT NOT NULL,
    order_date DATE NOT NULL,
    product_details JSON,
    delivery_date DATE NOT NULL,
    delivery_street_address VARCHAR(255) NOT NULL,
    delivery_area VARCHAR(255),
    delivery_town VARCHAR(100),
    delivery_city VARCHAR(100),
    delivery_pincode VARCHAR(20),   
    delivery_notes TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','scheduled','out_for_delivery','delivered','cancelled') DEFAULT 'scheduled',
    bill_url VARCHAR(255),
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
    SELECT 
      o.id, 
      o.customer_id, 
      o.order_date,
      o.delivery_date, 
      o.total_amount, 
      o.delivery_street_address, 
      o.delivery_area, 
      o.delivery_town, 
      o.delivery_city, 
      o.delivery_pincode, 
      o.delivery_notes, 
      o.status,
      o.product_details,
      c.name AS customer_name,
      c.phone AS customer_phone
    FROM orders o
    INNER JOIN customers c ON o.customer_id = c.id
    ORDER BY o.created_date DESC
  `);
  return rows;
}
async function getAllDeliveredOrders() {
  const [rows] = await pool.query(`
    SELECT o.id, o.order_date, o.product_details, o.delivery_date, o.delivery_street_address,o.delivery_area, o.delivery_town,o.delivery_city,o.delivery_pincode,o.delivery_notes,o.status,o.delivery_pincode,o.bill_url, c.name AS customer_name, c.phone, c.email, o.total_amount 
       FROM orders o 
       JOIN customers c ON o.customer_id = c.id 
       WHERE o.status = 'delivered'
  `);
  // console.log(rows);
  return rows;
}

async function getOrderById(id) {
  const [rows] = await pool.query(
    `
    SELECT 
      o.*,
      c.name AS customer_name,
      c.phone AS customer_phone,
      c.email AS customer_email
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    WHERE o.id = ?
  `,
    [id]
  );

  if (!rows[0]) return null;

  const row = rows[0];
  row.product_details = row.product_details
    ? JSON.parse(row.product_details)
    : [];
  return row;
}

async function createOrder(data) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert the order
    const [result] = await connection.query(
      `INSERT INTO orders 
       (customer_id, order_date, product_details, delivery_date, delivery_street_address, delivery_area, delivery_town, delivery_city, delivery_pincode, delivery_notes, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.customer_id,
        data.order_date,
        JSON.stringify(data.product_details || []),
        data.delivery_date,
        data.delivery_street_address,
        data.delivery_area,
        data.delivery_town,
        data.delivery_city,
        data.delivery_pincode,
        data.delivery_notes || null,
        data.total_amount,
        data.status || "scheduled",
      ]
    );

    const orderId = result.insertId;

    // 2. Deduct stock for each product
    for (const item of data.product_details) {
      await connection.query(
        `UPDATE products SET available_stock = available_stock - ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
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

    // 1. Fetch existing order
    const existingOrder = await getOrderById(id);

    if (!existingOrder) throw new Error("Order not found");

    // 2. Restore previous product stocks
    for (const item of existingOrder.product_details) {
      await connection.query(
        `UPDATE products SET available_stock = available_stock + ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    // 3. Update order
    await connection.query(
      `UPDATE orders SET
         customer_id=?, order_date=?, product_details=?, delivery_date=?,  
         delivery_street_address=?, delivery_area=?, delivery_town=?, 
         delivery_city=?, delivery_pincode=?, delivery_notes=?, 
         total_amount=?, status=?, updated_date=NOW()
       WHERE id=?`,
      [
        data.customer_id,
        data.order_date,
        JSON.stringify(data.product_details || []),
        data.delivery_date,
        data.delivery_street_address,
        data.delivery_area,
        data.delivery_town,
        data.delivery_city,
        data.delivery_pincode,
        data.delivery_notes || null,
        data.total_amount,
        data.status || "pending",
        id,
      ]
    );

    // 4. Deduct new product stocks
    for (const item of data.product_details) {
      await connection.query(
        `UPDATE products SET available_stock = available_stock - ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
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
  getAllDeliveredOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
