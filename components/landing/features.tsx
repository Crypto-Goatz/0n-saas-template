import { Card } from '@/components/ui/card'
import {
  Zap,
  BarChart3,
  Search,
  Brain,
  Shield,
  Globe,
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Autonomous CRO',
    description: 'AI-powered conversion rate optimization that tests, learns, and improves automatically. No manual A/B testing required.',
    color: 'text-cr0n-cyan',
    bg: 'bg-cr0n-cyan/10',
  },
  {
    icon: Search,
    title: 'SXO Engine',
    description: 'Search experience optimization that combines SEO with UX. Improve rankings while delivering better user experiences.',
    color: 'text-cr0n-violet',
    bg: 'bg-cr0n-violet/10',
  },
  {
    icon: Brain,
    title: 'Self-Learning AI',
    description: 'Machine learning models that continuously improve based on real user behavior and conversion data.',
    color: 'text-cr0n-cyan',
    bg: 'bg-cr0n-cyan/10',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Live dashboards showing conversion metrics, search performance, and optimization impact in real-time.',
    color: 'text-cr0n-violet',
    bg: 'bg-cr0n-violet/10',
  },
  {
    icon: Globe,
    title: 'Multi-Site Management',
    description: 'Manage optimization across all your sites from a single dashboard. Scale without complexity.',
    color: 'text-cr0n-cyan',
    bg: 'bg-cr0n-cyan/10',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with encrypted data, role-based access, and audit logging built in.',
    color: 'text-cr0n-violet',
    bg: 'bg-cr0n-violet/10',
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-cr0n-cyan">Features</p>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Everything you need to <span className="text-gradient">grow faster</span>
          </h2>
          <p className="text-gray-400">
            A complete optimization platform that handles CRO and SXO in one unified system.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} hover className="group">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} transition-transform group-hover:scale-110`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-gray-400">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
