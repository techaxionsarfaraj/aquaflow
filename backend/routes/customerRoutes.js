// backend/routes/customerRoutes.js

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Routes
router.get('/', customerController.getAll);           // Get all customers
router.get('/:id', customerController.getById);      // Get customer by ID
router.post('/', customerController.create);         // Create new customer
router.put('/:id', customerController.update);       // Update customer
router.delete('/:id', customerController.remove);    // Delete customer

module.exports = router;
