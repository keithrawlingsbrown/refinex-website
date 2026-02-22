export default function Terms() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-32">
      <h1 className="text-3xl font-bold text-refinex-primary mb-6">Terms of Service</h1>
      <p className="text-refinex-secondary leading-relaxed mb-4">
        RefineX provides advisory spot market signals. Signals are probabilistic and do not
        constitute infrastructure management advice, financial advice, or execution instructions.
      </p>
      <p className="text-refinex-secondary leading-relaxed mb-4">
        RefineX makes no guarantee of signal accuracy, savings realization, or system performance
        outcomes. Customer retains sole decision authority over all infrastructure actions.
      </p>
      <p className="text-refinex-secondary leading-relaxed mb-4">
        Prohibited uses: reverse engineering confidence calculation methods, sharing API keys,
        continuous automated polling beyond your rate tier, competitive intelligence extraction.
      </p>
      <p className="text-refinex-secondary leading-relaxed">
        For questions: legal@refinex.io
      </p>
    </main>
  );
}
