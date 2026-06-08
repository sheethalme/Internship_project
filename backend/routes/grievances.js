const router = require('express').Router();
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');
const c = require('../controllers/grievanceController');
router.use(verifyToken);
router.post('/', roleCheck('student'), c.create);
router.get('/my', roleCheck('student'), c.getMy);
router.put('/:id/status', c.updateStatus);
module.exports = router;
