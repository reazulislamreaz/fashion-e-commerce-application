/**
 * Phase 0 seed placeholder.
 * Super Admin and catalog seed data will be added in later phases.
 */
async function main() {
  // Intentionally empty for Phase 0.
  // eslint-disable-next-line no-console
  console.log('Phase 0: no seed data. Database foundation is ready.');
}

main().catch((error: unknown) => {
   
  console.error('Seed failed:', error);
  process.exit(1);
});
