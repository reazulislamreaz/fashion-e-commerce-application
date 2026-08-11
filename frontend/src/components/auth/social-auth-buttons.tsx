'use client';

import { env } from '@/lib/config/env';
import { useToast } from '../ui/toast';

type SocialAuthButtonsProps = {
  actionLabel?: string;
};

export function SocialAuthButtons({ actionLabel = 'Continue' }: SocialAuthButtonsProps) {
  const { showToast } = useToast();

  const handleSocialAuth = (provider: 'Google' | 'Facebook') => {
    const baseUrl = env.apiBaseUrl;
    const endpoint = provider === 'Google' ? '/auth/google' : '/auth/facebook';
    showToast(
      `${provider} Authentication`,
      `Redirecting to ${provider} OAuth authentication...`,
      'info',
    );
    window.location.href = `${baseUrl}${endpoint}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex items-center justify-center my-2">
        <div className="w-full border-t border-stone-200" />
        <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
          Or {actionLabel.toLowerCase()} with
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => handleSocialAuth('Google')}
          className="flex items-center justify-center gap-2 border border-stone-300 bg-white py-2.5 px-4 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 hover:border-stone-400 transition-all"
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.1 0-5.74-2.09-6.68-4.91H1.32v3.15C3.32 21.36 7.37 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.32 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.56H1.32C.48 8.24 0 10.06 0 12s.48 3.76 1.32 5.44l4-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.32 2.64 1.32 6.56l4 3.15c.94-2.82 3.58-4.96 6.68-4.96z"
            />
          </svg>
          <span>Google</span>
        </button>
      </div>
    </div>
  );
}
