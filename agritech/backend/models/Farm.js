const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Farm name is required'], trim: true },
    areaAcres: { type: Number, required: [true, 'Area is required'], min: 0 },
    location: {
      village: String,
      district: { type: String, required: [true, 'District is required'] },
      state: String,
      latitude: Number,
      longitude: Number,
    },
    soil: {
      type: { type: String, default: 'Loamy' },
      ph: { type: Number, min: 0, max: 14, default: 6.5 },
      nitrogen: { type: Number, default: 50 },
      phosphorus: { type: Number, default: 30 },
      potassium: { type: Number, default: 150 },
      moisture: { type: Number, min: 0, max: 100, default: 35 },
      organicCarbon: { type: Number, default: 0.6 },
      lastTested: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Farm', farmSchema);
