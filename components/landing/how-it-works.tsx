const steps = [
  {
    step: '01',
    title: 'Connect Your Site',
    description: 'Add your domain and install a lightweight script. Takes less than 2 minutes to set up.',
  },
  {
    step: '02',
    title: 'AI Analyzes Everything',
    description: 'Our engine scans your site, identifies optimization opportunities, and builds a baseline model.',
  },
  {
    step: '03',
    title: 'Autonomous Optimization',
    description: 'cr0n continuously tests and implements improvements. Conversions and search rankings grow on autopilot.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-cr0n-violet">How It Works</p>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Three steps to <span className="text-gradient">autonomous growth</span>
          </h2>
          <p className="text-gray-400">
            Set it up once. Let cr0n handle the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((item, i) => (
            <div key={item.step} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-8 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-cr0n-cyan/30 to-transparent md:block" />
              )}

              <div className="relative rounded-2xl border border-border/50 bg-surface/30 p-6">
                <span className="mb-4 inline-block font-mono text-3xl font-bold text-cr0n-cyan/30">
                  {item.step}
                </span>
                <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
