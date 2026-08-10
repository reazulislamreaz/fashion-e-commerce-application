'use client';

import { useCallback, useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useAuth } from '@/context/auth-context';
import {
  createStyleApi,
  deleteStyleApi,
  getStyles,
  updateStyleApi,
} from '@/lib/api/services';
import { PaginationMeta, Style } from '@/types';
import {
  IconChevronLeft,
  IconChevronRight,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from '@/components/ui/icons';

export default function DashboardStylesPage() {
  const { accessToken } = useAuth();
  const [styles, setStyles] = useState<Style[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<Style | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchStylesList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStyles({ page, limit: 10, search, status: 'all' });
      setStyles(res.items || []);
      setMeta(res.pagination || null);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchStylesList();
  }, [fetchStylesList]);

  const handleOpenCreate = () => {
    setEditingStyle(null);
    setFormData({ name: '', description: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st: Style) => {
    setEditingStyle(st);
    setFormData({ name: st.name, description: st.description || '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!formData.name.trim()) {
      setFormError('Style name is required (e.g. Casual, Formal, Streetwear).');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingStyle) {
        await updateStyleApi(
          editingStyle.id,
          { name: formData.name.trim(), description: formData.description.trim() },
          accessToken,
        );
      } else {
        await createStyleApi(
          { name: formData.name.trim(), description: formData.description.trim() },
          accessToken,
        );
      }
      setIsModalOpen(false);
      fetchStylesList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to save style');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    setDeleteError(null);

    try {
      await deleteStyleApi(id, accessToken);
      setDeletingId(null);
      fetchStylesList();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Cannot delete style');
      }
    }
  };

  return (
    <DashboardShell allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
              Style Management
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              Manage fashion aesthetic styles (e.g. Formal, Casual, Vintage, Urban).
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 bg-stone-950 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors cursor-pointer"
          >
            <IconPlus className="size-4" />
            <span>Add Style</span>
          </button>
        </div>

        {/* Search Toolbar */}
        <div className="border border-stone-200 bg-white p-4">
          <div className="relative max-w-sm">
            <IconSearch className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search style name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 focus:border-[#C9A227] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Style Table */}
        <div className="overflow-hidden border border-stone-200 bg-white">
          {loading ? (
            <div className="p-8 text-center text-xs text-stone-500">
              Loading styles...
            </div>
          ) : styles.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500">
              No fashion styles found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4">Style Name</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {styles.map((st) => (
                    <tr key={st.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-stone-950">{st.name}</td>
                      <td className="py-3.5 px-4 text-stone-500 max-w-xs truncate">
                        {st.description || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            st.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          {st.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="cursor-pointer"
                            onClick={() => handleOpenEdit(st)}
                            className="p-1.5 text-stone-500 hover:text-stone-950 transition-colors"
                            title="Edit Style"
                          >
                            <IconPencil className="size-4" />
                          </button>
                          <button className="cursor-pointer"
                            onClick={() => {
                              setDeletingId(st.id);
                              setDeleteError(null);
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 transition-colors"
                            title="Delete Style"
                          >
                            <IconTrash className="size-4" />
                          </button>
                        </div>
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
                Page {meta.page} of {meta.totalPages} ({meta.totalItems} styles)
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

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md border border-stone-200 bg-white p-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                <h3 className="text-base font-bold text-stone-950 font-display">
                  {editingStyle ? 'Edit Fashion Style' : 'Create New Style'}
                </h3>
                <button className="cursor-pointer" onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900">
                  <IconX className="size-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Style Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-stone-300 p-2.5 text-xs font-medium focus:border-[#C9A227] focus:outline-none"
                    placeholder="e.g. Formal Wear, Streetwear, Minimalist"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-stone-300 p-2.5 text-xs font-medium focus:border-[#C9A227] focus:outline-none"
                    placeholder="Describe this fashion style..."
                  />
                </div>

                <div className="mt-2 flex items-center justify-end gap-3 border-t border-stone-100 pt-4">
                  <button className="cursor-pointer"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-stone-950 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Saving...' : editingStyle ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm border border-stone-200 bg-white p-6 text-center">
              <h3 className="text-base font-bold text-stone-950 font-display">Delete Fashion Style?</h3>
              <p className="mt-2 text-xs text-stone-500">
                Are you sure you want to delete this style definition?
              </p>

              {deleteError && (
                <div className="mt-3 bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
                  {deleteError}
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-3">
                <button className="cursor-pointer"
                  onClick={() => setDeletingId(null)}
                  className="border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button className="cursor-pointer"
                  onClick={() => handleDelete(deletingId)}
                  className="bg-rose-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-rose-700 transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
