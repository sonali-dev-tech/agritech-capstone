const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const getOwned = async (req, res) => {
  const farm = await Farm.findById(req.params.id);
  if (!farm) throw httpError(res, 404, 'Farm not found');
  if (req.user.role !== 'Admin' && !farm.owner.equals(req.user._id)) throw httpError(res, 403, 'Not your farm');
  return farm;
};

exports.getFarms = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'Admin' ? {} : { owner: req.user._id };
  res.json(await Farm.find(filter).populate('owner', 'name email').sort('-createdAt'));
});
exports.getFarm = asyncHandler(async (req, res) => res.json(await getOwned(req, res)));
exports.createFarm = asyncHandler(async (req, res) => {
  const { owner, ...body } = req.body;
  res.status(201).json(await Farm.create({ ...body, owner: req.user._id }));
});
exports.updateFarm = asyncHandler(async (req, res) => {
  const farm = await getOwned(req, res);
  const { owner, ...body } = req.body;
  farm.set(body);
  res.json(await farm.save());
});
exports.deleteFarm = asyncHandler(async (req, res) => {
  const farm = await getOwned(req, res);
  await Crop.deleteMany({ farm: farm._id });
  await farm.deleteOne();
  res.json({ message: 'Farm and its crops deleted' });
});
