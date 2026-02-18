const express = require('express');
const router = express.Router();
const { signup, verifyOTP, signin } = require('../controllers/userController');

router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/signin', signin);

module.exports = router;
