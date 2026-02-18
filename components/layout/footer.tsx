import Link from 'next/link'

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-dark/50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cr0n-cyan to-cr0n-violet">
                <span className="text-sm font-bold text-void">0</span>
              </div>
              <span className="text-lg font-bold text-white">
                cr<span className="text-cr0n-cyan">0</span>n
              </span>
            </Link>
            <p className="mt-3 text-sm text-subtle">
              The Autonomous Growth Engine.
              <br />
              CRO + SXO combined.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-sm font-semibold text-white">{group.title}</p>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-subtle hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border/30 pt-6 text-center text-xs text-subtle">
          &copy; {new Date().getFullYear()} cr0n. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
