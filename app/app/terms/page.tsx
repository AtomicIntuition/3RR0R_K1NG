import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | 3RROR_K1NG',
  description: 'Terms of service for 3RROR_K1NG website roasting tool',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-8 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-terminal mb-8">Terms of Service</h1>

          <div className="space-y-6 text-gray-300">
            <p className="text-gray-400">Last updated: January 2025</p>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-400">
                By using 3RROR_K1NG, you agree to these terms of service. If you do not agree,
                please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">2. Service Description</h2>
              <p className="text-gray-400">
                3RROR_K1NG provides website security, performance, SEO, and accessibility auditing
                services. Our AI generates analysis and recommendations based on automated scans
                of publicly accessible websites.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">3. Acceptable Use</h2>
              <p className="mb-3 text-gray-400">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-400">
                <li>Use the service for malicious purposes or to plan actual attacks</li>
                <li>Attempt to overload or abuse the scanning infrastructure</li>
                <li>Use scan results to harass or stalk individuals</li>
                <li>Circumvent rate limits or access restrictions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">4. About Our Scanning</h2>
              <p className="text-gray-400">
                3RROR_K1NG performs passive analysis of publicly accessible websites, similar to
                services like Google PageSpeed Insights or SSL Labs. Our scans only access publicly
                available information and do not perform penetration testing or exploit vulnerabilities.
                You may scan any publicly accessible website for educational or informational purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">5. Payments & Refunds</h2>
              <p className="text-gray-400">
                Payments are processed securely through Stripe. Pro subscriptions can be cancelled
                at any time. Scan packs are non-refundable once purchased. Subscription refunds
                are handled on a case-by-case basis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">6. Disclaimer</h2>
              <p className="text-gray-400">
                3RROR_K1NG provides automated security analysis for informational purposes only.
                We do not guarantee the detection of all vulnerabilities. Our roasts are meant
                to be entertaining while providing genuine feedback. The service is provided
                &quot;as is&quot; without warranties of any kind.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">7. Limitation of Liability</h2>
              <p className="text-gray-400">
                We are not liable for any damages arising from the use of our service, including
                but not limited to security incidents, business losses, or reputational harm.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">8. Account Termination</h2>
              <p className="text-gray-400">
                We reserve the right to suspend or terminate accounts that violate these terms
                or engage in abusive behavior.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">9. Changes to Terms</h2>
              <p className="text-gray-400">
                We may update these terms at any time. Continued use of the service after changes
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">10. Contact</h2>
              <p className="text-gray-400">
                For questions about these terms, contact us at{' '}
                <a href="mailto:chaptera@yahoo.com" className="text-terminal hover:text-terminal-bright">
                  chaptera@yahoo.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
