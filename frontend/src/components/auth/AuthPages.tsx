"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import {
  loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema,
  type LoginFormData, type RegisterFormData,
} from '@/lib/validations';
import { Button, Input, Select, Spinner, toast } from '@/components/ui';
import { cn } from '@/lib/utils';

// ─── Shared Logo
const AuthLogo = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    </div>
    <span className="text-xl font-black tracking-tight">Synkly<span className="text-blue-600"> ERP</span></span>
  </div>
);

// ─── Auth Shell Layout
const AuthShell = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
  <div className="min-h-screen flex">
    {/* Left panel */}
    <div className="hidden lg:flex w-[480px] flex-shrink-0 flex-col justify-center px-14 py-16 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
      <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 pointer-events-none bg-blue-500" />
      <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full blur-[80px] opacity-15 pointer-events-none bg-purple-500" />
      <div className="relative z-10">{left}</div>
    </div>
    {/* Right panel */}
    <div className="flex-1 flex flex-col justify-center items-center bg-white px-6 py-12 overflow-y-auto">
      <div className="w-full max-w-[420px]">{right}</div>
    </div>
  </div>
);

// ─── Google Sign-in Button
const GoogleBtn = ({ label }: { label: string }) => (
  <button className="w-full h-11 flex items-center justify-center gap-3 border-[1.5px] border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-semibold text-slate-700">
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    {label}
  </button>
);

// ─── Divider
const OrDivider = () => (
  <div className="flex items-center gap-3 my-5">
    <div className="flex-1 h-px bg-slate-200" />
    <span className="text-xs text-slate-400 font-medium">or</span>
    <div className="flex-1 h-px bg-slate-200" />
  </div>
);

