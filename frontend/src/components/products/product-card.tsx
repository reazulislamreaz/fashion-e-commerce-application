'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { useToast } from '../ui/toast';
import { Product } from '@/types';
import { IconBag } from '../ui/icons';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const availableSizes = product.productSizes?.map((ps) => ps.size) || [];
  const [selectedSizeId, setSelectedSizeId] = useState<string | undefined>(
    availableSizes[0]?.id,
  );

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80';

  const priceNum =
    typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, selectedSizeId, 1);
    showToast(
      'Added to cart',
      `${product.name} ${
        selectedSizeId
          ? `(Size: ${availableSizes.find((s) => s.id === selectedSizeId)?.name})`
          : ''
      }`,
    );
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs hover:border-[#C9A227]/50 hover:shadow-xl transition-all duration-300">
      {/* Image container */}
      <Link href={`/products/${product.id}`} className="relative aspect-4/5 w-full overflow-hidden bg-stone-100">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Category & Style badges overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {product.category?.name && (
            <span className="rounded-full bg-stone-950/80 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-white tracking-wide uppercase">
              {product.category.name}
            </span>
          )}
          {product.style?.name && (
            <span className="rounded-full bg-[#C9A227] px-2.5 py-0.5 text-[10px] font-bold text-stone-950 tracking-wide uppercase">
              {product.style.name}
            </span>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <Link href={`/products/${product.id}`}>
            <h3 className="text-sm font-bold text-stone-900 line-clamp-1 group-hover:text-[#C9A227] transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-stone-500 line-clamp-2">
            {product.description}
          </p>

          {/* Size picker pills */}
          {availableSizes.length > 0 && (
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-stone-400 mr-1">Size:</span>
              {availableSizes.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedSizeId(size.id);
                  }}
                  className={`flex size-6 items-center justify-center rounded-md text-[10px] font-bold transition-all ${
                    selectedSizeId === size.id
                      ? 'bg-stone-900 text-[#C9A227] ring-1 ring-stone-900'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price & Add to Cart Action */}
        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
          <div>
            <span className="text-xs text-stone-400 block font-medium">Price</span>
            <span className="text-base font-extrabold text-stone-950 font-display">
              ${priceNum.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 rounded-xl bg-stone-950 px-3.5 py-2 text-xs font-bold text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors shadow-xs"
          >
            <IconBag className="size-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
