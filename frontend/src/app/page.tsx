"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { modulesApi, pricingApi, blogApi, settingsApi } from '@/lib/api';
import { Button, Badge, SectionTag, StatCard } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';

// ── Sticky Header
const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  const links = ['Home', 'Product', 'Pricing', 'Blog', 'Contact'];
  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center transition-all duration-300',
      scrolled ? 'bg-white/95 border-b border-slate-200 backdrop-blur-md shadow-sm' : 'bg-transparent'
    )}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight">Synkly<span className="text-blue-600"> ERP</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {links.map(l => (
            <Link key={l} href={l === 'Home' ? '/' : `/${l.toLowerCase()}`}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all">
              {l}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          <Link href="/auth/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link href="/auth/register"><Button size="sm">Get Started Free</Button></Link>
        </div>

        <button className="md:hidden p-2 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg md:hidden">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-2">
            {links.map(l => <Link key={l} href={l === 'Home' ? '/' : `/${l.toLowerCase()}`} className="py-2.5 text-sm font-medium text-slate-700">{l}</Link>)}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Link href="/auth/login" className="flex-1"><Button variant="ghost" className="w-full">Sign in</Button></Link>
              <Link href="/auth/register" className="flex-1"><Button className="w-full">Get Started</Button></Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// ── Hero with 3-slide carousel
