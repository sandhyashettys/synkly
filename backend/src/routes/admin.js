const express = require('express');
const router = express.Router();
const { protect, superAdminOnly } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Company = require('../models/Company');
const { Blog, Contact, Plan, AuditLog } = require('../models/index');

// ── GET /api/admin/stats  — dashboard overview
router.get('/stats', protect, superAdminOnly, asyncHandler(async (req, res) => {
  const [
    totalUsers, activeUsers, totalCompanies,
    totalBlogs, publishedBlogs, newContacts,
    trialCompanies, paidCompanies,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Company.countDocuments(),
    Blog.countDocuments(),
    Blog.countDocuments({ status: 'published' }),
    Contact.countDocuments({ status: 'new' }),
    Company.countDocuments({ subscriptionStatus: 'trial' }),
    Company.countDocuments({ subscriptionStatus: 'active' }),
  ]);

  // Users registered last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

  // Monthly signups (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlySignups = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: {
      _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
      count: { $sum: 1 },
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Plan distribution
  const planDist = await User.aggregate([
    { $group: { _id: '$plan', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      users: { total: totalUsers, active: activeUsers, recent: recentUsers },
      companies: { total: totalCompanies, trial: trialCompanies, paid: paidCompanies },
      blogs: { total: totalBlogs, published: publishedBlogs },
      contacts: { new: newContacts },
      charts: { monthlySignups, planDistribution: planDist },
    },
  });
}));

// ── GET /api/admin/companies
router.get('/companies', protect, superAdminOnly, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, plan, status } = req.query;
  const query = {};
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  if (plan)   query.plan = plan;
  if (status) query.subscriptionStatus = status;

  const total = await Company.countDocuments(query);
  const companies = await Company.find(query)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('createdBy', 'firstName lastName email');

  res.json({ success: true, count: total, page: parseInt(page), data: companies });
}));

// ── GET /api/admin/audit-logs
router.get('/audit-logs', protect, superAdminOnly, asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const total = await AuditLog.countDocuments();
  const logs = await AuditLog.find()
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('user', 'firstName lastName email');
  res.json({ success: true, count: total, data: logs });
}));

module.exports = router;
