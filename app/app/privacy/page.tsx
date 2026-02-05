import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Crisp',
  description: 'Privacy policy for Crisp website audit platform',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="pt-12 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-50 tracking-tight mb-4">Privacy Policy</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800 text-xs font-medium text-gray-400 border border-gray-700">
              Last updated: January 2025
            </span>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-50 mb-3">1. Information We Collect</h2>
              <p className="mb-3 text-gray-300 leading-relaxed">When you use Crisp, we collect:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-400 leading-relaxed">
                <li><strong className="text-gray-200">URLs you submit</strong> for scanning and analysis</li>
                <li><strong className="text-gray-200">Account information</strong> (email, authentication data) if you create an account</li>
                <li><strong className="text-gray-200">Payment information</strong> processed securely through Stripe</li>
                <li><strong className="text-gray-200">Usage data</strong> including scan history and feature usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-50 mb-3">2. How We Use Your Data</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-400 leading-relaxed">
                <li>To perform website security, performance, and accessibility audits</li>
                <li>To generate AI-powered analysis and recommendations</li>
                <li>To process payments and manage subscriptions</li>
                <li>To improve our service and develop new features</li>
                <li>To communicate important updates about your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-50 mb-3">3. Data Storage & Security</h2>
              <p className="text-gray-400 leading-relaxed">
                Your data is stored securely using industry-standard encryption. We use Supabase for
                database hosting and Stripe for payment processing. We do not sell your personal
                information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-50 mb-3">4. Third-Party Services</h2>
              <p className="mb-3 text-gray-400 leading-relaxed">We integrate with the following services:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-400 leading-relaxed">
                <li><strong className="text-gray-200">Supabase</strong> - Authentication and database</li>
                <li><strong className="text-gray-200">Stripe</strong> - Payment processing</li>
                <li><strong className="text-gray-200">Anthropic Claude</strong> - AI-powered analysis</li>
                <li><strong className="text-gray-200">Vercel</strong> - Hosting and deployment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-50 mb-3">5. Your Rights</h2>
              <p className="text-gray-400 leading-relaxed">
                You can request access to, correction of, or deletion of your personal data at any time
                by contacting us. You can also delete your account through the settings page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-50 mb-3">6. Cookies</h2>
              <p className="text-gray-400 leading-relaxed">
                We use essential cookies for authentication and session management. We do not use
                tracking cookies for advertising purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-50 mb-3">7. Contact</h2>
              <p className="text-gray-400 leading-relaxed">
                For privacy-related questions, contact us at{' '}
                <a href="mailto:chaptera@yahoo.com" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  chaptera@yahoo.com
                </a>
              </p>
            </section>
          </div>

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              &larr; Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
