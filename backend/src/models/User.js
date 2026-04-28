const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  // Personal Info
  firstName: { type: String, required: [true, 'First name is required'], trim: true, maxlength: 50 },
  lastName:  { type: String, required: [true, 'Last name is required'],  trim: true, maxlength: 50 },
  email:     { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Please enter a valid email'] },
  phone:     { type: String, trim: true,
    match: [/^[+]?[\d\s\-().]{7,20}$/, 'Please enter a valid phone number'] },
  avatar:    { type: String, default: '' },
  password:  { type: String, required: [true, 'Password is required'], minlength: 8, select: false },

  // Role & Access
  role: {
    type: String,
    enum: ['super_admin', 'client_admin', 'staff', 'viewer'],
    default: 'client_admin',
  },
  permissions: [{ type: String }],

  // Company / Tenant
  companyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  companyName:  { type: String, trim: true },
  industry:     { type: String },
  companySize:  { type: String },

  // Account Status
  isActive:      { type: Boolean, default: true },
  isEmailVerified:{ type: Boolean, default: false },
  emailVerifyToken: String,
  emailVerifyExpire: Date,

  // Password Reset
  resetPasswordToken:  String,
  resetPasswordExpire: Date,

  // Subscription
  plan:         { type: String, enum: ['free', 'starter', 'growth', 'enterprise'], default: 'free' },
  trialEndsAt:  Date,
  subscriptionId: String,

  // Preferences
  preferences: {
    language:  { type: String, default: 'en' },
    timezone:  { type: String, default: 'UTC' },
    currency:  { type: String, default: 'USD' },
    theme:     { type: String, default: 'light' },
    notifications: {
      email:  { type: Boolean, default: true },
      push:   { type: Boolean, default: true },
      sms:    { type: Boolean, default: false },
    },
  },

  // Audit
  lastLogin:  Date,
  loginCount: { type: Number, default: 0 },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ companyId: 1 });
userSchema.index({ role: 1 });

// Virtual: full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save: hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method: compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method: generate JWT
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role, companyId: this.companyId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Method: generate refresh token
userSchema.methods.getRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
};

// Method: generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Method: generate email verify token
userSchema.methods.getEmailVerifyToken = function () {
  const verifyToken = crypto.randomBytes(20).toString('hex');
  this.emailVerifyToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
  this.emailVerifyExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return verifyToken;
};

module.exports = mongoose.model('User', userSchema);
