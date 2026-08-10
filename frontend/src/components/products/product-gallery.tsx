'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/types';

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const initialIndex = sortedImages.findIndex((img) => img.isPrimary);
  const [selectedIndex, setSelectedIndex] = useState(
    initialIndex > -1 ? initialIndex : 0,
  );

  const fallbackImage =
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1000&q=80';

  const activeImageUrl = sortedImages[selectedIndex]?.url || fallbackImage;

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Image Display */}
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-xs">
        <Image
          src={activeImageUrl}
          alt={`${productName} view ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center transition-all duration-300"
        />
      </div>

      {/* Thumbnails Gallery Strip */}
      {sortedImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {sortedImages.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                selectedIndex === idx
                  ? 'border-[#C9A227] shadow-md ring-1 ring-[#C9A227]'
                  : 'border-stone-200 opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img.url}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
