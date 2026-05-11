const express = require('express');
const axios = require('axios');
const Order = require('../models/Order');
const router = express.Router();

// INITIALIZE PAYMENT
router.post('/initialize', async (req, res) => {
  try {
    const { email, fullName, phone, address, amount, tx_ref } = req.body;

    const payload = {
      public_key: process.env.FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: tx_ref || `lareji_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount,
      currency: 'NGN',
      payment_options: 'card,ussd,bank_transfer',
      customer: {
        email: email,
        phone_number: phone,
        name: fullName
      },
      customizations: {
        title: 'LAREJI Store',
        description: `Order from ${fullName}`,
        logo: 'https://lareji.co/logo.png'
      },
      meta: {
        customer_name: fullName,
        address: address
      },
      redirect_url: 'https://lareji-store.vercel.app/checkout/success'
    };

    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status === 'success') {
      res.json({
        success: true,
        link: response.data.data.link,
        tx_ref: response.data.data.tx_ref
      });
    } else {
      res.status(400).json({ error: 'Failed to create payment link' });
    }
  } catch (err) {
    console.error('Payment error:', err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// VERIFY FLUTTERWAVE PAYMENT
router.post('/verify-flutterwave', async (req, res) => {
  try {
    const { transactionId, orderId } = req.body;

    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
        }
      }
    );

    if (response.data.data.status === 'successful') {
      const order = await Order.findOne({ orderId });
      if (order) {
        order.paymentStatus = 'completed';
        order.transactionId = transactionId;
        if (order.timeline && order.timeline[1]) {
          order.timeline[1].completed = true;
        }
        await order.save();
      }

      res.json({ success: true, order });
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (err) {
    console.error('Verification error:', err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;