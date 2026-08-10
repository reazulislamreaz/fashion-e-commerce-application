'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getProductById } from '@/lib/api/services';
import { Product } from '@/types';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/components/ui/toast';
import { ProductGallery } from '@/components/products/product-gallery';
import { IconBag, IconChevronRight, IconMinus, IconPlus } from '@/components/ui/icons';

export default function ProductDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedSizeId, setSelectedSizeId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(false);
      try {
        const data = await getProductById(params.id);
        setProduct(data);
        const sizes = data.productSizes?.map((ps) => ps.size) || [];
        if (sizes.length > 0) {
          setSelectedSizeId(sizes[0].id);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="aspect-4/5 w-full animate-pulse bg-stone-200" />
          <div className="flex flex-col gap-4">
            <div className="h-4 w-1/4 animate-pulse bg-stone-200" />
            <div className="h-8 w-3/4 animate-pulse bg-stone-200" />
            <div className="h-6 w-1/3 animate-pulse bg-stone-200" />
            <div className="mt-4 h-24 w-full animate-pulse bg-stone-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-stone-900">Product Not Found</h2>
        <p className="mt-2 text-xs text-stone-500">
          The product you are looking for may have been removed or is temporarily unavailable.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 bg-stone-950 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
        >
          Back to Shop Catalog
        </Link>
      </div>
    );
  }

  const availableSizes = product.productSizes?.map((ps) => ps.size) || [];
  const priceNum =
    typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  const handleAddToCart = () => {
    addItem(product, selectedSizeId, quantity);
    const selectedSizeName = availableSizes.find((s) => s.id === selectedSizeId)?.name;
    showToast(
      'Added to Cart',
      `${quantity}x ${product.name} ${selectedSizeName ? `(Size: ${selectedSizeName})` : ''}`,
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-stone-500">
        <Link href="/" className="hover:text-stone-900">
          Home
        </Link>
        <IconChevronRight className="size-3" />
        <Link href="/products" className="hover:text-stone-900">
          Shop
        </Link>
        {product.category?.name && (
          <>
            <IconChevronRight className="size-3" />
            <Link
              href={`/products?categoryId=${product.categoryId}`}
              className="hover:text-stone-900"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <IconChevronRight className="size-3" />
        <span className="text-stone-900 font-semibold truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-16">
        {/* Left Column: Image Gallery */}
        <ProductGallery images={product.images || []} productName={product.name} />

        {/* Right Column: Product Metadata & Purchasing */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              {product.category?.name && (
                <span className="rounded-full bg-stone-950 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                  {product.category.name}
                </span>
              )}
              {product.style?.name && (
                <span className="rounded-full bg-[#C9A227] px-3 py-1 text-[10px] font-bold text-stone-950 uppercase tracking-wider">
                  {product.style.name}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
                ${priceNum.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 rounded-full px-2.5 py-0.5">
                In Stock & Ready to Ship
              </span>
            </div>

            <div className="mt-6 border-t border-b border-stone-200 py-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Description
              </h3>
              <p className="text-sm leading-relaxed text-stone-600">
                {product.description}
              </p>
            </div>

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Select Size
                  </label>
                  <span className="text-xs font-medium text-stone-400">
                    Standard Fit
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSizeId(size.id)}
                      className={`min-w-12 h-10 px-3  text-xs font-bold transition-all flex items-center justify-center ${
                        selectedSizeId === size.id
                          ? 'bg-stone-950 text-[#C9A227]  ring-2 ring-stone-950'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mt-6">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                Quantity
              </label>
              <div className="inline-flex items-center border border-stone-300 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex size-9 items-center justify-center text-stone-600 hover:bg-stone-100"
                >
                  <IconMinus className="size-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-stone-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  className="flex size-9 items-center justify-center text-stone-600 hover:bg-stone-100"
                >
                  <IconPlus className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Add to Cart CTA */}
          <div className="mt-8 border-t border-stone-200 pt-6">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-2 bg-stone-950 py-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors transform hover:-translate-y-0.5 cursor-pointer"
            >
              <IconBag className="size-5" />
              <span>Add to Cart — ${(priceNum * quantity).toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
