import { Card } from '@/components/ui/card'

const testimonials = [
  {
    quote: "cr0n increased our conversion rate by 47% in the first month. The autonomous optimization is game-changing.",
    author: 'Sarah Chen',
    role: 'Head of Growth, TechScale',
  },
  {
    quote: "We replaced 3 separate tools with cr0n. CRO and SXO in one place — it just makes sense.",
    author: 'Marcus Rodriguez',
    role: 'CEO, DataFlow',
  },
  {
    quote: "The self-learning AI actually gets better over time. Our search rankings improved without any manual SEO work.",
    author: 'Emily Nakamura',
    role: 'Marketing Director, CloudPeak',
  },
]

export function Testimonials() {
  return (
    <section className="py-20 lg:py-32 bg-dark/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-cr0n-violet">Testimonials</p>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Trusted by <span className="text-gradient">growth teams</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.author} hover>
              <blockquote className="mb-4 text-sm leading-relaxed text-gray-300">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div>
                <p className="text-sm font-semibold text-white">{t.author}</p>
                <p className="text-xs text-subtle">{t.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
