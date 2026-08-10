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
    <div className="relative w-full overflow-hidden bg-stone-950 text-white min-h-[500px] sm:min-h-[600px] lg:min-h-[750px] flex items-center">
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
        <div
          key={active.id}
          className="max-w-2xl transition-all duration-700"
        >
          <span className="inline-block bg-white px-3 py-1 text-[10px] font-bold tracking-widest text-stone-950 uppercase">
            {active.badge}
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-7xl font-display leading-[1.1] uppercase">
            {active.title}
          </h1>
          <p className="mt-5 text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
            {active.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={active.ctaLink}
              className="inline-flex items-center justify-center bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-950 hover:bg-stone-200 transition-colors uppercase tracking-widest"
            >
              {active.ctaText}
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center border border-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white hover:text-stone-950 transition-colors uppercase tracking-widest"
            >
              View All Products
            </Link>
          </div>
        </div>
      </div>

      {/* Left/Right Navigation Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-4 z-30 flex size-12 items-center justify-center bg-stone-950/50 text-white hover:bg-stone-950 transition-colors cursor-pointer"
        aria-label="Previous Slide"
      >
        <IconChevronLeft className="size-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 z-30 flex size-12 items-center justify-center bg-stone-950/50 text-white hover:bg-stone-950 transition-colors cursor-pointer"
        aria-label="Next Slide"
      >
        <IconChevronRight className="size-5" />
      </button>

      {/* Pagination Indicators */}
      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2">
        {HERO_SLIDES.map((_, idx) => (
          <button className="cursor-pointer"
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1 transition-all ${
              idx === currentSlide ? 'w-12 bg-white' : 'w-4 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
