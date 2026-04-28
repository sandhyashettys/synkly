"use client";
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { modulesApi } from '@/lib/api';
import { Badge, Skeleton, SectionTag } from '@/components/ui';
import { PubHeader, PubFooter } from '../blog/page';

export default function ProductPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['all-modules'],
    queryFn: () => modulesApi.list({ active: true }),
  });
  const modules = data?.data?.data || [];

  const INDUSTRIES = [
    { icon:'🛒', name:'Retail & E-Commerce', desc:'Inventory sync, sales tracking, supplier management, and customer analytics in one place.' },
    { icon:'🏥', name:'Healthcare & Pharma', desc:'Patient billing, staff scheduling, compliance tracking, and medical supply management.' },
    { icon:'🏗️', name:'Construction', desc:'Project costing, subcontractor management, equipment tracking, and milestone billing.' },
    { icon:'🎓', name:'Education', desc:'Student records, fee management, staff payroll, and academic calendar planning.' },
    { icon:'🍽️', name:'Restaurant & Food', desc:'Ingredient tracking, vendor management, staff scheduling, and revenue reporting.' },
    { icon:'💼', name:'Professional Services', desc:'Client management, time tracking, invoicing, and project profitability analysis.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PubHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #2563eb, transparent 60%)' }} />
        <div className="container mx-auto px-6 relative z-10">
          <SectionTag>🧩 Full Platform</SectionTag>
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight mt-2 mb-5">
            Every module.<br/>
            <span style={{ background:'linear-gradient(135deg,#60a5fa,#c084fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              One platform.
            </span>
          </h1>
          <p className="text-lg text-white/55 max-w-xl mx-auto mb-8">
            Each module is powerful on its own — together, they create an unmatched operational advantage for any industry.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register">
              <button className="px-7 py-3.5 bg-blue-600 text-white rounded-xl font-black text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/40">
                Start Free Trial
              </button>
            </Link>
            <Link href="/pricing">
              <button className="px-7 py-3.5 bg-white/8 border border-white/20 text-white rounded-xl font-semibold text-base hover:bg-white/15 transition-colors">
                View Pricing
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modules from API */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <SectionTag>📦 Modules</SectionTag>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight mt-2 mb-4">Six integrated modules</h2>
            <p className="text-lg text-slate-500 max-w-lg mx-auto">Use individually or as a complete suite. Enable only what you need.</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(6)].map((_,i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {modules.map((mod: any) => (
                <div key={mod._id} id={mod.slug}
                  className="border border-slate-200 rounded-2xl p-7 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-250">
                  <div className="flex items-start gap-5 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl flex-shrink-0">{mod.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-xl">{mod.name}</h3>
                        {mod.isPremium && <Badge variant="purple">Premium</Badge>}
                        {mod.category && <Badge variant="gray" className="capitalize">{mod.category}</Badge>}
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed">{mod.description}</p>
                    </div>
                  </div>

                  {/* Features */}
                  {mod.features?.length > 0 && (
                    <div className="mb-5">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Key Features</div>
                      <div className="grid grid-cols-2 gap-2">
                        {mod.features.map((f: any) => (
                          <div key={f.name} className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                            <span className="text-sm text-slate-600">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Use cases */}
                  {mod.useCases?.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Industry Use Cases</div>
                      <div className="flex flex-wrap gap-2">
                        {mod.useCases.map((uc: any) => (
                          <span key={uc.industry} title={uc.description}
                            className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg cursor-default">
                            {uc.industry}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Industry use cases */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <SectionTag>🌍 Industries</SectionTag>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight mt-2 mb-4">Built for every industry</h2>
            <p className="text-lg text-slate-500 max-w-lg mx-auto">Synkly ERP adapts to your workflow — not the other way around.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIES.map(ind => (
              <div key={ind.name} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{ind.icon}</div>
                <h3 className="font-black text-base mb-2">{ind.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <SectionTag>🔗 Integrations</SectionTag>
            <h2 className="text-3xl font-black tracking-tight mt-2 mb-4">150+ integrations</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Connect with the tools your team already uses.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {['Stripe','Shopify','Xero','QuickBooks','Slack','Zapier','HubSpot','Salesforce','Google Workspace','Microsoft 365','AWS','Twilio','PayPal','Razorpay','Mailchimp'].map(t => (
              <div key={t} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-300 hover:shadow transition-all">
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-950 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">Start your free 14-day trial</h2>
          <p className="text-white/55 text-lg mb-8 max-w-md mx-auto">No credit card required. Full access to all modules.</p>
          <Link href="/auth/register">
            <button className="px-8 py-4 bg-white text-slate-900 rounded-xl font-black text-lg hover:bg-slate-100 transition-colors">
              Get Started Free →
            </button>
          </Link>
        </div>
      </section>

      <PubFooter />
    </div>
  );
}
