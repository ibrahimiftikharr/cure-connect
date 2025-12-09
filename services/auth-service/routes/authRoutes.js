const express = require('express');
const router = express.Router();
const {
  signup,
  verifyOTP,
  resendOTP,
  login,
  logout,
  getMe,
} = require('../controllers/authController');
const {
  signupValidation,
  verifyOTPValidation,
  loginValidation,
  resendOTPValidation,
} = require('../middleware/validation');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/signup', signupValidation, signup);
router.post('/verify-otp', verifyOTPValidation, verifyOTP);
router.post('/resend-otp', resendOTPValidation, resendOTP);
router.post('/login', loginValidation, login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
