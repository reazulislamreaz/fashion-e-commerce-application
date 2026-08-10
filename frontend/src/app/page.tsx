import Link from 'next/link';
import Image from 'next/image';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { SummaryCards } from '@/components/home/summary-cards';
import { ProductCard } from '@/components/products/product-card';
import { getCategories, getProducts } from '@/lib/api/services';
import { Product } from '@/types';
import { IconArrowRight } from '@/components/ui/icons';

export default async function HomePage() {
  let featuredProducts: Product[] = [];
  let menId = '';
  let womenId = '';

  try {
    const [prodRes, catRes] = await Promise.all([
      getProducts({ limit: 8 }),
      getCategories(),
    ]);
    featuredProducts = prodRes.items || [];

    if (catRes.items) {
      const men = catRes.items.find((c) => c.name === "Men's Collection");
      const women = catRes.items.find((c) => c.name === "Women's Collection");
      if (men) menId = men.id;
      if (women) womenId = women.id;
    }
  } catch {
    featuredProducts = [];
  }

  return (
    <div className="flex flex-col pb-24">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Catalog Summary Section */}
      <div className="w-full border-b border-stone-200 bg-stone-50">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <SummaryCards />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-24 mt-24">
        {/* Featured Products Grid */}
        <section className="flex flex-col gap-10">
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-stone-950 font-display uppercase">
              New Arrivals
            </h2>
            <div className="h-0.5 w-12 bg-stone-950 mt-2"></div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-900 hover:text-stone-500 transition-colors uppercase tracking-widest border-b border-transparent hover:border-stone-500"
            >
              <span>View All Products</span>
              <IconArrowRight className="size-4" />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="border border-dashed border-stone-300 p-12 text-center">
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
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative overflow-hidden p-10 sm:p-16 text-white flex flex-col justify-end min-h-[450px] group">
            <Image
              src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80"
              alt="Menswear"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent z-0" />
            <div className="relative z-10 flex flex-col items-start">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight font-display uppercase">
                Men&apos;s Essentials
              </h3>
              <p className="mt-2 text-sm text-stone-200 max-w-sm">
                Crafted for comfort, premium stitching, and modern silhouetted cuts.
              </p>
              <Link
                href={menId ? `/products?categoryId=${menId}` : '/products'}
                className="mt-6 inline-flex items-center gap-2 bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-950 hover:bg-stone-200 transition-colors uppercase tracking-wider"
              >
                <span>Shop Men</span>
                <IconArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden p-10 sm:p-16 text-white flex flex-col justify-end min-h-[450px] group">
            <Image
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80"
              alt="Womenswear"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent z-0" />
            <div className="relative z-10 flex flex-col items-start">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight font-display uppercase">
                Women&apos;s Fashion
              </h3>
              <p className="mt-2 text-sm text-stone-200 max-w-sm">
                Vibrant palettes, organic cottons, and timeless elegance for every occasion.
              </p>
              <Link
                href={womenId ? `/products?categoryId=${womenId}` : '/products'}
                className="mt-6 inline-flex items-center gap-2 bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-950 hover:bg-stone-200 transition-colors uppercase tracking-wider"
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
