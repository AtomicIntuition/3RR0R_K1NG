import Anthropic from '@anthropic-ai/sdk';
import type { SecurityFinding } from './audits/security.js';
import type { PerformanceMetric } from './audits/performance.js';
import type { SeoFinding } from './audits/seo.js';
import type { AccessibilityViolation } from './audits/accessibility.js';
import type { CodeQualityIssue } from './audits/codeQuality.js';
import type { TechStackItem } from './audits/techStack.js';
import type { ResourceAnalysis, ResourceIssue } from './audits/resources.js';
import type { VulnerabilityAuditResult } from './audits/vulnerabilities.js';
import type { ProtocolInfo } from './audits/protocol.js';
import type { ImageAuditResult } from './audits/images.js';
import type { CacheAuditResult } from './audits/caching.js';
import type { RedirectAuditResult } from './audits/redirects.js';
// Phase 3 audit types
import type { PWAAuditResult } from './audits/pwa.js';
import type { StructuredDataAuditResult } from './audits/structuredData.js';
import type { LinkAuditResult } from './audits/links.js';
// Phase 2 audit types
import type { DependencyAuditResult } from './audits/dependencies.js';
import type { SecretsAuditResult } from './audits/secrets.js';
import type { CodePatternsAuditResult } from './audits/codePatterns.js';

export interface RoastFix {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'performance' | 'security' | 'seo' | 'accessibility' | 'code_quality';
  title: string;
  description: string;
  effort: 'quick' | 'medium' | 'significant';
}

export interface RoastResult {
  title: string;
  body: string;
  fixes: RoastFix[];
  twitterRoast?: string; // Short 280-char roast for Twitter sharing
  llmReport?: string; // LLM-ready detailed report
  isFallback?: boolean; // Track if AI generation failed
  fallbackReason?: string; // Why AI failed (for debugging)
  persona?: RoastPersona; // Which persona generated this roast
}

// ============================================
// Analysis Configuration - Professional Voice
// ============================================

export type RoastPersona = 'professional';

export interface PersonaConfig {
  id: RoastPersona;
  name: string;
  description: string;
  icon: string; // Icon identifier for UI
  prompt: string;
}

export const ROAST_PERSONAS: Record<RoastPersona, PersonaConfig> = {
  professional: {
    id: 'professional',
    name: 'Crisp Analysis',
    description: 'Professional website audit with actionable insights',
    icon: 'chart',
    prompt: `You are a senior web development consultant providing professional website audits. Your analysis is thorough, objective, and focused on actionable improvements. You communicate clearly without jargon, explain the business impact of issues, and prioritize recommendations by severity. Your tone is professional but approachable - direct without being harsh.`,
  },
};

export interface RoastInput {
  url: string;
  scores: {
    overall: number;
    letterGrade: string;
    performance: number;
    security: number;
    seo: number;
    accessibility: number;
    codeQuality: number;
  };
  scoringBreakdown?: {
    category: string;
    score: number;
    weight: number;
    contribution: number;
  }[];
  securityFindings: SecurityFinding[];
  performanceMetrics: PerformanceMetric[];
  seoFindings: SeoFinding[];
  accessibilityViolations: AccessibilityViolation[];
  codeQualityIssues: CodeQualityIssue[];
  techStack: TechStackItem[];
  resourceAnalysis?: ResourceAnalysis;
  // Phase 1 new audits
  vulnerabilities?: VulnerabilityAuditResult;
  protocol?: ProtocolInfo;
  images?: ImageAuditResult;
  caching?: CacheAuditResult;
  redirects?: RedirectAuditResult;
  // Phase 3 new audits
  pwa?: PWAAuditResult;
  structuredData?: StructuredDataAuditResult;
  links?: LinkAuditResult;
  // Analysis style (kept for backwards compatibility)
  persona?: RoastPersona;
}

/**
 * Generate an LLM-ready report that can be pasted directly into Claude/GPT for fixing
 * Exported for use in Quick Audit mode (no AI needed)
 */
