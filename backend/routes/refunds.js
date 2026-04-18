const router = require('express').Router();
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');
const c = require('../controllers/refundController');
router.use(verifyToken, roleCheck('student'));
router.post('/', c.request);
router.get('/my', c.getMy);
module.exports = router;
