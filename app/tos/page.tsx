import type { Metadata } from 'next';
import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of Service for using the Lumaro Nexus website, accounts, and online platform.',
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="16 July 2026">
      <p>
        These Terms of Service (&quot;ToS&quot;) govern your access to and use of the
        Lumaro Nexus website at{' '}
        <a href="https://www.lumaronexus.com" className="text-yellow-800 underline">
          www.lumaronexus.com
        </a>{' '}
        and related online features (the &quot;Service&quot;). By accessing or using the
        Service, you agree to this ToS.
      </p>
      <p>
        Purchase-specific rules for house plans and custom designs are set out in our{' '}
        <a href="/terms" className="text-yellow-800 underline">
          Terms &amp; Conditions
        </a>
        . How we handle personal data is described in our{' '}
        <a href="/privacy" className="text-yellow-800 underline">
          Privacy Policy
        </a>
        .
      </p>

      <LegalSection title="1. Eligibility">
        <p>
          You must be at least 18 years old (or the age of majority in your jurisdiction)
          and able to form a binding contract to create an account or submit commercial
          enquiries. By using the Service, you represent that you meet these requirements.
        </p>
      </LegalSection>

      <LegalSection title="2. Accounts">
        <ul className="list-disc pl-5 space-y-2">
          <li>You must provide accurate registration information and keep it updated.</li>
          <li>
            You are responsible for maintaining the confidentiality of your login
            credentials and for all activity under your account.
          </li>
          <li>
            Notify us promptly at{' '}
            <a href="mailto:help@lumaronexus.com" className="text-yellow-800 underline">
              help@lumaronexus.com
            </a>{' '}
            if you suspect unauthorized access.
          </li>
          <li>
            We may suspend or terminate accounts that violate this ToS or pose a security
            risk.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Use the Service for unlawful, fraudulent, or harmful purposes</li>
          <li>
            Attempt to gain unauthorized access to systems, accounts, or non-public APIs
          </li>
          <li>
            Scrape, harvest, or bulk-download content in a way that impairs the Service
            or violates our intellectual property rights
          </li>
          <li>
            Upload malware, spam, or abusive content, or interfere with other users
          </li>
          <li>
            Misrepresent your identity or affiliation when contacting us or submitting
            forms
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Website content and intellectual property">
        <p>
          Site content—including text, logos, images, plan previews, and software—is owned
          by Lumaro Nexus or its licensors and is protected by intellectual property laws.
          You may view and use the site for personal, non-commercial browsing and for
          legitimate enquiries. Reproduction or commercial reuse of site content without
          written permission is prohibited, except for fair use or other rights that
          cannot be waived under applicable law.
        </p>
      </LegalSection>

      <LegalSection title="5. User submissions">
        <p>
          When you submit enquiries, messages, or custom plan briefs, you grant us a
          limited license to use that content to respond to you and deliver the requested
          services. You represent that your submissions do not infringe third-party
          rights and are accurate to the best of your knowledge.
        </p>
      </LegalSection>

      <LegalSection title="6. Third-party services">
        <p>
          The Service may integrate third-party tools (for example authentication or image
          hosting). Their use may be subject to those providers&apos; terms. We are not
          responsible for third-party services we do not control.
        </p>
      </LegalSection>

      <LegalSection title="7. Disclaimers">
        <p>
          The Service is provided on an &quot;as is&quot; and &quot;as available&quot;
          basis. We do not warrant that the site will be uninterrupted, error-free, or
          free of harmful components. Catalog information (prices, specs, availability)
          may change without notice until confirmed in a purchase.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation of liability">
        <p>
          To the fullest extent permitted by law, Lumaro Nexus and its officers,
          employees, and agents shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages arising from your use of—or inability to
          use—the Service. Our aggregate liability arising out of the Service itself
          (excluding confirmed paid plan purchases, which are governed by the Terms &amp;
          Conditions) shall not exceed USD 100 or the amount you paid us for Service
          access in the prior 12 months, whichever is greater.
        </p>
      </LegalSection>

      <LegalSection title="9. Indemnity">
        <p>
          You agree to indemnify and hold harmless Lumaro Nexus from claims arising out of
          your misuse of the Service, your violation of this ToS, or your infringement of
          any third-party rights, to the extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection title="10. Suspension and termination">
        <p>
          We may suspend or terminate access to the Service if you breach this ToS or if
          we discontinue the platform. Provisions that by nature should survive
          (including intellectual property, disclaimers, and liability limits) will
          survive termination.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes">
        <p>
          We may update this ToS periodically. The &quot;Last updated&quot; date will
          reflect material changes. Continued use after changes constitutes acceptance of
          the updated ToS.
        </p>
      </LegalSection>

      <LegalSection title="12. Governing law">
        <p>
          This ToS is governed by the laws of Rwanda. Disputes shall be resolved in the
          courts of Kigali, Rwanda, subject to any mandatory consumer protections that
          apply where you live.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>
          Lumaro Nexus — Kigali, Rwanda<br />
          <a href="mailto:info@lumaronexus.com" className="text-yellow-800 underline">
            info@lumaronexus.com
          </a>
          {' · '}
          <a href="mailto:help@lumaronexus.com" className="text-yellow-800 underline">
            help@lumaronexus.com
          </a>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
