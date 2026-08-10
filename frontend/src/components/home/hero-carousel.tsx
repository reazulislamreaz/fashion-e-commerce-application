'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IconChevronLeft, IconChevronRight } from '../ui/icons';

type Slide = {
  id: number;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  badge: string;
  image: string;
};

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    badge: 'NEW SEASON COLLECTION',
    title: 'ELEGANCE DEFINED BY CRAFTSMANSHIP',
    subtitle: 'Discover contemporary menswear and luxury womenswear designed for effortless elegance.',
    ctaText: 'Shop New Arrivals',
    ctaLink: '/products',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80',
  },
  {
    id: 2,
    badge: 'SUMMER FASHION PROMO',
    title: 'TRENDSETTING APPAREL & LUXURY STYLES',
    subtitle: 'Uncompromising fabric quality matched with state-of-the-art tailored fits.',
    ctaText: 'Explore Collection',
    ctaLink: '/products?styleId=00000000-0000-4000-8000-000000000001',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80',
  },
  {
    id: 3,
    badge: 'EXCLUSIVE ATTIRE',
    title: 'TIMENESS FORMALS & CASUAL ESSENTIALS',
    subtitle: 'Upgrade your wardrobe with tailored blazers, premium denim, and versatile shirts.',
    ctaText: 'Browse Formals',
    ctaLink: '/products?styleId=00000000-0000-4000-8000-000000000002',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&q=80',
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const active = HERO_SLIDES[currentSlide];

  return (
    <div className="relative w-full overflow-hidden bg-stone-950 text-white min-h-[440px] sm:min-h-[520px] lg:min-h-[600px] flex items-center">
      {/* Background Image Carousel */}
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center brightness-45"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent" />
        </div>
      ))}

      {/* Slide Content Overlay */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#C9A227]">
            {active.badge}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl font-display leading-[1.1]">
            {active.title}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
            {active.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={active.ctaLink}
              className="inline-flex items-center justify-center rounded-xl bg-[#C9A227] px-7 py-3 text-sm font-bold text-stone-950 shadow-lg hover:bg-[#D4B03A] transition-all transform hover:-translate-y-0.5"
            >
              {active.ctaText}
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl border border-stone-700 bg-stone-900/80 backdrop-blur-xs px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition-all"
            >
              View All Products
            </Link>
          </div>
        </div>
      </div>

      {/* Left/Right Navigation Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 z-30 flex size-10 items-center justify-center rounded-full bg-stone-900/60 text-white backdrop-blur-xs hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
        aria-label="Previous Slide"
      >
        <IconChevronLeft className="size-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 z-30 flex size-10 items-center justify-center rounded-full bg-stone-900/60 text-white backdrop-blur-xs hover:bg-[#C9A227] hover:text-stone-950 transition-colors"
        aria-label="Next Slide"
      >
        <IconChevronRight className="size-5" />
      </button>

      {/* Pagination Indicators */}
      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentSlide ? 'w-8 bg-[#C9A227]' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
