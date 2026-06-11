const router = require('express').Router();
const { verifyToken } = require('../middleware/authMiddleware');
const c = require('../controllers/paymentController');
router.use(verifyToken);
router.post('/initiate', c.initiate);
router.post('/confirm', c.confirm);
router.get('/:order_id', c.getStatus);
module.exports = router;
