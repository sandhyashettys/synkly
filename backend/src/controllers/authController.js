const crypto = require('crypto');
const User = require('../models/User');
const Company = require('../models/Company');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

// ── Helper: send token response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken();

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    refreshToken,
    user: {
      id:          user._id,
      firstName:   user.firstName,
      lastName:    user.lastName,
      fullName:    user.fullName,
      email:       user.email,
      role:        user.role,
      companyId:   user.companyId,
      companyName: user.companyName,
      avatar:      user.avatar,
      plan:        user.plan,
      preferences: user.preferences,
    },
  });
};

// ── @desc   Register user + create company
// ── @route  POST /api/auth/register
// ── @access Public
exports.register = asyncHandler(async (req, res, next) => {
  const {
    firstName, lastName, email, password, phone,
    companyName, industry, companySize, website,
  } = req.body;

  // Check if email exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  // Create company
  const company = await Company.create({
    name: companyName || `${firstName}'s Company`,
    email: email.toLowerCase(),
    phone,
    industry,
    companySize,
    website,
    plan: 'free',
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 day trial
  });

  // Create user
  const user = await User.create({
    firstName, lastName, email, password, phone,
    companyId: company._id,
    companyName: company.name,
    industry,
    companySize,
    role: 'client_admin',
    plan: 'free',
    trialEndsAt: company.trialEndsAt,
  });

  // Link company to user
  company.createdBy = user._id;
  await company.save();

  // Send welcome email (non-blocking)
  try {
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Synkly ERP!',
      template: 'welcome',
      data: { name: user.firstName, companyName: company.name },
    });
  } catch (emailErr) {
    // Don't fail registration if email fails
    console.error('Welcome email failed:', emailErr.message);
  }

  // Update last login
  user.lastLogin = new Date();
  user.loginCount += 1;
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 201, res, 'Account created successfully');
});

// ── @desc   Login user
// ── @route  POST /api/auth/login
// ── @access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  if (!user.isActive) {
    return next(new ErrorResponse('Your account has been deactivated. Contact support.', 403));
  }

  // Update last login
  user.lastLogin = new Date();
  user.loginCount += 1;
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Login successful');
});

// ── @desc   Get current user
// ── @route  GET /api/auth/me
// ── @access Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('companyId');
  res.status(200).json({ success: true, user });
});

// ── @desc   Logout
// ── @route  POST /api/auth/logout
// ── @access Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Logged out successfully', token: null });
});

// ── @desc   Forgot password
// ── @route  POST /api/auth/forgot-password
// ── @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorResponse('Please provide an email address', 400));

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // Return success even if user not found (security)
    return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      template: 'resetPassword',
      data: { name: user.firstName, resetUrl, expiresIn: '10 minutes' },
    });
    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// ── @desc   Reset password
// ── @route  PUT /api/auth/reset-password/:token
// ── @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired reset token', 400));
  }

  if (!password || password.length < 8) {
    return next(new ErrorResponse('Password must be at least 8 characters', 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
});

// ── @desc   Update password (when logged in)
// ── @route  PUT /api/auth/update-password
// ── @access Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    return next(new ErrorResponse('Current password is incorrect', 400));
  }
  if (!newPassword || newPassword.length < 8) {
    return next(new ErrorResponse('New password must be at least 8 characters', 400));
  }
  if (!/(?=.*\d)(?=.*[!@#$%^&*])/.test(newPassword)) {
    return next(new ErrorResponse('Password must contain at least one number and one special character', 400));
  }

  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res, 'Password updated successfully');
});

// ── @desc   Refresh access token
// ── @route  POST /api/auth/refresh-token
// ── @access Public
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return next(new ErrorResponse('Refresh token required', 400));

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return next(new ErrorResponse('Invalid refresh token', 401));
    const newToken = user.getSignedJwtToken();
    res.status(200).json({ success: true, token: newToken });
  } catch (_) {
    return next(new ErrorResponse('Invalid or expired refresh token', 401));
  }
});
