// ═══════════════════════════════════════════
// users.js route
// ═══════════════════════════════════════════
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize, superAdminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// GET /api/users  (super admin: all users; client admin: company users)
router.get('/', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, status } = req.query;
  const query = {};

  if (req.user.role !== 'super_admin') {
    query.companyId = req.user.companyId;
  }
  if (search) {
    query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName:  new RegExp(search, 'i') },
      { email:     new RegExp(search, 'i') },
    ];
  }
  if (role)   query.role = role;
  if (status !== undefined) query.isActive = status === 'active';

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password -resetPasswordToken -emailVerifyToken')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({ success: true, count: total, page: parseInt(page), data: users });
}));

// GET /api/users/:id
router.get('/:id', protect, asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return next(new ErrorResponse('User not found', 404));
  if (req.user.role !== 'super_admin' && user.companyId?.toString() !== req.user.companyId?.toString()) {
    return next(new ErrorResponse('Access denied', 403));
  }
  res.json({ success: true, data: user });
}));

// POST /api/users  (create user within company)
router.post('/', protect, authorize('super_admin', 'client_admin'), [
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars'),
  body('role').isIn(['client_admin', 'staff', 'viewer']).withMessage('Invalid role'),
], validate, asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, role, phone } = req.body;

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return next(new ErrorResponse('Email already in use', 400));

  const user = await User.create({
    firstName, lastName, email, password, role, phone,
    companyId: req.body.companyId || req.user.companyId,
    companyName: req.user.companyName,
    createdBy: req.user._id,
  });

  user.password = undefined;
  res.status(201).json({ success: true, message: 'User created', data: user });
}));

// PUT /api/users/:id
router.put('/:id', protect, asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  if (req.user.role !== 'super_admin' && req.user._id.toString() !== req.params.id &&
      user.companyId?.toString() !== req.user.companyId?.toString()) {
    return next(new ErrorResponse('Access denied', 403));
  }

  const allowed = ['firstName', 'lastName', 'phone', 'avatar', 'preferences'];
  if (req.user.role === 'super_admin' || req.user.role === 'client_admin') {
    allowed.push('role', 'isActive');
  }

  allowed.forEach(field => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  await user.save({ validateBeforeSave: false });
  user.password = undefined;
  res.json({ success: true, message: 'User updated', data: user });
}));

// DELETE /api/users/:id
router.delete('/:id', protect, authorize('super_admin', 'client_admin'), asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  if (req.user._id.toString() === req.params.id) {
    return next(new ErrorResponse('Cannot delete your own account', 400));
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
}));

module.exports = router;
