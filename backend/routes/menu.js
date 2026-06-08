const router = require('express').Router();
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');
const c = require('../controllers/menuController');
// Public
router.get('/canteens', c.getCanteens);
router.get('/canteens/:id', c.getCanteen);
router.get('/canteens/:id/menu', c.getMenu);
// Vendor only
router.post('/items', verifyToken, roleCheck('vendor'), c.addItem);
router.put('/items/:id', verifyToken, roleCheck('vendor'), c.updateItem);
router.put('/items/:id/toggle', verifyToken, roleCheck('vendor'), c.toggleItem);
router.put('/items/:id/restock', verifyToken, roleCheck('vendor'), c.restockItem);
router.delete('/items/:id', verifyToken, roleCheck('vendor'), c.deleteItem);
module.exports = router;
