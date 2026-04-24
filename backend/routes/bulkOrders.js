const router = require('express').Router();
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');
const c = require('../controllers/bulkOrderController');

router.use(verifyToken);

router.post('/', roleCheck('student'), c.submitBulkOrder);
router.get('/my', roleCheck('student'), c.getMyBulkOrders);
router.get('/:id', c.getBulkOrder);

module.exports = router;
