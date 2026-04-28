require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Company = require('./models/Company');
const { Module, Plan, Blog, Settings } = require('./models/index');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding');
};

const seedData = async () => {
  await connectDB();

  // Clear existing
  await Promise.all([
    User.deleteMany(), Company.deleteMany(),
    Module.deleteMany(), Plan.deleteMany(),
    Blog.deleteMany(), Settings.deleteMany(),
  ]);
  console.log('Cleared existing data');

  // ── Create super admin company
  const adminCompany = await Company.create({
    name: 'Synkly Admin',
    slug: 'synkly-admin',
    email: 'admin@synkly.io',
    plan: 'enterprise',
    subscriptionStatus: 'active',
  });

  // ── Create super admin user
  const superAdmin = await User.create({
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@synkly.io',
    password: 'Admin@123456',
    role: 'super_admin',
    companyId: adminCompany._id,
    companyName: 'Synkly Admin',
    isEmailVerified: true,
    plan: 'enterprise',
  });
  adminCompany.createdBy = superAdmin._id;
  await adminCompany.save();

  // ── Create demo client
  const demoCompany = await Company.create({
    name: 'Demo Corp',
    slug: 'demo-corp',
    email: 'client@demo.com',
    industry: 'Technology',
    companySize: '11-50',
    plan: 'growth',
    subscriptionStatus: 'active',
  });

  const demoClient = await User.create({
    firstName: 'Demo',
    lastName: 'Client',
    email: 'client@demo.com',
    password: 'Client@123456',
    role: 'client_admin',
    companyId: demoCompany._id,
    companyName: 'Demo Corp',
    isEmailVerified: true,
    plan: 'growth',
  });
  demoCompany.createdBy = demoClient._id;
  await demoCompany.save();

  // ── Modules
  const modulesData = [
    { name: 'Finance & Accounting', slug: 'finance', icon: '💰', category: 'finance', order: 1,
      description: 'Track income, expenses, invoices, budgets, and financial reports with full audit trail.',
      features: [
        { name: 'Transaction Management', description: 'Record and categorize all financial transactions' },
        { name: 'Invoice Generation', description: 'Create and send professional invoices' },
        { name: 'Budget Tracking', description: 'Set and monitor budgets by department' },
        { name: 'Financial Reports', description: 'P&L, balance sheet, cash flow statements' },
      ],
      useCases: [
        { industry: 'Retail', description: 'Track daily sales, manage supplier payments and reconcile accounts' },
        { industry: 'Healthcare', description: 'Manage patient billing, insurance claims and medical expenses' },
        { industry: 'Construction', description: 'Track project costs, labor expenses and subcontractor payments' },
      ],
    },
    { name: 'HR & People', slug: 'hr', icon: '👥', category: 'hr', order: 2,
      description: 'Manage your entire team lifecycle — hiring, onboarding, payroll, performance and offboarding.',
      features: [
        { name: 'Employee Directory', description: 'Centralized employee profiles and documents' },
        { name: 'Attendance & Leave', description: 'Track attendance, manage leave requests and approvals' },
        { name: 'Payroll Processing', description: 'Automate salary calculations and disbursements' },
        { name: 'Performance Reviews', description: 'Set goals, conduct reviews and track KPIs' },
      ],
      useCases: [
        { industry: 'Manufacturing', description: 'Manage shift scheduling, overtime and compliance' },
        { industry: 'Hospitality', description: 'Handle seasonal staffing, tips and service charges' },
      ],
    },
    { name: 'CRM & Sales', slug: 'crm', icon: '🤝', category: 'crm', order: 3,
      description: 'Manage contacts, leads, pipeline and customer relationships from first touch to close.',
      features: [
        { name: 'Contact Management', description: 'Organize customers, leads, partners and vendors' },
        { name: 'Sales Pipeline', description: 'Visual kanban pipeline with stage tracking' },
        { name: 'Activity Tracking', description: 'Log calls, emails and meetings' },
        { name: 'Deal Forecasting', description: 'Revenue predictions and win/loss analysis' },
      ],
      useCases: [
        { industry: 'Real Estate', description: 'Track property inquiries, buyer journeys and closings' },
        { industry: 'SaaS', description: 'Manage trial conversions, churn prevention and upsells' },
      ],
    },
    { name: 'Inventory & Stock', slug: 'inventory', icon: '📦', category: 'operations', order: 4,
      description: 'Real-time stock visibility across warehouses with automated reorder alerts and supplier management.',
      features: [
        { name: 'Stock Tracking', description: 'Real-time inventory levels across locations' },
        { name: 'Reorder Management', description: 'Automatic reorder alerts and purchase orders' },
        { name: 'Supplier Management', description: 'Manage vendors, prices and lead times' },
        { name: 'Barcode Support', description: 'Scan-in/scan-out for accurate tracking' },
      ],
      useCases: [
        { industry: 'E-Commerce', description: 'Sync inventory across channels and prevent overselling' },
        { industry: 'Restaurant', description: 'Track ingredients, manage waste and reorder supplies' },
      ],
    },
    { name: 'Projects & Tasks', slug: 'projects', icon: '📁', category: 'operations', order: 5,
      description: 'Plan, execute and track projects with Kanban boards, milestones and team collaboration.',
      features: [
        { name: 'Task Management', description: 'Create, assign and track tasks with priorities' },
        { name: 'Kanban Boards', description: 'Visual workflow management for teams' },
        { name: 'Milestones & Deadlines', description: 'Set project milestones and track timelines' },
        { name: 'Team Collaboration', description: 'Comments, file attachments and mentions' },
      ],
      useCases: [
        { industry: 'IT & Software', description: 'Sprint planning, bug tracking and feature releases' },
        { industry: 'Marketing', description: 'Campaign management from brief to delivery' },
      ],
    },
    { name: 'Analytics & Reports', slug: 'analytics', icon: '📊', category: 'analytics', order: 6, isPremium: true,
      description: 'Actionable business intelligence with real-time dashboards, KPI tracking and downloadable reports.',
      features: [
        { name: 'Custom Dashboards', description: 'Drag-and-drop KPI widgets and charts' },
        { name: 'Report Builder', description: 'Create custom reports from any data source' },
        { name: 'Export Tools', description: 'Download as CSV, PDF or Excel' },
        { name: 'AI Insights', description: 'Trend detection and anomaly alerts' },
      ],
      useCases: [
        { industry: 'Finance & Banking', description: 'Real-time portfolio performance and risk metrics' },
        { industry: 'Logistics', description: 'Delivery KPIs, route efficiency and cost analysis' },
      ],
    },
  ];

  const modules = await Module.insertMany(modulesData);
  console.log(`Created ${modules.length} modules`);

  // ── Plans
  const plansData = [
    { name: 'Starter', slug: 'starter', order: 1,
      description: 'For small teams and startups getting started.',
      monthlyPrice: 39, yearlyPrice: 29,
      maxUsers: 5, maxStorage: '5GB', trialDays: 14,
      features: [
        { name: 'Up to 5 users', included: true },
        { name: 'Finance & HR modules', included: true },
        { name: 'Email support', included: true },
        { name: '5 GB storage', included: true },
        { name: 'Monthly reports', included: true },
        { name: 'CRM module', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'API access', included: false },
      ],
      modules: modules.filter(m => ['finance', 'hr'].includes(m.slug)).map(m => m._id),
    },
    { name: 'Growth', slug: 'growth', order: 2, isPopular: true,
      description: 'The go-to plan for growing businesses.',
      monthlyPrice: 99, yearlyPrice: 79,
      maxUsers: 25, maxStorage: '50GB', trialDays: 14,
      features: [
        { name: 'Up to 25 users', included: true },
        { name: 'All 6 modules', included: true },
        { name: 'CRM & Sales', included: true },
        { name: 'Priority support', included: true },
        { name: '50 GB storage', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Custom workflows', included: true },
        { name: 'API access', included: true },
      ],
      modules: modules.map(m => m._id),
    },
    { name: 'Enterprise', slug: 'enterprise', order: 3,
      description: 'Tailored solutions for large organizations.',
      monthlyPrice: 0, yearlyPrice: 0,
      maxUsers: 999999, maxStorage: 'Unlimited', trialDays: 30,
      features: [
        { name: 'Unlimited users', included: true },
        { name: 'Dedicated instance', included: true },
        { name: 'Custom integrations', included: true },
        { name: '24/7 phone support', included: true },
        { name: 'Unlimited storage', included: true },
        { name: 'AI forecasting', included: true },
        { name: 'Onboarding & training', included: true },
        { name: 'SLA guarantee', included: true },
      ],
      modules: modules.map(m => m._id),
    },
  ];
  await Plan.insertMany(plansData.map(p => ({ ...p, createdBy: superAdmin._id })));
  console.log('Created 3 plans');

  // ── Settings
  const settingsData = [
    { key: 'site_name', value: 'Synkly ERP', group: 'general', label: 'Site Name', type: 'text' },
    { key: 'site_description', value: 'The all-in-one ERP platform for modern businesses', group: 'general', type: 'text' },
    { key: 'site_logo', value: '/logo.png', group: 'general', type: 'url' },
    { key: 'primary_color', value: '#2563eb', group: 'general', type: 'color' },
    { key: 'contact_email', value: 'hello@synkly.io', group: 'general', type: 'text' },
    { key: 'contact_phone', value: '+1 (800) SYNKLY-1', group: 'general', type: 'text' },
    { key: 'contact_address', value: '123 Innovation Drive, San Francisco, CA 94105', group: 'general', type: 'text' },
    { key: 'meta_title', value: 'Synkly ERP — Smart Business Management', group: 'seo', type: 'text' },
    { key: 'meta_description', value: 'Synkly ERP unifies finance, HR, CRM, inventory and analytics into one intelligent platform.', group: 'seo', type: 'text' },
    { key: 'twitter_url', value: 'https://twitter.com/synklyerp', group: 'social', type: 'url' },
    { key: 'linkedin_url', value: 'https://linkedin.com/company/synkly', group: 'social', type: 'url' },
  ];
  await Settings.insertMany(settingsData);
  console.log('Created settings');

  // ── Sample blog posts
  const blogPosts = [
    { title: 'The Future of ERP: AI-Powered Automation in 2025',
      slug: 'future-erp-ai-automation-2025',
      excerpt: 'How artificial intelligence is reshaping enterprise resource planning and what it means for your business.',
      content: '<h2>Introduction</h2><p>Enterprise resource planning has undergone a fundamental transformation. AI-enhanced ERP systems report a 35% reduction in manual data entry and 28% improvement in forecast accuracy...</p>',
      category: 'Industry Insights', tags: ['AI', 'ERP', 'Automation'],
      status: 'published', publishedAt: new Date('2025-04-15'),
      author: superAdmin._id, readingTime: 5,
      seo: { metaTitle: 'AI-Powered ERP 2025', metaDescription: 'How AI is reshaping ERP systems' },
    },
    { title: 'How to Reduce Operational Costs by 40% with Integrated ERP',
      slug: 'reduce-operational-costs-integrated-erp',
      excerpt: 'A deep dive into the cost-saving potential of unified business software with real data from 500 companies.',
      content: '<h2>The Cost of Disconnected Systems</h2><p>Most businesses use 5-7 different software tools. Each tool has licensing fees, training costs, and integration overhead...</p>',
      category: 'Guides', tags: ['Cost Reduction', 'ROI', 'ERP'],
      status: 'published', publishedAt: new Date('2025-04-10'),
      author: superAdmin._id, readingTime: 8,
    },
    { title: 'Multi-Industry ERP: Why Generic Beats Niche',
      slug: 'multi-industry-erp-generic-vs-niche',
      excerpt: 'Why a configurable, industry-agnostic ERP platform often outperforms purpose-built niche software.',
      content: '<h2>The Niche Software Trap</h2><p>Industry-specific software feels like a perfect fit at first. But as businesses grow and diversify, rigid niche tools become bottlenecks...</p>',
      category: 'Tips', tags: ['Strategy', 'Multi-industry'],
      status: 'published', publishedAt: new Date('2025-04-05'),
      author: superAdmin._id, readingTime: 6,
    },
  ];
  await Blog.insertMany(blogPosts);
  console.log('Created 3 blog posts');

  console.log('\n✅ Seeding complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Super Admin:  admin@synkly.io   / Admin@123456');
  console.log('Demo Client:  client@demo.com   / Client@123456');
  console.log('API Docs:     http://localhost:5000/api/docs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  mongoose.disconnect();
};

seedData().catch(err => { console.error(err); process.exit(1); });
