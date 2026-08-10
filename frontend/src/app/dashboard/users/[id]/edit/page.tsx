'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useAuth } from '@/context/auth-context';
import { getUserByIdApi, updateUserApi } from '@/lib/api/services';
import { IconArrowRight } from '@/components/ui/icons';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function DashboardEditUserPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { accessToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadUser() {
      if (!accessToken) return;
      setLoading(true);
      try {
        const u = await getUserByIdApi(id, accessToken);
        setFullName(u.fullName);
        setEmail(u.email);
        setPhone(u.phone || '');
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch user information');
        }
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [id, accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    if (!fullName.trim()) return setError('Full name is required.');
    if (!email.trim()) return setError('Email address is required.');

    setSubmitting(true);
    setError(null);

    try {
      await updateUserApi(
        id,
        {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
        },
        accessToken,
      );

      router.push('/dashboard/users');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update user');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell allowedRoles={['SUPER_ADMIN']}>
        <div className="flex h-64 items-center justify-center text-xs text-stone-500">
          Loading user record...
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell allowedRoles={['SUPER_ADMIN']}>
      <div className="mx-auto max-w-2xl flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
            <Link href="/dashboard/users" className="hover:underline">
              Users
            </Link>
            <IconArrowRight className="size-3" />
            <span className="text-stone-900 font-bold">Edit User</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
            Edit User Profile
          </h1>
        </div>

        {error && (
          <div className="border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="border border-stone-200 bg-white p-6 flex flex-col gap-4"
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
              className="w-full border border-stone-300 p-3 text-xs font-medium focus:border-[#C9A227] focus:outline-none"
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
              className="w-full border border-stone-300 p-3 text-xs font-medium focus:border-[#C9A227] focus:outline-none"
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
              className="w-full border border-stone-300 p-3 text-xs font-medium focus:border-[#C9A227] focus:outline-none"
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-3 border-t border-stone-100 pt-4">
            <Link
              href="/dashboard/users"
              className="border border-stone-300 px-5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-stone-950 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
