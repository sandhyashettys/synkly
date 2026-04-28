const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize, superAdminOnly, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { Blog } = require('../models/index');

// ── GET /api/blog  (public)
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, search, status = 'published' } = req.query;
  const query = {};

  // Public only sees published
  if (!req.user || req.user.role !== 'super_admin') {
    query.status = 'published';
  } else if (status) {
    query.status = status;
  }

  if (category) query.category = category;
  if (search) {
    query.$or = [
      { title:   new RegExp(search, 'i') },
      { excerpt: new RegExp(search, 'i') },
      { tags:    new RegExp(search, 'i') },
    ];
  }

  const total = await Blog.countDocuments(query);
  const blogs = await Blog.find(query)
    .populate('author', 'firstName lastName avatar')
    .sort('-publishedAt -createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .select('-content');

  res.json({
    success: true,
    count: total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: blogs,
  });
}));

// ── GET /api/blog/categories
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await Blog.distinct('category', { status: 'published' });
  res.json({ success: true, data: categories });
}));

// ── GET /api/blog/:slug  (public)
router.get('/:slug', optionalAuth, asyncHandler(async (req, res, next) => {
  const blog = await Blog.findOne({ slug: req.params.slug })
    .populate('author', 'firstName lastName avatar');

  if (!blog) return next(new ErrorResponse('Blog post not found', 404));

  if (blog.status !== 'published' && (!req.user || req.user.role !== 'super_admin')) {
    return next(new ErrorResponse('Blog post not found', 404));
  }

  // Increment views
  blog.views += 1;
  await blog.save({ validateBeforeSave: false });

  res.json({ success: true, data: blog });
}));

// ── POST /api/blog  (admin only)
router.post('/', protect, superAdminOnly, [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('content').notEmpty().withMessage('Content is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('status').optional().isIn(['draft', 'published', 'archived']),
], validate, asyncHandler(async (req, res) => {
  req.body.author = req.user._id;
  const blog = await Blog.create(req.body);
  res.status(201).json({ success: true, message: 'Blog post created', data: blog });
}));

// ── PUT /api/blog/:id  (admin only)
router.put('/:id', protect, superAdminOnly, asyncHandler(async (req, res, next) => {
  let blog = await Blog.findById(req.params.id);
  if (!blog) return next(new ErrorResponse('Blog post not found', 404));

  const allowed = ['title', 'excerpt', 'content', 'coverImage', 'category', 'tags', 'status', 'seo'];
  allowed.forEach(f => { if (req.body[f] !== undefined) blog[f] = req.body[f]; });
  await blog.save();

  res.json({ success: true, message: 'Blog post updated', data: blog });
}));

// ── DELETE /api/blog/:id  (admin only)
router.delete('/:id', protect, superAdminOnly, asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return next(new ErrorResponse('Blog post not found', 404));
  await blog.deleteOne();
  res.json({ success: true, message: 'Blog post deleted' });
}));

module.exports = router;
