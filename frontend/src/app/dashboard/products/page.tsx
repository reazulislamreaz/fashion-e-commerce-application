'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useAuth } from '@/context/auth-context';
import {
  deleteProductApi,
  getCategories,
  getProducts,
  getStyles,
} from '@/lib/api/services';
import { extractErrorMessage } from '@/lib/api/errors';
import { useToast } from '@/components/ui/toast';
import { Category, PaginationMeta, Product, Style } from '@/types';
import {
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';

export default function DashboardProductsPage() {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [styleId, setStyleId] = useState('');

  // Delete Modal
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProductsList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts({
        page,
        limit: 10,
        search,
        categoryId: categoryId || undefined,
        styleId: styleId || undefined,
        status: 'all',
      });
      setProducts(res.items || []);
      setMeta(res.pagination || null);
    } catch (err) {
      console.error('Failed to load products:', extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, styleId]);

  useEffect(() => {
    fetchProductsList();
  }, [fetchProductsList]);

  useEffect(() => {
    getCategories({ limit: 100 })
      .then((res) => setCategories(res.items || []))
      .catch(() => {});
    getStyles({ limit: 100 })
      .then((res) => setStyles(res.items || []))
      .catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    setDeleteError(null);

    try {
      await deleteProductApi(id, accessToken);
      showToast('Product Deleted', 'The product has been removed from the catalog.');
      setDeletingId(null);
      fetchProductsList();
    } catch (err: unknown) {
      setDeleteError(extractErrorMessage(err, 'Failed to delete product.'));
    }
  };

  return (
    <DashboardShell allowedRoles={['SUPER_ADMIN', 'ADMIN', 'MANAGER']}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 uppercase">
              Product Management
            </h1>
            <p className="mt-1 text-xs text-stone-500">
              Create, edit, inspect, and manage fashion catalog products.
            </p>
          </div>

          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center justify-center gap-2 bg-stone-950 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
          >
            <IconPlus className="size-4" />
            <span>Create Product</span>
          </Link>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col gap-3 border border-stone-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search product name or description..."
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
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="border border-stone-200 bg-stone-50 py-2.5 px-3 text-xs font-medium text-stone-900 focus:border-[#C9A227] focus:bg-white focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={styleId}
              onChange={(e) => {
                setStyleId(e.target.value);
                setPage(1);
              }}
              className="border border-stone-200 bg-stone-50 py-2.5 px-3 text-xs font-medium text-stone-900 focus:border-[#C9A227] focus:bg-white focus:outline-none"
            >
              <option value="">All Styles</option>
              {styles.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-hidden border border-stone-200 bg-white">
          {loading ? (
            <div className="p-8 text-center text-xs text-stone-500">
              Loading product database...
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500">
              No products found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4">Item</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Style</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {products.map((prod) => {
                    const primaryImg =
                      prod.images?.find((i) => i.isPrimary)?.url ||
                      prod.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200';

                    const priceNum =
                      typeof prod.price === 'string'
                        ? parseFloat(prod.price)
                        : prod.price;

                    return (
                      <tr key={prod.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative size-10 shrink-0 overflow-hidden border border-stone-200 bg-stone-100">
                              <Image
                                src={primaryImg}
                                alt={prod.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-stone-950 line-clamp-1">
                                {prod.name}
                              </span>
                              <span className="text-[10px] text-stone-400 line-clamp-1">
                                {prod.productSizes?.map((ps) => ps.size?.name).join(', ') || 'No sizes'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">
                          {prod.category?.name || 'Unassigned'}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">
                          {prod.style?.name || 'Unassigned'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-950">
                          ${priceNum.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              prod.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-stone-100 text-stone-600 border border-stone-200'
                            }`}
                          >
                            {prod.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/products/${prod.id}/edit`}
                              className="p-1.5 text-stone-500 hover:text-stone-950 transition-colors"
                              title="Edit Product"
                            >
                              <IconPencil className="size-4" />
                            </Link>
                            <button
                              onClick={() => {
                                setDeletingId(prod.id);
                                setDeleteError(null);
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 transition-colors"
                              title="Delete Product"
                            >
                              <IconTrash className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <Pagination meta={meta} onPageChange={setPage} noun="products" />
        </div>

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm border border-stone-200 bg-white p-6 text-center">
              <h3 className="text-base font-bold text-stone-950">Delete Product?</h3>
              <p className="mt-2 text-xs text-stone-500">
                Are you sure you want to permanently delete this product?
              </p>

              {deleteError && (
                <div className="mt-3 bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
                  {deleteError}
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
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
