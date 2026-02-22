'use client';

export default function IntegrationBar() {
  const integrations = ['AWS', 'Kubernetes', 'Terraform', 'Datadog', 'Grafana', 'PagerDuty', 'n8n'];

  return (
    <section className="py-12 px-6 section-divider">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-xs font-medium tracking-widest uppercase text-refinex-muted mb-8">
          Works with your existing stack
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {integrations.map((name) => (
            <span key={name}
              className="text-sm font-semibold tracking-wide transition-colors duration-200"
              style={{ color: '#475569' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#94A3B8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
