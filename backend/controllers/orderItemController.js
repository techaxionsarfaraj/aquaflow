// backend/controllers/orderItemController.js

const orderItemModel = require('../models/orderItemModel');

exports.getAll = async (req, res) => {
  try {
    const items = await orderItemModel.getAllItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await orderItemModel.getItemById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Order item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const item = await orderItemModel.createItem(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await orderItemModel.updateItem(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Order item not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await orderItemModel.getItemById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Order item not found' });

    const result = await orderItemModel.deleteItem(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