const Hero = () => {
  const [slide, setSlide] = useState(0);
  const slides = [
    { badge: '🚀 Analytics 3.0 Now Available', h1: 'Run Your Entire', h2: 'Business Smarter', sub: 'Synkly ERP unifies finance, HR, CRM, inventory and analytics into one intelligent platform for every industry.' },
    { badge: '✅ Trusted by 3,000+ Organizations', h1: 'Automate What', h2: 'Slows You Down', sub: 'From transactions to team management, Synkly handles the complexity so you can focus on growth.' },
    { badge: '🔒 Enterprise-Grade & Secure', h1: 'Scale With Full', h2: 'Visibility & Control', sub: 'Universal dashboards, smart analytics and role-based access give every team the clarity they need.' },
  ];
  useEffect(() => { const t = setInterval(() => setSlide(s => (s+1) % 3), 5500); return () => clearInterval(t); }, []);
  const s = slides[slide];
  return (
    <section className="hero-gradient min-h-screen flex items-center pt-[68px] pb-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(37,99,235,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.8) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
      <div className="absolute top-[-100px] right-[-80px] w-[500px] h-[500px] rounded-full blur-[100px] opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle,#2563eb,transparent 70%)' }} />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div key={slide} className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-semibold text-slate-600 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
              {s.badge}
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-none mb-2">
              {s.h1}<br/>
              <span className="gradient-text">{s.h2}</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mt-6 mb-10 max-w-md">{s.sub}</p>
            <div className="flex flex-wrap gap-3 mb-12">
              <Link href="/auth/register"><Button size="lg" className="shadow-lg shadow-blue-600/30">Start Free Trial <ArrowRight /></Button></Link>
              <Button size="lg" variant="ghost">
                <span className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center"><svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></span>
                Watch Demo
              </Button>
            </div>
            <div className="flex gap-0 border-t border-slate-200 pt-8">
              {[['3,000+','Organizations'], ['99.9%','Uptime SLA'], ['40%','Cost Saved']].map(([n, l], i) => (
                <div key={l} className={cn('flex-1 pr-5', i > 0 && 'pl-5 border-l border-slate-200')}>
                  <div className="text-2xl font-black tracking-tight">{n}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard preview card */}
          <div className="animate-float lg:flex justify-end hidden">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 w-[440px]">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Total Revenue</div>
                  <div className="text-3xl font-black tracking-tight">$2.84M</div>
                  <div className="text-sm font-bold text-emerald-600 mt-1">↑ 23.4% this quarter</div>
                </div>
                <div className="flex gap-1.5">
                  {['M','Q','Y'].map((t,i) => <span key={t} className={cn('px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer', i===1?'bg-blue-600 text-white':'bg-slate-100 text-slate-400')}>{t}</span>)}
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-16 mb-5">
                {[38,55,42,70,52,84,61,90,68,88,74,96].map((h,i) => (
                  <div key={i} className="flex-1 rounded-t" style={{ height:`${h*0.6}%`, background: i===11?'linear-gradient(to top,#2563eb,#7c3aed)':'#dbeafe' }} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[{l:'Members',v:'47',c:'#7c3aed'},{l:'Contacts',v:'284',c:'#059669'},{l:'Tasks',v:'138',c:'#d97706'}].map(m=>(
                  <div key={m.l} className="bg-slate-50 rounded-xl p-3">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">{m.l}</div>
                    <div className="text-xl font-black" style={{ color: m.c }}>{m.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="flex gap-2 mt-10">
          {[0,1,2].map(i => (
            <button key={i} onClick={() => setSlide(i)}
              className="rounded-full transition-all duration-300"
              style={{ height: 5, width: i === slide ? 24 : 5, background: i === slide ? '#2563eb' : '#d1d5db' }} />
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Features section (from API)
const FeaturesSection = () => {
  const { data: modulesData, isLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: () => modulesApi.list({ active: true }),
  });
  const modules = modulesData?.data?.data || [];

  return (
    <section className="py-24 bg-white" id="features">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <SectionTag>📦 Modules</SectionTag>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Universal modules for <span className="gradient-text">every industry</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">Works for retail, healthcare, manufacturing, services, and beyond. Six integrated modules, zero industry lock-in.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((mod: any) => (
              <Link key={mod._id} href={`/product#${mod.slug}`}
                className="group border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-600/8 hover:-translate-y-1 transition-all duration-250 bg-white">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {mod.icon}
                </div>
                {mod.isPremium && <Badge variant="purple" className="mb-3">Premium</Badge>}
                <h3 className="font-bold text-base mb-2">{mod.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{mod.description}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ── Clients ticker
const CLIENTS = ['Acme Corp','TechFlow','NovaStar','BuildRight','SwiftLogix','Nexora','CloudBase','PulseMedia','ArgoTech','FuseWave'];
const ClientsTicker = () => (
  <section className="py-12 bg-slate-50 border-y border-slate-200 overflow-hidden">
    <div className="text-center mb-7">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trusted by 3,000+ organizations worldwide</p>
    </div>
    <div className="overflow-hidden">
      <div className="flex gap-14 items-center animate-ticker w-max">
        {[...CLIENTS, ...CLIENTS].map((name, i) => (
          <div key={i} className="flex items-center gap-2.5 text-base font-bold text-slate-400 opacity-40 hover:opacity-100 hover:text-blue-600 transition-all cursor-default whitespace-nowrap">
            <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-black">{name[0]}</div>
            {name}
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── Pricing section (from API)
const PricingSection = () => {
  const [yearly, setYearly] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['plans'], queryFn: () => pricingApi.list() });
  const plans = data?.data?.data || [];

  return (
    <section className="py-24 bg-white" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <SectionTag>💰 Pricing</SectionTag>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-slate-500 max-w-md mx-auto mb-7">No hidden fees. Cancel anytime. 14-day free trial.</p>
          <div className="inline-flex bg-slate-100 border border-slate-200 rounded-full p-1">
            {[['Monthly',false],['Yearly',true]].map(([l,v]) => (
              <button key={String(l)} onClick={() => setYearly(v as boolean)}
                className={cn('px-5 py-1.5 rounded-full text-sm font-semibold transition-all', yearly === v ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-700')}>
                {l as string}{v ? ' −25%' : ''}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[...Array(3)].map((_,i) => <div key={i} className="h-[480px] rounded-2xl bg-slate-100 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {plans.map((plan: any) => (
              <div key={plan._id} className={cn(
                'border-[1.5px] rounded-2xl p-7 relative transition-all hover:shadow-lg',
                plan.isPopular ? 'border-blue-500 shadow-blue-600/15 shadow-md' : 'border-slate-200'
              )}>
                {plan.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className="font-black text-xl mb-1.5">{plan.name}</div>
                <p className="text-sm text-slate-400 mb-5">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-black tracking-tight">
                    {plan.monthlyPrice === 0 ? 'Custom' : `$${yearly ? plan.yearlyPrice : plan.monthlyPrice}`}
                  </span>
                  {plan.monthlyPrice > 0 && <span className="text-slate-400 text-base">/mo</span>}
                </div>
                <div className="space-y-2.5 mb-7">
                  {plan.features?.slice(0,7).map((f: any) => (
                    <div key={f.name} className={cn('flex items-start gap-2.5 text-sm', !f.included && 'opacity-40')}>
                      <span className={f.included ? 'text-emerald-500' : 'text-slate-300'}>
                        {f.included ? '✓' : '✕'}
                      </span>
                      <span className={f.included ? 'text-slate-700' : 'text-slate-400'}>{f.name}</span>
                    </div>
                  ))}
                </div>
                <Link href="/auth/register">
                  <Button variant={plan.isPopular ? 'primary' : 'ghost'} className="w-full">
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ── Testimonials
const TESTIS = [
  { n:'Sarah Chen', r:'COO, TechFlow Ltd', q:'Synkly replaced three separate tools. Finance-inventory integration alone saved 15 hours per week.' },
  { n:'Marcus Williams', r:'CEO, BuildRight Co.', q:"From a construction company's perspective, having projects, HR, and finance in one place is a game-changer." },
  { n:'Dr. Priya Nair', r:'CFO, Nexora Retail', q:'Real-time P&L across 12 branches on one screen. Fundamentally changed how leadership makes decisions.' },
  { n:'James Park', r:'Ops Director, SwiftLogix', q:'Inventory discrepancies dropped 94% in the first month. Best-in-class integration overall.' },
];
const Testimonials = () => {
  const [idx, setIdx] = useState(0);
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <SectionTag>⭐ Testimonials</SectionTag>
          <h2 className="text-4xl font-black tracking-tight">Loved by teams <span className="gradient-text">across industries</span></h2>
        </div>
        <div className="overflow-hidden max-w-5xl mx-auto">
          <div className="flex gap-5 transition-transform duration-500" style={{ transform: `translateX(calc(-${idx*(380+20)}px))` }}>
            {TESTIS.map((t, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 min-w-[370px] flex-shrink-0 shadow-sm">
                <div className="flex gap-0.5 mb-4">{[1,2,3,4,5].map(j => <span key={j} className="text-amber-400 text-sm">★</span>)}</div>
                <p className="text-slate-600 text-sm leading-relaxed italic mb-5">"{t.q}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {t.n.split(' ').map(w=>w[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{t.n}</div>
                    <div className="text-xs text-slate-400">{t.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-7 items-center">
          <button onClick={() => setIdx(Math.max(0,idx-1))} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          {TESTIS.map((_,i) => (
            <button key={i} onClick={() => setIdx(i)} className="rounded-full transition-all" style={{ height: 6, width: i===idx?20:6, background: i===idx?'#2563eb':'#d1d5db' }} />
          ))}
          <button onClick={() => setIdx(Math.min(TESTIS.length-1,idx+1))} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
};

// ── CTA section
const CTASection = () => (
  <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden text-center">
    <div className="absolute inset-0 opacity-10 pointer-events-none"
      style={{ background: 'radial-gradient(circle at 50% 50%, #2563eb, transparent 70%)' }} />
    <div className="container mx-auto px-6 relative z-10">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/8 border border-white/15 text-sm font-semibold text-white/80 mb-6">
        🎉 14-day free trial · No credit card required
      </div>
      <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-5">
        Ready to transform<br/>
        <span style={{ background:'linear-gradient(135deg,#60a5fa,#c084fc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
          your operations?
        </span>
      </h2>
      <p className="text-lg text-white/55 max-w-md mx-auto mb-10 leading-relaxed">
        Join 3,000+ organizations using Synkly ERP to run faster and smarter.
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link href="/auth/register">
          <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-black shadow-xl">
            Get Started Free <ArrowRight className="text-slate-900" />
          </Button>
        </Link>
        <Link href="/contact">
          <Button size="lg" className="bg-white/8 border border-white/20 text-white hover:bg-white/15">
            Book a Demo
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

// ── Footer
const Footer = () => (
  <footer className="bg-[#0f172a] text-white/55 pt-16 pb-8">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
              </svg>
            </div>
            <span className="text-lg font-black text-white">Synkly<span className="text-blue-400"> ERP</span></span>
          </div>
          <p className="text-sm leading-relaxed">The all-in-one business management platform that adapts to every industry.</p>
        </div>
        {[
          { t:'Product', ls:['Features','Pricing','Integrations','Changelog'] },
          { t:'Company', ls:['About','Blog','Careers','Contact'] },
          { t:'Legal',   ls:['Privacy','Terms','Security','GDPR'] },
        ].map(col => (
          <div key={col.t}>
            <div className="text-xs font-bold uppercase tracking-widest text-white/25 mb-4">{col.t}</div>
            <div className="flex flex-col gap-2.5">
              {col.ls.map(l => <Link key={l} href={`/${l.toLowerCase()}`} className="text-sm hover:text-blue-400 transition-colors">{l}</Link>)}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs">{`© ${new Date().getFullYear()} Synkly ERP. All rights reserved.`}</p>
        <div className="flex gap-2">
          {['globe','mail'].map(ic => (
            <div key={ic} className="w-8 h-8 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/12 transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {ic === 'globe' ? <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> : <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>}
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={cn('w-4 h-4', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ── HOME PAGE
export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturesSection />
        <ClientsTicker />
        <PricingSection />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
