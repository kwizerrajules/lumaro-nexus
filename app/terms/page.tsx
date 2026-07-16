import type { Metadata } from 'next';
import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Terms and conditions for purchasing and using Lumaro Nexus house plans, custom designs, and related documentation.',
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPageLayout title="Terms & Conditions" lastUpdated="16 July 2026">
      <p>
        These Terms &amp; Conditions (&quot;Terms&quot;) govern your purchase and use of
        house plans, construction documents, and custom design services from Lumaro Nexus
        (&quot;we&quot;, &quot;us&quot;). By placing an enquiry, ordering a plan, or
        submitting a custom plan request, you agree to these Terms.
      </p>
      <p>
        For rules about using the website itself (accounts, acceptable use, liability for
        the platform), also see our{' '}
        <a href="/tos" className="text-yellow-800 underline">
          Terms of Service
        </a>
        .
      </p>

      <LegalSection title="1. Products and services">
        <p>
          We offer digital architectural house plans, related documentation, and custom
          design services tailored primarily for African markets. Plan packages, contents,
          pricing, and delivery timelines are described on the relevant product or custom
          plan pages and may be confirmed in writing after your enquiry.
        </p>
      </LegalSection>

      <LegalSection title="2. Orders and enquiries">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Submitting an enquiry or custom plan request does not create a binding
            purchase until we confirm acceptance and any required payment terms.
          </li>
          <li>
            You are responsible for providing accurate project details (plot constraints,
            rooms, floors, area, and local requirements).
          </li>
          <li>
            We may decline or cancel requests that we cannot fulfill for technical, legal,
            or capacity reasons and will notify you if so.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Pricing and payment">
        <p>
          Prices are shown in the currency indicated on the site unless otherwise agreed.
          Payment methods and schedules will be communicated during checkout or via
          invoice. Plans and files are delivered only after cleared payment, unless we
          expressly agree otherwise in writing.
        </p>
      </LegalSection>

      <LegalSection title="4. Delivery">
        <p>
          Standard catalog plans are typically delivered digitally after purchase
          confirmation. Custom plans are generally delivered within the timeframe stated
          on the custom plan page (for example, 5–7 business days) or as confirmed for
          your project. Delivery times are estimates and may vary for complex work.
        </p>
      </LegalSection>

      <LegalSection title="5. License to use plans">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Unless otherwise agreed in writing, you receive a <strong>non-exclusive,
            non-transferable license</strong> to use the purchased plans for a single
            building project at a single site.
          </li>
          <li>
            You may not resell, redistribute, republish, or sublicense our plans or
            documentation to third parties as a product.
          </li>
          <li>
            Modifications for your site may be made by a qualified professional at your
            expense; significant redesign may require a new custom engagement with us.
          </li>
          <li>
            All intellectual property rights in our designs remain with Lumaro Nexus or
            our licensors.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Local codes and professional responsibility">
        <p>
          Our plans are design documents and may need adaptation for local building codes,
          soil conditions, climate, materials, and regulations. You are responsible for
          engaging licensed architects, engineers, and builders as required in your
          jurisdiction before construction. We are not liable for construction outcomes,
          site supervision, or approvals by local authorities.
        </p>
      </LegalSection>

      <LegalSection title="7. Refunds and guarantee">
        <p>
          Where we advertise a satisfaction or money-back guarantee, the specific
          conditions stated at purchase apply. Digital products that have been downloaded
          or delivered may have limited refund eligibility except where required by law or
          where we confirm a defect in the files we supplied. Contact{' '}
          <a href="mailto:help@lumaronexus.com" className="text-yellow-800 underline">
            help@lumaronexus.com
          </a>{' '}
          within a reasonable time if you believe files are incomplete or defective.
        </p>
      </LegalSection>

      <LegalSection title="8. Custom plans">
        <p>
          Custom work is based on the brief you submit. Revisions beyond the agreed scope
          may incur additional fees. Ownership and license terms for custom deliverables
          will follow these Terms unless a separate written agreement states otherwise.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of liability">
        <p>
          To the fullest extent permitted by law, Lumaro Nexus is not liable for indirect,
          incidental, special, or consequential damages arising from use of our plans or
          services. Our total liability for any claim related to a purchase is limited to
          the amount you paid us for that specific product or service.
        </p>
      </LegalSection>

      <LegalSection title="10. Governing law">
        <p>
          These Terms are governed by the laws of Rwanda, without regard to conflict-of-law
          principles. Disputes shall first be addressed in good faith; failing resolution,
          courts in Kigali, Rwanda shall have jurisdiction, subject to mandatory consumer
          protections that may apply in your country.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Questions about these Terms:{' '}
          <a href="mailto:info@lumaronexus.com" className="text-yellow-800 underline">
            info@lumaronexus.com
          </a>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
