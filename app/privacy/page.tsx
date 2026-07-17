import type { Metadata } from 'next';
import LegalPageLayout, { LegalSection } from '@/components/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Notice for LUMARO NEXUS — how we collect, use, share, and protect your personal information.',
};

const linkClass = 'text-yellow-800 underline break-words';

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="PRIVACY POLICY" lastUpdated="July 17, 2026">
      <p>
        This Privacy Notice for <strong>LUMARO NEXUS</strong> (&quot;<strong>we</strong>,&quot;
        &quot;<strong>us</strong>,&quot; or &quot;<strong>our</strong>&quot;), describes how
        and why we might access, collect, store, use, and/or share (&quot;<strong>process</strong>&quot;)
        your personal information when you use our services (&quot;<strong>Services</strong>&quot;),
        including when you:
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          Visit our website at{' '}
          <a
            href="https://www.lumaronexus.com"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            https://www.lumaronexus.com
          </a>{' '}
          or any website of ours that links to this Privacy Notice
        </li>
        <li>
          Use <strong>LUMARO NEXUS</strong>. Lumaro Nexus designs house plans and
          construction documents from Kigali, Rwanda. Since 2014 we have helped families
          and builders choose ready plans or brief a custom design that fits their plot,
          budget, and how people actually build here. Our packages include clear drawings
          prepared with Rwanda housing standards and permitting in mind — so you can talk
          to your builder and take files to a District One Stop Centre or BPMIS with
          confidence. Browse our catalog online, request a custom plan, or message us on
          WhatsApp. Quality designs. Clear construction documents. Fair pricing.
        </li>
        <li>Engage with us in other related ways, including any marketing or events</li>
      </ul>
      <p>
        <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you
        understand your privacy rights and choices. We are responsible for making
        decisions about how your personal information is processed. If you do not agree
        with our policies and practices, please do not use our Services. If you still have
        any questions or concerns, please contact us at{' '}
        <a href="mailto:info@lumaronexus.com" className={linkClass}>
          info@lumaronexus.com
        </a>
        .
      </p>

      <LegalSection title="SUMMARY OF KEY POINTS">
        <p>
          <em>
            This summary provides key points from our Privacy Notice, but you can find out
            more details about any of these topics by clicking the link following each key
            point or by using our{' '}
            <a href="#toc" className={linkClass}>
              table of contents
            </a>{' '}
            below to find the section you are looking for.
          </em>
        </p>
        <p>
          <strong>What personal information do we process?</strong> When you visit, use, or
          navigate our Services, we may process personal information depending on how you
          interact with us and the Services, the choices you make, and the products and
          features you use. Learn more about{' '}
          <a href="#personalinfo" className={linkClass}>
            personal information you disclose to us
          </a>
          .
        </p>
        <p>
          <strong>Do we process any sensitive personal information?</strong> Some of the
          information may be considered &quot;special&quot; or &quot;sensitive&quot; in
          certain jurisdictions, for example your racial or ethnic origins, sexual
          orientation, and religious beliefs. We do not process sensitive personal
          information.
        </p>
        <p>
          <strong>Do we collect any information from third parties?</strong> We do not
          collect any information from third parties.
        </p>
        <p>
          <strong>How do we process your information?</strong> We process your information
          to provide, improve, and administer our Services, communicate with you, for
          security and fraud prevention, and to comply with law. We may also process your
          information for other purposes with your consent. We process your information
          only when we have a valid legal reason to do so. Learn more about{' '}
          <a href="#infouse" className={linkClass}>
            how we process your information
          </a>
          .
        </p>
        <p>
          <strong>In what situations and with which parties do we share personal information?</strong>{' '}
          We may share information in specific situations and with specific third parties.
          Learn more about{' '}
          <a href="#whoshare" className={linkClass}>
            when and with whom we share your personal information
          </a>
          .
        </p>
        <p>
          <strong>How do we keep your information safe?</strong> We have adequate
          organizational and technical processes and procedures in place to protect your
          personal information. However, no electronic transmission over the internet or
          information storage technology can be guaranteed to be 100% secure, so we cannot
          promise or guarantee that hackers, cybercriminals, or other unauthorized third
          parties will not be able to defeat our security and improperly collect, access,
          steal, or modify your information. Learn more about{' '}
          <a href="#infosafe" className={linkClass}>
            how we keep your information safe
          </a>
          .
        </p>
        <p>
          <strong>What are your rights?</strong> Depending on where you are located
          geographically, the applicable privacy law may mean you have certain rights
          regarding your personal information. Learn more about{' '}
          <a href="#privacyrights" className={linkClass}>
            your privacy rights
          </a>
          .
        </p>
        <p>
          <strong>How do you exercise your rights?</strong> The easiest way to exercise
          your rights is by visiting{' '}
          <a
            href="https://www.lumaronexus.com/#contact"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            https://www.lumaronexus.com/#contact
          </a>
          , or by contacting us. We will consider and act upon any request in accordance
          with applicable data protection laws.
        </p>
        <p>
          Want to learn more about what we do with any information we collect?{' '}
          <a href="#toc" className={linkClass}>
            Review the Privacy Notice in full
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="TABLE OF CONTENTS">
        <div id="toc" className="space-y-1">
          <p>
            <a href="#infocollect" className={linkClass}>
              1. WHAT INFORMATION DO WE COLLECT?
            </a>
          </p>
          <p>
            <a href="#infouse" className={linkClass}>
              2. HOW DO WE PROCESS YOUR INFORMATION?
            </a>
          </p>
          <p>
            <a href="#whoshare" className={linkClass}>
              3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
            </a>
          </p>
          <p>
            <a href="#cookies" className={linkClass}>
              4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?
            </a>
          </p>
          <p>
            <a href="#sociallogins" className={linkClass}>
              5. HOW DO WE HANDLE YOUR SOCIAL LOGINS?
            </a>
          </p>
          <p>
            <a href="#inforetain" className={linkClass}>
              6. HOW LONG DO WE KEEP YOUR INFORMATION?
            </a>
          </p>
          <p>
            <a href="#infosafe" className={linkClass}>
              7. HOW DO WE KEEP YOUR INFORMATION SAFE?
            </a>
          </p>
          <p>
            <a href="#privacyrights" className={linkClass}>
              8. WHAT ARE YOUR PRIVACY RIGHTS?
            </a>
          </p>
          <p>
            <a href="#DNT" className={linkClass}>
              9. CONTROLS FOR DO-NOT-TRACK FEATURES
            </a>
          </p>
          <p>
            <a href="#otherlaws" className={linkClass}>
              10. DO OTHER REGIONS HAVE SPECIFIC PRIVACY RIGHTS?
            </a>
          </p>
          <p>
            <a href="#policyupdates" className={linkClass}>
              11. DO WE MAKE UPDATES TO THIS NOTICE?
            </a>
          </p>
          <p>
            <a href="#contact" className={linkClass}>
              12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
            </a>
          </p>
          <p>
            <a href="#request" className={linkClass}>
              13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
            </a>
          </p>
        </div>
      </LegalSection>

      <section id="infocollect">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          1. WHAT INFORMATION DO WE COLLECT?
        </h2>
        <div className="space-y-3 text-[15px]">
          <h3 id="personalinfo" className="text-lg font-semibold text-gray-900">
            Personal information you disclose to us
          </h3>
          <p>
            <strong>
              <em>In Short:</em>
            </strong>{' '}
            <em>We collect personal information that you provide to us.</em>
          </p>
          <p>
            We collect personal information that you voluntarily provide to us when you
            register on the Services, express an interest in obtaining information about us
            or our products and Services, when you participate in activities on the
            Services, or otherwise when you contact us.
          </p>
          <p>
            <strong>Personal Information Provided by You.</strong> The personal information
            that we collect depends on the context of your interactions with us and the
            Services, the choices you make, and the products and features you use. The
            personal information we collect may include the following:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>names</li>
            <li>phone numbers</li>
            <li>email addresses</li>
            <li>passwords</li>
            <li>billing addresses</li>
          </ul>
          <p id="sensitiveinfo">
            <strong>Sensitive Information.</strong> We do not process sensitive information.
          </p>
          <p>
            <strong>Social Media Login Data.</strong> We may provide you with the option to
            register with us using your existing social media account details, like your
            Facebook, X, or other social media account. If you choose to register in this
            way, we will collect certain profile information about you from the social
            media provider, as described in the section called{' '}
            <a href="#sociallogins" className={linkClass}>
              HOW DO WE HANDLE YOUR SOCIAL LOGINS?
            </a>{' '}
            below.
          </p>
          <p>
            All personal information that you provide to us must be true, complete, and
            accurate, and you must notify us of any changes to such personal information.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 pt-2">
            Information automatically collected
          </h3>
          <p>
            <strong>
              <em>In Short:</em>
            </strong>{' '}
            <em>
              Some information — such as your Internet Protocol (IP) address and/or browser
              and device characteristics — is collected automatically when you visit our
              Services.
            </em>
          </p>
          <p>
            We automatically collect certain information when you visit, use, or navigate
            the Services. This information does not reveal your specific identity (like
            your name or contact information) but may include device and usage information,
            such as your IP address, browser and device characteristics, operating system,
            language preferences, referring URLs, device name, country, location,
            information about how and when you use our Services, and other technical
            information. This information is primarily needed to maintain the security and
            operation of our Services, and for our internal analytics and reporting
            purposes.
          </p>
          <p>
            Like many businesses, we also collect information through cookies and similar
            technologies. You can find out more about this in our Cookie Notice:{' '}
            <a
              href="https://www.lumaronexus.com/cookies"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              https://www.lumaronexus.com/cookies
            </a>
            .
          </p>
          <p>The information we collect includes:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <em>Log and Usage Data.</em> Log and usage data is service-related,
              diagnostic, usage, and performance information our servers automatically
              collect when you access or use our Services and which we record in log files.
              Depending on how you interact with us, this log data may include your IP
              address, device information, browser type, and settings and information about
              your activity in the Services (such as the date/time stamps associated with
              your usage, pages and files viewed, searches, and other actions you take such
              as which features you use), device event information (such as system
              activity, error reports (sometimes called &quot;crash dumps&quot;), and
              hardware settings).
            </li>
            <li>
              <em>Device Data.</em> We collect device data such as information about your
              computer, phone, tablet, or other device you use to access the Services.
              Depending on the device used, this device data may include information such
              as your IP address (or proxy server), device and application identification
              numbers, location, browser type, hardware model, Internet service provider
              and/or mobile carrier, operating system, and system configuration
              information.
            </li>
            <li>
              <em>Location Data.</em> We collect location data such as information about
              your device&apos;s location, which can be either precise or imprecise. How
              much information we collect depends on the type and settings of the device
              you use to access the Services. For example, we may use GPS and other
              technologies to collect geolocation data that tells us your current location
              (based on your IP address). You can opt out of allowing us to collect this
              information either by refusing access to the information or by disabling your
              Location setting on your device. However, if you choose to opt out, you may
              not be able to use certain aspects of the Services.
            </li>
          </ul>
          <h3 className="text-lg font-semibold text-gray-900 pt-2">Google API</h3>
          <p>
            Our use of information received from Google APIs will adhere to{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Google API Services User Data Policy
            </a>
            , including the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy#limited-use"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Limited Use requirements
            </a>
            .
          </p>
        </div>
      </section>

      <section id="infouse">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          2. HOW DO WE PROCESS YOUR INFORMATION?
        </h2>
        <div className="space-y-3 text-[15px]">
          <p>
            <strong>
              <em>In Short:</em>
            </strong>{' '}
            <em>
              We process your information to provide, improve, and administer our Services,
              communicate with you, for security and fraud prevention, and to comply with
              law. We may also process your information for other purposes with your
              consent.
            </em>
          </p>
          <p>
            <strong>
              We process your personal information for a variety of reasons, depending on
              how you interact with our Services, including:
            </strong>
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>
                To facilitate account creation and authentication and otherwise manage user
                accounts.
              </strong>{' '}
              We may process your information so you can create and log in to your account,
              as well as keep your account in working order.
            </li>
            <li>
              <strong>To fulfill and manage your orders.</strong> We may process your
              information to fulfill and manage your orders, payments, returns, and
              exchanges made through the Services.
            </li>
            <li>
              <strong>To request feedback.</strong> We may process your information when
              necessary to request feedback and to contact you about your use of our
              Services.
            </li>
            <li>
              <strong>To protect our Services.</strong> We may process your information as
              part of our efforts to keep our Services safe and secure, including fraud
              monitoring and prevention.
            </li>
            <li>
              <strong>
                To determine the effectiveness of our marketing and promotional campaigns.
              </strong>{' '}
              We may process your information to better understand how to provide marketing
              and promotional campaigns that are most relevant to you.
            </li>
          </ul>
        </div>
      </section>

      <section id="whoshare">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
        </h2>
        <div className="space-y-3 text-[15px]">
          <p>
            <strong>
              <em>In Short:</em>
            </strong>{' '}
            <em>
              We may share information in specific situations described in this section
              and/or with the following third parties.
            </em>
          </p>
          <p>We may need to share your personal information in the following situations:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Business Transfers.</strong> We may share or transfer your
              information in connection with, or during negotiations of, any merger, sale
              of company assets, financing, or acquisition of all or a portion of our
              business to another company.
            </li>
            <li>
              <strong>When we use Google Maps Platform APIs.</strong> We may share your
              information with certain Google Maps Platform APIs (e.g., Google Maps API,
              Places API). Google Maps uses GPS, Wi-Fi, and cell towers to estimate your
              location. GPS is accurate to about 20 meters, while Wi-Fi and cell towers
              help improve accuracy when GPS signals are weak, like indoors. This data
              helps Google Maps provide directions, but it is not always perfectly precise.
              We obtain and store on your device (&quot;cache&quot;) your location for two
              (2) months. You may revoke your consent anytime by contacting us at the
              contact details provided at the end of this document.
            </li>
          </ul>
        </div>
      </section>

      <section id="cookies">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?
        </h2>
        <div className="space-y-3 text-[15px]">
          <p>
            <strong>
              <em>In Short:</em>
            </strong>{' '}
            <em>
              We may use cookies and other tracking technologies to collect and store your
              information.
            </em>
          </p>
          <p>
            We may use cookies and similar tracking technologies (like web beacons and
            pixels) to gather information when you interact with our Services. Some online
            tracking technologies help us maintain the security of our Services and your
            account, prevent crashes, fix bugs, save your preferences, and assist with
            basic site functions.
          </p>
          <p>
            We also permit third parties and service providers to use online tracking
            technologies on our Services for analytics and advertising, including to help
            manage and display advertisements or to tailor advertisements to your
            interests. The third parties and service providers use their technology to
            provide advertising about products and services tailored to your interests which
            may appear either on our Services or on other websites.
          </p>
          <p>
            Specific information about how we use such technologies and how you can refuse
            certain cookies is set out in our Cookie Notice:{' '}
            <a
              href="https://www.lumaronexus.com/cookies"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              https://www.lumaronexus.com/cookies
            </a>
            .
          </p>
          <h3 className="text-lg font-semibold text-gray-900 pt-2">Google Analytics</h3>
          <p>
            We may share your information with Google Analytics to track and analyze the
            use of the Services. The Google Analytics Advertising Features that we may use
            include: Google Analytics Demographics and Interests Reporting, Remarketing
            with Google Analytics, and Google Display Network Impressions Reporting. To opt
            out of being tracked by Google Analytics across the Services, visit{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              https://tools.google.com/dlpage/gaoptout
            </a>
            . You can opt out of Google Analytics Advertising Features through{' '}
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Ads Settings
            </a>{' '}
            and Ad Settings for mobile apps. Other opt out means include{' '}
            <a
              href="http://optout.networkadvertising.org/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              http://optout.networkadvertising.org/
            </a>{' '}
            and{' '}
            <a
              href="http://www.networkadvertising.org/mobile-choice"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              http://www.networkadvertising.org/mobile-choice
            </a>
            . For more information on the privacy practices of Google, please visit the{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Google Privacy &amp; Terms page
            </a>
            .
          </p>
        </div>
      </section>

      <section id="sociallogins">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          5. HOW DO WE HANDLE YOUR SOCIAL LOGINS?
        </h2>
        <div className="space-y-3 text-[15px]">
          <p>
            <strong>
              <em>In Short:</em>
            </strong>{' '}
            <em>
              If you choose to register or log in to our Services using a social media
              account, we may have access to certain information about you.
            </em>
          </p>
          <p>
            Our Services offer you the ability to register and log in using your
            third-party social media account details (like your Facebook or X logins).
            Where you choose to do this, we will receive certain profile information about
            you from your social media provider. The profile information we receive may
            vary depending on the social media provider concerned, but will often include
            your name, email address, friends list, and profile picture, as well as other
            information you choose to make public on such a social media platform.
          </p>
          <p>
            We will use the information we receive only for the purposes that are described
            in this Privacy Notice or that are otherwise made clear to you on the relevant
            Services. Please note that we do not control, and are not responsible for,
            other uses of your personal information by your third-party social media
            provider. We recommend that you review their privacy notice to understand how
            they collect, use, and share your personal information, and how you can set
            your privacy preferences on their sites and apps.
          </p>
        </div>
      </section>

      <section id="inforetain">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          6. HOW LONG DO WE KEEP YOUR INFORMATION?
        </h2>
        <div className="space-y-3 text-[15px]">
          <p>
            <strong>
              <em>In Short:</em>
            </strong>{' '}
            <em>
              We keep your information for as long as necessary to fulfill the purposes
              outlined in this Privacy Notice unless otherwise required by law.
            </em>
          </p>
          <p>
            We will only keep your personal information for as long as it is necessary for
            the purposes set out in this Privacy Notice, unless a longer retention period
            is required or permitted by law (such as tax, accounting, or other legal
            requirements). No purpose in this notice will require us keeping your personal
            information for longer than the period of time in which users have an account
            with us.
          </p>
          <p>
            When we have no ongoing legitimate business need to process your personal
            information, we will either delete or anonymize such information, or, if this
            is not possible (for example, because your personal information has been stored
            in backup archives), then we will securely store your personal information and
            isolate it from any further processing until deletion is possible.
          </p>
        </div>
      </section>

      <section id="infosafe">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          7. HOW DO WE KEEP YOUR INFORMATION SAFE?
        </h2>
        <div className="space-y-3 text-[15px]">
          <p>
            <strong>
              <em>In Short:</em>
            </strong>{' '}
            <em>
              We aim to protect your personal information through a system of
              organizational and technical security measures.
            </em>
          </p>
          <p>
            We have implemented appropriate and reasonable technical and organizational
            security measures designed to protect the security of any personal information
            we process. However, despite our safeguards and efforts to secure your
            information, no electronic transmission over the Internet or information
            storage technology can be guaranteed to be 100% secure, so we cannot promise or
            guarantee that hackers, cybercriminals, or other unauthorized third parties
            will not be able to defeat our security and improperly collect, access, steal,
            or modify your information. Although we will do our best to protect your
            personal information, transmission of personal information to and from our
            Services is at your own risk. You should only access the Services within a
            secure environment.
          </p>
        </div>
      </section>

      <section id="privacyrights">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          8. WHAT ARE YOUR PRIVACY RIGHTS?
        </h2>
        <div className="space-y-3 text-[15px]">
          <p>
            <strong>
              <em>In Short:</em>
            </strong>{' '}
            <em>
              You may review, change, or terminate your account at any time, depending on
              your country, province, or state of residence.
            </em>
          </p>
          <p id="withdrawconsent">
            <strong>
              <u>Withdrawing your consent:</u>
            </strong>{' '}
            If we are relying on your consent to process your personal information, which
            may be express and/or implied consent depending on the applicable law, you have
            the right to withdraw your consent at any time. You can withdraw your consent
            at any time by contacting us by using the contact details provided in the
            section{' '}
            <a href="#contact" className={linkClass}>
              HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
            </a>{' '}
            below.
          </p>
          <p>
            However, please note that this will not affect the lawfulness of the processing
            before its withdrawal nor, when applicable law allows, will it affect the
            processing of your personal information conducted in reliance on lawful
            processing grounds other than consent.
          </p>
          <p>
            <strong>
              <u>Opting out of marketing and promotional communications:</u>
            </strong>{' '}
            You can unsubscribe from our marketing and promotional communications at any
            time by clicking on the unsubscribe link in the emails that we send, replying
            &quot;STOP&quot; or &quot;UNSUBSCRIBE&quot; to the SMS messages that we send,
            or by contacting us using the details provided in the section{' '}
            <a href="#contact" className={linkClass}>
              HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
            </a>{' '}
            below. You will then be removed from the marketing lists. However, we may still
            communicate with you — for example, to send you service-related messages that
            are necessary for the administration and use of your account, to respond to
            service requests, or for other non-marketing purposes.
          </p>
          <h3 className="text-lg font-semibold text-gray-900 pt-2">Account Information</h3>
          <p>
            If you would at any time like to review or change the information in your
            account or terminate your account, you can:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Log in to your account settings and update your user account.</li>
            <li>Contact us using the contact information provided.</li>
          </ul>
          <p>
            Upon your request to terminate your account, we will deactivate or delete your
            account and information from our active databases. However, we may retain some
            information in our files to prevent fraud, troubleshoot problems, assist with
            any investigations, enforce our legal terms and/or comply with applicable legal
            requirements.
          </p>
          <p>
            <strong>
              <u>Cookies and similar technologies:</u>
            </strong>{' '}
            Most Web browsers are set to accept cookies by default. If you prefer, you can
            usually choose to set your browser to remove cookies and to reject cookies. If
            you choose to remove cookies or reject cookies, this could affect certain
            features or services of our Services. For further information, please see our
            Cookie Notice:{' '}
            <a
              href="https://www.lumaronexus.com/cookies"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              https://www.lumaronexus.com/cookies
            </a>
            .
          </p>
          <p>
            If you have questions or comments about your privacy rights, you may email us
            at{' '}
            <a href="mailto:info@lumaronexus.com" className={linkClass}>
              info@lumaronexus.com
            </a>
            .
          </p>
        </div>
      </section>

      <section id="DNT">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          9. CONTROLS FOR DO-NOT-TRACK FEATURES
        </h2>
        <div className="space-y-3 text-[15px]">
          <p>
            Most web browsers and some mobile operating systems and mobile applications
            include a Do-Not-Track (&quot;DNT&quot;) feature or setting you can activate to
            signal your privacy preference not to have data about your online browsing
            activities monitored and collected. At this stage, no uniform technology
            standard for recognizing and implementing DNT signals has been finalized. As
            such, we do not currently respond to DNT browser signals or any other mechanism
            that automatically communicates your choice not to be tracked online. If a
            standard for online tracking is adopted that we must follow in the future, we
            will inform you about that practice in a revised version of this Privacy
            Notice.
          </p>
        </div>
      </section>

      <section id="otherlaws">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          10. DO OTHER REGIONS HAVE SPECIFIC PRIVACY RIGHTS?
        </h2>
        <div className="space-y-3 text-[15px]">
          <p>
            <em>
              <strong>In Short:</strong> You may have additional rights based on the
              country you reside in.
            </em>
          </p>
          <h3 className="text-lg font-semibold text-gray-900 pt-2">
            Republic of South Africa
          </h3>
          <p>
            At any time, you have the right to request access to or correction of your
            personal information. You can make such a request by contacting us by using the
            contact details provided in the section{' '}
            <a href="#request" className={linkClass}>
              HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
            </a>
          </p>
          <p>
            If you are unsatisfied with the manner in which we address any complaint with
            regard to our processing of personal information, you can contact the office of
            the regulator, the details of which are:
          </p>
          <p>
            <a
              href="https://inforegulator.org.za/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              The Information Regulator (South Africa)
            </a>
          </p>
          <p>
            General enquiries:{' '}
            <a
              href="mailto:enquiries@inforegulator.org.za"
              className={linkClass}
            >
              enquiries@inforegulator.org.za
            </a>
          </p>
          <p>
            Complaints (complete POPIA/PAIA form 5):{' '}
            <a
              href="mailto:PAIAComplaints@inforegulator.org.za"
              className={linkClass}
            >
              PAIAComplaints@inforegulator.org.za
            </a>{' '}
            &amp;{' '}
            <a
              href="mailto:POPIAComplaints@inforegulator.org.za"
              className={linkClass}
            >
              POPIAComplaints@inforegulator.org.za
            </a>
          </p>
        </div>
      </section>

      <section id="policyupdates">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          11. DO WE MAKE UPDATES TO THIS NOTICE?
        </h2>
        <div className="space-y-3 text-[15px]">
          <p>
            <em>
              <strong>In Short:</strong> Yes, we will update this notice as necessary to
              stay compliant with relevant laws.
            </em>
          </p>
          <p>
            We may update this Privacy Notice from time to time. The updated version will
            be indicated by an updated &quot;Revised&quot; date at the top of this Privacy
            Notice. If we make material changes to this Privacy Notice, we may notify you
            either by prominently posting a notice of such changes or by directly sending
            you a notification. We encourage you to review this Privacy Notice frequently
            to be informed of how we are protecting your information.
          </p>
        </div>
      </section>

      <section id="contact">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
        </h2>
        <div className="space-y-3 text-[15px]">
          <p>
            If you have questions or comments about this notice, you may email us at{' '}
            <a href="mailto:info@lumaronexus.com" className={linkClass}>
              info@lumaronexus.com
            </a>{' '}
            or contact us by post at:
          </p>
          <p>
            LUMARO NEXUS
            <br />
            NYAMIRAMBO
            <br />
            Kigali, Kigali City
            <br />
            Rwanda
          </p>
        </div>
      </section>

      <section id="request">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
        </h2>
        <div className="space-y-3 text-[15px]">
          <p>
            Based on the applicable laws of your country, you may have the right to request
            access to the personal information we collect from you, details about how we
            have processed it, correct inaccuracies, or delete your personal information.
            You may also have the right to withdraw your consent to our processing of your
            personal information. These rights may be limited in some circumstances by
            applicable law. To request to review, update, or delete your personal
            information, please visit:{' '}
            <a
              href="https://www.lumaronexus.com/#contact"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              https://www.lumaronexus.com/#contact
            </a>
            .
          </p>
        </div>
      </section>

      <p className="text-sm text-gray-500 pt-4">
        This Privacy Policy was created using Termly&apos;s{' '}
        <a
          href="https://termly.io/products/privacy-policy-generator/"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Privacy Policy Generator
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
