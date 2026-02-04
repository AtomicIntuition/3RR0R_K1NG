'use client';

import { memo } from 'react';
import clsx from 'clsx';

interface Step {
  number: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
}

// Custom illustrated icons for each step
const URLIllustration = () => (
  <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
    {/* Browser window */}
    <rect x="10" y="15" width="60" height="50" rx="6" fill="#F5F5F7" stroke="#E5E7EB" strokeWidth="2"/>
    {/* Browser header */}
    <rect x="10" y="15" width="60" height="12" rx="6" fill="#FAFAFA"/>
    <rect x="10" y="21" width="60" height="6" fill="#FAFAFA"/>
    {/* Traffic lights */}
    <circle cx="18" cy="21" r="2" fill="#FF5F57"/>
    <circle cx="25" cy="21" r="2" fill="#FEBC2E"/>
    <circle cx="32" cy="21" r="2" fill="#28C840"/>
    {/* URL bar */}
    <rect x="16" y="33" width="48" height="8" rx="4" fill="white" stroke="#E5E7EB"/>
    {/* Globe icon */}
    <circle cx="22" cy="37" r="2" stroke="#0071E3" strokeWidth="1.5" fill="none"/>
    <path d="M20 37h4M22 35v4" stroke="#0071E3" strokeWidth="0.75"/>
    {/* URL text line */}
    <rect x="27" y="35" width="32" height="4" rx="2" fill="#0071E3" fillOpacity="0.2"/>
    {/* Content lines */}
    <rect x="16" y="48" width="32" height="3" rx="1.5" fill="#E5E7EB"/>
    <rect x="16" y="54" width="24" height="3" rx="1.5" fill="#E5E7EB"/>
  </svg>
);

const ScanIllustration = () => (
  <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
    {/* Radar circle */}
    <circle cx="40" cy="40" r="28" stroke="#E5E7EB" strokeWidth="2" fill="#F5F5F7"/>
    <circle cx="40" cy="40" r="20" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4" fill="none"/>
    <circle cx="40" cy="40" r="12" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2 2" fill="none"/>
    {/* Radar sweep */}
    <path d="M40 40L40 12" stroke="#0071E3" strokeWidth="2" strokeLinecap="round">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 40 40"
        to="360 40 40"
        dur="3s"
        repeatCount="indefinite"
      />
    </path>
    {/* Sweep gradient */}
    <path d="M40 40L68 40A28 28 0 0040 12Z" fill="url(#sweepGradient)">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 40 40"
        to="360 40 40"
        dur="3s"
        repeatCount="indefinite"
      />
    </path>
    <defs>
      <linearGradient id="sweepGradient" x1="40" y1="40" x2="68" y2="40">
        <stop offset="0%" stopColor="#0071E3" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#0071E3" stopOpacity="0"/>
      </linearGradient>
    </defs>
    {/* Detection dots */}
    <circle cx="52" cy="32" r="3" fill="#34C759">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="30" cy="50" r="3" fill="#FF9500">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" begin="0.5s"/>
    </circle>
    <circle cx="55" cy="48" r="3" fill="#FF3B30">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" begin="1s"/>
    </circle>
    {/* Center dot */}
    <circle cx="40" cy="40" r="4" fill="#0071E3"/>
  </svg>
);

