const router = require('express').Router();
const c = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
router.use(protect, authorize('Admin'));
router.get('/stats', c.getStats);
router.get('/users', c.getUsers);
router.delete('/users/:id', c.deleteUser);
module.exports = router;
