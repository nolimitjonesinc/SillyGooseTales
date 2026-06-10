import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Silly Goose Tales',
  description: 'Privacy Policy for Silly Goose Tales',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FDF6EE]">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="text-[#E8A838] text-sm font-semibold hover:underline">
            ← Silly Goose Tales
          </Link>
          <h1
            className="text-3xl font-bold text-[#2C2A26] mt-4 mb-2"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm text-[#aaa]">Last Updated: June 5, 2026</p>
        </div>

        <div className="prose prose-sm max-w-none text-[#2C2A26] space-y-8">

          <section>
            <h2 className="text-lg font-bold mb-3">1. Introduction</h2>
            <p className="text-[#5a5550] leading-relaxed">
              Silly Goose Tales ("we," "us," or "our") takes your privacy seriously — especially since our service involves information about your children. This Privacy Policy explains what we collect, why we collect it, and how we use and protect it.
            </p>
            <p className="text-[#5a5550] leading-relaxed mt-3">
              By using Silly Goose Tales, you consent to the practices described in this policy. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Information We Collect</h2>

            <p className="text-[#5a5550] font-semibold mb-1">INFORMATION YOU PROVIDE DIRECTLY:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550] mb-4">
              <li>Your email address (used to deliver stories)</li>
              <li>Your child's first name and age (used to personalize stories)</li>
              <li>Mood selections after each story (used to shape future stories)</li>
              <li>Payment information (processed securely by Stripe — we never store full card details)</li>
              <li>Any messages you send us via support</li>
            </ul>

            <p className="text-[#5a5550] font-semibold mb-1">INFORMATION COLLECTED AUTOMATICALLY:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550] mb-4">
              <li>Device and browser type when you visit our website</li>
              <li>Pages visited and actions taken on our site</li>
              <li>IP address and access times</li>
              <li>Email engagement data (open rates, link clicks) via our email provider</li>
            </ul>

            <p className="text-[#5a5550] font-semibold mb-1">WHAT WE DO NOT COLLECT:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li>Your child's last name</li>
              <li>Photos or images of your child</li>
              <li>Location data</li>
              <li>Any data directly from children — all information flows through the parent/guardian account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. How We Use Your Information</h2>

            <p className="text-[#5a5550] font-semibold mb-1">SERVICE DELIVERY:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550] mb-4">
              <li>Generate personalized bedtime stories using your child's name, age, and mood data</li>
              <li>Deliver stories to your email inbox nightly</li>
              <li>Manage your subscription and process payments</li>
              <li>Adapt future stories based on mood feedback</li>
            </ul>

            <p className="text-[#5a5550] font-semibold mb-1">COMMUNICATION:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550] mb-4">
              <li>Send your nightly story</li>
              <li>Send account, billing, and service notifications</li>
              <li>Respond to your support requests</li>
              <li>Occasional product updates (you can unsubscribe anytime)</li>
            </ul>

            <p className="text-[#5a5550] font-semibold mb-1">SERVICE IMPROVEMENT:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li>Understand how the service is used to improve it</li>
              <li>Identify and fix bugs</li>
              <li>Improve our AI story generation quality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. AI Processing and Third-Party Services</h2>
            <p className="text-[#5a5550] leading-relaxed mb-3">
              To generate personalized stories, we send a prompt to Anthropic (Claude AI) that includes your child's first name, age range, and current mood. We do not send full names, addresses, or other identifying information to AI providers.
            </p>
            <p className="text-[#5a5550] leading-relaxed mb-2">
              Our third-party service providers and their roles:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li><strong>Anthropic:</strong> Story generation — processes first name, age range, and mood</li>
              <li><strong>Supabase:</strong> Database and authentication — stores your account and subscription data</li>
              <li><strong>Stripe:</strong> Payment processing — handles all billing securely</li>
              <li><strong>Resend:</strong> Email delivery — sends your nightly stories</li>
              <li><strong>Vercel:</strong> Web hosting</li>
            </ul>
            <p className="text-[#5a5550] leading-relaxed mt-3">
              Each provider is subject to their own privacy policy and security standards. We select providers with strong privacy practices, but we cannot guarantee how they handle data beyond our API agreements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Children's Privacy</h2>
            <p className="text-[#5a5550] leading-relaxed mb-3">
              Silly Goose Tales generates stories for children but is operated by adult subscribers (parents and guardians). We do not knowingly collect personal information directly from children under 13. All account creation, data submission, and subscription management is handled by the adult account holder.
            </p>
            <p className="text-[#5a5550] leading-relaxed mb-3">
              The only child-related information we use is a first name, age range, and mood selection — the minimum necessary to personalize a story. We do not store detailed profiles about children and do not share child information with third parties for advertising or analytics purposes.
            </p>
            <p className="text-[#5a5550] leading-relaxed">
              If you believe a child under 13 has created an account independently, contact us at{' '}
              <a href="mailto:hello@sillygoose.tales" className="text-[#E8A838] hover:underline">hello@sillygoose.tales</a>{' '}
              and we will promptly delete the account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. How We Share Your Information</h2>
            <p className="text-[#5a5550] leading-relaxed mb-2">
              We do not sell your personal information. We share data only in these circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li><strong>Service providers:</strong> As described in Section 4, to operate the service</li>
              <li><strong>Legal requirements:</strong> To comply with applicable law or respond to lawful requests</li>
              <li><strong>Business transfers:</strong> In connection with a merger or acquisition; you will be notified</li>
              <li><strong>Aggregated/anonymized data:</strong> Non-identifiable usage patterns may be used for service improvement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Data Retention</h2>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li><strong>Account data:</strong> Retained while your account is active; deleted within 90 days of account deletion request</li>
              <li><strong>Story history:</strong> We retain recent stories to power the mood-adaptive system; older stories may be purged periodically</li>
              <li><strong>Payment records:</strong> Retained as required for tax and legal compliance (typically 7 years)</li>
              <li><strong>Usage logs:</strong> Retained up to 2 years for analytics and security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Data Security</h2>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li>All data is encrypted in transit (HTTPS/TLS)</li>
              <li>Passwords are hashed — we never store them in plain text</li>
              <li>Payment data is handled entirely by Stripe and never stored on our servers</li>
              <li>Access to personal data is limited to those who need it to operate the service</li>
            </ul>
            <p className="text-[#5a5550] leading-relaxed mt-3">
              No system is 100% secure. In the event of a data breach affecting your personal information, we will notify you and relevant authorities as required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. Your Rights and Choices</h2>
            <p className="text-[#5a5550] leading-relaxed mb-2">
              You have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing emails at any time via the unsubscribe link in any email</li>
              <li><strong>Cancellation:</strong> Cancel your subscription at any time</li>
            </ul>
            <p className="text-[#5a5550] leading-relaxed mt-3">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:hello@sillygoose.tales" className="text-[#E8A838] hover:underline">hello@sillygoose.tales</a>.
              We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">10. Cookies</h2>
            <p className="text-[#5a5550] leading-relaxed mb-2">
              We use minimal cookies to operate the service:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li><strong>Essential cookies:</strong> Session management and authentication — required for the site to function</li>
              <li><strong>Preference cookies:</strong> Remember your settings</li>
            </ul>
            <p className="text-[#5a5550] leading-relaxed mt-3">
              We do not use third-party advertising cookies or sell data to advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">11. California Privacy Rights</h2>
            <p className="text-[#5a5550] leading-relaxed">
              California residents have additional rights under the CCPA/CPRA, including the right to know, delete, and opt-out of the sale or sharing of personal information. We do not sell personal information. To exercise your California privacy rights, contact us at{' '}
              <a href="mailto:hello@sillygoose.tales" className="text-[#E8A838] hover:underline">hello@sillygoose.tales</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">12. International Users</h2>
            <p className="text-[#5a5550] leading-relaxed">
              Your information may be processed in the United States, where our servers are located. If you are in the EU or UK, we conduct international data transfers using Standard Contractual Clauses. EU/UK users have rights under GDPR including access, rectification, erasure, and the right to lodge a complaint with your local data protection authority.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">13. Changes to This Policy</h2>
            <p className="text-[#5a5550] leading-relaxed">
              We may update this policy from time to time. For material changes, we will notify you via email. Your continued use after the effective date constitutes acceptance. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">14. Contact Us</h2>
            <p className="text-[#5a5550] leading-relaxed">
              Questions, concerns, or requests regarding this Privacy Policy:
            </p>
            <p className="text-[#5a5550] mt-2">
              Email:{' '}
              <a href="mailto:hello@sillygoose.tales" className="text-[#E8A838] hover:underline">
                hello@sillygoose.tales
              </a>
            </p>
            <p className="text-[#5a5550] mt-1">We aim to respond to privacy inquiries within 30 days.</p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-6 border-t border-[#e8ddd0] flex flex-wrap gap-4 text-xs text-[#aaa]">
          <Link href="/privacy" className="hover:text-[#E8A838] transition-colors font-semibold text-[#5a5550]">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#E8A838] transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-[#E8A838] transition-colors">← Back to Silly Goose Tales</Link>
        </div>

      </div>
    </main>
  )
}
