'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminUsers = await queryInterface.sequelize.query(
      "SELECT user_id FROM users WHERE role = 'admin' LIMIT 1",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const adminUserId = adminUsers.length > 0 ? adminUsers[0].user_id : 1;
    const now = new Date();

    const privacyPolicyContent = `
      <div class="legal-document">
        <h1>Privacy Policy</h1>
        <p><strong>Last Updated: January 1, 2025</strong></p>

        <p>
          This Privacy Policy explains how our Education Support System (“we,” “our,” “us”)
          collects, uses, shares, and protects your personal information when you use our
          application and services. We are committed to compliance with applicable data
          protection laws, including the General Data Protection Regulation (GDPR) and
          the California Consumer Privacy Act (CCPA).
        </p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li><strong>Personal Information:</strong> name, email, and account details provided directly or via Google Sign-In.</li>
          <li><strong>Educational Information:</strong> your chosen courses, study activities, and learning progress.</li>
          <li><strong>Technical Data:</strong> IP address, device type, operating system, and browser type.</li>
          <li><strong>Usage Data:</strong> logs of how you interact with the system, including pages visited and features used.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect for the following purposes:</p>
        <ul>
          <li>To provide, operate, and maintain our educational services.</li>
          <li>To personalize your learning experience.</li>
          <li>To process authentication and secure login with Google Sign-In.</li>
          <li>To comply with legal obligations and resolve disputes.</li>
          <li>To protect against fraud and misuse of our services.</li>
        </ul>

        <h2>3. Sharing and Disclosure</h2>
        <p>
          We never sell your personal data. We may share it only with trusted partners such as:
        </p>
        <ul>
          <li>Service providers (e.g., cloud hosting, authentication providers like Google).</li>
          <li>Legal authorities if required to comply with applicable laws.</li>
        </ul>

        <h2>4. Your Rights</h2>
        <p>Depending on your jurisdiction, you may have the following rights:</p>
        <ul>
          <li><strong>GDPR:</strong> Right to access, rectify, erase, restrict, and port your data, as well as object to processing.</li>
          <li><strong>CCPA:</strong> Right to know what personal data we collect, request deletion, and opt out of the sale of personal data (we do not sell data).</li>
        </ul>
        <p>
          To exercise these rights, please contact us at
          <a href="mailto:support@educationsystem.com">support@educationsystem.com</a>.
        </p>

        <h2>5. Data Retention</h2>
        <p>
          We retain your data only as long as necessary to provide services or comply with legal
          obligations. Data is securely deleted once no longer required.
        </p>

        <h2>6. Data Security</h2>
        <p>
          We implement technical and organizational measures (such as encryption, secure servers,
          and restricted access) to safeguard your information.
        </p>

        <h2>7. Children’s Privacy</h2>
        <p>
          Our services are not directed at children under 13. For users under 18, parental consent
          is required in some jurisdictions.
        </p>

        <h2>8. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy to reflect legal, technical, or business changes. The
          updated version will be posted with a revised effective date.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          For questions or privacy-related concerns, contact us at:
          <a href="mailto:support@educationsystem.com">support@educationsystem.com</a>.
        </p>
      </div>
    `.trim();

    const termsOfServiceContent = `
      <div class="legal-document">
        <h1>Terms of Service</h1>
        <p><strong>Last Updated: January 1, 2025</strong></p>

        <p>
          These Terms of Service (“Terms”) govern your use of the Education Support System.
          By creating an account or using our services, you agree to be bound by these Terms.
          If you do not agree, please do not use the platform.
        </p>

        <h2>1. Eligibility</h2>
        <p>
          You must be at least 13 years old to use our services. If you are under 18,
          you must have parental or guardian consent.
        </p>

        <h2>2. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your login credentials
          and for all activities that occur under your account. Misuse of credentials may
          result in suspension or termination of your account.
        </p>

        <h2>3. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Engage in unlawful or fraudulent activities.</li>
          <li>Upload or distribute harmful, abusive, or misleading content.</li>
          <li>Attempt to compromise the security of the system or other accounts.</li>
          <li>Violate intellectual property rights or applicable laws.</li>
        </ul>

        <h2>4. Intellectual Property</h2>
        <p>
          All platform content, trademarks, and materials are the property of the Education
          Support System or licensed third parties. You may not reproduce or distribute
          them without permission.
        </p>

        <h2>5. Service Availability</h2>
        <p>
          We aim to provide continuous and reliable services but do not guarantee
          uninterrupted access. Downtime may occur for maintenance, upgrades, or issues
          beyond our control.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          To the extent permitted by law, we are not liable for indirect, incidental,
          or consequential damages arising from your use or inability to use the services.
        </p>

        <h2>7. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your account if you violate
          these Terms or engage in activities harmful to our platform or users.
        </p>

        <h2>8. Governing Law</h2>
        <p>
          These Terms will be governed by the laws of your jurisdiction. Any disputes
          will be resolved in accordance with applicable law.
        </p>

        <h2>9. Updates to the Terms</h2>
        <p>
          We may modify these Terms to reflect changes in laws, features, or business
          practices. Updates will be posted with the new effective date, and continued
          use of the service constitutes acceptance of the updated Terms.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          For questions about these Terms, please contact us at:
          <a href="mailto:support@educationsystem.com">support@educationsystem.com</a>.
        </p>
      </div>
    `.trim();

    await queryInterface.bulkInsert('legal_documents', [
  {
    document_type: 'privacy_policy',   // enum value
    title: 'Privacy Policy',
    version: '1.0',
    content: privacyPolicyContent,
    is_active: true,
    created_by: adminUserId,
    created_at: now,
    updated_at: now,
  },
  {
    document_type: 'terms_of_service', // enum value
    title: 'Terms of Service',
    version: '1.0',
    content: termsOfServiceContent,
    is_active: true,
    created_by: adminUserId,
    created_at: now,
    updated_at: now,
  }
]);

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('legal_documents', {
  document_type: { [Sequelize.Op.in]: ['privacy_policy', 'terms_of_service'] }
});
  }
};



