const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const send = (res, status, user) =>
  res.status(status).json({
    token: user.signToken(),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, location: user.location },
  });

// Public registration always creates a Farmer. Admins are created via seed script / DB.
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, location } = req.body;
  if (await User.findOne({ email })) throw httpError(res, 400, 'Email already registered');
  const user = await User.create({ name, email, password, phone, location, role: 'Farmer' });
  send(res, 201, user);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(res, 400, 'Email and password are required');
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw httpError(res, 401, 'Invalid email or password');
  send(res, 200, user);
});

exports.me = asyncHandler(async (req, res) => res.json(req.user));
