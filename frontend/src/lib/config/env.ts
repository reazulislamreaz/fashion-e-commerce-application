function requirePublicEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local.`,
    );
  }
  return value.replace(/\/$/, '');
}

export const env = {
  apiBaseUrl: requirePublicEnv(
    'NEXT_PUBLIC_API_BASE_URL',
    'https://easyapi.elevateapparel.com.bd/api/v1',
  ),
} as const;
