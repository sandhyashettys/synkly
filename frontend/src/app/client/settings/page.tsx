"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientLayout } from '@/components/dashboard/ClientDashboard';
import { useAuthStore } from '@/store/authStore';
import { Button, Input, toast, Avatar } from '@/components/ui';
import { profileSchema, updatePasswordSchema, type ProfileFormData } from '@/lib/validations';
import { usersApi, authApi } from '@/lib/api';

export default function ClientSettingsPage() {
  const { user, setUser } = useAuthStore();
  const [saved, setSaved] = useState(false);

  const pf = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName||'', lastName: user?.lastName||'', email: user?.email||'', phone:'' },
  });

  const pwf = useForm<any>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const saveProfile = async (data: ProfileFormData) => {
    try {
      const res = await usersApi.update(user!.id, data);
      setUser(res.data.data);
      setSaved(true); setTimeout(()=>setSaved(false),2500);
      toast.success('Profile saved successfully');
    } catch { toast.error('Failed to save profile'); }
  };

  const changePw = async (data: any) => {
    try {
      await authApi.updatePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      pwf.reset();
      toast.success('Password updated successfully');
    } catch (err:any) { toast.error(err.response?.data?.message||'Failed to update password'); }
  };

  return (
    <ClientLayout title="Settings" subtitle="Manage your account and preferences">
      <div className="max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="font-black text-base mb-5">Profile Information</div>
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={user?.fullName||''} size={60} />
            <div>
              <div className="font-bold">{user?.fullName}</div>
              <div className="text-sm text-slate-400">{user?.companyName}</div>
            </div>
          </div>
          <form onSubmit={pf.handleSubmit(saveProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" required error={pf.formState.errors.firstName?.message} {...pf.register('firstName')} />
              <Input label="Last Name" required error={pf.formState.errors.lastName?.message} {...pf.register('lastName')} />
            </div>
            <Input label="Email" type="email" required error={pf.formState.errors.email?.message} {...pf.register('email')} />
            <Input label="Phone" type="tel" error={pf.formState.errors.phone?.message} {...pf.register('phone')} />
            <Button type="submit" loading={pf.formState.isSubmitting}>{saved?'✓ Saved!':'Save Changes'}</Button>
          </form>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="font-black text-base mb-5">Change Password</div>
          <form onSubmit={pwf.handleSubmit(changePw)} className="space-y-4">
            <Input label="Current Password" type="password" required error={pwf.formState.errors.currentPassword?.message} {...pwf.register('currentPassword')} />
            <Input label="New Password" type="password" required hint="Min 8 chars + number + symbol" error={pwf.formState.errors.newPassword?.message} {...pwf.register('newPassword')} />
            <Input label="Confirm Password" type="password" required error={pwf.formState.errors.confirm?.message} {...pwf.register('confirm')} />
            <Button type="submit" variant="ghost" loading={pwf.formState.isSubmitting}>Update Password</Button>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
}
