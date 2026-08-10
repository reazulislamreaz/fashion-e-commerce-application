'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useAuth } from '@/context/auth-context';
import {
  getRolesApi,
  getUsersApi,
  updateUserRoleApi,
  updateUserStatusApi,
} from '@/lib/api/services';
import { PaginationMeta, Role, RoleCode, User, UserStatus } from '@/types';
import {
  IconChevronLeft,
  IconChevronRight,
  IconPencil,
  IconPlus,
  IconSearch,
} from '@/components/ui/icons';

const ROLE_OPTIONS: RoleCode[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CUSTOMER'];

export default function DashboardUsersPage() {
  const { user: currentUser, accessToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [, setRoles] = useState<Role[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleCode | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');

  const isSuperAdmin = currentUser?.role?.code === 'SUPER_ADMIN';

  const fetchUsersList = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await getUsersApi(
        {
          page,
          limit: 10,
          search,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
        },
        accessToken,
      );
      setUsers(res.items || []);
      setMeta(res.pagination || null);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsersList();
  }, [fetchUsersList]);

  useEffect(() => {
    if (accessToken) {
      getRolesApi(accessToken)
        .then((r) => setRoles(r))
        .catch(() => {});
    }
  }, [accessToken]);

  const handleToggleStatus = async (user: User) => {
    if (!accessToken || !isSuperAdmin) return;
    const newStatus: UserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      await updateUserStatusApi(user.id, newStatus, accessToken);
      fetchUsersList();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    }
  };

  const handleRoleChange = async (userId: string, newRole: RoleCode) => {
    if (!accessToken || !isSuperAdmin) return;

    try {
      await updateUserRoleApi(userId, newRole, accessToken);
      fetchUsersList();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    }
  };

  return (
    <DashboardShell allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
              User Management
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              Super Admin user administration, role assignment, and account activation.
            </p>
          </div>

          {isSuperAdmin && (
            <Link
              href="/dashboard/users/new"
              className="inline-flex items-center justify-center gap-2 bg-stone-950 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
            >
              <IconPlus className="size-4" />
              <span>Create User</span>
            </Link>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col gap-3 border border-stone-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 focus:border-[#C9A227] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as RoleCode | '');
                setPage(1);
              }}
              className="border border-stone-200 bg-stone-50 py-2.5 px-3 text-xs font-medium text-stone-900 focus:border-[#C9A227] focus:bg-white focus:outline-none"
            >
              <option value="">All Roles</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as UserStatus | '');
                setPage(1);
              }}
              className="border border-stone-200 bg-stone-50 py-2.5 px-3 text-xs font-medium text-stone-900 focus:border-[#C9A227] focus:bg-white focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden border border-stone-200 bg-white">
          {loading ? (
            <div className="p-8 text-center text-xs text-stone-500">
              Loading user registry...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500">
              No users found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-stone-950">{u.fullName}</span>
                          <span className="text-[10px] text-stone-400">{u.phone || 'No phone'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">{u.email}</td>
                      <td className="py-3.5 px-4">
                        {isSuperAdmin ? (
                          <select
                            value={u.role?.code}
                            onChange={(e) =>
                              handleRoleChange(u.id, e.target.value as RoleCode)
                            }
                            className="border border-stone-200 bg-stone-50 py-1 px-2 text-[11px] font-bold text-stone-800 focus:border-[#C9A227] focus:outline-none"
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-800 border border-stone-200">
                            {u.role?.name || u.role?.code}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button className="cursor-pointer"
                          disabled={!isSuperAdmin}
                          onClick={() => handleToggleStatus(u)}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-opacity ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          } ${isSuperAdmin ? 'hover:opacity-80' : 'cursor-default'}`}
                        >
                          {u.status}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isSuperAdmin && (
                          <Link
                            href={`/dashboard/users/${u.id}/edit`}
                            className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-950 transition-colors"
                            title="Edit User Info"
                          >
                            <IconPencil className="size-4" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-stone-100 px-4 py-3 text-xs text-stone-500">
              <span>
                Page {meta.page} of {meta.totalPages} ({meta.totalItems} users)
              </span>
              <div className="flex items-center gap-2">
                <button className="cursor-pointer"
                  disabled={!meta.hasPreviousPage}
                  onClick={() => setPage((p) => p - 1)}
                  className="border border-stone-200 p-1.5 disabled:opacity-40"
                >
                  <IconChevronLeft className="size-4" />
                </button>
                <button className="cursor-pointer"
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="border border-stone-200 p-1.5 disabled:opacity-40"
                >
                  <IconChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
