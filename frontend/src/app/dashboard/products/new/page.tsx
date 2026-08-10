'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/toast';
import {
  createProductApi,
  getCategories,
  getSizes,
  getStyles,
  uploadImageApi,
} from '@/lib/api/services';
import { Category, Size, Style } from '@/types';
import { extractErrorMessage } from '@/lib/api/errors';
import { IconArrowRight,  IconTrash } from '@/components/ui/icons';

export default function DashboardNewProductPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [styleId, setStyleId] = useState('');
  const [selectedSizeIds, setSelectedSizeIds] = useState<string[]>([]);
  
  // Image Array state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [images, setImages] = useState<
    Array<{ url: string; isPrimary: boolean; sortOrder: number }>
  >([]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories({ limit: 100 }).then((res) => setCategories(res.items || []));
    getStyles({ limit: 100 }).then((res) => setStyles(res.items || []));
    getSizes({ limit: 100 }).then((res) => setSizes(res.items || []));
  }, []);

  const handleToggleSize = (sizeId: string) => {
    setSelectedSizeIds((prev) =>
      prev.includes(sizeId) ? prev.filter((id) => id !== sizeId) : [...prev, sizeId],
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    try {
      setUploadingImage(true);
      setError(null);
      const res = await uploadImageApi(file, accessToken);
      
      setImages((prev) => [
        ...prev,
        {
          url: res.url,
          isPrimary: prev.length === 0,
          sortOrder: prev.length + 1,
        },
      ]);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Failed to upload image. Please try a different file.'));
    } finally {
      setUploadingImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((i) => i.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    if (!name.trim()) return setError('Product name is required.');
    if (!description.trim()) return setError('Product description is required.');
    if (!price || parseFloat(price) <= 0) return setError('Valid price is required.');
    if (!categoryId) return setError('Please select a product category.');
    if (!styleId) return setError('Please select a fashion style.');
    if (selectedSizeIds.length === 0) return setError('Select at least one available size.');
    if (images.length === 0) return setError('Add at least one product image URL.');

    setSubmitting(true);
    setError(null);

    try {
      await createProductApi(
        {
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price),
          categoryId,
          styleId,
          sizeIds: selectedSizeIds,
          images: images.map((img, idx) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            sortOrder: idx + 1,
          })),
        },
        accessToken,
      );
      
      showToast('Product Created', `Product "${name.trim()}" has been published.`);
      router.push('/dashboard/products');
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Failed to create product. Please check your input and try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="mx-auto max-w-4xl flex flex-col gap-6">
        {/* Breadcrumb & Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-1">
            <Link href="/dashboard/products" className="hover:underline">
              Products
            </Link>
            <IconArrowRight className="size-3" />
            <span className="text-stone-900 font-bold">New Product</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
            Create Fashion Product
          </h1>
        </div>

        {error && (
          <div className="border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Section 1: Basic Information */}
          <div className="border border-stone-200 bg-white p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-stone-950 font-display border-b border-stone-100 pb-3">
              Basic Details
            </h2>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Italian Wool Double-Breasted Overcoat"
                className="w-full border border-stone-300 p-3 text-xs font-medium focus:border-[#C9A227] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Description *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed garment description, material breakdown, and fit information..."
                className="w-full border border-stone-300 p-3 text-xs font-medium focus:border-[#C9A227] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="299.99"
                  className="w-full border border-stone-300 p-3 text-xs font-medium focus:border-[#C9A227] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border border-stone-300 p-3 text-xs font-medium focus:border-[#C9A227] focus:outline-none bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Style *
                </label>
                <select
                  required
                  value={styleId}
                  onChange={(e) => setStyleId(e.target.value)}
                  className="w-full border border-stone-300 p-3 text-xs font-medium focus:border-[#C9A227] focus:outline-none bg-white"
                >
                  <option value="">Select Style</option>
                  {styles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Available Sizes */}
          <div className="border border-stone-200 bg-white p-6 flex flex-col gap-3">
            <h2 className="text-base font-bold text-stone-950 font-display border-b border-stone-100 pb-3">
              Available Sizes *
            </h2>
            <p className="text-xs text-stone-500">
              Select all sizes in stock for this product.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {sizes.map((sz) => {
                const isSelected = selectedSizeIds.includes(sz.id);
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => handleToggleSize(sz.id)}
                    className={` border px-4 py-2.5 text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-stone-950 bg-stone-950 text-[#C9A227] '
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {sz.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Product Images */}
          <div className="border border-stone-200 bg-white p-6 flex flex-col gap-4">
            <h2 className="text-base font-bold text-stone-950 font-display border-b border-stone-100 pb-3">
              Product Images *
            </h2>

            <div className="flex gap-2">
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileUpload}
                disabled={uploadingImage}
                className="flex-1 border border-stone-300 p-2 text-xs font-medium focus:border-[#C9A227] focus:outline-none file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
              />
              {uploadingImage && (
                <div className="flex items-center px-4 py-2.5 text-xs font-bold text-stone-500">
                  Uploading...
                </div>
              )}
            </div>

            {/* Image Preview Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative flex flex-col  border p-2 transition-all ${
                    img.isPrimary
                      ? 'border-[#C9A227] bg-amber-50/40 ring-2 ring-[#C9A227]/30'
                      : 'border-stone-200 bg-stone-50'
                  }`}
                >
                  <div className="relative aspect-3/4 w-full overflow-hidden bg-stone-200">
                    <Image
                      src={img.url}
                      alt={`Product image ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(idx)}
                      className={`text-[10px] font-bold uppercase tracking-wider  px-2 py-1 ${
                        img.isPrimary
                          ? 'bg-[#C9A227] text-stone-950'
                          : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                      }`}
                    >
                      {img.isPrimary ? 'Primary' : 'Make Primary'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1 text-rose-500 hover:text-rose-700"
                    >
                      <IconTrash className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/dashboard/products"
              className="border border-stone-300 bg-white px-6 py-3 text-xs font-bold text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-stone-950 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Creating Product...' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
