const mongoose = require('mongoose');

const pestAlertSchema = new mongoose.Schema(
  {
    pest: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    note: String,
    resolved: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const cropSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    name: { type: String, required: [true, 'Crop name is required'], trim: true },
    variety: String,
    plantedOn: { type: Date, default: Date.now },
    expectedHarvest: Date,
    stage: { type: String, enum: ['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest'], default: 'Sowing' },
    health: {
      score: { type: Number, min: 0, max: 100, default: 80 },
      waterLevel: { type: Number, min: 0, max: 100, default: 50 },
      growthPercent: { type: Number, min: 0, max: 100, default: 0 },
      notes: String,
    },
    pestAlerts: [pestAlertSchema],
  },
  { timestamps: true }
);
module.exports = mongoose.model('Crop', cropSchema);
