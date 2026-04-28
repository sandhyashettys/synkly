const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, superAdminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { Module } = require('../models/index');

// GET /api/modules  (public)
router.get('/', asyncHandler(async (req, res) => {
  const { category, active } = req.query;
  const query = {};
  if (active !== 'false') query.isActive = true;
  if (category) query.category = category;
  const modules = await Module.find(query).sort('order');
  res.json({ success: true, data: modules });
}));

// GET /api/modules/:slug
router.get('/:slug', asyncHandler(async (req, res, next) => {
  const mod = await Module.findOne({ slug: req.params.slug });
  if (!mod) return next(new ErrorResponse('Module not found', 404));
  res.json({ success: true, data: mod });
}));

// POST /api/modules (admin)
router.post('/', protect, superAdminOnly, [
  body('name').trim().notEmpty().withMessage('Module name required'),
  body('description').notEmpty().withMessage('Description required'),
], validate, asyncHandler(async (req, res) => {
  const mod = await Module.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, message: 'Module created', data: mod });
}));

// PUT /api/modules/:id (admin)
router.put('/:id', protect, superAdminOnly, asyncHandler(async (req, res, next) => {
  const mod = await Module.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!mod) return next(new ErrorResponse('Module not found', 404));
  res.json({ success: true, message: 'Module updated', data: mod });
}));

// DELETE /api/modules/:id (admin)
router.delete('/:id', protect, superAdminOnly, asyncHandler(async (req, res, next) => {
  const mod = await Module.findById(req.params.id);
  if (!mod) return next(new ErrorResponse('Module not found', 404));
  await mod.deleteOne();
  res.json({ success: true, message: 'Module deleted' });
}));

module.exports = router;
