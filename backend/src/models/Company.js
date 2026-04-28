const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true, lowercase: true },
  email:       { type: String, required: true, lowercase: true },
  phone:       { type: String },
  website:     { type: String },
  industry:    { type: String },
  companySize: { type: String },
  address: {
    street: String, city: String, state: String,
    country: String, zipCode: String,
  },

  // Branding
  branding: {
    logo:        { type: String, default: '' },
    favicon:     { type: String, default: '' },
    primaryColor:{ type: String, default: '#2563eb' },
    secondaryColor:{ type: String, default: '#7c3aed' },
    companyName: String,
  },

  // Subscription
  plan:     { type: String, enum: ['free','starter','growth','enterprise'], default: 'free' },
  planId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  trialEndsAt:       Date,
  subscriptionEndsAt:Date,
  subscriptionStatus:{ type: String, enum: ['active','inactive','trial','cancelled'], default: 'trial' },
  stripeCustomerId:  String,
  razorpayCustomerId:String,

  // Modules enabled
  enabledModules: [{
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
    name: String,
    isEnabled: { type: Boolean, default: true },
  }],

  // Settings
  settings: {
    timezone:  { type: String, default: 'UTC' },
    currency:  { type: String, default: 'USD' },
    language:  { type: String, default: 'en' },
    dateFormat:{ type: String, default: 'MM/DD/YYYY' },
    notifications: {
      email: { type: Boolean, default: true },
      sms:   { type: Boolean, default: false },
    },
  },

  // SEO
  seo: { title: String, description: String, keywords: [String] },

  isActive: { type: Boolean, default: true },
  createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, toJSON: { virtuals: true } });

companySchema.index({ slug: 1 });
companySchema.index({ email: 1 });

// Generate slug pre-save
companySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Company', companySchema);
