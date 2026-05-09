const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true },
  customer: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  items: [{
    productId: Number,
    name: String,
    emoji: String,
    price: Number,
    size: String,
    qty: Number
  }],
  subtotal: Number,
  shipping: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: Number,
  currency: { type: String, default: 'NGN' },
  paymentMethod: { type: String, enum: ['card', 'bank_transfer', 'ussd', 'whatsapp'] },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  transactionId: String,
  orderStatus: { 
    type: String, 
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  trackingNumber: String,
  timeline: [{
    status: String,
    date: Date,
    icon: String,
    completed: Boolean
  }],
  createdAt: { type: Date, default: Date.now },
  estimatedDelivery: Date,
  shippingMethod: String
});

module.exports = mongoose.model('Order', orderSchema);