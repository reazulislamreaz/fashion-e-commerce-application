'use client';

import { useEffect, useState } from 'react';
import { getCategories, getProducts, getSizes, getStyles } from '@/lib/api/services';

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
          getCategories().catch(() => ({ pagination: { totalItems: 0 } })),
          getProducts({ limit: 1 }).catch(() => ({ pagination: { totalItems: 0 } })),
          getSizes().catch(() => ({ pagination: { totalItems: 0 } })),
          getStyles().catch(() => ({ pagination: { totalItems: 0 } })),
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
    { label: 'Total Categories', value: summary?.totalCategories, icon: '📂' },
    { label: 'Fashion Products', value: summary?.totalProducts, icon: '👕' },
    { label: 'Available Sizes', value: summary?.totalSizes, icon: '📏' },
    { label: 'Available Styles', value: summary?.totalStyles, icon: '✨' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs hover:border-[#C9A227]/50 hover:shadow-md transition-all"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-xl shadow-inner">
            {card.icon}
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              {card.label}
            </p>
            {loading ? (
              <div className="mt-1 h-7 w-12 animate-pulse rounded bg-stone-200" />
            ) : (
              <p className="mt-0.5 text-2xl font-bold text-stone-900 font-display">
                {card.value ?? 0}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
