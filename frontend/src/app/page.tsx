import { HealthStatus } from '@/components/health-status';

export default function HomePage() {
  return (
    <section className="flex flex-1 flex-col gap-8">
      <div className="max-w-2xl">
        <h1
          className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Easy Fashion
        </h1>
        <p className="mt-4 text-base leading-7 text-stone-600 sm:text-lg">
          Phase 0 foundation is ready. Customer storefront and management
          dashboard features will be built on this NestJS + Next.js base in
          later phases.
        </p>
      </div>

      <div className="rounded-2xl border border-stone-900/10 bg-white/55 p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
          Backend readiness
        </h2>
        <div className="mt-4">
          <HealthStatus />
        </div>
      </div>
    </section>
  );
}
