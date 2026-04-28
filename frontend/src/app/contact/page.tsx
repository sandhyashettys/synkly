"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactFormData } from '@/lib/validations';
import { contactApi } from '@/lib/api';
import { Button, toast } from '@/components/ui';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await contactApi.submit(data);
      setSent(true);
      reset();
      toast.success('Message sent! We\'ll get back to you within 24 hours.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  const CONTACT_INFO = [
    { icon: '📧', label: 'Email Us', value: 'hello@synkly.io',           link: 'mailto:hello@synkly.io' },
    { icon: '📞', label: 'Call Us',  value: '+1 (800) SYNKLY-1',          link: 'tel:+18007695591' },
    { icon: '📍', label: 'Visit Us', value: '123 Innovation Drive, San Francisco, CA 94105', link: '#' },
    { icon: '📅', label: 'Book Demo',value: '30-minute platform walkthrough', link: '#book-demo' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
              </svg>
            </div>
            <span className="text-lg font-black">Synkly<span className="text-blue-600"> ERP</span></span>
          </Link>
          <Link href="/auth/register"><Button size="sm">Get Started</Button></Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white py-16 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Let's start a <span style={{ background:'linear-gradient(135deg,#60a5fa,#c084fc)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>conversation</span>
          </h1>
          <p className="text-lg text-white/60 max-w-lg mx-auto">
            Have questions about Synkly ERP? We typically respond within 2 hours on business days.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">

          {/* Contact info + map */}
          <div>
            <h2 className="text-2xl font-black mb-2">Contact Information</h2>
            <p className="text-slate-500 mb-8">Reach us through any of the following channels.</p>

            <div className="space-y-5 mb-10">
              {CONTACT_INFO.map(c => (
                <a key={c.label} href={c.link} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    {c.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{c.label}</div>
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{c.value}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* Google Maps embed placeholder */}
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm h-56 bg-slate-100 flex items-center justify-center">
              <iframe
                src="https://maps.google.com/maps?q=San+Francisco,+CA&z=13&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                title="Synkly ERP Location"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            {sent ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-5">✅</div>
                <h3 className="text-2xl font-black mb-3">Message Sent!</h3>
                <p className="text-slate-500 mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <Button variant="ghost" onClick={() => setSent(false)}>Send Another Message</Button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-black mb-6">Send us a Message</h3>
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input placeholder="John Smith"
                        className={cn('w-full h-10 px-3.5 rounded-lg border-[1.5px] text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10',
                          errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white')}
                        {...register('name')} />
                      {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input type="email" placeholder="you@company.com"
                        className={cn('w-full h-10 px-3.5 rounded-lg border-[1.5px] text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10',
                          errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white')}
                        {...register('email')} />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input type="tel" placeholder="+1 (555) 000-0000"
                      className={cn('w-full h-10 px-3.5 rounded-lg border-[1.5px] text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10',
                        errors.phone ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white')}
                      {...register('phone')} />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                  </div>

                  {/* Company + Subject */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Company</label>
                      <input placeholder="Your company" className="w-full h-10 px-3.5 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" {...register('company')} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Subject</label>
                      <input placeholder="How can we help?" className="w-full h-10 px-3.5 rounded-lg border-[1.5px] border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" {...register('subject')} />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea placeholder="Tell us about your business and what you're looking for…"
                      className={cn('w-full px-3.5 py-2.5 rounded-lg border-[1.5px] text-sm outline-none resize-none h-28 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10',
                        errors.message ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white')}
                      {...register('message')} />
                    {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                  </div>

                  <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
                    {isSubmitting ? 'Sending…' : 'Send Message'}
                  </Button>

                  <p className="text-center text-xs text-slate-400">
                    🔒 Your information is secure and never shared with third parties.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
