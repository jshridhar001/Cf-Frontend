import { Link } from '@tanstack/react-router';
import { LegalList, LegalPage, LegalSection } from '@/features/legal/components/legal-page';
import { BRAND_LEGAL_NAME, BRAND_OFFICE_ADDRESS } from '@/lib/brand';
import { env } from '@/lib/env';

export function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service">
      <LegalSection title="Agreement">
        <p>
          These terms govern access to the {env.appName} application (the “Service”), operated by{' '}
          {BRAND_LEGAL_NAME} (“we”, “us”). By signing in or using the Service, you agree to these
          terms and to our{' '}
          <Link
            to="/privacy-policy"
            className="font-medium text-primary underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <p>
          The Service is a business tool for contract-farming operations. It is made available to
          people we authorize, including our staff and other users we permit.
        </p>
      </LegalSection>

      <LegalSection title="Accounts">
        <p>
          You must keep your sign-in credentials confidential and use only an account issued or
          approved for you. You are responsible for activity under your account. Tell us promptly if
          you believe your account has been used without permission.
        </p>
        <p>
          If you sign in with Google, you also authorize us to receive the Google account
          information described in the Privacy Policy, and you remain responsible for the Google
          account you use. We may refuse, suspend, or close an account that is unused, duplicated,
          or used in breach of these terms.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree to use the Service only for legitimate contract-farming work. You must not:</p>
        <LegalList>
          <li>Access data, accounts, or areas of the Service you are not authorized to use.</li>
          <li>Enter information you know to be false in a grower, contract, or payment record.</li>
          <li>
            Interfere with the Service, probe it for vulnerabilities, or attempt to bypass access
            controls.
          </li>
          <li>Copy, resell, or disclose records from the Service except as your role requires.</li>
          <li>Use the Service in a way that violates applicable law.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Records you enter">
        <p>
          Operational records in the Service, including grower, land, identity, bank, and contract
          details, are entered by authorized users. You are responsible for the accuracy of the
          information you submit. Grower agreements generated from the Service are business records
          of {BRAND_LEGAL_NAME} and the parties named in those agreements.
        </p>
      </LegalSection>

      <LegalSection title="Our intellectual property">
        <p>
          The Service, its design, and our name and logo belong to {BRAND_LEGAL_NAME} or our
          licensors. These terms give you a limited right to use the Service while your account is
          active. They do not transfer any ownership to you.
        </p>
      </LegalSection>

      <LegalSection title="Availability">
        <p>
          We work to keep the Service available, and we may change, suspend, or withdraw features
          when we need to maintain, secure, or improve it. We do not promise uninterrupted access.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer and liability">
        <p>
          The Service is provided for internal operations. To the extent the law allows, we disclaim
          warranties that are not expressly stated in these terms, including implied warranties of
          fitness for a particular purpose. We are not liable for indirect or consequential loss, or
          for loss arising from information a user entered incorrectly, except where the law does
          not allow that limit. Nothing in these terms excludes liability that cannot legally be
          excluded.
        </p>
      </LegalSection>

      <LegalSection title="Ending access">
        <p>
          You may stop using the Service at any time. We may suspend or end access if these terms
          are broken, if an account is no longer authorized, or if we discontinue the Service.
          Sections that by their nature should survive, including intellectual property, liability,
          and governing law, continue after access ends.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These terms are governed by the laws of India. Courts at Jalandhar, Punjab have exclusive
          jurisdiction, subject to any right you have under law that cannot be waived.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          {BRAND_LEGAL_NAME}
          <br />
          {BRAND_OFFICE_ADDRESS}
        </p>
      </LegalSection>
    </LegalPage>
  );
}
