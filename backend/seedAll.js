const pool = require('./config/db');
const initTables = require('./utils/initTables');

async function seedAll() {
  try {
    // 1️⃣ Ensure all tables exist
    await initTables();

    const connection = await pool.getConnection();
    console.log('🌱 Seeding dummy data...');

    // ----------------------------
    // Customers
    // ----------------------------
    const customers = [
      ['John Doe', '9876543210', 'john@example.com', '123 Main St', 'Area 1'],
      ['Jane Smith', '9876543211', 'jane@example.com', '456 Elm St', 'Area 2'],
      ['Robert Brown', '9876543212', 'robert@example.com', '789 Oak St', 'Area 3'],
      ['Emily Davis', '9876543213', 'emily@example.com', '321 Pine St', 'Area 4'],
      ['Michael Wilson', '9876543214', 'michael@example.com', '654 Maple St', 'Area 5'],
      ['Linda Johnson', '9876543215', 'linda@example.com', '987 Birch St', 'Area 6'],
      ['David Lee', '9876543216', 'david@example.com', '111 Cedar St', 'Area 7'],
      ['Susan Taylor', '9876543217', 'susan@example.com', '222 Walnut St', 'Area 8'],
      ['James Martin', '9876543218', 'james@example.com', '333 Chestnut St', 'Area 9'],
      ['Patricia Clark', '9876543219', 'patricia@example.com', '444 Spruce St', 'Area 10'],
    ];

    const customerIds = [];
    for (let c of customers) {
      const [result] = await connection.query(
        `INSERT INTO customers (name, phone, email, address, area) VALUES (?, ?, ?, ?, ?)`,
        c
      );
      customerIds.push(result.insertId);
    }

    // ----------------------------
    // Products
    // ----------------------------
    const products = [
      ['20L Jar', '20L_jar', 'Large water jar', 50.0],
      ['10L Jar', '10L_jar', 'Medium water jar', 30.0],
      ['5L Bottle', '5L_bottle', 'Small bottle', 15.0],
      ['1L Bottle', '1L_bottle', 'Mini bottle', 5.0],
      ['Extra Large Jar', '20L_jar', 'Extra large jar', 60.0],
      ['Medium Bottle', '5L_bottle', 'Medium bottle', 18.0],
      ['Small Bottle', '1L_bottle', 'Small bottle', 6.0],
      ['Premium Jar', '20L_jar', 'Premium jar', 70.0],
      ['Basic Jar', '10L_jar', 'Basic jar', 25.0],
      ['Deluxe Bottle', '5L_bottle', 'Deluxe bottle', 20.0],
    ];

    const productIds = [];
    for (let p of products) {
      const [result] = await connection.query(
        `INSERT INTO products (name, type, description, price_per_unit) VALUES (?, ?, ?, ?)`,
        p
      );
      productIds.push(result.insertId);
    }

    // ----------------------------
    // Users
    // ----------------------------
    const users = [
      ['admin1@example.com', 'Admin One', 'admin'],
      ['user1@example.com', 'User One', 'user'],
      ['user2@example.com', 'User Two', 'user'],
      ['user3@example.com', 'User Three', 'user'],
      ['user4@example.com', 'User Four', 'user'],
      ['admin2@example.com', 'Admin Two', 'admin'],
      ['user5@example.com', 'User Five', 'user'],
      ['user6@example.com', 'User Six', 'user'],
      ['user7@example.com', 'User Seven', 'user'],
      ['user8@example.com', 'User Eight', 'user'],
    ];

    for (let u of users) {
      await connection.query(
        `INSERT INTO users (email, full_name, role) VALUES (?, ?, ?)`,
        u
      );
    }

    // ----------------------------
    // Orders
    // ----------------------------
    const orderIds = [];
    for (let i = 0; i < 10; i++) {
      const customerId = customerIds[i % customerIds.length];
      const customerName = customers[i][0];
      const orderDate = new Date();
      const deliveryDate = new Date();
      deliveryDate.setDate(orderDate.getDate() + 1);

      const totalAmount = (i + 1) * 50;

      const [result] = await connection.query(
        `INSERT INTO orders (customer_id, customer_name, order_date, delivery_date, total_amount) VALUES (?, ?, ?, ?, ?)`,
        [customerId, customerName, orderDate, deliveryDate, totalAmount]
      );
      orderIds.push(result.insertId);
    }

    // ----------------------------
    // Order Items
    // ----------------------------
    for (let i = 0; i < 10; i++) {
      const orderId = orderIds[i];
      const productId = productIds[i % productIds.length];
      const productName = products[i % products.length][0];
      const quantity = (i % 5) + 1;
      const unitPrice = products[i % products.length][3];
      const total = quantity * unitPrice;

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, productId, productName, quantity, unitPrice, total]
      );
    }

    // ----------------------------
    // Payments
    // ----------------------------
    for (let i = 0; i < 10; i++) {
      const customerId = customerIds[i % customerIds.length];
      const customerName = customers[i][0];
      const orderId = orderIds[i];

      const amount = 50 + i * 5;
      const paymentDate = new Date();

      await connection.query(
        `INSERT INTO payments (customer_id, customer_name, order_id, amount, payment_date, payment_method, payment_type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [customerId, customerName, orderId, amount, paymentDate, 'cash', 'order_payment']
      );
    }

    console.log('✅ Dummy records for all tables inserted successfully!');
    connection.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedAll();
