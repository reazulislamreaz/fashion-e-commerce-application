'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCategories, getStyles } from '@/lib/api/services';

export function Footer() {
  const [menId, setMenId] = useState<string>('');
  const [womenId, setWomenId] = useState<string>('');
  const [casualId, setCasualId] = useState<string>('');
  const [formalId, setFormalId] = useState<string>('');

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cRes, sRes] = await Promise.all([getCategories(), getStyles()]);
        if (cRes.items) {
          const men = cRes.items.find((c) => c.name === "Men's Collection");
          const women = cRes.items.find((c) => c.name === "Women's Collection");
          if (men) setMenId(men.id);
          if (women) setWomenId(women.id);
        }
        if (sRes.items) {
          const casual = sRes.items.find((s) => s.name === 'Modern Casual');
          const formal = sRes.items.find((s) => s.name === 'Formal Elegance');
          if (casual) setCasualId(casual.id);
          if (formal) setFormalId(formal.id);
        }
      } catch {
        // ignore
      }
    }
    loadMeta();
  }, []);

  return (
    <footer className="border-t border-stone-900 bg-stone-950 text-stone-300">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Company Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center bg-[#C9A227] text-stone-950 font-bold text-sm">
                EF
              </span>
              <span className="text-lg font-bold tracking-wider text-white font-display">
                EASY FASHION
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Easy Fashion Limited is a premium fashion e-commerce destination
              crafted for modern styles, high-quality apparel, and exceptional
              customer experience.
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-stone-900 text-stone-400 hover:text-[#C9A227] hover:bg-stone-800 transition-colors cursor-pointer text-xs font-semibold">
                FB
              </span>
              <span className="flex size-8 items-center justify-center rounded-full bg-stone-900 text-stone-400 hover:text-[#C9A227] hover:bg-stone-800 transition-colors cursor-pointer text-xs font-semibold">
                IG
              </span>
              <span className="flex size-8 items-center justify-center rounded-full bg-stone-900 text-stone-400 hover:text-[#C9A227] hover:bg-stone-800 transition-colors cursor-pointer text-xs font-semibold">
                X
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
              Explore
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-xs text-stone-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-white transition-colors"
                >
                  Shop Catalog
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-white transition-colors"
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="hover:text-white transition-colors"
                >
                  Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Catalog Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
              Collections
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5 text-xs text-stone-400">
              <li>
                <Link
                  href={menId ? `/products?categoryId=${menId}` : '/products'}
                  className="hover:text-white transition-colors"
                >
                  Men&apos;s Collection
                </Link>
              </li>
              <li>
                <Link
                  href={womenId ? `/products?categoryId=${womenId}` : '/products'}
                  className="hover:text-white transition-colors"
                >
                  Women&apos;s Collection
                </Link>
              </li>
              <li>
                <Link
                  href={casualId ? `/products?styleId=${casualId}` : '/products'}
                  className="hover:text-white transition-colors"
                >
                  Casual Style
                </Link>
              </li>
              <li>
                <Link
                  href={formalId ? `/products?styleId=${formalId}` : '/products'}
                  className="hover:text-white transition-colors"
                >
                  Formal Style
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
              Customer Care
            </h3>
            <div className="mt-4 flex flex-col gap-2.5 text-xs text-stone-400">
              <p>Email: support@easyfashion.com</p>
              <p>Hotline: +880 1700-000000</p>
              <p>Address: Dhaka, Bangladesh</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1 text-[11px] font-medium text-[#C9A227]">
                <span>Support Available 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-stone-900 pt-6 flex flex-col items-center justify-between gap-4 text-xs text-stone-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Easy Fashion Limited. All rights reserved.</p>
          <p className="text-[11px]">Designed for Technical Assessment</p>
        </div>
      </div>
    </footer>
  );
}
