const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// ── Protect routes (JWT verification)
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check cookie (optional)
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 401));
    }
    if (!user.isActive) {
      return next(new ErrorResponse('Your account has been deactivated', 403));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ErrorResponse('Token expired, please login again', 401));
    }
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// ── Role-based access control
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(
        `Role '${req.user.role}' is not authorized to access this route`, 403
      ));
    }
    next();
  };
};

// ── Super admin only
exports.superAdminOnly = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return next(new ErrorResponse('Super Admin access required', 403));
  }
  next();
};

// ── Client admin or above
exports.clientAdminOrAbove = (req, res, next) => {
  const allowed = ['super_admin', 'client_admin'];
  if (!allowed.includes(req.user.role)) {
    return next(new ErrorResponse('Admin access required', 403));
  }
  next();
};

// ── Same company access check
exports.sameCompany = (resourceCompanyId) => (req, res, next) => {
  if (req.user.role === 'super_admin') return next();
  if (req.user.companyId?.toString() !== resourceCompanyId?.toString()) {
    return next(new ErrorResponse('Access denied: different company', 403));
  }
  next();
};

// ── Optional auth (for public routes that can use auth)
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (_) {}
  }
  next();
});