export function generateLLMReport(input: RoastInput): string {
  const failedSecurity = input.securityFindings.filter(f => !f.passed);
  const failedSeo = input.seoFindings.filter(f => !f.passed);

  let report = `# Website Audit Report - LLM Fix Instructions
## URL: ${input.url}
## Overall Score: ${input.scores.overall}/100 (Grade: ${input.scores.letterGrade})

### COMPREHENSIVE SCORING BREAKDOWN
${input.scoringBreakdown?.map(c => `- **${c.category}:** ${c.score}/100 (${c.weight}% weight, contributes ${c.contribution} points)`).join('\n') || `- Performance: ${input.scores.performance}/100
- Security: ${input.scores.security}/100
- SEO: ${input.scores.seo}/100
- Accessibility: ${input.scores.accessibility}/100
- Code Quality: ${input.scores.codeQuality}/100`}

### TECH STACK DETECTED
${input.techStack.map(t => `- ${t.name} (${t.category}, ${t.confidence}% confidence)`).join('\n') || 'None detected'}

---

## CRITICAL FIXES REQUIRED

`;

  // Security issues with exact details
  if (failedSecurity.length > 0) {
    report += `### SECURITY ISSUES (${failedSecurity.length} issues)\n\n`;
    for (const finding of failedSecurity) {
      report += `#### [${finding.severity.toUpperCase()}] ${finding.title}
- **Problem:** ${finding.description}
- **Fix:** ${finding.recommendation}

`;
    }
  }

  // Accessibility issues with actionable details
  if (input.accessibilityViolations.length > 0) {
    report += `### ACCESSIBILITY ISSUES (${input.accessibilityViolations.length} violations)\n\n`;
    for (const violation of input.accessibilityViolations) {
      const v = violation as any;
      report += `#### [${violation.impact.toUpperCase()}] ${violation.description}
- **Rule:** ${violation.id}
- **Fix:** ${violation.help}
- **Elements Affected:** ${v.nodeCount || v.nodes || 0} elements
- **Reference:** ${violation.helpUrl}

`;
      // Add detailed actionable info for each element
      if (v.affectedElements?.length > 0) {
        report += `**ACTIONABLE FIXES:**\n\n`;
        for (const elem of v.affectedElements.slice(0, 5)) {
          report += `**Element:** \`${elem.textContent || 'No text'}\`\n`;
          report += `- **Search for:** \`"${elem.textContent}"\` in your codebase\n`;
          report += `- **HTML:** \`${elem.html.slice(0, 200)}\`\n`;

          // Color contrast specific actionable fix
          if (elem.colorData) {
            report += `- **Current Color:** \`${elem.colorData.fgColor}\` on \`${elem.colorData.bgColor}\`\n`;
            report += `- **Current Ratio:** ${elem.colorData.contrastRatio.toFixed(2)} (needs ${elem.colorData.expectedRatio})\n`;
            report += `- **FIX: Change color to** \`${elem.colorData.suggestedFgColor}\`\n`;

            // Tailwind-specific suggestion
            if (elem.colorData.fgColor === '#6b7280') {
              report += `- **Tailwind Fix:** Change \`text-gray-500\` to \`text-gray-400\` or \`text-gray-300\`\n`;
            } else if (elem.colorData.fgColor === '#9ca3af') {
              report += `- **Tailwind Fix:** Change \`text-gray-400\` to \`text-gray-300\`\n`;
            }
          }
          report += `\n`;
        }
      }
    }
  }

  // SEO issues
  if (failedSeo.length > 0) {
    report += `### SEO ISSUES (${failedSeo.length} issues)\n\n`;
    for (const finding of failedSeo) {
      report += `#### ${finding.title}
- **Problem:** ${finding.description}
${finding.value ? `- **Current Value:** \`${finding.value}\`` : ''}

`;
    }
  }

  // Code quality issues with actionable context
  if (input.codeQualityIssues.length > 0) {
    report += `### CODE QUALITY ISSUES (${input.codeQualityIssues.length} issues)\n\n`;
    for (const issue of input.codeQualityIssues) {
      report += `#### [${issue.type.toUpperCase()}] ${issue.message}\n`;
      report += `- **Count:** ${issue.count}\n`;
      if (issue.source) {
        report += `- **Source/Location:** \`${issue.source}\`\n`;
      }

      // Add actionable fix suggestions based on issue type
      if (issue.type === 'console_error') {
        if (issue.message.includes('RSC payload') || issue.message.includes('Falling back to browser')) {
          report += `- **FIX:** This is a Next.js React Server Components issue. Check:\n`;
          report += `  1. Server component errors in your app/ pages\n`;
          report += `  2. CSP headers blocking RSC fetches (add your domain to connect-src)\n`;
          report += `  3. Middleware interfering with RSC routes\n`;
        } else if (issue.message.includes('404') || issue.message.includes('not found')) {
          report += `- **FIX:** A resource is missing. Check the URL in the error and ensure the file exists.\n`;
        } else if (issue.message.includes('fonts.googleapis.com') || issue.message.includes('Refused to connect')) {
          report += `- **FIX:** CSP is blocking this connection. Add the domain to your Content-Security-Policy connect-src directive.\n`;
        }
      } else if (issue.type === 'broken_link') {
        report += `- **FIX:** Create the missing pages or update the links to valid URLs.\n`;
        report += `- **Broken URLs:** ${issue.source}\n`;
      }
      report += `\n`;
    }
  }

  // Performance metrics
  report += `### PERFORMANCE METRICS\n\n`;
  for (const metric of input.performanceMetrics) {
    const status = metric.score >= 90 ? '[PASS]' : metric.score >= 50 ? '[WARN]' : '[FAIL]';
    report += `- ${status} **${metric.name}:** ${metric.displayValue} (score: ${metric.score}/100)\n`;
  }

  // Resource analysis (third-party, waterfall)
  if (input.resourceAnalysis) {
    const ra = input.resourceAnalysis;
    report += `\n### RESOURCE ANALYSIS\n\n`;
    report += `**Overview:**\n`;
    report += `- Total Resources: ${ra.totalResources}\n`;
    report += `- Total Page Weight: ${(ra.totalSize / 1024).toFixed(1)}KB\n`;
    report += `- First-Party: ${ra.firstParty.count} resources (${(ra.firstParty.size / 1024).toFixed(1)}KB)\n`;
    report += `- Third-Party: ${ra.thirdParty.count} resources (${(ra.thirdParty.size / 1024).toFixed(1)}KB)\n\n`;

    if (ra.thirdParty.domains.length > 0) {
      report += `**Third-Party Domains (by impact):**\n\n`;
      for (const domain of ra.thirdParty.domains.slice(0, 5)) {
        const impactLabel = domain.impact === 'high' ? '[HIGH]' : domain.impact === 'medium' ? '[MED]' : '[LOW]';
        report += `${impactLabel} **${domain.domain}** (${domain.category || 'unknown'})\n`;
        report += `   - Resources: ${domain.resourceCount}, Size: ${(domain.totalSize / 1024).toFixed(1)}KB, Time: ${domain.totalDuration.toFixed(0)}ms\n`;
      }
      report += `\n`;
    }

    if (ra.renderBlocking.scripts.length > 0 || ra.renderBlocking.stylesheets.length > 0) {
      report += `**Render-Blocking Resources:**\n`;
      for (const script of ra.renderBlocking.scripts.slice(0, 3)) {
        report += `- Script: \`${script.url.split('/').pop()}\` (${script.duration.toFixed(0)}ms)\n`;
      }
      for (const style of ra.renderBlocking.stylesheets.slice(0, 3)) {
        report += `- CSS: \`${style.url.split('/').pop()}\` (${style.duration.toFixed(0)}ms)\n`;
      }
      report += `\n`;
    }

    if (ra.issues.length > 0) {
      report += `**Resource Issues:**\n\n`;
      for (const issue of ra.issues) {
        report += `#### [${issue.severity.toUpperCase()}] ${issue.title}\n`;
        report += `- ${issue.description}\n`;
        report += `- **FIX:** ${issue.recommendation}\n`;
        if (issue.affectedResources && issue.affectedResources.length > 0) {
          report += `- Affected: ${issue.affectedResources.slice(0, 3).join(', ')}\n`;
        }
        report += `\n`;
      }
    }
  }

  // === Phase 1 New Audits ===

  // Vulnerable Libraries
  if (input.vulnerabilities && input.vulnerabilities.vulnerableLibraries.length > 0) {
    report += `\n### VULNERABLE LIBRARIES (${input.vulnerabilities.vulnerableLibraries.length} found)\n\n`;
    for (const lib of input.vulnerabilities.vulnerableLibraries) {
      report += `#### ${lib.name} v${lib.detectedVersion}\n`;
      for (const vuln of lib.vulnerabilities) {
        report += `- **[${vuln.severity.toUpperCase()}]** ${vuln.description}\n`;
        if (vuln.cve) {
          report += `  - CVE: ${vuln.cve}\n`;
        }
        report += `  - Fixed in: ${vuln.fixedIn}\n`;
        report += `  - **Action:** ${vuln.recommendation}\n`;
      }
      report += `\n`;
    }
  }

  // Protocol Analysis
  if (input.protocol) {
    report += `\n### PROTOCOL ANALYSIS\n\n`;
    report += `- **HTTP Version:** ${input.protocol.httpVersion}\n`;
    report += `- **HTTP/2 Supported:** ${input.protocol.http2Supported ? 'Yes' : 'No'}\n`;
    report += `- **HTTP/3 (QUIC):** ${input.protocol.http3Supported ? 'Yes' : 'No'}\n`;
    if (input.protocol.alpn) {
      report += `- **ALPN Protocol:** ${input.protocol.alpn}\n`;
    }
    if (input.protocol.recommendations.length > 0 && !input.protocol.recommendations[0].includes('optimal')) {
      report += `\n**Recommendations:**\n`;
      for (const rec of input.protocol.recommendations) {
        report += `- ${rec}\n`;
      }
    }
    report += `\n`;
  }

  // Image Optimization
  if (input.images && input.images.issues.length > 0) {
    report += `\n### IMAGE OPTIMIZATION (${input.images.issues.length} issues)\n\n`;
    report += `- **Total Images:** ${input.images.totalImages}\n`;
    report += `- **Total Size:** ${(input.images.totalSize / 1024).toFixed(1)}KB\n`;
    report += `- **Potential Savings:** ${(input.images.optimizationPotential / 1024).toFixed(1)}KB\n\n`;

    const highPriority = input.images.issues.filter(i => i.severity === 'high');
    const mediumPriority = input.images.issues.filter(i => i.severity === 'medium');

    if (highPriority.length > 0) {
      report += `**High Priority:**\n`;
      for (const issue of highPriority.slice(0, 3)) {
        report += `- ${issue.src.split('/').pop()}: ${issue.issues.join(', ')}\n`;
        for (const rec of issue.recommendations.slice(0, 2)) {
          report += `  - ${rec}\n`;
        }
      }
    }

    if (mediumPriority.length > 0) {
      report += `\n**Medium Priority:**\n`;
      for (const issue of mediumPriority.slice(0, 3)) {
        report += `- ${issue.src.split('/').pop()}: ${issue.issues.join(', ')}\n`;
      }
    }
    report += `\n`;
  }

  // Cache Analysis
  if (input.caching && input.caching.issues.length > 0) {
    report += `\n### CACHE HEADERS (${input.caching.issues.length} issues)\n\n`;
    report += `- **Cached Resources:** ${input.caching.summary.cached}/${input.caching.summary.totalResources}\n`;
    report += `- **Long Cache (>1 week):** ${input.caching.summary.longCache}\n`;
    report += `- **With Immutable:** ${input.caching.summary.immutable}\n\n`;

    for (const issue of input.caching.issues.slice(0, 5)) {
      report += `#### [${issue.severity.toUpperCase()}] ${issue.type} - ${issue.url.split('/').pop()}\n`;
      report += `- ${issue.description}\n`;
      report += `- **Fix:** ${issue.recommendation}\n\n`;
    }
  }

  // Redirect Chain
  if (input.redirects && input.redirects.totalRedirects > 0) {
    report += `\n### REDIRECT CHAIN (${input.redirects.totalRedirects} redirects, ${input.redirects.totalTime}ms)\n\n`;
    report += `\`\`\`\n`;
    for (const hop of input.redirects.redirectChain) {
      const status = hop.statusCode >= 300 && hop.statusCode < 400 ? `(${hop.statusCode})` : `(${hop.statusCode})`;
      report += `${hop.url} ${status} - ${hop.duration}ms\n`;
      if (hop.location) {
        report += `  → ${hop.location}\n`;
      }
    }
    report += `\`\`\`\n\n`;

    if (input.redirects.issues.length > 0) {
      for (const issue of input.redirects.issues) {
        report += `- **[${issue.severity.toUpperCase()}]** ${issue.description}\n`;
        report += `  - ${issue.recommendation}\n`;
      }
    }

    if (input.redirects.finalUrl !== input.url) {
      report += `\n**Recommended:** Update links to use final URL directly: \`${input.redirects.finalUrl}\`\n`;
    }
    report += `\n`;
  }

  // === Phase 3 New Audits ===

  // PWA Analysis
  if (input.pwa) {
    report += `\n### PWA ANALYSIS (Score: ${input.pwa.score}/100)\n\n`;
    report += `- **Installable:** ${input.pwa.installable ? 'Yes' : 'No'}\n`;
    report += `- **HTTPS:** ${input.pwa.checks.https ? 'Yes' : 'No'}\n`;
    report += `- **Manifest:** ${input.pwa.checks.manifest.exists ? (input.pwa.checks.manifest.valid ? 'Valid' : 'Invalid') : 'Missing'}\n`;
    report += `- **Service Worker:** ${input.pwa.checks.serviceWorker.registered ? 'Registered' : 'Not registered'}\n`;
    report += `- **192x192 Icon:** ${input.pwa.checks.icons.has192 ? 'Yes' : 'No'}\n`;
    report += `- **512x512 Icon:** ${input.pwa.checks.icons.has512 ? 'Yes' : 'No'}\n`;
    report += `- **Theme Color:** ${input.pwa.checks.themeColor ? 'Set' : 'Missing'}\n`;
    report += `- **Viewport:** ${input.pwa.checks.viewport ? 'Set' : 'Missing'}\n\n`;

    if (input.pwa.issues.length > 0) {
      report += `**Issues:**\n`;
      for (const issue of input.pwa.issues) {
        report += `- **[${issue.severity.toUpperCase()}]** ${issue.description}\n`;
        report += `  - ${issue.recommendation}\n`;
      }
      report += `\n`;
    }

    if (input.pwa.recommendations.length > 0) {
      report += `**Recommendations:**\n`;
      for (const rec of input.pwa.recommendations) {
        report += `- ${rec}\n`;
      }
      report += `\n`;
    }
  }

  // Structured Data Analysis
  if (input.structuredData) {
    report += `\n### STRUCTURED DATA (Score: ${input.structuredData.score}/100)\n\n`;
    report += `- **Found:** ${input.structuredData.found ? 'Yes' : 'No'}\n`;
    report += `- **JSON-LD Blocks:** ${input.structuredData.jsonLdCount}\n`;
    report += `- **Microdata Items:** ${input.structuredData.microdataCount}\n`;
    if (input.structuredData.types.length > 0) {
      report += `- **Schema Types:** ${input.structuredData.types.join(', ')}\n`;
    }
    report += `\n`;

    if (input.structuredData.errors.length > 0) {
      const errors = input.structuredData.errors.filter(e => e.severity === 'error');
      const warnings = input.structuredData.errors.filter(e => e.severity === 'warning');

      if (errors.length > 0) {
        report += `**Errors (${errors.length}):**\n`;
        for (const error of errors.slice(0, 5)) {
          report += `- ${error.type}: ${error.message}\n`;
        }
        report += `\n`;
      }

      if (warnings.length > 0) {
        report += `**Warnings (${warnings.length}):**\n`;
        for (const warning of warnings.slice(0, 5)) {
          report += `- ${warning.type}: ${warning.message}\n`;
        }
        report += `\n`;
      }
    }

    if (input.structuredData.recommendations.length > 0) {
      report += `**Recommendations:**\n`;
      for (const rec of input.structuredData.recommendations) {
        report += `- ${rec}\n`;
      }
      report += `\n`;
    }
  }

  // Link Audit
  if (input.links) {
    report += `\n### LINK AUDIT (Score: ${input.links.score}/100)\n\n`;
    report += `- **Total Links:** ${input.links.totalLinks}\n`;
    report += `- **Internal:** ${input.links.internalLinks}\n`;
    report += `- **External:** ${input.links.externalLinks}\n`;
    report += `- **Checked:** ${input.links.checkedLinks}\n\n`;

    if (input.links.brokenLinks.length > 0) {
      report += `**Broken Links (${input.links.brokenLinks.length}):**\n`;
      for (const link of input.links.brokenLinks.slice(0, 5)) {
        report += `- ${link.url} (${link.statusCode || 'connection error'})\n`;
        if (link.error) {
          report += `  - Error: ${link.error}\n`;
        }
      }
      report += `\n`;
    }

    if (input.links.insecureLinks.length > 0) {
      report += `**Insecure HTTP Links (${input.links.insecureLinks.length}):**\n`;
      for (const link of input.links.insecureLinks.slice(0, 5)) {
        report += `- ${link.url}\n`;
      }
      report += `**Fix:** Update all HTTP links to HTTPS or use protocol-relative URLs.\n\n`;
    }

    if (input.links.redirectedLinks.length > 0) {
      const permanentRedirects = input.links.redirectedLinks.filter(l => l.statusCode === 301);
      if (permanentRedirects.length > 0) {
        report += `**Permanent Redirects (${permanentRedirects.length}):**\n`;
        for (const link of permanentRedirects.slice(0, 3)) {
          report += `- ${link.url} → ${link.redirectTo || 'unknown'}\n`;
        }
        report += `**Fix:** Update links to point directly to final URLs.\n\n`;
      }
    }
  }

  // Copy-paste ready code fixes
  report += `\n---\n\n## 📋 COPY-PASTE CODE FIXES\n\n`;
  report += generateCodeFixes(input);

  report += `
---

## INSTRUCTIONS FOR AI ASSISTANT

Please analyze this report and provide specific code fixes for each issue. For each fix:
1. Identify the exact file(s) that need to be modified
2. Provide the exact code changes needed
3. Explain why the change fixes the issue

Prioritize fixes in this order:
1. Critical/High security issues
2. Serious accessibility violations
3. Performance issues under 50
4. SEO issues
5. Code quality issues

Start with the highest priority items and work through the list.`;

  return report;
}

