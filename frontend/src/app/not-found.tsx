import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-24 sm:px-6">
      <div className="text-center">
        <span className="inline-flex size-16 items-center justify-center bg-[#C9A227] text-stone-950 font-bold text-3xl mb-6">
          404
        </span>
        <h1 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-stone-950 font-display uppercase">
          Page Not Found
        </h1>
        <p className="mt-4 text-sm sm:text-base text-stone-500 max-w-md mx-auto">
          We couldn&apos;t find the page you were looking for. It might have been removed, renamed, or doesn&apos;t exist.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-stone-950 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#C9A227] hover:text-stone-950 transition-colors cursor-pointer"
          >
            Return to Homepage
          </Link>
          <Link
            href="/products"
            className="border border-stone-300 bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-stone-950 hover:border-stone-400 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
