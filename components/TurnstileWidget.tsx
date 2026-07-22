'use client';

import React, { useEffect, useId, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          size?: 'normal' | 'compact' | 'flexible';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    __turnstileScriptLoading?: Promise<void>;
  }
}

type TurnstileWidgetProps = {
  onToken: (token: string | null) => void;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
};

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (window.__turnstileScriptLoading) return window.__turnstileScriptLoading;

  window.__turnstileScriptLoading = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Turnstile script failed'))
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile script failed'));
    document.head.appendChild(script);
  });

  return window.__turnstileScriptLoading;
}

/**
 * Cloudflare Turnstile checkbox / managed widget.
 * Renders nothing if NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set.
 */
const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onToken,
  theme = 'auto',
  className = '',
}) => {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const reactId = useId();

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;

        containerRef.current.innerHTML = '';

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
          size: 'flexible',
        });
      })
      .catch((err) => {
        console.error(err);
        onTokenRef.current(null);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme, reactId]);

  if (!siteKey) return null;

  return (
    <div className={className}>
      <div ref={containerRef} />
      <p className="mt-2 text-xs text-neutral-500">
        Complete the check above before submitting.
      </p>
    </div>
  );
};

export function resetTurnstile() {
  if (typeof window !== 'undefined' && window.turnstile) {
    try {
      window.turnstile.reset();
    } catch {
      // ignore
    }
  }
}

export default TurnstileWidget;
