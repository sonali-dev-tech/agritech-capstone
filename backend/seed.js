require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Farm = require('./models/Farm');
const Crop = require('./models/Crop');
const Product = require('./models/Product');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User, Farm, Crop, Product].map((m) => m.deleteMany()));
  await User.create({ name: 'Admin', email: 'admin@agritech.com', password: 'admin123', role: 'Admin' });
  const farmer = await User.create({ name: 'Ramesh Patil', email: 'farmer@agritech.com', password: 'farmer123', role: 'Farmer', phone: '9876543210', location: 'Pune' });
  const farm = await Farm.create({
    owner: farmer._id, name: 'Green Valley Farm', areaAcres: 12,
    location: { village: 'Baramati', district: 'Pune', state: 'Maharashtra' },
    soil: { type: 'Black cotton', ph: 7.8, nitrogen: 35, phosphorus: 28, potassium: 180, moisture: 32, organicCarbon: 0.5 },
  });
  await Crop.create({
    owner: farmer._id, farm: farm._id, name: 'Wheat', variety: 'HD-2967', stage: 'Vegetative',
    health: { score: 82, waterLevel: 55, growthPercent: 40 },
    pestAlerts: [{ pest: 'Aphids', severity: 'Medium', note: 'Spotted on lower leaves' }],
  });
  await Product.insertMany([
    { name: 'Hybrid Wheat Seeds', category: 'Seeds', price: 60, unit: 'kg', stock: 500, description: 'High yield, rust resistant' },
    { name: 'Urea (46% N)', category: 'Fertilizer', price: 6, unit: 'kg', stock: 2000, description: 'Nitrogen fertilizer' },
    { name: 'DAP Fertilizer', category: 'Fertilizer', price: 27, unit: 'kg', stock: 1500, description: 'Phosphorus & nitrogen' },
    { name: 'Neem Oil Pesticide', category: 'Pesticide', price: 450, unit: 'litre', stock: 80, description: 'Organic pest control' },
    { name: 'Drip Irrigation Kit', category: 'Equipment', price: 3500, unit: 'kit', stock: 25, description: '1 acre drip kit' },
    { name: 'Knapsack Sprayer', category: 'Equipment', price: 1800, unit: 'piece', stock: 8, description: '16L manual sprayer' },
  ]);
  console.log('Seeded. Admin: admin@agritech.com / admin123 | Farmer: farmer@agritech.com / farmer123');
  process.exit(0);
})();
