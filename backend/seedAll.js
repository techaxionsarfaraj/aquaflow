// backend/seedAll.js

const pool = require('./config/db');
const initTables = require('./utils/initTables');

async function seedAll() {
  try {
    await initTables(); // Ensure all tables exist
    const connection = await pool.getConnection();
    console.log('🌱 Seeding dummy data...');

    // ----------------------------
    // Customers
    // ----------------------------
    const customers = [
      ['John Doe', '9876543210', 'john@example.com', '123 Main St', 'Area 1', 'residential', 'morning', true, 4, 100, 'active', 'Regular customer'],
      ['Jane Smith', '9876543211', 'jane@example.com', '456 Elm St', 'Area 2', 'commercial', 'afternoon', true, 3, 50, 'active', 'Prefers afternoon delivery'],
      ['Robert Brown', '9876543212', 'robert@example.com', '789 Oak St', 'Area 3', 'residential', 'evening', false, 0, 0, 'inactive', 'Temporary inactive'],
      ['Emily Davis', '9876543213', 'emily@example.com', '321 Pine St', 'Area 4', 'commercial', 'anytime', true, 5, 150, 'active', 'Monthly subscription'],
      ['Michael Wilson', '9876543214', 'michael@example.com', '654 Maple St', 'Area 5', 'residential', 'morning', true, 2, 80, 'suspended', 'Suspended due to payment'],
      ['Linda Johnson', '9876543215', 'linda@example.com', '987 Birch St', 'Area 6', 'commercial', 'evening', true, 4, 0, 'active', 'No deposit'],
      ['David Lee', '9876543216', 'david@example.com', '111 Cedar St', 'Area 7', 'residential', 'afternoon', false, 0, 0, 'active', null],
      ['Susan Taylor', '9876543217', 'susan@example.com', '222 Walnut St', 'Area 8', 'commercial', 'anytime', true, 3, 50, 'active', 'Notes for Susan'],
      ['James Martin', '9876543218', 'james@example.com', '333 Chestnut St', 'Area 9', 'residential', 'morning', true, 4, 20, 'active', null],
      ['Patricia Clark', '9876543219', 'patricia@example.com', '444 Spruce St', 'Area 10', 'commercial', 'afternoon', true, 5, 100, 'active', 'VIP customer'],
    ];

    const customerIds = [];
    for (const c of customers) {
      const [result] = await connection.query(
        `INSERT INTO customers
        (name, phone, email, address, area, area_type, delivery_preference, monthly_subscription, bottles_per_month, deposit_amount, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        c
      );
      customerIds.push(result.insertId);
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

    const userIds = [];
    for (const u of users) {
      const [result] = await connection.query(
        `INSERT INTO users (email, full_name, role) VALUES (?, ?, ?)`,
        u
      );
      userIds.push(result.insertId);
    }

    // ----------------------------
    // Products
    // ----------------------------
    const products = [
      ['20L Jar', '20L_jar', 'Large water jar', 50.0, true, 100, 20, 10, 'active'],
      ['10L Jar', '10L_jar', 'Medium water jar', 30.0, true, 50, 30, 10, 'active'],
      ['5L Bottle', '5L_bottle', 'Small bottle', 15.0, false, 0, 40, 10, 'active'],
      ['1L Bottle', '1L_bottle', 'Mini bottle', 5.0, false, 0, 50, 10, 'active'],
      ['Extra Large Jar', '20L_jar', 'Extra large jar', 60.0, true, 150, 10, 10, 'active'],
      ['Medium Bottle', '5L_bottle', 'Medium bottle', 18.0, false, 0, 30, 10, 'active'],
      ['Small Bottle', '1L_bottle', 'Small bottle', 6.0, false, 0, 25, 10, 'active'],
      ['Premium Jar', '20L_jar', 'Premium jar', 70.0, true, 200, 5, 10, 'active'],
      ['Basic Jar', '10L_jar', 'Basic jar', 25.0, true, 30, 40, 10, 'active'],
      ['Deluxe Bottle', '5L_bottle', 'Deluxe bottle', 20.0, false, 0, 15, 10, 'active'],
    ];

    const productIds = [];
    for (const p of products) {
      const [result] = await connection.query(
        `INSERT INTO products
        (name, type, description, price_per_unit, deposit_required, deposit_amount, current_stock, minimum_stock, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        p
      );
      productIds.push(result.insertId);
    }

    // ----------------------------
    // Orders
    // ----------------------------
    const orderIds = [];
    for (let i = 0; i < 10; i++) {
      const customerId = customerIds[i % customerIds.length];
      const orderDate = new Date();
      const deliveryDate = new Date();
      deliveryDate.setDate(orderDate.getDate() + 1);
      const totalAmount = (i + 1) * 50;

      const [result] = await connection.query(
        `INSERT INTO orders
        (customer_id, order_date, delivery_date, total_amount, delivery_address, delivery_area, delivery_notes, status, payment_status, is_monthly_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [customerId, orderDate, deliveryDate, totalAmount, customers[i][3], customers[i][4], `Notes for order ${i+1}`, 'pending', 'pending', true]
      );
      orderIds.push(result.insertId);
    }

    // ----------------------------
    // Order Items
    // ----------------------------
    for (let i = 0; i < 10; i++) {
      const orderId = orderIds[i];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 products per order

      for (let j = 0; j < numItems; j++) {
        const productIndex = (i + j) % productIds.length;
        const product = products[productIndex];
        const quantity = Math.floor(Math.random() * 5) + 1;
        const total = quantity * product[3];

        await connection.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)`,
          [orderId, productIds[productIndex], quantity, product[3], total]
        );
      }
    }

    // ----------------------------
    // Payments
    // ----------------------------
    for (let i = 0; i < 10; i++) {
      const customerId = customerIds[i % customerIds.length];
      const orderId = orderIds[i];
      const userId = userIds[i % userIds.length]; // use as created_by/collected_by
      const amount = 50 + i * 5;
      const paymentDate = new Date();

      await connection.query(
        `INSERT INTO payments
        (created_by, customer_id, order_id, amount, payment_date, payment_method, payment_type, bill_month, notes, collected_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `User ${userId}`,      // created_by
          customerId,
          orderId,
          amount,
          paymentDate,
          'cash',
          'order_payment',
          null,                  // bill_month
          `Payment for order ${i+1}`,
          `User ${userId}`       // collected_by
        ]
      );
    }

    console.log('✅ Dummy records inserted successfully!');
    connection.release();
    process.exit(0);

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedAll();
