//  backend/models/userModel.js

const pool = require('../config/db');

const userTableQuery = `
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin','user') DEFAULT 'user'
);`;

async function createTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(userTableQuery);
    connection.release();
    console.log('✅ Users table checked/created');
  } catch (err) {
    console.error('❌ Error creating users table:', err);
    throw err;
  }
}

// CRUD
async function getAllUsers() {
  const [rows] = await pool.query('SELECT * FROM users');
  return rows;
}

async function getUserById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createUser(data) {
  const [result] = await pool.query(
    `INSERT INTO users
     (email, full_name, role)
     VALUES (?, ?, ?)`,
    [
      data.email,
      data.full_name,
      data.role || 'user'
    ]
  );
  return getUserById(result.insertId);
}

async function updateUser(id, data) {
  await pool.query(
    `UPDATE users SET email=?, full_name=?, role=? WHERE id=?`,
    [
      data.email,
      data.full_name,
      data.role || 'user',
      id
    ]
  );
  return getUserById(id);
}

async function deleteUser(id) {
  await pool.query('DELETE FROM users WHERE id=?', [id]);
  return { message: 'User deleted successfully' };
}

module.exports = {
  createTable,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
