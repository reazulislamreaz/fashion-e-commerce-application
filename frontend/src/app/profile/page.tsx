'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/toast';
import {
  IconArrowRight,
  IconBag,
  IconChevronRight,
  IconUser,
} from '@/components/ui/icons';

function ProfileContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await logout();
    showToast('Signed Out', 'You have been successfully signed out of your account.');
    router.push('/login');
  };

  if (!user) return null;

  const roleName = user.role?.name || 'Customer';
  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Member';

  const userInitials = user.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'EF';

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-stone-500">
        <Link href="/" className="hover:text-stone-900">
          Home
        </Link>
        <IconChevronRight className="size-3" />
        <span className="text-stone-900 font-semibold">My Profile</span>
      </nav>

      {/* Main Profile Header Card */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-stone-200 pb-8">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-stone-950 text-[#C9A227] font-extrabold text-xl shadow-md">
              {userInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-stone-950 font-display">
                  {user.fullName}
                </h1>
                <span className="rounded-full bg-[#C9A227]/20 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#96740c]">
                  {roleName}
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-500">{user.email}</p>
              <p className="mt-0.5 text-[11px] font-medium text-stone-400">
                Member since {formattedDate}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-100 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Profile Information Details */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Overview */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-sm mb-4">
              <IconUser className="size-4 text-[#C9A227]" />
              <span>Personal Details</span>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between border-b border-stone-200/80 pb-2">
                <span className="text-stone-500 font-medium">Full Name</span>
                <span className="font-bold text-stone-900">{user.fullName}</span>
              </div>

              <div className="flex justify-between border-b border-stone-200/80 pb-2">
                <span className="text-stone-500 font-medium">Email Address</span>
                <span className="font-bold text-stone-900">{user.email}</span>
              </div>

              <div className="flex justify-between border-b border-stone-200/80 pb-2">
                <span className="text-stone-500 font-medium">Phone Number</span>
                <span className="font-bold text-stone-900">
                  {user.phone || 'Not provided'}
                </span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-stone-500 font-medium">Account Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm mb-4">
                <IconBag className="size-4 text-[#C9A227]" />
                <span>Customer Quick Portal</span>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed mb-4">
                Access your past order history, check shipment statuses, and view items in your cart.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/orders"
                className="flex items-center justify-between rounded-xl bg-white border border-stone-200 p-3 text-xs font-bold text-stone-900 hover:border-[#C9A227] hover:shadow-xs transition-all"
              >
                <span>View Order History</span>
                <IconArrowRight className="size-4 text-stone-400" />
              </Link>

              <Link
                href="/cart"
                className="flex items-center justify-between rounded-xl bg-white border border-stone-200 p-3 text-xs font-bold text-stone-900 hover:border-[#C9A227] hover:shadow-xs transition-all"
              >
                <span>Shopping Cart</span>
                <IconArrowRight className="size-4 text-stone-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
