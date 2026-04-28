"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { pricingApi } from '@/lib/api';
import { Badge, Skeleton, SectionTag } from '@/components/ui';
import { PubHeader, PubFooter } from '../blog/page';

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['plans-public'], queryFn: () => pricingApi.list() });
  const plans = data?.data?.data || [];

  const FAQ = [
    { q:'Is there a free trial?', a:'Yes — every plan starts with a 14-day free trial. No credit card required.' },
    { q:'Can I upgrade or downgrade anytime?', a:'Absolutely. You can change your plan at any time from your account settings.' },
    { q:'How does the per-user pricing work?', a:'Each plan includes a set number of users. You can add more at any time.' },
    { q:'What payment methods do you accept?', a:'We accept all major credit cards, PayPal, bank transfers, and Razorpay for Indian customers.' },
    { q:'Is there a long-term contract?', a:'No contracts. All plans are month-to-month or yearly (with a discount). Cancel anytime.' },
    { q:'Do you offer discounts for nonprofits or education?', a:"Yes — contact us at hello@synkly.io for special pricing." },
  ];

  // Build comparison table from all plan features
  const allFeatures = [...new Set(plans.flatMap((p: any) => p.features?.map((f: any) => f.name) || []))];

  return (
    <div className="min-h-screen bg-white">
      <PubHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-950 py-16 text-center">
        <div className="container mx-auto px-6">
          <SectionTag>💰 Pricing</SectionTag>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mt-2 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-white/55 max-w-md mx-auto mb-7">
            No hidden fees. No lock-in contracts. Start with a 14-day free trial.
          </p>
          {/* Toggle */}
          <div className="inline-flex bg-white/8 border border-white/15 rounded-full p-1">
            {[['Monthly', false],['Yearly', true]].map(([l, v]) => (
              <button key={String(l)} onClick={() => setYearly(v as boolean)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${yearly === v ? 'bg-white text-slate-900 shadow' : 'text-white/70 hover:text-white'}`}>
                {l as string}{v ? ' −25%' : ''}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[...Array(3)].map((_,i) => <Skeleton key={i} className="h-96 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
              {plans.map((plan: any) => (
                <div key={plan._id} className={`border-[1.5px] rounded-2xl p-7 relative transition-all hover:shadow-lg ${plan.isPopular ? 'border-blue-500 shadow-blue-600/12 shadow-md' : 'border-slate-200'}`}>
                  {plan.isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-black px-4 py-0.5 rounded-full whitespace-nowrap">
                      Most Popular
                    </div>
                  )}
                  <div className="font-black text-xl mb-1">{plan.name}</div>
                  <p className="text-sm text-slate-400 mb-5">{plan.description}</p>

                  <div className="mb-6">
                    {plan.monthlyPrice === 0 ? (
                      <div className="text-4xl font-black">Custom</div>
                    ) : (
                      <>
                        <span className="text-5xl font-black tracking-tight">${yearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                        <span className="text-slate-400 text-base">/mo</span>
                        {yearly && <div className="text-xs text-emerald-600 font-semibold mt-1">You save ${(plan.monthlyPrice - plan.yearlyPrice) * 12}/year</div>}
                      </>
                    )}
                  </div>

                  <div className="space-y-2.5 mb-7">
                    {plan.features?.map((f: any) => (
                      <div key={f.name} className={`flex items-start gap-2.5 text-sm ${!f.included && 'opacity-40'}`}>
                        <span className={f.included ? 'text-emerald-500 mt-0.5' : 'text-slate-300 mt-0.5'}>
                          {f.included ? '✓' : '✕'}
                        </span>
                        <span className={f.included ? 'text-slate-700' : 'text-slate-400'}>{f.name}</span>
                        {f.limit && <span className="text-xs text-slate-400 ml-auto">{f.limit}</span>}
                      </div>
                    ))}
                  </div>

                  <Link href="/auth/register">
                    <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      plan.isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}>
                      {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                    </button>
                  </Link>

                  <div className="text-center mt-3 text-xs text-slate-400">
                    Up to {plan.maxUsers === 999999 ? 'unlimited' : plan.maxUsers} users · {plan.maxStorage}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Comparison table */}
      {allFeatures.length > 0 && (
        <section className="py-12 bg-slate-50">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-black text-center mb-8">Full Feature Comparison</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full bg-white">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-6 py-4 text-sm font-bold text-slate-500">Feature</th>
                    {plans.map((p: any) => (
                      <th key={p._id} className={`px-6 py-4 text-center text-sm font-bold ${p.isPopular ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}>
                        {p.name}
                        {p.isPopular && <div className="text-xs font-normal text-blue-500">Most Popular</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature, i) => (
                    <tr key={feature} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-6 py-3.5 text-sm font-medium text-slate-700">{feature}</td>
                      {plans.map((p: any) => {
                        const f = p.features?.find((pf: any) => pf.name === feature);
                        return (
                          <td key={p._id} className={`px-6 py-3.5 text-center ${p.isPopular ? 'bg-blue-50/30' : ''}`}>
                            {f ? (
                              f.included
                                ? <span className="text-emerald-500 text-lg">✓</span>
                                : <span className="text-slate-300 text-lg">✕</span>
                            ) : <span className="text-slate-200 text-lg">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl font-black text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ.map((faq, i) => (
              <details key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden group">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-slate-800 hover:bg-slate-50 transition-colors list-none">
                  {faq.q}
                  <svg className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-slate-500 text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-blue-950 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-black text-white mb-3">Still have questions?</h2>
          <p className="text-white/55 mb-7">Talk to our team — we're happy to find the right plan for you.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register">
              <button className="px-7 py-3 bg-white text-slate-900 rounded-xl font-black hover:bg-slate-100 transition-colors">
                Start Free Trial
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-7 py-3 bg-white/8 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/15 transition-colors">
                Contact Sales
              </button>
            </Link>
          </div>
        </div>
      </section>

      <PubFooter />
    </div>
  );
}
