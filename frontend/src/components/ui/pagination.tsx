'use client';

import { PaginationMeta } from '@/types';
import { IconChevronLeft, IconChevronRight } from './icons';

type PaginationProps = {
  /** Pagination metadata from the API response */
  meta: PaginationMeta | null;
  /** Called when the user navigates to a different page */
  onPageChange: (page: number) => void;
  /** Entity label used in the summary text, e.g. "products", "users" */
  noun?: string;
  /** Visual variant: "table" renders inside a table card border-t, "standalone" renders free-standing */
  variant?: 'table' | 'standalone';
};

/**
 * Unified pagination control used across all dashboard management tables
 * and the customer-facing product catalog.
 */
export function Pagination({
  meta,
  onPageChange,
  noun = 'items',
  variant = 'table',
}: PaginationProps) {
  if (!meta || meta.totalPages <= 1) return null;

  const isTable = variant === 'table';

  // Smart pagination algorithm to generate page numbers with ellipses
  const getPageNumbers = () => {
    const totalPages = meta.totalPages;
    const currentPage = meta.page;
    const delta = 1; // Number of pages to show around current page
    
    const range: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift('...');
    } else if (currentPage - delta === 2) {
      // Avoid rendering "1 ... 3" when we could just render "1 2 3"
      // Note: Math.max(2, currentPage - delta) already handles starting at 2, 
      // but if the gap is exactly 1 page (page 2), let's make sure it's not replaced by ellipsis.
      // Wait, if currentPage = 4, delta = 1, we show 3, 4, 5. Gap is 2. (1 ... 3) -> Better to show 1 2 3 4 5
      // If gap is exactly 1 page, insert that page instead of ellipsis.
    }
    
    // Improved logic to avoid solitary ellipses
    if (range.length > 0) {
      if ((range[0] as number) > 2) {
        if ((range[0] as number) === 3) {
          range.unshift(2);
        } else {
          range.unshift('...');
        }
      }
      
      const lastItem = range[range.length - 1] as number;
      if (lastItem < totalPages - 1) {
        if (lastItem === totalPages - 2) {
          range.push(totalPages - 1);
        } else {
          range.push('...');
        }
      }
    }

    range.unshift(1);
    
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={
        isTable
          ? 'flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-stone-100 px-4 py-3 text-xs text-stone-500'
          : 'flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-stone-200 pt-6 text-xs text-stone-600'
      }
    >
      {/* Summary */}
      {isTable ? (
        <span>
          Page {meta.page} of {meta.totalPages} ({meta.totalItems} {noun})
        </span>
      ) : (
        <span className="font-medium text-stone-500">
          Showing page <strong className="text-stone-900">{meta.page}</strong> of{' '}
          <strong className="text-stone-900">{meta.totalPages}</strong>
        </span>
      )}

      {/* Navigation Controls */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* Previous Button */}
        <button
          disabled={!meta.hasPreviousPage}
          onClick={() => onPageChange(meta.page - 1)}
          aria-label="Previous page"
          className={
            isTable
              ? 'flex items-center justify-center border border-stone-200 bg-white p-1.5 text-stone-700 disabled:opacity-40 hover:bg-stone-50 transition-colors cursor-pointer'
              : 'flex items-center justify-center border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 disabled:opacity-40 hover:bg-stone-50 transition-colors cursor-pointer'
          }
        >
          {isTable ? <IconChevronLeft className="size-4" /> : 'Prev'}
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pages.map((p, index) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-xs text-stone-400 font-medium"
                >
                  ...
                </span>
              );
            }

            const isCurrentPage = p === meta.page;
            
            return (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                aria-current={isCurrentPage ? 'page' : undefined}
                className={
                  isTable
                    ? `flex min-w-7 h-7 items-center justify-center border text-xs font-semibold transition-colors cursor-pointer ${
                        isCurrentPage
                          ? 'border-stone-950 bg-stone-950 text-white'
                          : 'border-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                      }`
                    : `flex min-w-8 h-8 items-center justify-center border text-xs font-bold transition-colors cursor-pointer ${
                        isCurrentPage
                          ? 'border-stone-950 bg-stone-950 text-white'
                          : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-400'
                      }`
                }
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          disabled={!meta.hasNextPage}
          onClick={() => onPageChange(meta.page + 1)}
          aria-label="Next page"
          className={
            isTable
              ? 'flex items-center justify-center border border-stone-200 bg-white p-1.5 text-stone-700 disabled:opacity-40 hover:bg-stone-50 transition-colors cursor-pointer'
              : 'flex items-center justify-center border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 disabled:opacity-40 hover:bg-stone-50 transition-colors cursor-pointer'
          }
        >
          {isTable ? <IconChevronRight className="size-4" /> : 'Next'}
        </button>
      </div>
    </div>
  );
}
