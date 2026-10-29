const router = require('express').Router();
const c = require('../controllers/farmController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.route('/').get(c.getFarms).post(c.createFarm);
router.route('/:id').get(c.getFarm).put(c.updateFarm).delete(c.deleteFarm);
module.exports = router;
