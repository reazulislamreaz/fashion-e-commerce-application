'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { IconBag, IconMenu, IconSearch, IconUser, IconX } from '../ui/icons';

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, openCart } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800 bg-stone-950 text-white shadow-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu trigger */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-stone-300 hover:text-white"
            aria-label="Open Navigation Menu"
          >
            <IconMenu className="size-6" />
          </button>
        </div>

        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#C9A227] text-stone-950 font-bold text-lg shadow-xs group-hover:bg-[#D4B03A] transition-colors">
              EF
            </span>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-wider uppercase text-white font-display">
                Easy Fashion
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#C9A227] -mt-1 font-semibold">
                Limited
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex lg:items-center lg:gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-stone-200 hover:text-[#C9A227] transition-colors"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-stone-200 hover:text-[#C9A227] transition-colors"
          >
            Shop Catalog
          </Link>
          <Link
            href="/products?categoryId=00000000-0000-4000-8000-000000000001"
            className="text-sm font-medium text-stone-200 hover:text-[#C9A227] transition-colors"
          >
            Men&apos;s Wear
          </Link>
          <Link
            href="/products?categoryId=00000000-0000-4000-8000-000000000002"
            className="text-sm font-medium text-stone-200 hover:text-[#C9A227] transition-colors"
          >
            Women&apos;s Collection
          </Link>
        </nav>

        {/* Search & Actions */}
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex relative items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fashion..."
              className="w-48 lg:w-64 rounded-full border border-stone-800 bg-stone-900 py-1.5 pl-4 pr-9 text-xs text-white placeholder-stone-400 focus:border-[#C9A227] focus:outline-hidden focus:ring-1 focus:ring-[#C9A227]"
            />
            <button
              type="submit"
              className="absolute right-2 text-stone-400 hover:text-[#C9A227]"
            >
              <IconSearch className="size-4" />
            </button>
          </form>

          {/* Cart Icon button */}
          <button
            onClick={openCart}
            className="relative flex items-center p-2 text-stone-300 hover:text-[#C9A227] transition-colors"
            aria-label="View Cart"
          >
            <IconBag className="size-6" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#C9A227] text-[11px] font-bold text-stone-950 shadow-xs">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Account / Auth */}
          <div className="relative">
            {isAuthenticated && user ? (
              <div>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-stone-800 bg-stone-900 px-3 py-1.5 text-xs font-medium text-stone-200 hover:border-[#C9A227]"
                >
                  <IconUser className="size-4 text-[#C9A227]" />
                  <span className="hidden sm:inline line-clamp-1 max-w-24">
                    {user.fullName.split(' ')[0]}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-stone-800 bg-stone-900 p-2 shadow-xl z-50 text-xs"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-stone-800">
                      <p className="font-semibold text-white">{user.fullName}</p>
                      <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block w-full text-left px-3 py-2 text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block w-full text-left px-3 py-2 text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors mt-1"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-full bg-[#C9A227] px-4 py-1.5 text-xs font-bold text-stone-950 hover:bg-[#D4B03A] transition-colors"
              >
                <IconUser className="size-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-stone-950 p-6 text-white shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-md bg-[#C9A227] text-stone-950 font-bold text-sm">
                    EF
                  </span>
                  <span className="font-bold text-base tracking-wider font-display">
                    EASY FASHION
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-stone-400 hover:text-white"
                >
                  <IconX className="size-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="mt-6 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-lg border border-stone-800 bg-stone-900 py-2 pl-3 pr-9 text-xs text-white placeholder-stone-400"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-2.5 text-stone-400"
                >
                  <IconSearch className="size-4" />
                </button>
              </form>

              {/* Navigation */}
              <nav className="mt-6 flex flex-col gap-3 font-medium text-sm">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-stone-200 hover:bg-stone-900 hover:text-[#C9A227]"
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-stone-200 hover:bg-stone-900 hover:text-[#C9A227]"
                >
                  Shop All Products
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-lg px-3 py-2 text-stone-200 hover:bg-stone-900 hover:text-[#C9A227]"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-lg px-3 py-2 text-stone-200 hover:bg-stone-900 hover:text-[#C9A227]"
                    >
                      My Orders
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Auth Footer */}
            <div className="border-t border-stone-800 pt-4">
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">{user.fullName}</p>
                    <p className="text-[10px] text-stone-400">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs font-medium text-rose-400"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full rounded-lg bg-[#C9A227] py-2.5 text-center text-xs font-bold text-stone-950"
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
