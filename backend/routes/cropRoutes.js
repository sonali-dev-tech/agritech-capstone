const router = require('express').Router();
const c = require('../controllers/cropController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.route('/').get(c.getCrops).post(c.createCrop);
router.route('/:id').get(c.getCrop).put(c.updateCrop).delete(c.deleteCrop);
router.post('/:id/alerts', c.addAlert);
router.patch('/:id/alerts/:alertId/resolve', c.resolveAlert);
module.exports = router;
