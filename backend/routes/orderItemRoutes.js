// backend/routes/orderItemRoutes.js

const express = require('express');
const router = express.Router();
const orderItemController = require('../controllers/orderItemController');

router.get('/', orderItemController.getAll);
router.get('/:id', orderItemController.getById);
router.post('/', orderItemController.create);
router.put('/:id', orderItemController.update);
router.delete('/:id', orderItemController.remove);

module.exports = router;
