'use client';

import { Category, Size, Style } from '@/types';
import { IconFilter, IconX } from '../ui/icons';
import { FilterSidebar } from './filter-sidebar';

type FilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  sizes: Size[];
  styles: Style[];
  selectedCategory?: string;
  selectedSize?: string;
  selectedStyle?: string;
  onSelectCategory: (id?: string) => void;
  onSelectSize: (id?: string) => void;
  onSelectStyle: (id?: string) => void;
  onReset: () => void;
};

export function FilterDrawer({
  isOpen,
  onClose,
  ...sidebarProps
}: FilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 flex max-w-full pr-10">
        <div className="w-screen max-w-xs bg-white shadow-2xl flex flex-col justify-between">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-950 text-white">
            <div className="flex items-center gap-2">
              <IconFilter className="size-4 text-[#C9A227]" />
              <span className="font-bold text-sm">Filter Catalog</span>
            </div>
            <button onClick={onClose} className="p-1 text-stone-400 hover:text-white">
              <IconX className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <FilterSidebar {...sidebarProps} />
          </div>

          <div className="p-4 border-t border-stone-200 bg-stone-50">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-stone-950 py-3 text-xs font-bold text-white shadow-md hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
