const express = require('express');
const Order = require('../models/Order');
const { sendOrderConfirmation } = require('../services/email');
const router = express.Router();

// Generate unique order ID
const generateOrderId = () => {
  return 'LAREJI-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// CREATE order
router.post('/', async (req, res) => {
  try {
    const orderId = generateOrderId();
    const order = new Order({
      orderId,
      ...req.body,
      timeline: [
        { status: 'Order Placed', date: new Date(), icon: '✓', completed: true },
        { status: 'Processing', date: new Date(), icon: '⏳', completed: false },
        { status: 'Handed to Courier', date: null, icon: '📦', completed: false },
        { status: 'In Transit', date: null, icon: '🚚', completed: false },
        { status: 'Out for Delivery', date: null, icon: '🚚', completed: false },
        { status: 'Delivered', date: null, icon: '✅', completed: false }
      ],
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    });

    const saved = await order.save();
    
    // Send confirmation email
    await sendOrderConfirmation(saved);

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all orders (admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE order status (admin)
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;