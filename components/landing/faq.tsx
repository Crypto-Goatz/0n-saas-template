'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What is 0n?',
    answer: '0n is an autonomous growth engine that combines conversion rate optimization (CRO) and search experience optimization (SXO) into one self-learning AI system. It continuously optimizes your site for better conversions and search performance.',
  },
  {
    question: 'How does the AI optimization work?',
    answer: '0n uses machine learning models trained on conversion and search behavior data. It automatically identifies optimization opportunities, tests improvements, and implements winning changes — all without manual intervention.',
  },
  {
    question: 'Do I need technical knowledge to use 0n?',
    answer: 'No. 0n is designed to be plug-and-play. Simply add your domain, install a lightweight script, and the AI handles everything else. No coding or marketing expertise required.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes. All plans are month-to-month with no long-term contracts. You can upgrade, downgrade, or cancel at any time from your billing settings.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! The Free plan lets you optimize one site with basic features at no cost. Pro and Enterprise plans include a free trial period so you can experience the full power of 0n risk-free.',
  },
  {
    question: 'What kind of results can I expect?',
    answer: 'Results vary by site, but our customers typically see 20-50% improvement in conversion rates within the first 30 days. Search ranking improvements usually start appearing within 2-4 weeks.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border/30">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-sm font-medium text-white sm:text-base">{question}</span>
        <ChevronDown
          className={cn('ml-4 h-4 w-4 shrink-0 text-subtle transition-transform', open && 'rotate-180')}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-200',
          open ? 'grid-rows-[1fr] pb-5' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-gray-400">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export function FAQ() {
  return (
    <section id="faq" className="py-20 lg:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-cr0n-cyan">FAQ</p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Frequently asked <span className="text-gradient">questions</span>
          </h2>
        </div>

        <div>
          {faqs.map((faq) => (
            <FAQItem key={faq.question} {...faq} />
          ))}
        </div>
      </div>
    </section>
  )
}
