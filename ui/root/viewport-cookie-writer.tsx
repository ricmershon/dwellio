'use client';

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { VIEWPORT_WIDTH_COOKIE_NAME } from "@/types/types";

const COOKIE_MAX_AGE_SECONDS = 60 * 60* 24 * 30;    // 30 days

const getCookie = (name: string) => {
    const match = document.cookie.match(
        new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
    );
    
    return match ? decodeURIComponent(match[1]) : null;
}

const setCookie = (name: string, value: string) => {
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

const getViewportWidth = () => (
    Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0)
);

const ViewportCookieWriter = () => {
    const router = useRouter();
    const debounceTimer = useRef<number | null>(null);

    useEffect(() => {
        const writeIfChanged = (newWidth: number) => {
            const current = getCookie(VIEWPORT_WIDTH_COOKIE_NAME);
            const currentNum = current ? Number(current) : NaN;

            if (!Number.isFinite(currentNum) || currentNum !== newWidth) {
                setCookie(VIEWPORT_WIDTH_COOKIE_NAME, String(newWidth));

                /**
                 * Trigger refresh to server components re-render with updated cookie.
                 */
                router.refresh();
            }
        }

        /**
         * Initialize on mount.
         */
        writeIfChanged(getViewportWidth());

        const onResize = () => {
            if (debounceTimer.current) {
                window.clearTimeout(debounceTimer.current);
            }

            debounceTimer.current = window.setTimeout(() => {
                writeIfChanged(getViewportWidth());
            }, 300)
        }

        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);

            if (debounceTimer.current) {
                window.clearTimeout(debounceTimer.current)
            }
        }
    }, [router])

    return null;
};

export default ViewportCookieWriter;