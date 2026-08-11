const apiBaseUrlRaw = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrlRaw) {
  throw new Error(
    'Missing environment variable NEXT_PUBLIC_API_BASE_URL. Set it in .env.local (see .env.example).',
  );
}

export const env = {
  apiBaseUrl: apiBaseUrlRaw.replace(/\/$/, ''),
} as const;
