'use client';

import { useEffect, useState } from 'react';
import { getCategories, getProducts, getSizes, getStyles } from '@/lib/api/services';
import { IconGrid, IconTag, IconRuler, IconStyle } from '../ui/icons';

type CatalogSummary = {
  totalCategories: number;
  totalProducts: number;
  totalSizes: number;
  totalStyles: number;
};

export function SummaryCards() {
  const [summary, setSummary] = useState<CatalogSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [catRes, prodRes, sizeRes, styleRes] = await Promise.all([
          getCategories({ limit: 1 }).catch(() => ({ pagination: { totalItems: 0 } })),
          getProducts({ limit: 1 }).catch(() => ({ pagination: { totalItems: 0 } })),
          getSizes({ limit: 1 }).catch(() => ({ pagination: { totalItems: 0 } })),
          getStyles({ limit: 1 }).catch(() => ({ pagination: { totalItems: 0 } })),
        ]);

        setSummary({
          totalCategories: catRes.pagination?.totalItems || 0,
          totalProducts: prodRes.pagination?.totalItems || 0,
          totalSizes: sizeRes.pagination?.totalItems || 0,
          totalStyles: styleRes.pagination?.totalItems || 0,
        });
      } catch {
        setSummary({
          totalCategories: 0,
          totalProducts: 0,
          totalSizes: 0,
          totalStyles: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  const cards = [
    { label: 'Total Categories', value: summary?.totalCategories, icon: <IconGrid className="size-5 text-stone-900" /> },
    { label: 'Fashion Products', value: summary?.totalProducts, icon: <IconTag className="size-5 text-stone-900" /> },
    { label: 'Available Sizes', value: summary?.totalSizes, icon: <IconRuler className="size-5 text-stone-900" /> },
    { label: 'Available Styles', value: summary?.totalStyles, icon: <IconStyle className="size-5 text-stone-900" /> },
  ];

  return (
    <div className="grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:divide-x lg:divide-stone-300">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="flex flex-col items-center justify-center text-center px-6 group"
        >
          <span className="mb-4 flex text-stone-900 opacity-80 group-hover:opacity-100 transition-opacity">
            {card.icon}
          </span>
          {loading ? (
            <div className="h-8 w-16 animate-pulse bg-stone-200 mb-1" />
          ) : (
            <p className="text-4xl font-bold text-stone-950 font-display tracking-tight">
              {card.value ?? 0}
            </p>
          )}
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-stone-500">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}
