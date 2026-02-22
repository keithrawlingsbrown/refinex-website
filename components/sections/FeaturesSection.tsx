export default function FeaturesSection() {
  const features = [
    {
      label: 'Regime-aware signals',
      description: 'We classify market state — stable, volatile, mean-reverting — before scoring confidence. You get context, not just a number.',
    },
    {
      label: 'Suppression by design',
      description: 'Low-quality signals are blocked before they reach your API. Every suppression is logged with a reason. Discipline is the product.',
    },
    {
      label: 'Advisory-only by default',
      description: 'Signals inform decisions. Your autoscaler executes. We never touch your infrastructure. Preview mode is the default.',
    },
    {
      label: 'Confidence bands, not scores',
      description: 'We return HIGH, MEDIUM, or WATCH — never raw probability scores. Clean signal, clear action, no false precision.',
    },
    {
      label: 'API-first design',
      description: 'One endpoint. Structured JSON. Works with Kubernetes HPA, Terraform, n8n, or any automation layer you already run.',
    },
    {
      label: 'Six-hour signal clustering',
      description: 'Duplicate signals within a six-hour window are suppressed automatically. You see one clean signal, not noise.',
    },
  ];

  return (
    <section className="py-24 px-6 section-divider">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-refinex-primary mb-4">Built for engineers who distrust black boxes</h2>
          <p className="text-refinex-secondary max-w-xl">Every signal decision is logged. Every suppression is explained. You can audit the system at any point.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.label} className="p-6 rounded-xl card-border" style={{ background: '#0F172A' }}>
              <div className="w-1.5 h-6 rounded-full mb-4" style={{ background: '#2563EB' }} />
              <h3 className="text-refinex-primary font-semibold mb-2">{f.label}</h3>
              <p className="text-refinex-secondary text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
