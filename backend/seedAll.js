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
      ['John Doe', '9876543210', 'john@example.com', '123 Main St', 'Area 1', 'Navrangpura', 'Ahmedabad', '380009', 'residential', 'morning', TRUE, 100.00, 'active', 'Regular customer'],
      ['Jane Smith', '9876543211', 'jane@example.com', '456 Elm St', 'Area 2', 'Maninagar', 'Ahmedabad', '380008', 'commercial', 'afternoon', TRUE, 50.00, 'active', 'Prefers afternoon delivery'],
      ['Robert Brown', '9876543212', 'robert@example.com', '789 Oak St', 'Area 3', 'Bopal', 'Ahmedabad', '380058', 'residential', 'evening', FALSE, 0.00, 'inactive', 'Temporary inactive'],
      ['Emily Davis', '9876543213', 'emily@example.com', '321 Pine St', 'Area 4', 'Satellite', 'Ahmedabad', '380015', 'commercial', 'anytime', TRUE, 150.00, 'active', 'Monthly subscription'],
      ['Michael Wilson', '9876543214', 'michael@example.com', '654 Maple St', 'Area 5', 'Vastrapur', 'Ahmedabad', '380052', 'residential', 'morning', TRUE, 80.00, 'suspended', 'Suspended due to payment'],
      ['Linda Johnson', '9876543215', 'linda@example.com', '987 Birch St', 'Area 6', 'Ghatlodia', 'Ahmedabad', '380061', 'commercial', 'evening', TRUE, 0.00, 'active', 'No deposit'],
      ['David Lee', '9876543216', 'david@example.com', '111 Cedar St', 'Area 7', 'Chandkheda', 'Ahmedabad', '382424', 'residential', 'afternoon', FALSE, 0.00, 'active', NULL],
      ['Susan Taylor', '9876543217', 'susan@example.com', '222 Walnut St', 'Area 8', 'Nikol', 'Ahmedabad', '382350', 'commercial', 'anytime', TRUE, 50.00, 'active', 'Notes for Susan'],
      ['James Martin', '9876543218', 'james@example.com', '333 Chestnut St', 'Area 9', 'Thaltej', 'Ahmedabad', '380059', 'residential', 'morning', TRUE, 20.00, 'active', NULL],
      ['Patricia Clark', '9876543219', 'patricia@example.com', '444 Spruce St', 'Area 10', 'Shahibaug', 'Ahmedabad', '380004', 'commercial', 'afternoon', TRUE, 100.00, 'active', 'VIP customer'],
    ];

    const customerIds = [];
    for (const c of customers) {
      const [result] = await connection.query(
        `INSERT INTO customers
        (name, phone, email, street_address, area, town, city, pincode, 
          customer_type, delivery_preference, monthly_subscription, deposit_amount, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ['20L Jar', '20L_jar', 50.00, 'Large water jar', 100, 20, 10, 'active'],
      ['10L Jar', '10L_jar', 30.00, 'Medium water jar', 50, 30, 15, 'active'],
      ['5L Bottle', '5L_bottle', 15.00, 'Small bottle', 0, 40, 20, 'active'],
      ['1L Bottle', '1L_bottle', 5.00, 'Mini bottle', 0, 50, 25, 'active'],
      ['Extra Large Jar', '20L_jar', 60.00, 'Extra large jar', 150, 10, 5, 'active'],
      ['Medium Bottle', '5L_bottle', 18.00, 'Medium bottle', 0, 30, 15, 'active'],
      ['Small Bottle', '1L_bottle', 6.00, 'Small bottle', 0, 25, 10, 'active'],
      ['Premium Jar', '20L_jar', 70.00, 'Premium jar', 200, 5, 2, 'active'],
      ['Basic Jar', '10L_jar', 25.00, 'Basic jar', 30, 40, 20, 'active'],
      ['Deluxe Bottle', '5L_bottle', 20.00, 'Deluxe bottle', 0, 15, 5, 'active'],
    ];

    const productIds = [];
    for (const p of products) {
      const [result] = await connection.query(
        `INSERT INTO products
        (name, type, price_per_unit, description, total_stock, available_stock, minimum_stock, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