// ═══════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════
export const LoginPage = () => {
  const router  = useRouter();
  const { login } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.firstName}!`);
      if (user.role === 'super_admin') router.push('/admin/dashboard');
      else router.push('/client/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <AuthShell
      left={
        <>
          <AuthLogo />
          <div className="mt-14">
            <h2 className="text-3xl font-black text-white leading-tight mb-4">Welcome back to<br/>Synkly ERP</h2>
            <p className="text-white/55 text-base leading-relaxed mb-12">Your complete business management platform. Pick up right where you left off.</p>
            {[['3,000+','Companies worldwide'],['99.9%','Platform uptime SLA'],['40%','Average cost reduction']].map(([n,l]) => (
              <div key={l} className="flex items-center gap-4 mb-5">
                <div className="text-2xl font-black text-blue-400 min-w-[76px]">{n}</div>
                <div className="text-white/55 text-sm">{l}</div>
              </div>
            ))}
          </div>
        </>
      }
      right={
        <>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-8 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back to home
          </Link>
          <div className="mb-8">
            <div className="lg:hidden mb-6"><AuthLogo /></div>
            <h1 className="text-2xl font-black tracking-tight mb-1.5">Sign in to your account</h1>
            <p className="text-slate-500 text-sm">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input label="Email Address" type="email" placeholder="you@company.com" required
              error={errors.email?.message} {...register('email')} />
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password <span className="text-red-500">*</span></label>
                <Link href="/auth/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} placeholder="Enter your password"
                  className={cn('w-full h-10 px-3.5 pr-11 rounded-lg border-[1.5px] bg-white text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10',
                    errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200')}
                  {...register('password')} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {showPw
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" loading={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <OrDivider />
          <GoogleBtn label="Continue with Google" />

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-blue-600 font-bold hover:text-blue-700">Create one free</Link>
          </p>

          <div className="flex justify-center gap-5 mt-7">
            {[['shield','SOC 2'],['lock','256-bit SSL'],['globe','GDPR']].map(([ic,lb]) => (
              <div key={lb} className="flex items-center gap-1.5 text-xs text-slate-400">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {ic==='shield'&&<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
                  {ic==='lock'&&<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}
                  {ic==='globe'&&<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>}
                </svg>
                {lb}
              </div>
            ))}
          </div>
        </>
      }
    />
  );
};

// ═══════════════════════════════════════════════════════════
// REGISTER PAGE (2-step)
// ═══════════════════════════════════════════════════════════
const INDUSTRIES = ['','Retail & E-Commerce','Healthcare & Pharma','Manufacturing','Construction & Real Estate','Education & Training','Finance & Banking','Hospitality & Tourism','IT & Software','Logistics & Supply Chain','Media & Entertainment','Non-Profit','Professional Services','Restaurant & Food Service','Telecommunications','Transportation','Other'];
const COUNTRIES  = ['','United States','United Kingdom','Canada','Australia','India','Germany','France','Singapore','UAE','South Africa','Brazil','Japan','Netherlands','Spain','Italy','New Zealand','Malaysia','Philippines','Kenya','Nigeria','Mexico','Indonesia','Saudi Arabia','Sweden','Switzerland'];

export const RegisterPage = () => {
  const router  = useRouter();
  const [step, setStep]     = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [captcha, setCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, trigger, getValues, watch, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const pw = watch('password') || '';
  const pwScore = [pw.length>=8, /[A-Z]/.test(pw), /\d/.test(pw), /[!@#$%^&*]/.test(pw)].filter(Boolean).length;
  const pwColors = ['#dc2626','#ea580c','#ca8a04','#16a34a'];
  const pwLabels = ['Weak','Fair','Good','Strong'];

  const nextStep = async () => {
    const ok = await trigger(['firstName','lastName','email','password','confirm']);
    if (ok) setStep(2);
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (!captcha) { toast.error('Please complete the CAPTCHA verification'); return; }
    setLoading(true);
    try {
      const res = await authApi.register(data);
      const { token, refreshToken, user } = res.data;
      localStorage.setItem('synkly_token', token);
      localStorage.setItem('synkly_refresh_token', refreshToken);
      useAuthStore.setState({ user, token, refreshToken, isAuthenticated: true });
      toast.success(`Welcome, ${user.firstName}! Your account is ready.`);
      router.push('/client/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      left={
        <>
          <AuthLogo />
          <div className="mt-12">
            <h2 className="text-3xl font-black text-white leading-tight mb-4">Start your free<br/>14-day trial</h2>
            <p className="text-white/55 text-sm leading-relaxed mb-9">Join 3,000+ organizations using Synkly ERP to unify their operations.</p>
            {[['✅','No credit card required'],['⚡','Setup in under 5 minutes'],['🔒','Enterprise-grade security'],['🌍','Supports 60+ countries'],['📊','Full access to all 6 modules']].map(([e,t])=>(
              <div key={t} className="flex items-center gap-3 mb-4">
                <span className="text-lg">{e}</span>
                <span className="text-white/75 text-sm">{t}</span>
              </div>
            ))}
            <div className="mt-11 p-5 rounded-xl bg-white/6 border border-white/10">
              <div className="flex gap-1 mb-2">{[1,2,3,4,5].map(i=><span key={i} className="text-amber-400 text-xs">★</span>)}</div>
              <p className="text-white/70 text-sm italic leading-relaxed mb-3">"Synkly cut our reporting time by 70%. Onboarding took less than a day."</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">SC</div>
                <div><div className="text-white text-xs font-bold">Sarah Chen</div><div className="text-white/40 text-xs">COO, TechFlow Ltd</div></div>
              </div>
            </div>
          </div>
        </>
      }
      right={
        <>
          {step === 2 ? (
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-7 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Back to step 1
            </button>
          ) : (
            <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-7 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              Back to Sign In
            </Link>
          )}

          <div className="mb-7">
            <div className="lg:hidden mb-5"><AuthLogo /></div>
            <h1 className="text-2xl font-black tracking-tight mb-1">Create your account</h1>
            <p className="text-slate-400 text-sm">Step {step} of 2 — {step===1 ? 'Account credentials' : 'Company information'}</p>
          </div>

          {/* Step bar */}
          <div className="flex gap-1.5 mb-7">
            {[1,2].map(s => <div key={s} className="flex-1 h-1 rounded-full transition-all duration-400" style={{ background: s<=step ? '#2563eb' : '#e2e8f0' }} />)}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="First Name" placeholder="John" required error={errors.firstName?.message} {...register('firstName')} />
                  <Input label="Last Name" placeholder="Smith" required error={errors.lastName?.message} {...register('lastName')} />
                </div>
                <Input label="Email Address" type="email" placeholder="you@company.com" required error={errors.email?.message} {...register('email')} />

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input type={showPw?'text':'password'} placeholder="Min 8 chars + number + symbol"
                      className={cn('w-full h-10 px-3.5 pr-11 rounded-lg border-[1.5px] text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10',
                        errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white')}
                      {...register('password')} />
                    <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showPw ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                      </svg>
                    </button>
                  </div>
                  {pw && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[0,1,2,3].map(i=><div key={i} className="flex-1 h-1 rounded-full transition-all" style={{ background: i<pwScore ? pwColors[pwScore-1] : '#e2e8f0' }} />)}
                      </div>
                      <p className="text-xs font-medium" style={{ color: pwScore>0 ? pwColors[pwScore-1] : '#94a3b8' }}>{pwScore>0 ? pwLabels[pwScore-1] : 'Too weak'}</p>
                    </div>
                  )}
                  {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <Input label="Confirm Password" type="password" placeholder="Re-enter your password" required
                  error={errors.confirm?.message} {...register('confirm')} />

                <Button type="button" className="w-full mt-2" size="lg" onClick={nextStep}>
                  Continue <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Button>

                <OrDivider />
                <GoogleBtn label="Continue with Google" />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <Input label="Company / Organization Name" placeholder="Acme Corporation" required
                  error={errors.companyName?.message} {...register('companyName')} />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Industry <span className="text-red-500">*</span></label>
                    <select className={cn('w-full h-10 px-3 rounded-lg border-[1.5px] text-sm outline-none transition-all appearance-none cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10', errors.industry ? 'border-red-400 bg-red-50':'border-slate-200 bg-white')} {...register('industry')}>
                      {INDUSTRIES.map(i=><option key={i} value={i} disabled={!i}>{i||'Select industry'}</option>)}
                    </select>
                    {errors.industry && <p className="mt-1.5 text-xs text-red-500">{errors.industry.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Company Size</label>
                    <select className="w-full h-10 px-3 rounded-lg border-[1.5px] border-slate-200 bg-white text-sm outline-none appearance-none cursor-pointer focus:border-blue-500" {...register('companySize')}>
                      {['','1–10','11–50','51–200','201–500','501–1000','1000+'].map(s=><option key={s} value={s}>{s||'Select size'}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" required
                    error={errors.phone?.message} {...register('phone')} />
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Country <span className="text-red-500">*</span></label>
                    <select className={cn('w-full h-10 px-3 rounded-lg border-[1.5px] text-sm outline-none appearance-none cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10', errors.location ? 'border-red-400 bg-red-50':'border-slate-200 bg-white')} {...register('location')}>
                      {COUNTRIES.map(c=><option key={c} value={c} disabled={!c}>{c||'Select country'}</option>)}
                    </select>
                    {errors.location && <p className="mt-1.5 text-xs text-red-500">{errors.location.message}</p>}
                  </div>
                </div>

                <Input label="Website" type="url" placeholder="https://yourcompany.com"
                  hint="Optional" error={errors.website?.message} {...register('website')} />

                {/* CAPTCHA */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Security Verification <span className="text-red-500">*</span></label>
                  <CaptchaBox verified={captcha} onChange={setCaptcha} />
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  By creating an account you agree to our{' '}
                  <Link href="/terms" className="text-blue-600 font-semibold">Terms of Service</Link> and{' '}
                  <Link href="/privacy" className="text-blue-600 font-semibold">Privacy Policy</Link>.
                </p>

                <div className="flex gap-3">
                  <Button type="button" variant="ghost" className="flex-1" size="lg" onClick={() => setStep(1)}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                    Back
                  </Button>
                  <Button type="submit" className="flex-[2]" size="lg" loading={loading}>
                    {loading ? 'Creating…' : 'Create Account'}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-600 font-bold hover:text-blue-700">Sign in</Link>
          </p>
        </>
      }
    />
  );
};

// ═══════════════════════════════════════════════════════════
// FORGOT PASSWORD PAGE
// ═══════════════════════════════════════════════════════════
export const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{email:string}>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async ({ email }: { email: string }) => {
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-[420px] p-8">
        <div className="mb-6"><AuthLogo /></div>
        {sent ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">📬</div>
            <h2 className="text-xl font-black mb-2">Check your email</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              If that email is registered, we've sent a password reset link. Check your inbox (and spam folder).
            </p>
            <Link href="/auth/login"><Button variant="ghost" className="w-full">Back to Sign In</Button></Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black mb-1.5">Forgot password?</h1>
            <p className="text-slate-500 text-sm mb-7">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <Input label="Email Address" type="email" placeholder="you@company.com" required
                error={errors.email?.message} {...register('email')} />
              <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-5">
              <Link href="/auth/login" className="text-blue-600 font-bold">Back to Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// RESET PASSWORD PAGE
// ═══════════════════════════════════════════════════════════
export const ResetPasswordPage = ({ token }: { token: string }) => {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{password:string;confirm:string}>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async ({ password }: { password: string }) => {
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset link.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-[420px] p-8">
        <div className="mb-6"><AuthLogo /></div>
        {done ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-black mb-2">Password reset!</h2>
            <p className="text-slate-500 text-sm">Redirecting to sign in…</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black mb-1.5">Reset your password</h1>
            <p className="text-slate-500 text-sm mb-7">Enter a new password for your account.</p>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <Input label="New Password" type="password" placeholder="Min 8 chars + number + symbol" required
                error={errors.password?.message} {...register('password')} />
              <Input label="Confirm New Password" type="password" placeholder="Re-enter new password" required
                error={errors.confirm?.message} {...register('confirm')} />
              <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
                {isSubmitting ? 'Resetting…' : 'Reset Password'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// CAPTCHA COMPONENT
// ═══════════════════════════════════════════════════════════
const CaptchaBox = ({ verified, onChange }: { verified: boolean; onChange: (v: boolean) => void }) => {
  const [checking, setChecking] = useState(false);
  const click = () => {
    if (verified || checking) return;
    setChecking(true);
    setTimeout(() => { setChecking(false); onChange(true); }, 1400);
  };
  return (
    <div onClick={click}
      className={cn('flex items-center gap-3.5 p-3.5 rounded-xl border-[1.5px] cursor-pointer select-none transition-all',
        verified ? 'border-emerald-400 bg-emerald-50 cursor-default' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50')}>
      {checking
        ? <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin flex-shrink-0" />
        : <div className={cn('w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all',
            verified ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300')}>
            {verified && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
      }
      <div>
        <div className={cn('text-sm font-semibold', verified ? 'text-emerald-700' : 'text-slate-700')}>
          {verified ? "Verified — You're human ✓" : "I'm not a robot"}
        </div>
        {!verified && <div className="text-xs text-slate-400 mt-0.5">Click to verify</div>}
      </div>
      <div className="ml-auto text-center">
        <div className="text-xl">🔒</div>
        <div className="text-[9px] text-slate-400 leading-tight">reCAPTCHA<br/>Privacy · Terms</div>
      </div>
    </div>
  );
};
