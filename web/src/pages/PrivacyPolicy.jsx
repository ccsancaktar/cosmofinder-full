const sections = [
  {
    title: "Information We Collect",
    body: [
      "We may collect information you provide directly when you create an account, complete your profile, purchase tokens or subscriptions, request a reading, contact support, or otherwise use CosmoFinder.",
      "Depending on the features you use, this may include your name, email address, profile details, birth date, birth time, birth place, reading inputs, purchase information, and images you upload such as coffee cup photos or profile images.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use collected information to operate, maintain, and improve CosmoFinder. This includes authentication, account management, purchase and subscription processing, token balance management, reading generation, reading history, notification delivery, fraud prevention, customer support, diagnostics, and performance monitoring.",
      "We may also use information to understand app stability, improve features, and troubleshoot service issues.",
    ],
  },
  {
    title: "Photos and Reading Inputs",
    body: [
      "If you choose to use features such as coffee reading, we process the photos and inputs you provide to generate your requested reading. These materials are used to provide app functionality and are not used by us for tracking purposes.",
    ],
  },
  {
    title: "Payments, Purchases, and Subscriptions",
    body: [
      "Payments for in-app purchases and subscriptions are processed through Apple and our service providers. We do not directly collect your full payment card details inside the app. We may receive transaction, entitlement, and purchase status information needed to activate purchases, restore access, and manage subscriptions.",
    ],
  },
  {
    title: "Notifications",
    body: [
      "If you allow notifications, we may collect and store your push notification token and notification preferences in order to send app-related notifications such as daily reminders, angel number updates, and subscription-related notices.",
    ],
  },
  {
    title: "Third-Party Services",
    body: [
      "We may use third-party service providers to help operate CosmoFinder, including services for crash reporting, diagnostics, advertising, subscription management, analytics, hosting, and payment-related operations.",
      "These providers may include services such as Google AdMob, RevenueCat, Sentry, hosting providers, and other infrastructure partners that process data on our behalf or in connection with their services.",
    ],
  },
  {
    title: "Advertising and Diagnostics",
    body: [
      "CosmoFinder may display third-party advertising. We may also collect crash, diagnostic, and performance data to improve app stability, reliability, and user experience.",
    ],
  },
  {
    title: "Data Retention",
    body: [
      "We retain information for as long as reasonably necessary to provide the app, comply with legal obligations, resolve disputes, enforce agreements, and maintain business and security records.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You may update certain profile information inside the app. You may also manage notification permissions through your device settings. If you have questions about your information or would like to request support regarding your account, you can contact us using the email address below.",
    ],
  },
  {
    title: "Children's Privacy",
    body: [
      "CosmoFinder is not directed to children. If you believe that personal data has been provided to us by a child in violation of applicable law, please contact us so we can review and take appropriate action.",
    ],
  },
  {
    title: "Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. When we do, we will post the updated version on this page and revise the effective date below where appropriate.",
    ],
  },
  {
    title: "Contact Us",
    body: [
      "If you have any questions about this Privacy Policy or our privacy practices, please contact us at info@cosmofinder.com.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-3xl border border-primary/20 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-primary/80">
            Trust & Safety
          </p>
          <h1 className="mb-4 text-4xl font-semibold text-white sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-gray-300 sm:text-base">
            This Privacy Policy describes how CosmoFinder collects, uses, and
            shares information when you use our website, mobile application,
            readings, subscriptions, and related services.
          </p>
          <div className="mt-6 inline-flex rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm text-primary">
            Effective date: May 22, 2026
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-3xl border border-white/8 bg-white/5 p-7 shadow-lg shadow-black/10 backdrop-blur-sm"
            >
              <h2 className="mb-4 text-2xl font-semibold text-white">
                {section.title}
              </h2>
              <div className="space-y-4 text-sm leading-7 text-gray-300 sm:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
