// backend/models/paymentModel.js

const pool = require('../config/db');

const paymentTableQuery = `
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    customer_id BIGINT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    order_id BIGINT,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('cash','online','cheque','bank_transfer') DEFAULT 'cash',
    payment_type ENUM('order_payment','deposit','monthly_bill','advance') NOT NULL,
    bill_month VARCHAR(7),
    notes TEXT,
    collected_by VARCHAR(255),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);`;

async function createTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(paymentTableQuery);
    connection.release();
    console.log('✅ Payments table checked/created');
  } catch (err) {
    console.error('❌ Error creating payments table:', err);
    throw err;
  }
}

// CRUD
async function getAllPayments() {
  const [rows] = await pool.query('SELECT * FROM payments');
  return rows;
}

async function getPaymentById(id) {
  const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createPayment(data) {
  const [result] = await pool.query(
    `INSERT INTO payments
     (created_by, customer_id, customer_name, order_id, amount, payment_date, payment_method, payment_type, bill_month, notes, collected_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.created_by || null,
      data.customer_id,
      data.customer_name,
      data.order_id || null,
      data.amount,
      data.payment_date,
      data.payment_method || 'cash',
      data.payment_type,
      data.bill_month || null,
      data.notes || null,
      data.collected_by || null
    ]
  );
  return getPaymentById(result.insertId);
}

async function updatePayment(id, data) {
  await pool.query(
    `UPDATE payments SET
      created_by=?, customer_id=?, customer_name=?, order_id=?, amount=?, payment_date=?, payment_method=?, payment_type=?, bill_month=?, notes=?, collected_by=?, updated_date=NOW()
      WHERE id=?`,
    [
      data.created_by || null,
      data.customer_id,
      data.customer_name,
      data.order_id || null,
      data.amount,
      data.payment_date,
      data.payment_method || 'cash',
      data.payment_type,
      data.bill_month || null,
      data.notes || null,
      data.collected_by || null,
      id
    ]
  );
  return getPaymentById(id);
}

async function deletePayment(id) {
  await pool.query('DELETE FROM payments WHERE id = ?', [id]);
  return { message: 'Payment deleted successfully' };
}

module.exports = {
  createTable,
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
};
