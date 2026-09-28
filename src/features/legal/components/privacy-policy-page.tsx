import { Link } from '@tanstack/react-router';
import { LegalList, LegalPage, LegalSection } from '@/features/legal/components/legal-page';
import { BRAND_LEGAL_NAME, BRAND_OFFICE_ADDRESS } from '@/lib/brand';
import { env } from '@/lib/env';

export function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <LegalSection title="Who we are">
        <p>
          {BRAND_LEGAL_NAME} (“we”, “us”) operates the {env.appName} application (the “Service”).
          The Service is used to run our contract-farming operations, including grower records, seed
          requisitions, agreements, and related reports.
        </p>
        <p>
          Our office is at {BRAND_OFFICE_ADDRESS}. Questions about this policy can be sent to that
          office, marked for the attention of the Contract Farming application administrator.
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <p>We collect the following categories of information.</p>
        <LegalList>
          <li>
            <span className="font-medium">Account information.</span> Name, email address, role, and
            a password if you sign in with email and password. Passwords are stored in a protected
            form and are not kept as plain text.
          </li>
          <li>
            <span className="font-medium">Google account information.</span> If you sign in with
            Google, we receive the basic profile Google shares for authentication: your name, email
            address, and profile picture, together with a unique account identifier. We request only
            the OpenID, email, and profile information needed to sign you in.
          </li>
          <li>
            <span className="font-medium">Operational records.</span> Information that authorized
            users enter to run contract farming, such as grower names and contact details, land and
            address details, government identity numbers (including Aadhaar and PAN) where a
            contract requires them, bank account details used for payments, seed requisitions,
            agreements, and files uploaded to those records.
          </li>
          <li>
            <span className="font-medium">Session and security data.</span> Sign-in sessions,
            authentication tokens, and basic technical logs needed to keep accounts secure and to
            diagnose failures.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="How we use information">
        <p>We use this information to:</p>
        <LegalList>
          <li>Create and authenticate accounts, including Sign in with Google.</li>
          <li>Provide the contract-farming workflows the Service is built for.</li>
          <li>Prepare agreements, dispatches, requisitions, and operational reports.</li>
          <li>Limit access to people who are authorized to use the Service.</li>
          <li>Protect the Service against unauthorized access and misuse.</li>
          <li>Meet legal, accounting, and contractual duties.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Google user data">
        <p>
          Google user data is used only to identify you and to sign you in to the Service. We do not
          use Google user data for advertising. We do not sell Google user data. We do not use it to
          build profiles for purposes unrelated to operating the Service, and we do not transfer it
          except to the infrastructure providers that host the Service, or when the law requires it.
        </p>
        <p>
          {BRAND_LEGAL_NAME}’s use and transfer of information received from Google APIs adheres to
          the{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            className="font-medium text-primary underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements.
        </p>
      </LegalSection>

      <LegalSection title="How we share information">
        <p>
          We share personal information with service providers that host, secure, or operate the
          Service on our instructions. We may also share it with professional advisers, with a buyer
          of the business if ownership changes, and with authorities when the law requires it.
          Authorized staff of {BRAND_LEGAL_NAME} can see the operational records their role allows.
          We do not sell personal information.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep information">
        <p>
          Account information is kept while the account is active and for a limited period afterward
          so we can resolve disputes and meet record-keeping duties. Operational records, including
          identity and bank details used in grower agreements, are kept for as long as the related
          contract, payment, or legal obligation requires. Session data is kept only as long as
          needed for security.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          Access to the Service is limited to authenticated users, and permissions are assigned by
          role. We use industry-standard safeguards appropriate to the data we hold. No method of
          transmission or storage is completely secure, and we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You may ask us to access, correct, or delete personal information we hold about you,
          subject to records we must keep for a contract or for the law. To make a request, write to
          us at the office address above. If you signed in with Google, you can also remove the
          app’s access from your Google Account permissions.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          The Service is an operations tool for our business. It is not directed at children, and we
          do not knowingly collect personal information from children.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update this policy when the Service or the law changes. The date at the top of this
          page shows when it was last updated. Continued use of the Service after an update means
          you accept the revised policy.
        </p>
        <p>
          Use of the Service is also covered by our{' '}
          <Link
            to="/terms-of-service"
            className="font-medium text-primary underline underline-offset-4"
          >
            Terms of Service
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
