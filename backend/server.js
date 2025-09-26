// ./server.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db"); // import DB pool
const initTables = require("./utils/initTables");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/users", require("./routes/userRoutes"));


// Health check
app.get("/", (req, res) => {
  res.send("✅ AquaFlow API is running...");
});

// Error handling
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server after DB connection and table initialization
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1️⃣ Check DB connection
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();

    // 2️⃣ Initialize tables
    // await initTables();

    // 3️⃣ Start Express server
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1); // stop process if DB connection or table init fails
  }
}

startServer();
