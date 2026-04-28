const mongoose = require('mongoose');

// ─────────────────────────────────────────────
// MODULE MODEL
// ─────────────────────────────────────────────
const moduleSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  slug:        { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  icon:        { type: String, default: '📦' },
  image:       { type: String },
  category:    { type: String, enum: ['core','business','analytics','hr','finance','crm','operations'], default: 'core' },
  features:    [{ name: String, description: String, icon: String }],
  useCases:    [{ industry: String, description: String }],
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  isPremium:   { type: Boolean, default: false },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

moduleSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }
  next();
});

const Module = mongoose.model('Module', moduleSchema);

// ─────────────────────────────────────────────
// PLAN MODEL
// ─────────────────────────────────────────────
const planSchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true },
  slug:        { type: String, unique: true, lowercase: true },
  description: String,
  monthlyPrice:{ type: Number, required: true, min: 0 },
  yearlyPrice: { type: Number, required: true, min: 0 },
  currency:    { type: String, default: 'USD' },
  maxUsers:    { type: Number, default: 5 },
  maxStorage:  { type: String, default: '5GB' },
  features:    [{ name: String, included: { type: Boolean, default: true }, limit: String }],
  modules:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  isPopular:   { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
  trialDays:   { type: Number, default: 14 },
  stripePriceIdMonthly: String,
  stripePriceIdYearly:  String,
  razorpayPlanId: String,
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

planSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }
  next();
});

const Plan = mongoose.model('Plan', planSchema);

// ─────────────────────────────────────────────
// BLOG MODEL
// ─────────────────────────────────────────────
const blogSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  slug:        { type: String, unique: true, lowercase: true },
  excerpt:     { type: String, maxlength: 500 },
  content:     { type: String, required: true },
  coverImage:  { type: String },
  category:    { type: String, required: true },
  tags:        [String],
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:      { type: String, enum: ['draft','published','archived'], default: 'draft' },
  publishedAt: Date,
  views:       { type: Number, default: 0 },
  readingTime: { type: Number, default: 5 }, // minutes
  seo: {
    metaTitle:       String,
    metaDescription: String,
    metaKeywords:    [String],
    ogImage:         String,
  },
}, { timestamps: true, toJSON: { virtuals: true } });

blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });

blogSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    const slugify = require('slugify');
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now();
  }
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

// ─────────────────────────────────────────────
// CONTACT / LEAD MODEL
// ─────────────────────────────────────────────
const contactSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, required: true, lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Invalid email'] },
  phone:   { type: String, required: true,
    match: [/^[+]?[\d\s\-().]{7,20}$/, 'Invalid phone'] },
  subject: { type: String, trim: true },
  message: { type: String, required: true, minlength: 10, maxlength: 2000 },
  company: String,
  source:  { type: String, default: 'website' },
  status:  { type: String, enum: ['new','contacted','converted','closed'], default: 'new' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:   [{ text: String, addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, addedAt: Date }],
  ip:      String,
}, { timestamps: true });

contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

const Contact = mongoose.model('Contact', contactSchema);

// ─────────────────────────────────────────────
// SETTINGS MODEL
// ─────────────────────────────────────────────
const settingsSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  group: { type: String, default: 'general' },
  label: String,
  type:  { type: String, enum: ['text','boolean','number','json','url','color'], default: 'text' },
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

// ─────────────────────────────────────────────
// AUDIT LOG MODEL
// ─────────────────────────────────────────────
const auditLogSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action:    { type: String, required: true },
  resource:  { type: String, required: true },
  resourceId:{ type: mongoose.Schema.Types.ObjectId },
  changes:   mongoose.Schema.Types.Mixed,
  ip:        String,
  userAgent: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
}, { timestamps: true });

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ companyId: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = { Module, Plan, Blog, Contact, Settings, AuditLog };
