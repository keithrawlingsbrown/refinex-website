export default function Privacy() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-32">
      <h1 className="text-3xl font-bold text-refinex-primary mb-6">Privacy Policy</h1>
      <p className="text-refinex-secondary leading-relaxed mb-4">
        RefineX collects API usage metadata (request counts, endpoint, timestamp, API key identifier)
        for billing and rate limiting purposes. We do not collect, store, or analyze your
        infrastructure data, spot instance decisions, or workload characteristics.
      </p>
      <p className="text-refinex-secondary leading-relaxed mb-4">
        We do not sell data. We do not share data with third parties except as required
        to operate the service (payment processing via Stripe, error monitoring via Sentry).
      </p>
      <p className="text-refinex-secondary leading-relaxed">
        For questions: privacy@refinex.io
      </p>
    </main>
  );
}
