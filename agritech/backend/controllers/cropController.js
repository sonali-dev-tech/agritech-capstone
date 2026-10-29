const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const getOwned = async (req, res) => {
  const crop = await Crop.findById(req.params.id);
  if (!crop) throw httpError(res, 404, 'Crop not found');
  if (req.user.role !== 'Admin' && !crop.owner.equals(req.user._id)) throw httpError(res, 403, 'Not your crop');
  return crop;
};

exports.getCrops = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'Admin' ? {} : { owner: req.user._id };
  if (req.query.farm) filter.farm = req.query.farm;
  res.json(await Crop.find(filter).populate('farm', 'name location.district').sort('-createdAt'));
});
exports.getCrop = asyncHandler(async (req, res) => res.json(await getOwned(req, res)));
exports.createCrop = asyncHandler(async (req, res) => {
  const farm = await Farm.findById(req.body.farm);
  if (!farm) throw httpError(res, 404, 'Farm not found');
  if (req.user.role !== 'Admin' && !farm.owner.equals(req.user._id)) throw httpError(res, 403, 'Not your farm');
  const { owner, pestAlerts, ...body } = req.body;
  res.status(201).json(await Crop.create({ ...body, owner: farm.owner }));
});
exports.updateCrop = asyncHandler(async (req, res) => {
  const crop = await getOwned(req, res);
  const { owner, farm, pestAlerts, ...body } = req.body;
  crop.set(body);
  res.json(await crop.save());
});
exports.deleteCrop = asyncHandler(async (req, res) => {
  await (await getOwned(req, res)).deleteOne();
  res.json({ message: 'Crop deleted' });
});
exports.addAlert = asyncHandler(async (req, res) => {
  const crop = await getOwned(req, res);
  crop.pestAlerts.push({ pest: req.body.pest, severity: req.body.severity, note: req.body.note });
  res.status(201).json(await crop.save());
});
exports.resolveAlert = asyncHandler(async (req, res) => {
  const crop = await getOwned(req, res);
  const alert = crop.pestAlerts.id(req.params.alertId);
  if (!alert) throw httpError(res, 404, 'Alert not found');
  alert.resolved = true;
  res.json(await crop.save());
});
