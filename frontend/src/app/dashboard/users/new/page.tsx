'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useAuth } from '@/context/auth-context';
import { createUserApi } from '@/lib/api/services';
import { RoleCode } from '@/types';
import { IconArrowRight } from '@/components/ui/icons';

const ROLE_OPTIONS: RoleCode[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CUSTOMER'];

export default function DashboardNewUserPage() {
  const router = useRouter();
  const { accessToken } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleCode, setRoleCode] = useState<RoleCode>('ADMIN');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    if (!fullName.trim()) return setError('Full name is required.');
    if (!email.trim()) return setError('Email address is required.');
    if (!password || password.length < 8)
      return setError('Password must be at least 8 characters long.');

    setSubmitting(true);
    setError(null);

    try {
      await createUserApi(
        {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          roleCode,
        },
        accessToken,
      );

      router.push('/dashboard/users');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create user');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell allowedRoles={['SUPER_ADMIN']}>
      <div className="mx-auto max-w-2xl flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
            <Link href="/dashboard/users" className="hover:underline">
              Users
            </Link>
            <IconArrowRight className="size-3" />
            <span className="text-stone-900 font-bold">New User</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-950 font-display">
            Provision Dashboard User
          </h1>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 shadow-xs">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs flex flex-col gap-4"
        >
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full rounded-xl border border-stone-300 p-3 text-xs font-medium focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@easyfashion.com"
              className="w-full rounded-xl border border-stone-300 p-3 text-xs font-medium focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801712345678"
              className="w-full rounded-xl border border-stone-300 p-3 text-xs font-medium focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Initial Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-stone-300 p-3 text-xs font-medium focus:border-[#C9A227] focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-stone-500">
              Must be at least 8 characters with letters and numbers.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Assigned System Role *
            </label>
            <select
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value as RoleCode)}
              className="w-full rounded-xl border border-stone-300 p-3 text-xs font-bold text-stone-900 focus:border-[#C9A227] focus:outline-none bg-white"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3 border-t border-stone-100 pt-4">
            <Link
              href="/dashboard/users"
              className="rounded-xl border border-stone-300 px-5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-stone-950 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#C9A227] hover:text-stone-950 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Provisioning...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
