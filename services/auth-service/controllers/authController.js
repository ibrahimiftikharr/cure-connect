const User = require('../models/User');
const emailService = require('../services/emailService');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/jwtUtils');

// @desc    Register user and send OTP
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email',
        });
      }
      
      // If user exists but not verified, update and resend OTP
      existingUser.name = name;
      existingUser.password = password;
      existingUser.role = role;
      
      const otp = existingUser.generateOTP();
      await existingUser.save();
      
      await emailService.sendOTP(email, otp, name);
      
      return res.status(200).json({
        success: true,
        message: 'OTP resent successfully. Please check your email.',
        email: email,
      });
    }

    // Create new user
    const userData = {
      name,
      email,
      password,
      role,
    };

    const user = await User.create(userData);

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    await emailService.sendOTP(email, otp, name);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for OTP verification.',
      email: email,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Verify OTP and activate user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password +otp');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified',
      });
    }

    // Debug logging
    console.log('OTP Verification Debug:', {
      email,
      receivedOTP: otp,
      storedOTP: user.otp?.code,
      expiresAt: user.otp?.expiresAt,
      currentTime: new Date(),
      isExpired: user.otp?.expiresAt ? new Date() > user.otp.expiresAt : 'No expiry',
      otpMatch: user.otp?.code === otp,
    });

    // Verify OTP
    if (!user.verifyOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
        debug: process.env.NODE_ENV === 'development' ? {
          storedOTP: user.otp?.code,
          receivedOTP: otp,
          expiresAt: user.otp?.expiresAt,
          currentTime: new Date(),
        } : undefined,
      });
    }

    // Activate user
    user.isVerified = true;
    user.isActive = true;
    user.otp = undefined;
    await user.save();

    // Generate JWT token
    const token = generateToken(user);
    setTokenCookie(res, token);

    // Send welcome email
    await emailService.sendWelcomeEmail(email, user.name, user.role);

    // Return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileComplete: user.profileComplete,
      isVerified: user.isVerified,
    };

    if (user.role === 'doctor') {
      userData.specialty = user.specialty;
      userData.qualifications = user.qualifications;
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to CureConnect.',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified',
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    await emailService.sendOTP(email, otp, user.name);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully. Please check your email.',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for OTP.',
        requiresVerification: true,
        email: user.email,
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user);
    setTokenCookie(res, token);

    // Return user data without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileComplete: user.profileComplete,
      isVerified: user.isVerified,
    };

    if (user.role === 'doctor') {
      userData.specialty = user.specialty;
      userData.qualifications = user.qualifications;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    clearTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed. Please try again.',
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const userData = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      profileComplete: req.user.profileComplete,
      isVerified: req.user.isVerified,
    };

    if (req.user.role === 'doctor') {
      userData.specialty = req.user.specialty;
      userData.qualifications = req.user.qualifications;
    }

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
    });
  }
};

module.exports = {
  signup,
  verifyOTP,
  resendOTP,
  login,
  logout,
  getMe,
};