/**
 * Generate copy-paste ready code fixes for common issues
 */
function generateCodeFixes(input: RoastInput): string {
  let fixes = '';
  const failedSecurity = input.securityFindings.filter(f => !f.passed);
  const failedSeo = input.seoFindings.filter(f => !f.passed);

  // Detect framework from tech stack
  const isNextJs = input.techStack.some(t => t.name.toLowerCase().includes('next'));
  const isReact = input.techStack.some(t => t.name.toLowerCase().includes('react'));
  const isVite = input.techStack.some(t => t.name.toLowerCase().includes('vite'));

  // Security header fixes
  const hstsIssue = failedSecurity.find(f => f.id === 'hsts');
  const cspIssue = failedSecurity.find(f => f.id === 'csp');
  const xFrameIssue = failedSecurity.find(f => f.id === 'x-frame-options');

  if (hstsIssue || cspIssue || xFrameIssue) {
    if (isNextJs) {
      fixes += `### Next.js Security Headers (next.config.js)\n\n`;
      fixes += '```javascript\n';
      fixes += `// next.config.js
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
`;
      fixes += '```\n\n';
    } else {
      fixes += `### Apache Security Headers (.htaccess)\n\n`;
      fixes += '```apache\n';
      fixes += `# .htaccess
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Content-Security-Policy "default-src 'self';"
`;
      fixes += '```\n\n';

      fixes += `### Nginx Security Headers (nginx.conf)\n\n`;
      fixes += '```nginx\n';
      fixes += `# Add to server block
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
`;
      fixes += '```\n\n';
    }
  }

  // Meta tag fixes for SEO
  const titleIssue = failedSeo.find(f => f.id === 'title');
  const descIssue = failedSeo.find(f => f.id === 'meta-description');
  const ogIssue = failedSeo.find(f => f.id === 'open-graph');

  if (titleIssue || descIssue || ogIssue) {
    if (isNextJs) {
      fixes += `### Next.js SEO Metadata (app/layout.tsx)\n\n`;
      fixes += '```typescript\n';
      fixes += `// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Your Site Name',
    template: '%s | Your Site Name',
  },
  description: 'Your compelling meta description (150-160 characters)',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yoursite.com',
    siteName: 'Your Site Name',
    title: 'Your Site Name',
    description: 'Description for social sharing',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Your Site Name',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Site Name',
    description: 'Description for Twitter',
    images: ['/og-image.png'],
  },
};
`;
      fixes += '```\n\n';
    } else {
      fixes += `### HTML Meta Tags (head section)\n\n`;
      fixes += '```html\n';
      fixes += `<head>
  <title>Your Page Title | Site Name</title>
  <meta name="description" content="Your compelling meta description (150-160 characters)">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Your Page Title">
  <meta property="og:description" content="Description for social sharing">
  <meta property="og:image" content="https://yoursite.com/og-image.png">
  <meta property="og:url" content="https://yoursite.com">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Your Page Title">
  <meta name="twitter:description" content="Description for Twitter">
  <meta name="twitter:image" content="https://yoursite.com/og-image.png">
</head>
`;
      fixes += '```\n\n';
    }
  }

  // Accessibility color contrast fixes
  const contrastViolations = input.accessibilityViolations.filter(v => v.id === 'color-contrast');
  if (contrastViolations.length > 0) {
    fixes += `### Accessibility: Color Contrast Fixes (CSS)\n\n`;
    fixes += '```css\n';
    fixes += `/* Common Tailwind contrast fixes */
/* Replace text-gray-500 with text-gray-400 for better contrast on dark backgrounds */
/* Replace text-gray-600 with text-gray-400 for light backgrounds */

/* Custom CSS color fixes */
.low-contrast-text {
  /* Before: color: #6b7280 (gray-500) - 4.5:1 ratio needed */
  color: #9ca3af; /* gray-400 - meets contrast requirements */
}

.muted-text {
  /* Before: color: #9ca3af (gray-400) */
  color: #d1d5db; /* gray-300 - for dark backgrounds */
}
`;
    fixes += '```\n\n';
  }

  // Performance fixes for render-blocking
  if (input.resourceAnalysis?.renderBlocking.scripts.length) {
    fixes += `### Performance: Defer Render-Blocking Scripts\n\n`;
    fixes += '```html\n';
    fixes += `<!-- Add defer or async to non-critical scripts -->
<script src="your-script.js" defer></script>

<!-- For analytics, use async -->
<script src="analytics.js" async></script>

<!-- Critical inline scripts can stay, but move non-critical to end of body -->
`;
    fixes += '```\n\n';
  }

  // Third-party preconnect hints
  if (input.resourceAnalysis?.thirdParty.domains.length) {
    const domains = input.resourceAnalysis.thirdParty.domains.slice(0, 5);
    fixes += `### Performance: Preconnect to Third-Party Origins\n\n`;
    fixes += '```html\n';
    fixes += `<!-- Add to <head> for faster third-party loading -->\n`;
    for (const domain of domains) {
      fixes += `<link rel="preconnect" href="https://${domain.domain}" crossorigin>\n`;
      fixes += `<link rel="dns-prefetch" href="https://${domain.domain}">\n`;
    }
    fixes += '```\n\n';
  }

  // SRI fixes for external resources
  const sriIssue = failedSecurity.find(f => f.id === 'sri-missing');
  if (sriIssue && sriIssue.details?.affectedElements) {
    fixes += `### Security: Add Subresource Integrity (SRI)\n\n`;
    fixes += '```html\n';
    fixes += `<!-- Generate SRI hash: https://www.srihash.org/ -->
<!-- Or use: shasum -b -a 384 file.js | awk '{ print $1 }' | xxd -r -p | base64 -->

<script
  src="https://cdn.example.com/library.js"
  integrity="sha384-HASH_HERE"
  crossorigin="anonymous"
></script>

<link
  rel="stylesheet"
  href="https://cdn.example.com/styles.css"
  integrity="sha384-HASH_HERE"
  crossorigin="anonymous"
>
`;
    fixes += '```\n\n';
  }

  if (fixes === '') {
    fixes = '*No critical copy-paste fixes needed - your site is in good shape!*\n\n';
  }

  return fixes;
}

