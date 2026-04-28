// Each file is a thin wrapper around ModulePage

// finance/page.tsx
"use client";
import { ModulePage } from '@/components/dashboard/ModulePage';
export default function FinancePage() { return <ModulePage module="finance" />; }
