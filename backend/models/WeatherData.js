const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema(
  {
    location: { type: String, required: true, lowercase: true, trim: true, index: true },
    current: {
      temperature: Number, humidity: Number, windSpeed: Number,
      rainfallChance: Number, condition: String,
    },
    forecast: [
      { date: Date, minTemp: Number, maxTemp: Number, rainfallChance: Number, condition: String },
    ],
    advisory: [String],
    simulated: { type: Boolean, default: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model('WeatherData', weatherSchema);
