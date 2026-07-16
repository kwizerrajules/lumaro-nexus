import type { Metadata } from 'next';
import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Lumaro Nexus collects, uses, and protects your personal information when you use our house plans website and services.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="16 July 2026">
      <p>
        Lumaro Nexus (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates{' '}
        <a href="https://www.lumaronexus.com" className="text-yellow-800 underline">
          www.lumaronexus.com
        </a>
        . This Privacy Policy explains how we collect, use, store, and protect your
        information when you browse our catalog, create an account, submit enquiries,
        or request custom house plans.
      </p>

      <LegalSection title="1. Information we collect">
        <p>We may collect the following categories of information:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Account details:</strong> name, email address, country, and
            authentication data when you register or sign in (including via Google).
          </li>
          <li>
            <strong>Contact and enquiry data:</strong> messages, phone numbers, and
            project preferences you submit through contact forms or house-plan enquiries.
          </li>
          <li>
            <strong>Custom plan requests:</strong> design specifications such as rooms,
            floors, area, category, style, and descriptions you provide.
          </li>
          <li>
            <strong>Technical data:</strong> IP address, browser type, device information,
            and usage logs necessary to operate and secure the website.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. How we use your information">
        <p>We use personal information to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Provide and improve our house plans catalog and custom design services</li>
          <li>Respond to enquiries, support requests, and custom plan submissions</li>
          <li>Manage your account and authenticate access</li>
          <li>Send service-related communications (order updates, replies to contacts)</li>
          <li>Protect our platform against fraud, abuse, and security threats</li>
          <li>Comply with applicable legal obligations</li>
        </ul>
        <p>
          We do not sell your personal information to third parties for marketing.
        </p>
      </LegalSection>

      <LegalSection title="3. Legal bases">
        <p>
          Depending on your location, we process data based on: performance of a contract
          (providing services you request), your consent (where required), our legitimate
          interests (securing and improving the site), and legal compliance.
        </p>
      </LegalSection>

      <LegalSection title="4. Sharing of information">
        <p>We may share data with:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Service providers</strong> who help us host the site, store data,
            send email, process authentication, or host images (e.g. cloud hosting,
            email, and image CDN providers), under appropriate agreements.
          </li>
          <li>
            <strong>Authorities</strong> when required by law or to protect our rights,
            users, or the public.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Cookies and similar technologies">
        <p>
          We use essential cookies and local storage (for example, session tokens) to keep
          you signed in and to operate core features. You can control cookies through your
          browser settings; disabling them may affect login and account features.
        </p>
      </LegalSection>

      <LegalSection title="6. Data retention">
        <p>
          We retain account, enquiry, and custom-plan data for as long as needed to provide
          services, resolve disputes, and meet legal or accounting requirements. You may
          request deletion of your account data subject to lawful retention needs.
        </p>
      </LegalSection>

      <LegalSection title="7. Security">
        <p>
          We implement reasonable technical and organizational measures to protect personal
          data. No method of transmission or storage is completely secure; please use a
          strong password and keep your credentials confidential.
        </p>
      </LegalSection>

      <LegalSection title="8. Your rights">
        <p>
          Depending on applicable law, you may have rights to access, correct, delete, or
          restrict processing of your personal data, and to object to certain processing.
          To exercise these rights, contact us at{' '}
          <a href="mailto:help@lumaronexus.com" className="text-yellow-800 underline">
            help@lumaronexus.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. International transfers">
        <p>
          Our services may be hosted or processed in countries other than where you live.
          Where we transfer data internationally, we take steps designed to ensure
          appropriate protection consistent with this policy.
        </p>
      </LegalSection>

      <LegalSection title="10. Children">
        <p>
          Our services are directed to adults and businesses seeking architectural house
          plans. We do not knowingly collect personal information from children under 16.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. The &quot;Last updated&quot;
          date at the top will change when we do. Continued use of the site after changes
          means you accept the revised policy.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
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
