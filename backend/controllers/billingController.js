// controllers/billingController.js
const db = require("../config/db");
const fs = require("fs");
const path = require("path");
const orderModel = require("../models/orderModel");

const formatCurrency = (v) => {
  if (v == null || v === "") return "₹0.00";
  return "₹" + Number(v).toFixed(2);
};

exports.generateBill = async (req, res) => {
  try {
    const { order_id } = req.body;
    if (!order_id) {
      return res.status(400).json({ success: false, error: "order_id is required" });
    }

    const order = await orderModel.getOrderById(order_id);
    console.log(order);
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Parse product details
    let products = order.product_details;
    if (!Array.isArray(products)) {
      try {
        products = JSON.parse(order.product_details || "[]");
      } catch {
        products = [];
      }
    }

    const INVOICE_DIR = path.join(__dirname, "..", "invoices");
    fs.mkdirSync(INVOICE_DIR, { recursive: true });

    const filename = `ORD-${order.id}-${order.customer_phone}-Invoice.html`;
    const filePath = path.join(INVOICE_DIR, filename);

    const subtotal = products.reduce(
      (s, p) => s + (p.total || (p.quantity || 0) * (p.unit_price || 0)),
      0
    );
    const total = Number(order.total_amount || subtotal);

    // Tailwind Invoice HTML
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice - ${order.customer_name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://site-assets.fontawesome.com/releases/v7.0.1/css/all.css" />
</head>
<body class="bg-gray-50 font-sans">
  <!-- Header -->
  <div class="bg-blue-900 text-white py-6 text-center">
    <h1 class="text-2xl font-bold">INVOICE</h1>
  </div>

  <!-- Company Info -->
  <div class="max-w-4xl mx-auto p-6 bg-white shadow mt-6 rounded-lg">
    <div class="flex justify-between items-start border-b border-gray-100 ">
      <div class="flex flex-col gap-2 pb-6">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-droplets w-6 h-6 text-white"
              data-filename="layout"
              data-linenumber="88"
              data-visual-selector-id="layout88"
              data-source-location="layout:88:16"
              data-dynamic-content="false"
            >
              <path
                d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"
              ></path>
              <path
                d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"
              ></path>
            </svg>
          </div>
          <div>
            <h2 class="font-bold text-gray-900 text-lg">AquaFlow</h2>
            <p class="text-xs text-gray-500 font-medium">Water Delivery Manager</p>
          </div>
        </div>
      </div>
      <div class="text-right text-sm text-gray-700">
        <p class="text-left"><span class="font-semibold text-gray-900">Invoice :</span> #ORD-${order.id}</p>
        <p class="text-left"><span class="font-semibold text-gray-900">Date:</span> ${new Date(order.order_date).toLocaleDateString()}</p>
        <p class="text-left"><span class="font-semibold text-gray-900">Delivery Date:</span> ${new Date(order.delivery_date).toLocaleDateString()}</p>
      </div>
    </div>

    <!-- Bill To -->
    <div class="mt-6">
      <p class="text-gray-800 text-md mb-3"> <span class="font-semibold"> Bill To:</span></p>
      <p class="text-gray-700 text-sm mb-1"><i class="fa-regular fa-user"></i> ${order.customer_name}</p>
      <p class="text-gray-700 text-sm mb-1"><i class="fa-regular fa-envelope"></i> ${order.customer_email || ""}</p>
      <p class="text-gray-700 text-sm mb-1"><i class="fa-regular fa-phone"></i> +91 ${order.customer_phone || ""}</p>
      <p class="text-gray-700 text-sm mb-1"><i class="fa-regular fa-location-dot"></i> ${order.delivery_street_address || ""}</p>
      <p class="text-gray-700 text-sm mb-1"><i class="fa-regular fa-location-dot opacity-0"></i> ${order.delivery_area || ""} ${order.delivery_town || ""} </p>
      <p class="text-gray-700 text-sm"><i class="fa-regular fa-location-dot opacity-0"></i> ${order.delivery_city || ""} - ${order.delivery_pincode || ""}</p>
    </div>

    <!-- Items Table -->
    <div class="mt-6 overflow-x-auto">
      <table class="min-w-full border border-gray-200 text-sm">
        <thead class="bg-blue-900 text-white">
          <tr>
            <th class="px-4 py-2 text-left">PRODUCTS</th>
            <th class="px-4 py-2 text-left">DESCRIPTION</th>
            <th class="px-4 py-2 text-right">QTY</th>
            <th class="px-4 py-2 text-right">PRICE</th>
            <th class="px-4 py-2 text-right">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${products
            .map(
              (p, i) => `
            <tr class="${i % 2 === 0 ? "bg-gray-50" : "bg-white"}">
              <td class="px-4 py-2">${p.product_name || "Item"}</td>
              <td class="px-4 py-2">${p.description || "-"}</td>
              <td class="px-4 py-2 text-right">${p.quantity || 0}</td>
              <td class="px-4 py-2 text-right">${formatCurrency(p.unit_price || 0)}</td>
              <td class="px-4 py-2 text-right">${formatCurrency(
                p.total || (p.quantity || 0) * (p.unit_price || 0)
              )}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="mt-6 text-right">
      <p class="text-lg font-bold">Total: ${formatCurrency(total)}</p>
    </div>

    <!-- Notes -->
    <div class="mt-6 text-sm">
      <h4 class="font-semibold text-gray-800 ">Notes</h4>
      <p class="text-gray-600">Thank you for your business!</p>
    </div>

    <!-- Footer -->
    <div class="mt-10 text-center text-gray-500 text-xs border-t pt-4">
      Powered by AquaFlow
    </div>
  </div>
</body>
</html>
`;

    fs.writeFileSync(filePath, htmlContent, "utf-8");

    // save bill URL into database
    await db.query("UPDATE orders SET bill_url = ? WHERE id = ?", [filename, order_id]);

    const url = `${req.protocol}://${req.get("host")}/invoices/${filename}`;
    return res.json({ success: true, url });
  } catch (err) {
    console.error("generateBill error", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
