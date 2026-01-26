import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | 3RROR_K1NG',
  description: 'Privacy policy for 3RROR_K1NG website roasting tool',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <div className="pt-8 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-terminal mb-8">Privacy Policy</h1>

          <div className="space-y-6 text-gray-300">
            <p className="text-gray-400">Last updated: January 2025</p>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">1. Information We Collect</h2>
              <p className="mb-3">When you use 3RROR_K1NG, we collect:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-400">
                <li><strong className="text-gray-300">URLs you submit</strong> for scanning and analysis</li>
                <li><strong className="text-gray-300">Account information</strong> (email, authentication data) if you create an account</li>
                <li><strong className="text-gray-300">Payment information</strong> processed securely through Stripe</li>
                <li><strong className="text-gray-300">Usage data</strong> including scan history and feature usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">2. How We Use Your Data</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-400">
                <li>To perform website security, performance, and accessibility audits</li>
                <li>To generate AI-powered analysis and recommendations</li>
                <li>To process payments and manage subscriptions</li>
                <li>To improve our service and develop new features</li>
                <li>To communicate important updates about your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">3. Data Storage & Security</h2>
              <p className="text-gray-400">
                Your data is stored securely using industry-standard encryption. We use Supabase for
                database hosting and Stripe for payment processing. We do not sell your personal
                information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">4. Third-Party Services</h2>
              <p className="mb-3 text-gray-400">We integrate with the following services:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-400">
                <li><strong className="text-gray-300">Supabase</strong> - Authentication and database</li>
                <li><strong className="text-gray-300">Stripe</strong> - Payment processing</li>
                <li><strong className="text-gray-300">Anthropic Claude</strong> - AI-powered analysis</li>
                <li><strong className="text-gray-300">Vercel</strong> - Hosting and deployment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">5. Your Rights</h2>
              <p className="text-gray-400">
                You can request access to, correction of, or deletion of your personal data at any time
                by contacting us. You can also delete your account through the settings page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">6. Cookies</h2>
              <p className="text-gray-400">
                We use essential cookies for authentication and session management. We do not use
                tracking cookies for advertising purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-100 mb-3">7. Contact</h2>
              <p className="text-gray-400">
                For privacy-related questions, contact us at{' '}
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