function getAnalysisDepth(score: number): string {
  if (score >= 90) return 'highlight strengths with minor optimization suggestions';
  if (score >= 70) return 'balanced analysis with clear improvement priorities';
  if (score >= 50) return 'detailed analysis focusing on key issues';
  if (score >= 30) return 'comprehensive review with urgent recommendations';
  return 'thorough assessment with critical action items';
}

function buildPrompt(input: RoastInput): string {
  const failedSecurity = input.securityFindings.filter(f => !f.passed);
  const failedSeo = input.seoFindings.filter(f => !f.passed);

  // Use professional analysis voice
  const personaConfig = ROAST_PERSONAS['professional'];

  return `${personaConfig.prompt}

Your analysis should be clear, actionable, and focused on business impact.

WEBSITE: ${input.url}

AUDIT SCORES:
- Overall: ${input.scores.overall}/100
- Performance: ${input.scores.performance}/100
- Security: ${input.scores.security}/100
- SEO: ${input.scores.seo}/100
- Accessibility: ${input.scores.accessibility}/100
- Code Quality: ${input.scores.codeQuality}/100

TECH STACK DETECTED:
${input.techStack.map(t => `- ${t.name} (${t.category})`).join('\n') || 'Unable to detect tech stack'}

SECURITY ISSUES (${failedSecurity.length} failed):
${failedSecurity.map(f => `- [${f.severity.toUpperCase()}] ${f.title}: ${f.description}`).join('\n') || 'None found'}

PERFORMANCE METRICS:
${input.performanceMetrics.map(m => `- ${m.name}: ${m.displayValue} (score: ${m.score})`).join('\n')}

SEO ISSUES (${failedSeo.length} failed):
${failedSeo.map(f => `- ${f.title}: ${f.description}`).join('\n') || 'None found'}

ACCESSIBILITY VIOLATIONS (${input.accessibilityViolations.length}):
${input.accessibilityViolations.slice(0, 5).map(v => `- [${v.impact.toUpperCase()}] ${v.description} (${v.nodeCount} elements)`).join('\n') || 'None found'}

CODE QUALITY ISSUES (${input.codeQualityIssues.length}):
${input.codeQualityIssues.map(i => `- [${i.type}] ${i.message}`).join('\n') || 'None found'}

VULNERABLE LIBRARIES (${input.vulnerabilities?.vulnerableLibraries.length || 0}):
${input.vulnerabilities?.vulnerableLibraries.map(lib => `- ${lib.name} v${lib.detectedVersion}: ${lib.vulnerabilities.map(v => `[${v.severity.toUpperCase()}] ${v.cve || v.description}`).join(', ')}`).join('\n') || 'None detected'}

PROTOCOL:
- HTTP Version: ${input.protocol?.httpVersion || 'Unknown'}
- HTTP/2: ${input.protocol?.http2Supported ? 'Yes' : 'No'}
- HTTP/3: ${input.protocol?.http3Supported ? 'Yes' : 'No'}

IMAGE ISSUES (${input.images?.issues.length || 0}):
${input.images?.issues.slice(0, 3).map(i => `- ${i.issues.join(', ')}`).join('\n') || 'None found'}

REDIRECT CHAIN: ${input.redirects?.totalRedirects || 0} redirects (${input.redirects?.totalTime || 0}ms)

PWA STATUS:
- Installable: ${input.pwa?.installable ? 'Yes' : 'No'}
- Service Worker: ${input.pwa?.checks.serviceWorker.registered ? 'Yes' : 'No'}
- Manifest: ${input.pwa?.checks.manifest.exists ? (input.pwa?.checks.manifest.valid ? 'Valid' : 'Invalid') : 'Missing'}
- Issues: ${input.pwa?.issues.length || 0}

STRUCTURED DATA:
- Found: ${input.structuredData?.found ? 'Yes' : 'No'}
- Types: ${input.structuredData?.types.join(', ') || 'None'}
- Errors: ${input.structuredData?.errors.filter(e => e.severity === 'error').length || 0}

LINKS:
- Total: ${input.links?.totalLinks || 0}
- Broken: ${input.links?.brokenLinks.length || 0}
- Insecure HTTP: ${input.links?.insecureLinks.length || 0}

ANALYSIS DEPTH: ${getAnalysisDepth(input.scores.overall)}

Generate an analysis report in the following JSON format. The analysis should be professional, technically accurate, and include specific references to the actual issues found. Be direct and actionable.

{
  "title": "A clear summary headline (max 80 chars, complete the thought)",
  "body": "2-3 paragraph professional analysis that references specific findings. Start with the overall assessment, highlight key issues, and end with a prioritized recommendation.",
  "twitterRoast": "A concise 280-char summary suitable for sharing. Include the score and key finding.",
  "fixes": [
    {
      "priority": "critical|high|medium|low",
      "category": "performance|security|seo|accessibility|code_quality",
      "title": "Short actionable fix title",
      "description": "Specific technical explanation of what to do",
      "effort": "quick|medium|significant"
    }
  ]
}

RULES:
- Title must be under 80 characters and complete (no cut-off words)
- twitterRoast must be under 280 characters (for sharing)
- Include 3-5 of the most impactful fixes
- Fixes should be ordered by priority (critical first)
- Be specific - reference actual URLs, headers, or metrics found
- If the site scores well (85+), acknowledge strengths while noting areas for improvement
- Use technical terms correctly
- The body should be 100-200 words
- Maintain a professional, consultative tone
- Do NOT use markdown formatting in the body text

Return ONLY the JSON, no other text.`;
}

