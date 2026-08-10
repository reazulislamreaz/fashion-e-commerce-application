'use client';

import { Category, Size, Style } from '@/types';
import { IconFilter, IconX } from '../ui/icons';

type FilterSidebarProps = {
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

export function FilterSidebar({
  categories,
  sizes,
  styles,
  selectedCategory,
  selectedSize,
  selectedStyle,
  onSelectCategory,
  onSelectSize,
  onSelectStyle,
  onReset,
}: FilterSidebarProps) {
  const hasActiveFilters = !!selectedCategory || !!selectedSize || !!selectedStyle;

  return (
    <aside className="w-full flex flex-col gap-6 border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <IconFilter className="size-4 text-[#C9A227]" />
          <h3 className="text-sm font-bold text-stone-900 tracking-tight">
            Filter Catalog
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
          >
            <IconX className="size-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">
          Categories
        </h4>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => onSelectCategory(undefined)}
            className={`text-left text-xs px-3 py-2  font-medium transition-colors ${
              !selectedCategory
                ? 'bg-stone-900 text-[#C9A227] font-semibold'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                onSelectCategory(selectedCategory === cat.id ? undefined : cat.id)
              }
              className={`text-left text-xs px-3 py-2  font-medium transition-colors flex items-center justify-between ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-[#C9A227] font-semibold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Styles */}
      <div className="border-t border-stone-100 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">
          Styles
        </h4>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onSelectStyle(undefined)}
            className={`text-xs px-3 py-1.5  font-medium transition-colors ${
              !selectedStyle
                ? 'bg-stone-900 text-[#C9A227] font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All
          </button>
          {styles.map((st) => (
            <button
              key={st.id}
              onClick={() =>
                onSelectStyle(selectedStyle === st.id ? undefined : st.id)
              }
              className={`text-xs px-3 py-1.5  font-medium transition-colors ${
                selectedStyle === st.id
                  ? 'bg-stone-900 text-[#C9A227] font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="border-t border-stone-100 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">
          Sizes
        </h4>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onSelectSize(undefined)}
            className={`text-xs px-3 py-1.5  font-medium transition-colors ${
              !selectedSize
                ? 'bg-stone-900 text-[#C9A227] font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Sizes
          </button>
          {sizes.map((sz) => (
            <button
              key={sz.id}
              onClick={() =>
                onSelectSize(selectedSize === sz.id ? undefined : sz.id)
              }
              className={`size-8 text-xs flex items-center justify-center  font-bold transition-colors ${
                selectedSize === sz.id
                  ? 'bg-stone-900 text-[#C9A227] ring-1 ring-stone-900'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {sz.name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
