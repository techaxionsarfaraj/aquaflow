// backend/controllers/customerController.js

const customerModel = require('../models/customerModel');

// Get all customers
exports.getAll = async (req, res) => {
  try {
    const customers = await customerModel.getAllCustomers();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get customer by ID
exports.getById = async (req, res) => {
  try {
    const customer = await customerModel.getCustomerById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create customer
exports.create = async (req, res) => {
  try {
    const newCustomer = await customerModel.createCustomer(req.body);
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update customer
exports.update = async (req, res) => {
  try {
    const updatedCustomer = await customerModel.updateCustomer(req.params.id, req.body);
    if (!updatedCustomer) return res.status(404).json({ message: 'Customer not found' });
    res.json(updatedCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete customer
exports.remove = async (req, res) => {
  try {
    const customer = await customerModel.getCustomerById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const result = await customerModel.deleteCustomer(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
