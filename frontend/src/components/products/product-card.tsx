'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { useToast } from '../ui/toast';
import { Product } from '@/types';


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
    <div className="group relative flex flex-col bg-transparent transition-all duration-300">
      {/* Image container */}
      <Link href={`/products/${product.id}`} className="relative aspect-4/5 w-full overflow-hidden bg-stone-100 mb-4">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Category & Style badges overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {product.category?.name && (
            <span className="bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-stone-900 tracking-wide uppercase">
              {product.category.name}
            </span>
          )}
          {product.style?.name && (
            <span className="bg-stone-900/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-white tracking-wide uppercase">
              {product.style.name}
            </span>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <Link href={`/products/${product.id}`}>
            <h3 className="text-sm font-bold text-stone-900 line-clamp-1 group-hover:text-stone-600 transition-colors">
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
                  className={`text-[10px] font-bold uppercase transition-colors ${
                    selectedSizeId === size.id
                      ? 'text-stone-950 underline decoration-2 underline-offset-4'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price & Add to Cart Action */}
        <div className="mt-3 flex items-end justify-between">
          <p className="text-sm font-bold text-stone-900">
            ${priceNum.toFixed(2)}
          </p>

          <button
            onClick={handleAddToCart}
            className="text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-950 transition-colors border-b border-transparent hover:border-stone-950 cursor-pointer"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}
