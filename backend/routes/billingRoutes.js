// routes/billingRoutes.js
const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

router.post('/generate-bill', billingController.generateBill);

module.exports = router;
