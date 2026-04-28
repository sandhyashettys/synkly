const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, clientAdminOrAbove } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Company = require('../models/Company');
const mongoose = require('mongoose');

// ── Dynamic Record model factory (per-collection per-company)
const getRecordModel = (module) => {
  const modelName = `Record_${module}`;
  if (mongoose.models[modelName]) return mongoose.models[modelName];

  const schema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    module:    { type: String, required: true, index: true },
    data:      { type: mongoose.Schema.Types.Mixed, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  }, { timestamps: true });

  schema.index({ companyId: 1, module: 1, createdAt: -1 });
  return mongoose.model(modelName, schema);
};

// ── GET /api/client/dashboard
router.get('/dashboard', protect, asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const company = await Company.findById(companyId).populate('planId');

  // Count records per module
  const moduleNames = ['finance', 'hr', 'crm', 'inventory', 'projects', 'support'];
  const moduleCounts = {};
  for (const mod of moduleNames) {
    try {
      const Model = getRecordModel(mod);
      moduleCounts[mod] = await Model.countDocuments({ companyId, isDeleted: false });
    } catch (_) { moduleCounts[mod] = 0; }
  }

  res.json({
    success: true,
    data: {
      company,
      moduleCounts,
      trialDaysLeft: company?.trialEndsAt
        ? Math.max(0, Math.ceil((new Date(company.trialEndsAt) - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0,
    },
  });
}));

// ── GET /api/client/records/:module
router.get('/records/:module', protect, asyncHandler(async (req, res) => {
  const { module } = req.params;
  const { page = 1, limit = 20, search, sortBy = 'createdAt', sortDir = 'desc', ...filters } = req.query;
  const companyId = req.user.companyId;

  const Model = getRecordModel(module);
  const query = { companyId, module, isDeleted: false };

  if (search) {
    query['$or'] = [
      { 'data.name':        new RegExp(search, 'i') },
      { 'data.title':       new RegExp(search, 'i') },
      { 'data.email':       new RegExp(search, 'i') },
      { 'data.description': new RegExp(search, 'i') },
    ];
  }

  // Dynamic filters from data fields
  Object.keys(filters).forEach(key => {
    if (key.startsWith('data.')) query[key] = filters[key];
  });

  const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 };
  const total = await Model.countDocuments(query);
  const records = await Model.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('createdBy', 'firstName lastName');

  res.json({
    success: true,
    count: total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: records,
  });
}));

// ── POST /api/client/records/:module
router.post('/records/:module', protect, asyncHandler(async (req, res) => {
  const { module } = req.params;
  const companyId = req.user.companyId;

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ success: false, message: 'Record data is required' });
  }

  const Model = getRecordModel(module);
  const record = await Model.create({
    companyId,
    module,
    data: req.body,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Record created', data: record });
}));

// ── PUT /api/client/records/:module/:id
router.put('/records/:module/:id', protect, asyncHandler(async (req, res, next) => {
  const { module, id } = req.params;
  const companyId = req.user.companyId;

  const Model = getRecordModel(module);
  const record = await Model.findOne({ _id: id, companyId, isDeleted: false });
  if (!record) return next(new ErrorResponse('Record not found', 404));

  record.data = { ...record.data, ...req.body };
  record.updatedBy = req.user._id;
  await record.save();

  res.json({ success: true, message: 'Record updated', data: record });
}));

// ── DELETE /api/client/records/:module/:id
router.delete('/records/:module/:id', protect, asyncHandler(async (req, res, next) => {
  const { module, id } = req.params;
  const companyId = req.user.companyId;

  const Model = getRecordModel(module);
  const record = await Model.findOne({ _id: id, companyId, isDeleted: false });
  if (!record) return next(new ErrorResponse('Record not found', 404));

  // Soft delete
  record.isDeleted = true;
  record.deletedAt = new Date();
  await record.save();

  res.json({ success: true, message: 'Record deleted' });
}));

// ── GET /api/client/company
router.get('/company', protect, asyncHandler(async (req, res) => {
  const company = await Company.findById(req.user.companyId);
  if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
  res.json({ success: true, data: company });
}));

// ── PUT /api/client/company
router.put('/company', protect, clientAdminOrAbove, asyncHandler(async (req, res, next) => {
  const company = await Company.findById(req.user.companyId);
  if (!company) return next(new ErrorResponse('Company not found', 404));

  const allowed = ['name', 'phone', 'website', 'industry', 'companySize', 'address', 'branding', 'settings'];
  allowed.forEach(field => {
    if (req.body[field] !== undefined) company[field] = req.body[field];
  });

  await company.save();
  res.json({ success: true, message: 'Company updated', data: company });
}));

// ── GET /api/client/reports/:module
router.get('/reports/:module', protect, asyncHandler(async (req, res) => {
  const { module } = req.params;
  const { from, to } = req.query;
  const companyId = req.user.companyId;

  const Model = getRecordModel(module);
  const dateQuery = {};
  if (from) dateQuery.$gte = new Date(from);
  if (to)   dateQuery.$lte = new Date(to);

  const query = { companyId, module, isDeleted: false };
  if (from || to) query.createdAt = dateQuery;

  const total = await Model.countDocuments(query);
  const records = await Model.find(query).sort('-createdAt').limit(1000);

  // Basic stats from data fields
  const summary = {
    total,
    module,
    period: { from: from || 'all time', to: to || 'now' },
    records: records.map(r => r.data),
  };

  res.json({ success: true, data: summary });
}));

module.exports = router;
