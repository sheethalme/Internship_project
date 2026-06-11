const router = require('express').Router();
const { verifyToken } = require('../middleware/authMiddleware');
const c = require('../controllers/notificationController');

router.use(verifyToken);

router.get('/',              c.getMyNotifications);
router.put('/read-all',      c.markAllRead);
router.put('/:id/read',      c.markRead);
router.delete('/:id',        c.dismiss);

module.exports = router;
