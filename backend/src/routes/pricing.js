// ═══════════════════════════════ pricing.js ═══════════════════════════
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, superAdminOnly, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { Plan } = require('../models/index');

// GET /api/pricing  (public)
router.get('/', asyncHandler(async (req, res) => {
  const plans = await Plan.find({ isActive: true })
    .sort('order')
    .populate('modules', 'name icon');
  res.json({ success: true, data: plans });
}));

// GET /api/pricing/:id
router.get('/:id', asyncHandler(async (req, res, next) => {
  const plan = await Plan.findById(req.params.id).populate('modules');
  if (!plan) return next(new ErrorResponse('Plan not found', 404));
  res.json({ success: true, data: plan });
}));

// POST /api/pricing (admin)
router.post('/', protect, superAdminOnly, [
  body('name').trim().notEmpty().withMessage('Plan name required'),
  body('monthlyPrice').isNumeric().withMessage('Monthly price must be a number'),
  body('yearlyPrice').isNumeric().withMessage('Yearly price must be a number'),
], validate, asyncHandler(async (req, res) => {
  const plan = await Plan.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, message: 'Plan created', data: plan });
}));

// PUT /api/pricing/:id (admin)
router.put('/:id', protect, superAdminOnly, asyncHandler(async (req, res, next) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!plan) return next(new ErrorResponse('Plan not found', 404));
  res.json({ success: true, message: 'Plan updated', data: plan });
}));

// DELETE /api/pricing/:id (admin)
router.delete('/:id', protect, superAdminOnly, asyncHandler(async (req, res, next) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) return next(new ErrorResponse('Plan not found', 404));
  await plan.deleteOne();
  res.json({ success: true, message: 'Plan deleted' });
}));

module.exports = router;
