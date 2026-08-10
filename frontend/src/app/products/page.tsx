'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getCategories,
  getProducts,
  getSizes,
  getStyles,
} from '@/lib/api/services';
import { Category, PaginatedList, Product, Size, Style } from '@/types';
import { ProductCard } from '@/components/products/product-card';
import { FilterSidebar } from '@/components/products/filter-sidebar';
import { FilterDrawer } from '@/components/products/filter-drawer';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { IconFilter, IconSearch, IconX } from '@/components/ui/icons';

function ProductCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchParam = searchParams.get('search') || '';
  const categoryIdParam = searchParams.get('categoryId') || undefined;
  const styleIdParam = searchParams.get('styleId') || undefined;
  const sizeIdParam = searchParams.get('sizeId') || undefined;
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const sortByParam = searchParams.get('sortBy') || 'createdAt';
  const sortOrderParam = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  const [categories, setCategories] = useState<Category[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  const [productsData, setProductsData] = useState<PaginatedList<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParam);

  // Sync search input state if query param changes externally
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Load catalog options once
  useEffect(() => {
    async function loadCatalogMeta() {
      try {
        const [cRes, sRes, szRes] = await Promise.all([
          getCategories(),
          getStyles(),
          getSizes(),
        ]);
        setCategories(cRes.items || []);
        setStyles(sRes.items || []);
        setSizes(szRes.items || []);
      } catch {
        // Handle silently
      }
    }
    loadCatalogMeta();
  }, []);

  // Fetch products whenever params change
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await getProducts({
          page: pageParam,
          limit: 12,
          search: searchParam,
          categoryId: categoryIdParam,
          styleId: styleIdParam,
          sizeId: sizeIdParam,
          sortBy: sortByParam,
          sortOrder: sortOrderParam,
        });
        setProductsData(res);
      } catch {
        setProductsData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [
    searchParam,
    categoryIdParam,
    styleIdParam,
    sizeIdParam,
    pageParam,
    sortByParam,
    sortOrderParam,
  ]);

  const updateQueryParams = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 whenever filters or search change (unless explicitly setting page)
    if (!('page' in newParams)) {
      params.set('page', '1');
    }

    router.push(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ search: searchInput.trim() || undefined });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'price_asc') {
      updateQueryParams({ sortBy: 'price', sortOrder: 'asc' });
    } else if (val === 'price_desc') {
      updateQueryParams({ sortBy: 'price', sortOrder: 'desc' });
    } else if (val === 'name_asc') {
      updateQueryParams({ sortBy: 'name', sortOrder: 'asc' });
    } else {
      updateQueryParams({ sortBy: 'createdAt', sortOrder: 'desc' });
    }
  };

  const handleResetFilters = () => {
    setSearchInput('');
    router.push('/products');
  };

  const currentSortVal =
    sortByParam === 'price' && sortOrderParam === 'asc'
      ? 'price_asc'
      : sortByParam === 'price' && sortOrderParam === 'desc'
      ? 'price_desc'
      : sortByParam === 'name' && sortOrderParam === 'asc'
      ? 'name_asc'
      : 'newest';

  const hasActiveFilters =
    !!searchParam || !!categoryIdParam || !!styleIdParam || !!sizeIdParam;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-950 font-display">
            Fashion Catalog
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-stone-500">
            Browse our complete collection of modern apparel and seasonal styles.
          </p>
        </div>

        {/* Search & Sort bar */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by product name..."
              className="w-full rounded-xl border border-stone-300 bg-white py-2 pl-3 pr-9 text-xs text-stone-900 placeholder-stone-400 focus:border-[#C9A227] focus:outline-hidden focus:ring-1 focus:ring-[#C9A227]"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateQueryParams({ search: undefined });
                }}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
              >
                <IconX className="size-4" />
              </button>
            ) : (
              <button type="submit" className="absolute right-2.5 top-2.5 text-stone-400">
                <IconSearch className="size-4" />
              </button>
            )}
          </form>

          {/* Sort selector */}
          <select
            value={currentSortVal}
            onChange={handleSortChange}
            className="rounded-xl border border-stone-300 bg-white py-2 px-3 text-xs font-semibold text-stone-700 focus:border-[#C9A227] focus:outline-hidden"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="inline-flex lg:hidden items-center gap-1.5 rounded-xl bg-stone-950 px-4 py-2 text-xs font-bold text-white shadow-xs"
          >
            <IconFilter className="size-4 text-[#C9A227]" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Desktop Left Sidebar */}
        <div className="hidden lg:block">
          <FilterSidebar
            categories={categories}
            sizes={sizes}
            styles={styles}
            selectedCategory={categoryIdParam}
            selectedSize={sizeIdParam}
            selectedStyle={styleIdParam}
            onSelectCategory={(id) => updateQueryParams({ categoryId: id })}
            onSelectSize={(id) => updateQueryParams({ sizeId: id })}
            onSelectStyle={(id) => updateQueryParams({ styleId: id })}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Drawer */}
        <FilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          categories={categories}
          sizes={sizes}
          styles={styles}
          selectedCategory={categoryIdParam}
          selectedSize={sizeIdParam}
          selectedStyle={styleIdParam}
          onSelectCategory={(id) => updateQueryParams({ categoryId: id })}
          onSelectSize={(id) => updateQueryParams({ sizeId: id })}
          onSelectStyle={(id) => updateQueryParams({ styleId: id })}
          onReset={handleResetFilters}
        />

        {/* Products Grid */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : !productsData || productsData.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                <IconSearch className="size-7" />
              </div>
              <h3 className="mt-4 text-base font-bold text-stone-900">
                No matching fashion products found
              </h3>
              <p className="mt-1 text-xs text-stone-500 max-w-sm">
                Try adjusting your category, size, style filters, or search term to see available items.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="mt-6 rounded-xl bg-stone-950 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
                {productsData.items.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>

              {/* Pagination */}
              {productsData.pagination && productsData.pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-6">
                  <button
                    disabled={!productsData.pagination.hasPreviousPage}
                    onClick={() => updateQueryParams({ page: String(pageParam - 1) })}
                    className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 disabled:opacity-40 hover:bg-stone-50"
                  >
                    Previous Page
                  </button>

                  <span className="text-xs font-medium text-stone-600">
                    Page <strong className="text-stone-900">{productsData.pagination.page}</strong> of{' '}
                    <strong className="text-stone-900">{productsData.pagination.totalPages}</strong>
                  </span>

                  <button
                    disabled={!productsData.pagination.hasNextPage}
                    onClick={() => updateQueryParams({ page: String(pageParam + 1) })}
                    className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 disabled:opacity-40 hover:bg-stone-50"
                  >
                    Next Page
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading catalog...</div>}>
      <ProductCatalogContent />
    </Suspense>
  );
}