let anthropicClient: Anthropic | null = null;

const CLAUDE_TIMEOUT_MS = 30000; // 30 second timeout
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Base delay for exponential backoff

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    anthropicClient = new Anthropic({
      apiKey,
      timeout: CLAUDE_TIMEOUT_MS,
    });
  }
  return anthropicClient;
}

/**
 * Extract JSON from Claude's response, handling markdown code fences
 */
function extractJSON(text: string): string | null {
  // First try to extract from markdown code fence
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    const jsonMatch = codeBlockMatch[1].match(/\{[\s\S]*\}/);
    if (jsonMatch) return jsonMatch[0];
  }

  // Fall back to direct JSON extraction
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : null;
}

/**
 * Sleep for exponential backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call Claude API with retry logic
 */
async function callClaudeWithRetry(
  client: Anthropic,
  prompt: string,
  attempt: number = 1
): Promise<{ text: string; error?: string }> {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    return { text: textContent.text };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isRetryable =
      errorMessage.includes('timeout') ||
      errorMessage.includes('rate') ||
      errorMessage.includes('429') ||
      errorMessage.includes('503') ||
      errorMessage.includes('overloaded');

    if (isRetryable && attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(`Claude API attempt ${attempt} failed (${errorMessage}), retrying in ${delay}ms...`);
      await sleep(delay);
      return callClaudeWithRetry(client, prompt, attempt + 1);
    }

    return { text: '', error: errorMessage };
  }
}

