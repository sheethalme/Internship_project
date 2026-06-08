const router = require('express').Router();
const { registerStudent, loginStudent, loginVendor, loginAdmin } = require('../controllers/authController');
router.post('/student/register', registerStudent);
router.post('/student/login', loginStudent);
router.post('/vendor/login', loginVendor);
router.post('/admin/login', loginAdmin);
module.exports = router;
