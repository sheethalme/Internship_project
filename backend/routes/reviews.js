const router = require('express').Router();
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');
const c = require('../controllers/reviewController');
router.post('/', verifyToken, roleCheck('student'), c.submit);
router.get('/canteen/:canteen_id', c.getByCanteen);
module.exports = router;