export async function generateRoast(input: RoastInput): Promise<RoastResult> {
  const client = getAnthropicClient();
  const prompt = buildPrompt(input);

  // Call Claude with retry logic
  const { text, error } = await callClaudeWithRetry(client, prompt);

  if (error) {
    console.error(`Roast generation failed after ${MAX_RETRIES} attempts:`, error);
    return generateFallbackRoast(input, `API error: ${error}`);
  }

  // Extract JSON (handles markdown code fences)
  const jsonString = extractJSON(text);
  if (!jsonString) {
    console.error('Could not extract JSON from response:', text.slice(0, 200));
    return generateFallbackRoast(input, 'JSON extraction failed');
  }

  // Parse JSON
  let result: RoastResult;
  try {
    result = JSON.parse(jsonString) as RoastResult;
  } catch (parseError) {
    console.error('JSON parse error:', parseError, 'Raw:', jsonString.slice(0, 200));
    return generateFallbackRoast(input, 'JSON parse failed');
  }

  // Validate required fields
  if (!result.title || !result.body || !Array.isArray(result.fixes)) {
    console.error('Invalid roast format - missing required fields');
    return generateFallbackRoast(input, 'Invalid response format');
  }

  // Ensure title is not too long (smart truncate at word boundary)
  if (result.title.length > 80) {
    const truncated = result.title.slice(0, 80);
    const lastSpace = truncated.lastIndexOf(' ');
    result.title = lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated;
  }

  // Ensure twitterRoast is not too long (280 chars for Twitter)
  if (result.twitterRoast) {
    result.twitterRoast = result.twitterRoast.slice(0, 280);
  } else {
    // Generate a default twitter roast from the title and score
    result.twitterRoast = `${input.url.replace(/^https?:\/\//, '')} scored ${input.scores.overall}/100 (${input.scores.letterGrade}). ${result.title}`.slice(0, 280);
  }

  // Validate fixes
  result.fixes = result.fixes.slice(0, 5).map(fix => ({
    priority: ['critical', 'high', 'medium', 'low'].includes(fix.priority)
      ? fix.priority
      : 'medium',
    category: ['performance', 'security', 'seo', 'accessibility', 'code_quality'].includes(fix.category)
      ? fix.category
      : 'security',
    title: String(fix.title).slice(0, 100),
    description: String(fix.description).slice(0, 500),
    effort: ['quick', 'medium', 'significant'].includes(fix.effort)
      ? fix.effort
      : 'medium',
  })) as RoastFix[];

  // Generate LLM-ready report
  result.llmReport = generateLLMReport(input);
  result.isFallback = false;
  result.persona = 'professional';

  console.log('AI analysis generated successfully');
  return result;
}

/**
 * Generate deterministic fixes from audit data (no AI needed)
 * Used for Quick Audit mode
 */
export function generateQuickAuditFixes(input: RoastInput): RoastFix[] {
  const fixes: RoastFix[] = [];

  // Security fixes
  const failedSecurity = input.securityFindings.filter(f => !f.passed);
  for (const finding of failedSecurity.slice(0, 2)) {
    fixes.push({
      priority: finding.severity === 'critical' ? 'critical' : finding.severity === 'high' ? 'high' : 'medium',
      category: 'security',
      title: finding.title,
      description: finding.recommendation,
      effort: 'quick',
    });
  }

  // Performance fixes
  if (input.scores.performance < 70) {
    const slowMetric = input.performanceMetrics.find(m => m.score < 50);
    if (slowMetric) {
      fixes.push({
        priority: 'high',
        category: 'performance',
        title: `Improve ${slowMetric.name}`,
        description: `Current: ${slowMetric.displayValue}. Optimize to improve Core Web Vitals.`,
        effort: 'medium',
      });
    }
  }

  // SEO fixes
  const failedSeo = input.seoFindings.filter(f => !f.passed);
  if (failedSeo.length > 0) {
    fixes.push({
      priority: 'medium',
      category: 'seo',
      title: failedSeo[0].title,
      description: failedSeo[0].description,
      effort: 'quick',
    });
  }

  // Accessibility fixes
  if (input.accessibilityViolations.length > 0) {
    const worst = input.accessibilityViolations[0];
    fixes.push({
      priority: worst.impact === 'critical' ? 'critical' : worst.impact === 'serious' ? 'high' : 'medium',
      category: 'accessibility',
      title: 'Fix accessibility violations',
      description: worst.help,
      effort: 'medium',
    });
  }

  // Vulnerability fixes
  if (input.vulnerabilities && input.vulnerabilities.vulnerableLibraries.length > 0) {
    const lib = input.vulnerabilities.vulnerableLibraries[0];
    fixes.push({
      priority: 'critical',
      category: 'security',
      title: `Update ${lib.name}`,
      description: `Version ${lib.detectedVersion} has known vulnerabilities. Update to latest secure version.`,
      effort: 'quick',
    });
  }

  // PWA fixes
  if (input.pwa && !input.pwa.installable && input.pwa.issues.length > 0) {
    const issue = input.pwa.issues[0];
    fixes.push({
      priority: 'low',
      category: 'performance',
      title: 'Improve PWA readiness',
      description: issue.recommendation,
      effort: 'medium',
    });
  }

  return fixes.slice(0, 5);
}

function generateFallbackRoast(input: RoastInput, reason?: string): RoastResult {
  const { scores } = input;

  console.log(`Using fallback analysis${reason ? `: ${reason}` : ''}`);

  let title: string;
  let body: string;

  if (scores.overall >= 80) {
    title = 'Strong Foundation with Room for Optimization';
    body = `Your site scored ${scores.overall}/100, demonstrating solid fundamentals across most categories. With a security score of ${scores.security}/100, you've implemented good baseline protections. However, there are still opportunities for improvement that could further strengthen your site's security posture and user experience. Review the detailed findings below for specific recommendations.`;
  } else if (scores.overall >= 60) {
    title = 'Several Areas Require Attention';
    body = `With a score of ${scores.overall}/100, your site has a foundation to build on but requires attention in key areas. Performance at ${scores.performance}/100 is impacting user experience, and there are security considerations that should be addressed. The good news: most of these issues have straightforward solutions. Prioritize the critical and high-priority fixes listed below.`;
  } else {
    title = 'Critical Issues Identified - Immediate Action Recommended';
    body = `Your site scored ${scores.overall}/100, indicating significant issues across multiple categories. Security headers require immediate attention, performance is severely impacting user experience, and SEO visibility is limited. We recommend addressing the critical issues first, then working through high-priority items systematically. See the detailed breakdown below for specific action items.`;
  }

  const fixes: RoastFix[] = [];

  // Generate fixes based on actual issues
  const failedSecurity = input.securityFindings.filter(f => !f.passed);
  if (failedSecurity.length > 0) {
    const critical = failedSecurity.find(f => f.severity === 'critical' || f.severity === 'high');
    if (critical) {
      fixes.push({
        priority: critical.severity === 'critical' ? 'critical' : 'high',
        category: 'security',
        title: critical.title,
        description: critical.recommendation,
        effort: 'quick',
      });
    }
  }

  if (scores.performance < 70) {
    fixes.push({
      priority: 'high',
      category: 'performance',
      title: 'Optimize Core Web Vitals',
      description: 'Improve LCP by optimizing images, reduce CLS with proper sizing, and minimize TBT by deferring non-critical JavaScript.',
      effort: 'medium',
    });
  }

  const failedSeo = input.seoFindings.filter(f => !f.passed);
  if (failedSeo.length > 0) {
    fixes.push({
      priority: 'medium',
      category: 'seo',
      title: failedSeo[0].title,
      description: failedSeo[0].description,
      effort: 'quick',
    });
  }

  if (input.accessibilityViolations.length > 0) {
    const worst = input.accessibilityViolations[0];
    fixes.push({
      priority: worst.impact === 'critical' ? 'critical' : 'medium',
      category: 'accessibility',
      title: 'Fix accessibility violations',
      description: worst.help,
      effort: 'medium',
    });
  }

  // Generate LLM report for fallback too
  const llmReport = generateLLMReport(input);

  // Generate twitter summary for fallback
  const twitterRoast = `${input.url.replace(/^https?:\/\//, '')} scored ${scores.overall}/100. ${title}`.slice(0, 280);

  return {
    title,
    body,
    fixes,
    twitterRoast,
    llmReport,
    isFallback: true,
    fallbackReason: reason,
    persona: 'professional',
  };
}

