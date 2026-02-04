'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What exactly does 3RK scan?',
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
      <h2 className="text-display-sm sm:text-display-md text-center mb-8 text-gray-900 text-shadow-heading">
        Frequently Asked Questions
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={clsx(
              'bg-white border rounded-xl overflow-hidden shadow-card transition-all duration-200',
              openIndex === index ? 'border-primary/30' : 'border-gray-200'
            )}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
            >
              <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={clsx(
                  'flex-shrink-0 transition-colors',
                  openIndex === index ? 'text-primary' : 'text-gray-400'
                )}
              >
                <ChevronDown size={20} />
              </motion.div>
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
