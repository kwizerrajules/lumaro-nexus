/**
 * Cloudflare Turnstile server-side verification.
 * Docs: https://developers.cloudflare.com/turnstile/
 */

export type TurnstileVerifyResult =
  | { ok: true }
  | { ok: false; message: string };

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

export function isTurnstileEnabledOnClient(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
}

function fail(message: string): TurnstileVerifyResult {
  return { ok: false, message };
}

/**
 * Verify a Turnstile token from the browser.
 * If TURNSTILE_SECRET_KEY is not set, verification is skipped (local/dev).
 */
export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteip?: string | null
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[turnstile] TURNSTILE_SECRET_KEY missing — skipping verification'
      );
    }
    return { ok: true };
  }

  if (!token || typeof token !== 'string' || token.length < 10) {
    return fail('Please complete the human verification check.');
  }

  try {
    const body = new URLSearchParams();
    body.set('secret', secret);
    body.set('response', token);
    if (remoteip) body.set('remoteip', remoteip);

    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      }
    );

    const data = (await res.json()) as {
      success?: boolean;
      'error-codes'?: string[];
    };

    if (!data.success) {
      console.warn('[turnstile] verification failed:', data['error-codes']);
      return fail('Human verification failed. Please try again.');
    }

    return { ok: true };
  } catch (err) {
    console.error('[turnstile] verify error:', err);
    return fail('Could not verify human check. Please try again.');
  }
}