// ============================================
// Phase 2: File Upload Roast Generation
// ============================================

interface UploadRoastInput {
  filesCount: number;
  dependencies: DependencyAuditResult;
  secrets: SecretsAuditResult;
  codePatterns: CodePatternsAuditResult;
  overallScore: number;
}

/**
 * Generate an LLM-ready report for file upload scans
 */
function generateUploadLLMReport(input: UploadRoastInput): string {
  let report = `# Code Audit Report - LLM Fix Instructions
## Files Analyzed: ${input.filesCount}
## Overall Score: ${input.overallScore}/100

### SCORES BREAKDOWN
- Dependencies: ${input.dependencies.score}/100 (${input.dependencies.totalDependencies} packages)
- Secrets: ${input.secrets.score}/100 (${input.secrets.totalFilesScanned} files scanned)
- Code Patterns: ${input.codePatterns.score}/100 (${input.codePatterns.totalFilesScanned} files scanned)

---

## CRITICAL FIXES REQUIRED

`;

  // Secrets (most critical)
  if (input.secrets.findings.length > 0) {
    report += `### EXPOSED SECRETS (${input.secrets.findings.length} found)\n\n`;
    report += `**Summary:** ${input.secrets.summary.critical} critical, ${input.secrets.summary.high} high, ${input.secrets.summary.medium} medium\n\n`;

    for (const finding of input.secrets.findings.slice(0, 10)) {
      report += `#### [${finding.severity.toUpperCase()}] ${finding.type}
- **File:** \`${finding.file}\`
- **Line:** ${finding.line}
- **Found:** \`${finding.match}\`
- **Action:** ${finding.recommendation}

`;
    }
  }

  // Dependency Vulnerabilities
  if (input.dependencies.details.length > 0) {
    report += `### DEPENDENCY VULNERABILITIES (${input.dependencies.details.length} found)\n\n`;
    report += `**Summary:** ${input.dependencies.vulnerabilities.critical} critical, ${input.dependencies.vulnerabilities.high} high, ${input.dependencies.vulnerabilities.moderate} moderate, ${input.dependencies.vulnerabilities.low} low\n\n`;

    for (const vuln of input.dependencies.details.slice(0, 10)) {
      report += `#### [${vuln.severity.toUpperCase()}] ${vuln.package}@${vuln.installedVersion}
- **Issue:** ${vuln.vulnerability}
${vuln.cve ? `- **CVE:** ${vuln.cve}` : ''}
- **Fixed in:** ${vuln.patchedVersions}
- **Action:** ${vuln.recommendation}

`;
    }
  }

  // Code Pattern Issues
  if (input.codePatterns.issues.length > 0) {
    report += `### CODE PATTERN ISSUES (${input.codePatterns.issues.length} found)\n\n`;
    report += `**Summary:** ${input.codePatterns.summary.critical} critical, ${input.codePatterns.summary.high} high, ${input.codePatterns.summary.medium} medium, ${input.codePatterns.summary.low} low\n\n`;

    for (const issue of input.codePatterns.issues.slice(0, 15)) {
      report += `#### [${issue.severity.toUpperCase()}] ${issue.type}
- **File:** \`${issue.file}:${issue.line}\`
- **Code:** \`${issue.code}\`
- **Problem:** ${issue.description}
- **Fix:** ${issue.fix}

`;
    }
  }

  // Copy-paste fixes
  report += `\n---\n\n## COPY-PASTE CODE FIXES\n\n`;

  // npm update commands
  if (input.dependencies.details.length > 0) {
    const packages = [...new Set(input.dependencies.details.map(d => d.package))];
    report += `### Update Vulnerable Dependencies\n\n`;
    report += '```bash\n';
    report += `# Update all vulnerable packages\n`;
    report += `npm update ${packages.slice(0, 10).join(' ')}\n\n`;
    report += `# Or run npm audit fix\n`;
    report += `npm audit fix\n`;
    report += '```\n\n';
  }

  // Environment variable fixes for secrets
  if (input.secrets.findings.length > 0) {
    report += `### Fix Exposed Secrets\n\n`;
    report += '```typescript\n';
    report += `// BEFORE (insecure)\n`;
    report += `const apiKey = 'sk_live_xxxxx';\n\n`;
    report += `// AFTER (secure)\n`;
    report += `const apiKey = process.env.API_KEY;\n`;
    report += '```\n\n';
    report += `Add to .gitignore:\n`;
    report += '```\n';
    report += `.env\n`;
    report += `.env.local\n`;
    report += `.env.production\n`;
    report += '```\n\n';
  }

  report += `
---

## INSTRUCTIONS FOR AI ASSISTANT

Please analyze this code audit report and provide specific fixes for each issue:

1. **Secrets:** Identify all hardcoded secrets and provide safe alternatives using environment variables
2. **Dependencies:** Suggest specific npm commands to update vulnerable packages
3. **Code Patterns:** Provide corrected code snippets for each pattern issue

Prioritize fixes in this order:
1. Critical secrets (API keys, passwords, private keys)
2. Critical dependency vulnerabilities
3. High severity issues
4. Medium/Low issues

Start with the highest priority items and provide actionable code fixes.`;

  return report;
}

/**
 * Build prompt for upload scan analysis
 */
function buildUploadPrompt(input: UploadRoastInput): string {
  return `You are a senior security consultant providing professional code audits. Your analysis is thorough, objective, and focused on actionable improvements. You communicate clearly, explain business impact, and prioritize recommendations by severity.

CODE SCAN RESULTS:
- Files Analyzed: ${input.filesCount}
- Overall Score: ${input.overallScore}/100

DEPENDENCY VULNERABILITIES (${input.dependencies.details.length}):
- Critical: ${input.dependencies.vulnerabilities.critical}
- High: ${input.dependencies.vulnerabilities.high}
- Moderate: ${input.dependencies.vulnerabilities.moderate}
- Low: ${input.dependencies.vulnerabilities.low}
${input.dependencies.details.slice(0, 5).map(d => `  - ${d.package}@${d.installedVersion}: ${d.vulnerability}`).join('\n')}

EXPOSED SECRETS (${input.secrets.findings.length}):
- Critical: ${input.secrets.summary.critical}
- High: ${input.secrets.summary.high}
- Medium: ${input.secrets.summary.medium}
${input.secrets.findings.slice(0, 5).map(s => `  - [${s.severity.toUpperCase()}] ${s.type} in ${s.file}:${s.line}`).join('\n')}

CODE PATTERN ISSUES (${input.codePatterns.issues.length}):
- Critical: ${input.codePatterns.summary.critical}
- High: ${input.codePatterns.summary.high}
- Medium: ${input.codePatterns.summary.medium}
${input.codePatterns.issues.slice(0, 5).map(i => `  - [${i.severity.toUpperCase()}] ${i.type} in ${i.file}:${i.line}`).join('\n')}

ANALYSIS DEPTH: ${input.overallScore >= 80 ? 'highlight strengths with minor recommendations' : input.overallScore >= 50 ? 'balanced analysis with clear priorities' : 'comprehensive review with urgent recommendations'}

Generate an analysis report in the following JSON format. The analysis should be professional, technically accurate, and include specific references to the actual issues found.

{
  "title": "A clear summary headline (max 80 chars, complete the thought)",
  "body": "2-3 paragraph professional analysis that references specific findings. Focus on the most critical issues and their business impact.",
  "fixes": [
    {
      "priority": "critical|high|medium|low",
      "category": "security|code_quality",
      "title": "Short actionable fix title",
      "description": "Specific technical explanation of what to do",
      "effort": "quick|medium|significant"
    }
  ]
}

RULES:
- Title must be under 80 characters and complete (no cut-off words)
- Include 3-5 of the most impactful fixes
- Fixes should be ordered by priority (critical first)
- Be specific - reference actual package names, file paths, or secret types found
- If secrets were found, that's ALWAYS the #1 priority issue
- The body should be 100-200 words
- Maintain a professional, consultative tone
- Do NOT use markdown formatting in the body text

Return ONLY the JSON, no other text.`;
}

