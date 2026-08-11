'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  IconBag,
  IconDashboard,
  IconGrid,
  IconLogout,
  IconRuler,
  IconStyle,
  IconTag,
  IconUsers,
} from '@/components/ui/icons';

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Array<'SUPER_ADMIN' | 'ADMIN' | 'MANAGER'>;
};

const navigationItems: NavigationItem[] = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: IconDashboard,
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  },
  {
    name: 'Products',
    href: '/dashboard/products',
    icon: IconGrid,
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  },
  {
    name: 'Categories',
    href: '/dashboard/categories',
    icon: IconTag,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    name: 'Sizes',
    href: '/dashboard/sizes',
    icon: IconRuler,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    name: 'Styles',
    href: '/dashboard/styles',
    icon: IconStyle,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    name: 'Orders',
    href: '/dashboard/orders',
    icon: IconBag,
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
  },
  {
    name: 'User Management',
    href: '/dashboard/users',
    icon: IconUsers,
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
];

type DashboardSidebarProps = {
  onNavClick?: () => void;
};

export function DashboardSidebar({ onNavClick }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userRole = user?.role?.code as 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | undefined;

  const filteredNavigation = navigationItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole)),
  );

  return (
    <div className="flex h-full w-64 flex-col justify-between border-r border-stone-200 bg-stone-900 text-stone-300">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-stone-800 px-6">
          <span className="flex size-8 items-center justify-center bg-[#C9A227] font-bold text-stone-950 text-sm">
            EF
          </span>
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm tracking-wider uppercase">
              Management
            </span>
            <span className="text-[9px] font-semibold text-[#C9A227] tracking-[0.2em] uppercase -mt-0.5">
              Dashboard
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 p-4">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-stone-500 mb-1">
            Admin Menu
          </p>
          {filteredNavigation.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavClick}
                className={`flex items-center gap-3  px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#C9A227] text-stone-950 '
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="border-t border-stone-800 p-4">
        {user && (
          <div className="mb-3 bg-stone-800/80 p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white truncate">{user.fullName}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] font-medium text-stone-400 truncate max-w-[110px]">
                {user.email}
              </span>
              <span className="rounded-full bg-[#C9A227]/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#C9A227]">
                {user.role?.name || userRole}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 border border-stone-700 bg-stone-800 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:border-rose-800 transition-colors cursor-pointer"
        >
          <IconLogout className="size-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
