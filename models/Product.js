const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  emoji: { type: String, required: true },
  category: { type: String, required: true },
  categoryLabel: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  description: { type: String, required: true },
  details: { type: String },
  sizes: [String],
  badge: { type: String }, // 'NEW', 'POPULAR', 'SALE'
  featured: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true },
  image: { type: String }, // Cloudinary URL
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);