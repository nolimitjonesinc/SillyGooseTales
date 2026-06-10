import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Silly Goose Tales',
  description: 'Terms of Service for Silly Goose Tales',
}

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-[#aaa]">Last Updated: June 5, 2026</p>
        </div>

        <div className="prose prose-sm max-w-none text-[#2C2A26] space-y-8">

          <section>
            <h2 className="text-lg font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-[#5a5550] leading-relaxed">
              By accessing or using Silly Goose Tales ("Service," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
            </p>
            <p className="text-[#5a5550] leading-relaxed mt-3">
              These Terms constitute a legally binding agreement between you and Silly Goose Tales. We reserve the right to modify these Terms at any time. For material changes, we will notify you via email at least 30 days before the changes take effect. Your continued use of the Service after the effective date constitutes acceptance of those changes.
            </p>
            <p className="text-[#5a5550] leading-relaxed mt-3">
              Please also review our <Link href="/privacy" className="text-[#E8A838] hover:underline">Privacy Policy</Link>, which describes how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Eligibility</h2>
            <p className="text-[#5a5550] leading-relaxed mb-2">
              You must be at least 18 years old to create an account and subscribe to Silly Goose Tales. By using the Service, you represent and warrant that:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>You are not prohibited from using the Service under applicable law</li>
              <li>You are subscribing on behalf of yourself or your household</li>
            </ul>
            <p className="text-[#5a5550] leading-relaxed mt-3">
              Silly Goose Tales delivers stories intended for children, but the account holder and subscriber must be an adult. Story content is designed to be child-appropriate. If we learn that an account has been created by someone under 18, we will terminate the account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Description of Service</h2>
            <p className="text-[#5a5550] leading-relaxed mb-2">
              Silly Goose Tales is an AI-powered personalized bedtime story service that:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li>Generates a new, original bedtime story every night tailored to your child's name, age, and current mood</li>
              <li>Delivers stories directly to your email inbox — no app or login required</li>
              <li>Adapts future stories based on mood feedback you provide</li>
              <li>Provides a free trial story with no credit card required</li>
            </ul>
            <p className="text-[#5a5550] leading-relaxed mt-3">
              The Service uses artificial intelligence technology to generate story content. AI-generated content is fictional and creative in nature. Stories are intended for entertainment and bedtime enjoyment only.
            </p>
            <p className="text-[#5a5550] leading-relaxed mt-3">
              Features may be added, modified, or removed at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. User Accounts</h2>
            <p className="text-[#5a5550] leading-relaxed mb-2">
              To subscribe, you must provide a valid email address and complete the signup process. When creating an account, you agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li>Provide accurate, current, and complete information</li>
              <li>Keep your subscription and contact information up to date</li>
              <li>Accept responsibility for all activity associated with your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
            <p className="text-[#5a5550] leading-relaxed mt-3">
              We reserve the right to suspend or terminate accounts that violate these Terms or remain inactive for an extended period. You may cancel your subscription at any time.
            </p>
            <p className="text-[#5a5550] leading-relaxed mt-3 font-medium">
              CHARGEBACKS AND PAYMENT DISPUTES: If you initiate a chargeback or payment dispute, we reserve the right to suspend your account until the dispute is resolved.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Subscriptions and Payments</h2>

            <p className="text-[#5a5550] font-semibold mb-1">FREE TRIAL:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550] mb-4">
              <li>One free personalized story delivered tonight</li>
              <li>No credit card required</li>
            </ul>

            <p className="text-[#5a5550] font-semibold mb-1">MONTHLY ($9.99/month):</p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550] mb-4">
              <li>One new personalized story delivered nightly</li>
              <li>Mood-adaptive story generation</li>
              <li>Cancel anytime</li>
            </ul>

            <p className="text-[#5a5550] font-semibold mb-1">ANNUAL ($89.99/year — $7.50/month):</p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550] mb-4">
              <li>Everything in Monthly, billed annually</li>
              <li>25% savings vs. monthly billing</li>
            </ul>

            <p className="text-[#5a5550] font-semibold mb-1">BILLING:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550] mb-4">
              <li>Subscriptions are billed through our payment processor, Stripe</li>
              <li>Your subscription renews automatically unless cancelled before the renewal date</li>
              <li>You may cancel at any time; cancellation takes effect at the end of the current billing period</li>
              <li>Prices may change with 30 days' notice; you may cancel before the new price takes effect</li>
            </ul>

            <p className="text-[#5a5550] font-semibold mb-1">REFUND POLICY:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li>We offer a 7-day money-back guarantee for new subscribers</li>
              <li>To request a refund within this period, contact us at hello@sillygoose.tales</li>
              <li>After the 7-day period, payments are non-refundable except where required by law</li>
              <li>No refunds for partial months of service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Content Rights</h2>

            <p className="text-[#5a5550] font-semibold mb-1">YOUR INFORMATION:</p>
            <p className="text-[#5a5550] leading-relaxed mb-4">
              By providing your child's name, age, and mood preferences ("Personalization Data"), you grant Silly Goose Tales a license to use that information solely to generate and deliver personalized stories to you.
            </p>

            <p className="text-[#5a5550] font-semibold mb-1">AI-GENERATED STORIES:</p>
            <p className="text-[#5a5550] leading-relaxed mb-4">
              Stories generated by the Service are created by artificial intelligence. The copyrightability of AI-generated content is legally evolving. Stories are provided for personal, household use only. You may not sell, republish, or commercially exploit stories generated through the Service.
            </p>

            <p className="text-[#5a5550] font-semibold mb-1">PERSONAL USE:</p>
            <p className="text-[#5a5550] leading-relaxed">
              You receive a personal, non-exclusive license to read and enjoy stories delivered to your inbox for personal, non-commercial, household use only. You may share individual stories informally (e.g., forwarding to a grandparent) but may not distribute or publish them commercially.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. AI-Generated Content</h2>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li>All stories are fictional and intended for entertainment only</li>
              <li>AI-generated content may occasionally be imperfect despite our quality controls</li>
              <li>Stories should not be relied upon for factual information or advice</li>
              <li>We continuously work to ensure stories are age-appropriate and safe</li>
              <li>We do not guarantee that every story will perfectly match your preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Prohibited Conduct</h2>
            <p className="text-[#5a5550] leading-relaxed mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li>Share account access or story delivery with unauthorized users</li>
              <li>Use automated systems to access or extract content from the Service</li>
              <li>Attempt to reverse-engineer, replicate, or extract the story generation system</li>
              <li>Use stories to develop competing products or train AI models</li>
              <li>Commercially republish or sell AI-generated stories</li>
              <li>Provide false information during signup</li>
              <li>Violate any applicable law or regulation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. Third-Party Services</h2>
            <p className="text-[#5a5550] leading-relaxed mb-2">
              Silly Goose Tales uses the following third-party services to operate:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li><strong>Anthropic (Claude):</strong> AI story generation</li>
              <li><strong>Supabase:</strong> User data and authentication</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Resend:</strong> Email delivery</li>
              <li><strong>Vercel:</strong> Web hosting</li>
            </ul>
            <p className="text-[#5a5550] leading-relaxed mt-3">
              Your use of these services is subject to their respective terms and privacy policies. We are not responsible for their practices or content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">10. Disclaimers</h2>
            <p className="text-[#5a5550] leading-relaxed mb-2 uppercase font-semibold text-xs tracking-wide">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li>Merchantability or fitness for a particular purpose</li>
              <li>Accuracy or completeness of AI-generated content</li>
              <li>Uninterrupted or error-free delivery</li>
              <li>Indefinite preservation of story history</li>
            </ul>
            <p className="text-[#5a5550] leading-relaxed mt-3">
              We may modify, suspend, or discontinue any part of the Service at any time. We have no obligation to maintain any specific feature set beyond what is available at the time of your subscription.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">11. Limitation of Liability</h2>
            <p className="text-[#5a5550] leading-relaxed">
              To the maximum extent permitted by law, Silly Goose Tales shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability for any claim shall not exceed the amount you paid us in the 3 months preceding the claim, or $50, whichever is greater.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">12. Indemnification</h2>
            <p className="text-[#5a5550] leading-relaxed">
              You agree to indemnify and hold harmless Silly Goose Tales, its officers, employees, and affiliates from any claims, damages, or expenses arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">13. Termination</h2>
            <p className="text-[#5a5550] leading-relaxed mb-2">
              We may suspend or terminate your access at any time, with or without cause.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#5a5550]">
              <li><strong>Termination for cause</strong> (Terms violation): Immediate, no refund.</li>
              <li><strong>Termination without cause by us:</strong> Pro-rata refund of unused prepaid subscription period.</li>
              <li><strong>Voluntary cancellation:</strong> Service continues through end of billing period.</li>
            </ul>
            <p className="text-[#5a5550] leading-relaxed mt-3">
              If we permanently discontinue the Service, paid subscribers will receive 30 days' advance notice and a pro-rata refund.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">14. Governing Law</h2>
            <p className="text-[#5a5550] leading-relaxed">
              These Terms are governed by the laws of the United States. Any dispute shall first be resolved through informal negotiation. If unresolved after 30 days, disputes shall be resolved through binding arbitration. You waive any right to participate in class actions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">15. Contact</h2>
            <p className="text-[#5a5550] leading-relaxed">
              Questions about these Terms? Reach us at:{' '}
              <a href="mailto:hello@sillygoose.tales" className="text-[#E8A838] hover:underline">
                hello@sillygoose.tales
              </a>
            </p>
            <p className="text-[#5a5550] leading-relaxed mt-2">We aim to respond within 48 hours.</p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-6 border-t border-[#e8ddd0] flex flex-wrap gap-4 text-xs text-[#aaa]">
          <Link href="/privacy" className="hover:text-[#E8A838] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#E8A838] transition-colors font-semibold text-[#5a5550]">Terms of Service</Link>
          <Link href="/" className="hover:text-[#E8A838] transition-colors">← Back to Silly Goose Tales</Link>
        </div>

      </div>
    </main>
  )
}
