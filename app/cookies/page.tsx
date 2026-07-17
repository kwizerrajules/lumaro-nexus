import type { Metadata } from 'next';
import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How Lumaro Nexus uses cookies, local storage, and similar technologies on www.lumaronexus.com.',
};

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="17 July 2026">
      <p>
        This Cookie Policy explains how Lumaro Nexus (&quot;we&quot;, &quot;us&quot;, or
        &quot;our&quot;) uses cookies, local storage, and similar technologies on{' '}
        <a href="https://www.lumaronexus.com" className="text-yellow-800 underline">
          www.lumaronexus.com
        </a>
        . It should be read together with our{' '}
        <a href="/privacy" className="text-yellow-800 underline">
          Privacy Policy
        </a>
        .
      </p>

      <LegalSection title="1. What are cookies?">
        <p>
          Cookies are small text files stored on your device when you visit a website.
          Similar tools include local storage and session storage in your browser. We use
          these technologies to keep the site working, remember preferences, and understand
          how visitors use our catalog.
        </p>
      </LegalSection>

      <LegalSection title="2. How we use cookies">
        <p>We use cookies and similar technologies for:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Essential operation:</strong> signing in, keeping your session secure,
            and protecting forms against bots (for example Cloudflare Turnstile).
          </li>
          <li>
            <strong>Preferences:</strong> remembering basic choices so features work
            smoothly while you browse plans.
          </li>
          <li>
            <strong>Analytics:</strong> understanding traffic and page use with Google
            Analytics so we can improve the site (when analytics is enabled).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Types of cookies we use">
        <ul className="list-disc pl-5 space-y-3">
          <li>
            <strong>Strictly necessary</strong> — required for login, security, and core
            features. The site may not work correctly without these.
          </li>
          <li>
            <strong>Functional / local storage</strong> — for example access tokens and
            saved user profile data so you stay signed in across pages.
          </li>
          <li>
            <strong>Analytics</strong> — Google Analytics (GA4) cookies and related tags,
            when analytics is enabled on the site, to measure visits and page views.
          </li>
          <li>
            <strong>Security / challenge</strong> — Cloudflare Turnstile may set cookies
            or use similar checks when you submit contact, signup, login, or custom-plan
            forms.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Third-party cookies">
        <p>
          Some cookies are set by services we use, not directly by us. These may include:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Google</strong> — Sign-In with Google and Google Analytics, subject to
            Google&apos;s own policies.
          </li>
          <li>
            <strong>Cloudflare</strong> — Turnstile human verification on public forms.
          </li>
          <li>
            <strong>Hosting / CDN providers</strong> — as needed to deliver the website
            securely and reliably.
          </li>
        </ul>
        <p>
          We recommend reviewing those providers&apos; privacy and cookie documentation for
          details on how they process data.
        </p>
      </LegalSection>

      <LegalSection title="5. How long cookies last">
        <p>
          Session cookies are deleted when you close your browser. Persistent cookies and
          local storage remain until they expire or you clear them. Authentication tokens
          we store locally are intended for limited session lengths (for example access
          tokens that expire after a few hours).
        </p>
      </LegalSection>

      <LegalSection title="6. Managing cookies">
        <p>You can control cookies through your browser settings. Typical options include:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Blocking all or third-party cookies</li>
          <li>Deleting existing cookies and site data</li>
          <li>Using private / incognito browsing</li>
        </ul>
        <p>
          If you disable essential cookies or clear local storage, you may need to sign in
          again and some features (enquiries, custom plans, account menu) may not work.
        </p>
        <p>
          For Google Analytics, you can also use browser controls or Google&apos;s own
          opt-out tools where available in your region.
        </p>
      </LegalSection>

      <LegalSection title="7. Updates">
        <p>
          We may update this Cookie Policy when our tools or practices change. The
          &quot;Last updated&quot; date at the top will change when we do.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact">
        <p>
          Questions about cookies or privacy? Contact us:
        </p>
        <p>
          Lumaro Nexus<br />
          Kigali, Rwanda<br />
          Email:{' '}
          <a href="mailto:info@lumaronexus.com" className="text-yellow-800 underline">
            info@lumaronexus.com
          </a>
          <br />
          Support:{' '}
          <a href="mailto:help@lumaronexus.com" className="text-yellow-800 underline">
            help@lumaronexus.com
          </a>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
