'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const COOKIE_NAME = 'vw';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function getViewportWidth(): number {
  return Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
}

export default function ViewportCookieWriter() {
  const router = useRouter();
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    const writeIfChanged = (newWidth: number) => {
      const current = getCookie(COOKIE_NAME);
      const currentNum = current ? Number(current) : NaN;
      if (!Number.isFinite(currentNum) || currentNum !== newWidth) {
        setCookie(COOKIE_NAME, String(newWidth));
        // Trigger a refresh so server components re-render with updated cookies
        router.refresh();
      }
    };

    // Initialize immediately on mount
    writeIfChanged(getViewportWidth());

    const onResize = () => {
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = window.setTimeout(() => {
        writeIfChanged(getViewportWidth());
      }, 300);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (debounceTimer.current) {
        window.clearTimeout(debounceTimer.current);
      }
    };
  }, [router]);

  return null;
}