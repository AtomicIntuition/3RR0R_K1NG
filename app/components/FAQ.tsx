'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What exactly does Crisp scan?',
    answer: 'We run 50+ checks across 5 categories: Security (headers, HTTPS, vulnerabilities), Performance (Core Web Vitals, load times), SEO (meta tags, structure, crawlability), Accessibility (WCAG compliance, screen reader support), and Code Quality (errors, best practices). You get a detailed report with actionable fixes.',
  },
  {
    question: 'Is my website data safe?',
    answer: "We only scan publicly accessible pages - the same thing any visitor would see. We don't store your source code, and scan results are only visible to you (unless you share them). We never sell or share your data.",
  },
  {
    question: 'How is this different from Lighthouse?',
    answer: "Lighthouse is great, but it's just performance. We combine Lighthouse with security audits, SEO analysis, accessibility checks, and code quality scanning - then have AI generate actionable recommendations with specific fixes you can implement immediately.",
  },
  {
    question: 'What do I get with Pro?',
    answer: '200 scans/month, priority queue (2x faster), site monitoring with daily scans and email alerts, API access for CI/CD integration, and the CLI tool. Free users get 3 scans/day with standard queue.',
  },
  {
    question: 'Can I use this in my CI/CD pipeline?',
    answer: 'Yes! Pro users get API access and our CLI tool. Run scans from GitHub Actions, GitLab CI, or any pipeline. Fail builds if scores drop below your threshold.',
  },
  {
    question: 'How accurate are the audits?',
    answer: "We use industry-standard tools: Lighthouse for performance, axe-core for accessibility, and custom security scanners. Run us through our own scanner - we score 95+. We practice what we preach.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-display-sm sm:text-display-md text-center mb-8 text-gray-50 text-shadow-heading">
        Frequently Asked Questions
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={clsx(
              'bg-gray-900 border rounded-xl overflow-hidden transition-all duration-200',
              openIndex === index ? 'border-emerald-500/30' : 'border-gray-800'
            )}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
            >
              <span className="font-medium text-gray-50 pr-4">{faq.question}</span>
              <div
                className={clsx(
                  'flex-shrink-0 transition-transform duration-200',
                  openIndex === index ? 'rotate-180 text-emerald-500' : 'text-gray-400'
                )}
              >
                <ChevronDown size={20} />
              </div>
            </button>

            {/* CSS grid-rows accordion for smooth height animation */}
            <div
              className={clsx(
                'grid transition-[grid-template-rows] duration-300 ease-out',
                openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800 pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
