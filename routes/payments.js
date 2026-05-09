const express = require('express');
const axios = require('axios');
const Order = require('../models/Order');
const router = express.Router();

// VERIFY FLUTTERWAVE PAYMENT
router.post('/verify-flutterwave', async (req, res) => {
  try {
    const { transactionId, orderId } = req.body;

    // Verify with Flutterwave API
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    if (response.data.data.status === 'successful') {
      // Update order status
      const order = await Order.findOne({ orderId });
      order.paymentStatus = 'completed';
      order.transactionId = transactionId;
      order.timeline[1].completed = true;
      await order.save();

      res.json({ success: true, order });
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// INITIALIZE PAYMENT
router.post('/initialize', async (req, res) => {
  try {
    const { email, amount, currency, orderId } = req.body;

    const payload = {
      email,
      amount,
      currency: currency || 'NGN',
      meta: { orderId },
      redirect_url: 'https://lareji.vercel.app/checkout'
    };

    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;