const AIIllustration = () => (
  <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
    {/* Brain outline */}
    <path
      d="M40 16C28 16 20 26 20 36C20 42 23 47 28 50V58C28 60 30 62 32 62H48C50 62 52 60 52 58V50C57 47 60 42 60 36C60 26 52 16 40 16Z"
      fill="#F5F5F7"
      stroke="#E5E7EB"
      strokeWidth="2"
    />
    {/* Neural connections */}
    <circle cx="32" cy="32" r="4" fill="#0071E3" fillOpacity="0.2" stroke="#0071E3" strokeWidth="1.5"/>
    <circle cx="48" cy="32" r="4" fill="#0071E3" fillOpacity="0.2" stroke="#0071E3" strokeWidth="1.5"/>
    <circle cx="40" cy="42" r="4" fill="#0071E3" fillOpacity="0.2" stroke="#0071E3" strokeWidth="1.5"/>
    <circle cx="34" cy="48" r="3" fill="#34C759" fillOpacity="0.2" stroke="#34C759" strokeWidth="1"/>
    <circle cx="46" cy="48" r="3" fill="#34C759" fillOpacity="0.2" stroke="#34C759" strokeWidth="1"/>
    {/* Connection lines */}
    <line x1="32" y1="32" x2="40" y2="42" stroke="#0071E3" strokeWidth="1.5" strokeDasharray="2 2">
      <animate attributeName="stroke-dashoffset" from="0" to="8" dur="1s" repeatCount="indefinite"/>
    </line>
    <line x1="48" y1="32" x2="40" y2="42" stroke="#0071E3" strokeWidth="1.5" strokeDasharray="2 2">
      <animate attributeName="stroke-dashoffset" from="0" to="8" dur="1s" repeatCount="indefinite"/>
    </line>
    <line x1="32" y1="32" x2="48" y2="32" stroke="#0071E3" strokeWidth="1" strokeDasharray="2 2">
      <animate attributeName="stroke-dashoffset" from="0" to="8" dur="1s" repeatCount="indefinite"/>
    </line>
    {/* Sparkles */}
    <path d="M24 24l2 4 2-4-2-4-2 4z" fill="#0071E3">
      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite"/>
    </path>
    <path d="M56 28l1.5 3 1.5-3-1.5-3-1.5 3z" fill="#0071E3">
      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.7s"/>
    </path>
  </svg>
);

const ReportIllustration = () => (
  <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
    {/* Document */}
    <rect x="16" y="12" width="48" height="56" rx="4" fill="#F5F5F7" stroke="#E5E7EB" strokeWidth="2"/>
    {/* Header */}
    <rect x="22" y="18" width="20" height="4" rx="2" fill="#1D1D1F"/>
    {/* Score badge */}
    <rect x="48" y="16" width="12" height="8" rx="4" fill="#34C759"/>
    <text x="54" y="22" fontSize="6" fill="white" textAnchor="middle" fontWeight="bold">87</text>
    {/* Chart bars */}
    <rect x="22" y="30" width="8" height="20" rx="2" fill="#34C759" fillOpacity="0.3"/>
    <rect x="22" y="38" width="8" height="12" rx="2" fill="#34C759"/>
    <rect x="33" y="30" width="8" height="20" rx="2" fill="#FF9500" fillOpacity="0.3"/>
    <rect x="33" y="42" width="8" height="8" rx="2" fill="#FF9500"/>
    <rect x="44" y="30" width="8" height="20" rx="2" fill="#0071E3" fillOpacity="0.3"/>
    <rect x="44" y="34" width="8" height="16" rx="2" fill="#0071E3"/>
    <rect x="55" y="30" width="8" height="20" rx="2" fill="#34C759" fillOpacity="0.3"/>
    <rect x="55" y="36" width="8" height="14" rx="2" fill="#34C759"/>
    {/* Fix items */}
    <rect x="22" y="54" width="36" height="4" rx="2" fill="#E5E7EB"/>
    <rect x="22" y="60" width="28" height="4" rx="2" fill="#E5E7EB"/>
    {/* Checkmark badge */}
    <circle cx="64" cy="56" r="8" fill="#34C759"/>
    <path d="M60 56l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const steps: Step[] = [
  {
    number: '01',
    title: 'Enter URL',
    description: 'Paste any website URL you want to audit',
    illustration: <URLIllustration />,
  },
  {
    number: '02',
    title: 'Automated Audit',
    description: 'Our system scans security, performance, SEO, and accessibility',
    illustration: <ScanIllustration />,
  },
  {
    number: '03',
    title: 'AI Analysis',
    description: 'Claude AI generates actionable insights and recommendations',
    illustration: <AIIllustration />,
  },
  {
    number: '04',
    title: 'Get Report',
    description: 'Review detailed findings with prioritized fixes',
    illustration: <ReportIllustration />,
  },
];

export const TerminalDemo = memo(function TerminalDemo() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className={clsx(
              'relative bg-white rounded-2xl border border-gray-200 p-6',
              'transition-all duration-300 hover:shadow-card hover:border-primary/30',
              'animate-fade-in group'
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Step number */}
            <div className="text-xs font-semibold text-primary mb-4">
              Step {step.number}
            </div>

            {/* Illustration */}
            <div className="w-20 h-20 mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
              {step.illustration}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-800 mb-2 text-center">
              {step.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed text-center">
              {step.description}
            </p>

            {/* Connector line (hidden on mobile and last item) */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-gray-200 to-gray-100" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

// Alias for clarity
export const HowItWorks = TerminalDemo;
