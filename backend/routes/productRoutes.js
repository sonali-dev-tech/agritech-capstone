const router = require('express').Router();
const c = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.get('/', c.getProducts);
router.post('/', authorize('Admin'), c.createProduct);
router.route('/:id').put(authorize('Admin'), c.updateProduct).delete(authorize('Admin'), c.deleteProduct);
module.exports = router;