/**
 * Generate roast for file upload scans
 */
export async function generateUploadRoast(input: UploadRoastInput): Promise<RoastResult> {
  const client = getAnthropicClient();
  const prompt = buildUploadPrompt(input);

  // Call Claude with retry logic
  const { text, error } = await callClaudeWithRetry(client, prompt);

  if (error) {
    console.error(`Upload roast generation failed after ${MAX_RETRIES} attempts:`, error);
    return generateUploadFallbackRoast(input, `API error: ${error}`);
  }

  // Extract JSON (handles markdown code fences)
  const jsonString = extractJSON(text);
  if (!jsonString) {
    console.error('Could not extract JSON from response:', text.slice(0, 200));
    return generateUploadFallbackRoast(input, 'JSON extraction failed');
  }

  // Parse JSON
  let result: RoastResult;
  try {
    result = JSON.parse(jsonString) as RoastResult;
  } catch (parseError) {
    console.error('JSON parse error:', parseError, 'Raw:', jsonString.slice(0, 200));
    return generateUploadFallbackRoast(input, 'JSON parse failed');
  }

  // Validate required fields
  if (!result.title || !result.body || !Array.isArray(result.fixes)) {
    console.error('Invalid roast format - missing required fields');
    return generateUploadFallbackRoast(input, 'Invalid response format');
  }

  // Ensure title is not too long (smart truncate at word boundary)
  if (result.title.length > 80) {
    const truncated = result.title.slice(0, 80);
    const lastSpace = truncated.lastIndexOf(' ');
    result.title = lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated;
  }

  // Validate fixes
  result.fixes = result.fixes.slice(0, 5).map(fix => ({
    priority: ['critical', 'high', 'medium', 'low'].includes(fix.priority)
      ? fix.priority
      : 'medium',
    category: ['security', 'code_quality'].includes(fix.category)
      ? fix.category
      : 'security',
    title: String(fix.title).slice(0, 100),
    description: String(fix.description).slice(0, 500),
    effort: ['quick', 'medium', 'significant'].includes(fix.effort)
      ? fix.effort
      : 'medium',
  })) as RoastFix[];

  // Generate LLM-ready report
  result.llmReport = generateUploadLLMReport(input);
  result.isFallback = false;

  console.log('AI upload analysis generated successfully');
  return result;
}

/**
 * Generate fallback analysis for upload scans when AI fails
 */
function generateUploadFallbackRoast(input: UploadRoastInput, reason?: string): RoastResult {
  console.log(`Using fallback upload analysis${reason ? `: ${reason}` : ''}`);

  let title: string;
  let body: string;

  const hasSecrets = input.secrets.findings.length > 0;
  const hasCriticalDeps = input.dependencies.vulnerabilities.critical > 0;
  const score = input.overallScore;

  if (hasSecrets) {
    title = 'Critical: Exposed Credentials Detected';
    body = `Analysis identified ${input.secrets.findings.length} exposed secrets in your codebase. ${
      input.secrets.summary.critical > 0
        ? `${input.secrets.summary.critical} are classified as critical, including API keys and credentials.`
        : 'These could potentially provide unauthorized access to your systems.'
    } Immediate action required: rotate all affected credentials, move sensitive values to environment variables, and ensure .gitignore is properly configured. This is your highest priority issue.`;
  } else if (hasCriticalDeps) {
    title = 'Critical Dependency Vulnerabilities Found';
    body = `Your codebase contains ${input.dependencies.vulnerabilities.critical} critical vulnerabilities in dependencies. These represent known security issues with available patches. Run \`npm audit fix\` to address most issues automatically, and review any remaining vulnerabilities manually. Score: ${score}/100.`;
  } else if (score >= 80) {
    title = 'Strong Codebase with Minor Improvements Needed';
    body = `Your code scored ${score}/100, demonstrating solid development practices. Analysis found ${input.codePatterns.issues.length} code pattern issues and ${input.dependencies.details.length} dependency considerations, all within acceptable ranges. Continue maintaining your current standards while addressing the specific items noted below.`;
  } else if (score >= 50) {
    title = 'Several Areas Identified for Improvement';
    body = `With a score of ${score}/100, your codebase has foundational elements in place but requires attention in several areas. Analysis identified ${input.codePatterns.issues.length} code pattern issues that should be addressed. Review the detailed findings below and prioritize the high-severity items.`;
  } else {
    title = 'Comprehensive Review Recommended';
    body = `Your code scored ${score}/100, indicating significant areas requiring attention. With ${input.codePatterns.issues.length} code pattern issues and ${input.dependencies.details.length} dependency vulnerabilities identified, we recommend a systematic review starting with critical and high-priority items. See the detailed breakdown below for specific recommendations.`;
  }

  const fixes: RoastFix[] = [];

  // Add secret fixes first
  if (input.secrets.findings.length > 0) {
    const finding = input.secrets.findings[0];
    fixes.push({
      priority: finding.severity === 'critical' ? 'critical' : 'high',
      category: 'security',
      title: `Remove exposed ${finding.type}`,
      description: finding.recommendation,
      effort: 'quick',
    });
  }

  // Add dependency fixes
  if (input.dependencies.details.length > 0) {
    const critical = input.dependencies.details.find(d => d.severity === 'critical');
    if (critical) {
      fixes.push({
        priority: 'critical',
        category: 'security',
        title: `Update ${critical.package}`,
        description: critical.recommendation,
        effort: 'quick',
      });
    }
  }

  // Add code pattern fixes
  if (input.codePatterns.issues.length > 0) {
    const issue = input.codePatterns.issues[0];
    fixes.push({
      priority: issue.severity === 'critical' ? 'critical' : 'medium',
      category: 'code_quality',
      title: issue.type,
      description: issue.fix,
      effort: 'medium',
    });
  }

  const llmReport = generateUploadLLMReport(input);

  return { title, body, fixes, llmReport, isFallback: true, fallbackReason: reason };
}
