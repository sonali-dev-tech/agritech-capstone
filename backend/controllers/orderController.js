const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const FLOW = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];

// Body: { items:[{productId, quantity}], shippingAddress, paymentMethod }
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  if (!Array.isArray(items) || !items.length) throw httpError(res, 400, 'Order must contain items');

  const reserved = [];
  const lines = [];
  try {
    for (const it of items) {
      const qty = Number(it.quantity);
      if (!Number.isInteger(qty) || qty < 1) throw httpError(res, 400, 'Invalid quantity');
      // atomic stock reservation (works on standalone MongoDB, no transactions needed)
      const product = await Product.findOneAndUpdate(
        { _id: it.productId, stock: { $gte: qty } }, { $inc: { stock: -qty } }, { new: true }
      );
      if (!product) throw httpError(res, 400, 'A product is out of stock or does not exist');
      reserved.push({ id: product._id, qty });
      lines.push({ product: product._id, name: product.name, price: product.price, quantity: qty });
    }
    const totalAmount = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const order = await Order.create({
      user: req.user._id, items: lines, totalAmount, shippingAddress, paymentMethod,
      statusHistory: [{ status: 'Placed' }],
    });
    res.status(201).json(order);
  } catch (err) {
    for (const r of reserved) await Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } });
    throw err;
  }
});

exports.getMyOrders = asyncHandler(async (req, res) =>
  res.json(await Order.find({ user: req.user._id }).sort('-createdAt')));

exports.getAllOrders = asyncHandler(async (req, res) =>
  res.json(await Order.find().populate('user', 'name email').sort('-createdAt')));

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw httpError(res, 404, 'Order not found');
  if (req.user.role !== 'Admin' && !order.user._id.equals(req.user._id)) throw httpError(res, 403, 'Not your order');
  res.json(order);
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(res, 404, 'Order not found');
  const { status } = req.body;
  if (!['Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) throw httpError(res, 400, 'Invalid status');
  if (['Delivered', 'Cancelled'].includes(order.status)) throw httpError(res, 400, `Order already ${order.status}`);
  if (status !== 'Cancelled' && FLOW.indexOf(status) <= FLOW.indexOf(order.status)) throw httpError(res, 400, 'Status can only move forward');
  if (status === 'Cancelled') await restock(order);
  order.status = status;
  order.statusHistory.push({ status });
  res.json(await order.save());
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw httpError(res, 404, 'Order not found');
  if (!order.user.equals(req.user._id)) throw httpError(res, 403, 'Not your order');
  if (order.status !== 'Placed') throw httpError(res, 400, 'Only orders in "Placed" status can be cancelled');
  await restock(order);
  order.status = 'Cancelled';
  order.statusHistory.push({ status: 'Cancelled' });
  res.json(await order.save());
});

const restock = (order) =>
  Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } })));
