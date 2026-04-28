"use client";
import { useParams } from 'next/navigation';
import { ResetPasswordPage } from '@/components/auth/AuthPages';
export default function Page() {
  const params = useParams();
  return <ResetPasswordPage token={params.token as string} />;
}
