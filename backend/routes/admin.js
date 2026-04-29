const router = require('express').Router();
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');
const c = require('../controllers/adminController');
const b = require('../controllers/bulkOrderController');
const r = require('../controllers/reviewController');

router.use(verifyToken, roleCheck('admin'));

router.get('/dashboard', c.getDashboard);
router.get('/orders', c.getAllOrders);
router.put('/orders/:id', c.updateOrder);
router.get('/canteens', c.getAllCanteens);
router.put('/canteens/:id', c.updateCanteen);
router.get('/grievances', c.getAllGrievances);
router.put('/grievances/:id/reply', c.replyGrievance);
router.get('/refunds', c.getAllRefunds);
router.put('/refunds/:id/process', c.processRefund);
router.get('/analytics', c.getAnalytics);
router.get('/reviews', r.adminGetAll);
router.delete('/reviews/:id', r.adminDelete);

// Bulk orders
router.get('/bulk-orders', b.adminListBulkOrders);
router.put('/bulk-orders/:id/approve', b.approveBulkOrder);
router.put('/bulk-orders/:id/reject', b.rejectBulkOrder);

module.exports = router;
