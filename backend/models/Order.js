const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        price: Number,
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: [true, 'Shipping address is required'] },
    paymentMethod: { type: String, enum: ['COD', 'UPI', 'Card'], default: 'COD' },
    status: { type: String, enum: ['Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' },
    statusHistory: [{ status: String, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);
module.exports = mongoose.model('Order', orderSchema);
