const router = require('express').Router();
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');
const c = require('../controllers/vendorController');
const b = require('../controllers/bulkOrderController');

router.use(verifyToken, roleCheck('vendor'));

router.get('/dashboard', c.getDashboard);
router.get('/orders/live', c.getLiveOrders);
router.get('/orders/preorders', c.getPreorders);
router.put('/orders/:id/accept', c.acceptOrder);
router.put('/orders/:id/prepare', c.markPreparing);
router.put('/orders/:id/ready', c.markReady);
router.put('/orders/:id/delivered', c.markDelivered);
router.put('/orders/:id/complete', c.completeOrder);
router.put('/canteen/status', c.updateCanteenStatus);
router.get('/analytics', c.getAnalytics);

// Bulk orders
router.get('/bulk-orders', b.vendorListBulkOrders);
router.put('/bulk-orders/:id/fulfill', b.fulfillBulkOrder);

module.exports = router;
