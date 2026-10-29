const router = require('express').Router();
const c = require('../controllers/weatherController');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.get('/', c.getWeather);
router.get('/history', authorize('Admin'), c.getHistory);
module.exports = router;
