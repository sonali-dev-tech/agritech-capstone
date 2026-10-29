const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    category: { type: String, enum: ['Seeds', 'Fertilizer', 'Pesticide', 'Equipment', 'Other'], default: 'Other' },
    description: String,
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    unit: { type: String, default: 'kg' },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Product', productSchema);
