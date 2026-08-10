import Link from 'next/link';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { SummaryCards } from '@/components/home/summary-cards';
import { ProductCard } from '@/components/products/product-card';
import { getProducts } from '@/lib/api/services';
import { Product } from '@/types';
import { IconArrowRight } from '@/components/ui/icons';

export default async function HomePage() {
  let featuredProducts: Product[] = [];
  try {
    const res = await getProducts({ limit: 8 });
    featuredProducts = res.items || [];
  } catch {
    featuredProducts = [];
  }

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Carousel */}
      <HeroCarousel />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-16">
        {/* Catalog Summary Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#C9A227]">
                LIVE DATABASE METRICS
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-stone-950 font-display">
                Catalog Overview
              </h2>
            </div>
          </div>
          <SummaryCards />
        </section>

        {/* Featured Products Grid */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9A227]">
                NEW ARRIVALS
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-display">
                Featured Fashion Collections
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-950 hover:text-[#C9A227] transition-colors"
            >
              <span>Explore All Products</span>
              <IconArrowRight className="size-4" />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 p-12 text-center">
              <p className="text-stone-600 font-medium">
                No products found in live database. Make sure backend is running and seeded.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Fashion Banners Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-3xl bg-stone-950 p-8 sm:p-12 text-white flex flex-col justify-between min-h-[300px] shadow-lg group">
            <div className="z-10 max-w-sm">
              <span className="inline-block rounded-full bg-[#C9A227] px-3 py-1 text-[10px] font-bold text-stone-950 uppercase tracking-widest">
                MEN&apos;S ESSENTIALS
              </span>
              <h3 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight font-display">
                Tailored Suits & Casual Polo Shirts
              </h3>
              <p className="mt-2 text-xs text-stone-300">
                Crafted for comfort, premium stitching, and modern silhouetted cuts.
              </p>
            </div>
            <div className="z-10 mt-6">
              <Link
                href="/products?categoryId=00000000-0000-4000-8000-000000000001"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-stone-950 hover:bg-[#C9A227] transition-colors"
              >
                <span>Shop Men</span>
                <IconArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-stone-900 p-8 sm:p-12 text-white flex flex-col justify-between min-h-[300px] shadow-lg group">
            <div className="z-10 max-w-sm">
              <span className="inline-block rounded-full bg-[#C9A227] px-3 py-1 text-[10px] font-bold text-stone-950 uppercase tracking-widest">
                WOMEN&apos;S FASHION
              </span>
              <h3 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight font-display">
                Sophisticated Dresses & Modern Wear
              </h3>
              <p className="mt-2 text-xs text-stone-300">
                Vibrant palettes, organic cottons, and timeless elegance for every occasion.
              </p>
            </div>
            <div className="z-10 mt-6">
              <Link
                href="/products?categoryId=00000000-0000-4000-8000-000000000002"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-stone-950 hover:bg-[#C9A227] transition-colors"
              >
                <span>Shop Women</span>
                <IconArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
