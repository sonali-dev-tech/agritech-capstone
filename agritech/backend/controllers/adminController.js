const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

exports.getStats = asyncHandler(async (req, res) => {
  const [users, farms, crops, orders, products, revenue, byStatus, alerts, lowStock] = await Promise.all([
    User.countDocuments({ role: 'Farmer' }), Farm.countDocuments(), Crop.countDocuments(), Order.countDocuments(),
    Product.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Crop.aggregate([{ $unwind: '$pestAlerts' }, { $match: { 'pestAlerts.resolved': false } }, { $count: 'open' }]),
    Product.find({ stock: { $lt: 10 } }).select('name stock'),
  ]);
  res.json({
    farmers: users, farms, crops, orders, products,
    revenue: revenue[0]?.total || 0,
    ordersByStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    openPestAlerts: alerts[0]?.open || 0,
    lowStock,
  });
});

exports.getUsers = asyncHandler(async (req, res) => res.json(await User.find().sort('-createdAt')));

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(res, 404, 'User not found');
  if (user.role === 'Admin') throw httpError(res, 400, 'Admin accounts cannot be deleted here');
  const farms = await Farm.find({ owner: user._id }).select('_id');
  await Crop.deleteMany({ farm: { $in: farms.map((f) => f._id) } });
  await Farm.deleteMany({ owner: user._id });
  await user.deleteOne();
  res.json({ message: 'User and related data deleted' });
});
