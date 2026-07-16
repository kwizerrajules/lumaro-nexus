'use client';
import React, { useEffect, useRef, useState } from 'react';

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
  onError?: (message: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  width?: number;
}

const GIS_SRC = 'https://accounts.google.com/gsi/client';

function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Not in browser'));
      return;
    }
    if ((window as any).google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')));
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.head.appendChild(script);
  });
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onCredential,
  onError,
  text = 'continue_with',
  width = 320,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [unavailableMessage, setUnavailableMessage] = useState('');

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  }, [onCredential, onError]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      // Soft-fail: show helper text under the button, don't block email/password signup.
      setUnavailableMessage('not-configured');
      return;
    }

    setUnavailableMessage('');
    let cancelled = false;

    loadGisScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return;
        const google = (window as any).google;

        // Clear previous render when switching sign-in / sign-up text
        buttonRef.current.innerHTML = '';

        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential?: string }) => {
            if (response?.credential) {
              onCredentialRef.current(response.credential);
            } else {
              onErrorRef.current?.('No credential returned from Google.');
            }
          },
        });

        google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text,
          width,
        });
      })
      .catch((err: Error) => {
        const msg = err.message || 'Failed to initialize Google sign-in.';
        setUnavailableMessage(msg);
        onErrorRef.current?.(msg);
      });

    return () => {
      cancelled = true;
    };
  }, [text, width]);

  if (unavailableMessage) {
    return (
      <p className="text-center text-sm text-gray-500 max-w-sm">
        Google sign-in is not available right now. Please use email and password above.
      </p>
    );
  }

  return <div ref={buttonRef} className="flex justify-center min-h-[44px]" />;
};

export default GoogleSignInButton;
