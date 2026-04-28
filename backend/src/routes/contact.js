const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, superAdminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { Contact } = require('../models/index');
const sendEmail = require('../utils/sendEmail');

// ── POST /api/contact  (public)
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Enter a valid email address'),
  body('phone')
    .matches(/^[+]?[\d\s\-().]{10,20}$/)
    .withMessage('Enter a valid 10-digit phone number'),
  body('message')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  body('subject').optional().isLength({ max: 200 }),
], validate, asyncHandler(async (req, res) => {
  const { name, email, phone, message, subject, company } = req.body;

  const contact = await Contact.create({
    name, email, phone, message, subject, company,
    ip: req.ip,
    source: 'website',
  });

  // Send confirmation to user
  try {
    await sendEmail({
      to: email,
      subject: 'We received your message — Synkly ERP',
      template: 'contactConfirmation',
      data: { name, message },
    });
    // Notify admin
    await sendEmail({
      to: process.env.FROM_EMAIL,
      subject: `New Contact Inquiry from ${name}`,
      template: 'contactAdmin',
      data: { name, email, phone, message, subject, company },
    });
  } catch (e) {
    console.error('Contact email error:', e.message);
  }

  res.status(201).json({
    success: true,
    message: 'Thank you for reaching out! We will get back to you within 24 hours.',
    data: { id: contact._id },
  });
}));

// ── GET /api/contact  (super admin)
router.get('/', protect, superAdminOnly, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name:  new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }
  const total = await Contact.countDocuments(query);
  const contacts = await Contact.find(query)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('assignedTo', 'firstName lastName');

  res.json({ success: true, count: total, page: parseInt(page), data: contacts });
}));

// ── PUT /api/contact/:id  (admin)
router.put('/:id', protect, superAdminOnly, asyncHandler(async (req, res, next) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id,
    { status: req.body.status, assignedTo: req.body.assignedTo },
    { new: true, runValidators: true }
  );
  if (!contact) return next(new ErrorResponse('Contact not found', 404));
  res.json({ success: true, data: contact });
}));

// ── DELETE /api/contact/:id  (admin)
router.delete('/:id', protect, superAdminOnly, asyncHandler(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) return next(new ErrorResponse('Contact not found', 404));
  await contact.deleteOne();
  res.json({ success: true, message: 'Lead deleted' });
}));

module.exports = router;
