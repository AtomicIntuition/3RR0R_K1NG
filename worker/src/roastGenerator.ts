import Anthropic from '@anthropic-ai/sdk';
import type { SecurityFinding } from './audits/security.js';
import type { PerformanceMetric } from './audits/performance.js';
import type { SeoFinding } from './audits/seo.js';
import type { AccessibilityViolation } from './audits/accessibility.js';
import type { CodeQualityIssue } from './audits/codeQuality.js';
import type { TechStackItem } from './audits/techStack.js';
import type { ResourceAnalysis, ResourceIssue } from './audits/resources.js';

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
  llmReport?: string; // New: LLM-ready detailed report
  isFallback?: boolean; // Track if AI generation failed
  fallbackReason?: string; // Why AI failed (for debugging)
}

interface RoastInput {
  url: string;
  scores: {
    overall: number;
    performance: number;
    security: number;
    seo: number;
    accessibility: number;
    codeQuality: number;
  };
  securityFindings: SecurityFinding[];
  performanceMetrics: PerformanceMetric[];
  seoFindings: SeoFinding[];
  accessibilityViolations: AccessibilityViolation[];
  codeQualityIssues: CodeQualityIssue[];
  techStack: TechStackItem[];
  resourceAnalysis?: ResourceAnalysis;
}

/**
 * Generate an LLM-ready report that can be pasted directly into Claude/GPT for fixing
 */
function generateLLMReport(input: RoastInput): string {
  const failedSecurity = input.securityFindings.filter(f => !f.passed);
  const failedSeo = input.seoFindings.filter(f => !f.passed);

  let report = `# Website Audit Report - LLM Fix Instructions
## URL: ${input.url}
## Overall Score: ${input.scores.overall}/100

### SCORES BREAKDOWN
- Performance: ${input.scores.performance}/100
- Security: ${input.scores.security}/100
- SEO: ${input.scores.seo}/100
- Accessibility: ${input.scores.accessibility}/100
- Code Quality: ${input.scores.codeQuality}/100

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
    const status = metric.score >= 90 ? '✅' : metric.score >= 50 ? '⚠️' : '❌';
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
        const impactEmoji = domain.impact === 'high' ? '🔴' : domain.impact === 'medium' ? '🟡' : '🟢';
        report += `${impactEmoji} **${domain.domain}** (${domain.category || 'unknown'})\n`;
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

function getRoastIntensity(score: number): string {
  if (score >= 90) return 'mild teasing with genuine compliments';
  if (score >= 70) return 'playful roasting with constructive criticism';
  if (score >= 50) return 'firm roasting with clear disappointment';
  if (score >= 30) return 'brutal honesty with dramatic flair';
  return 'scorched earth devastation, absolutely savage';
}

function buildPrompt(input: RoastInput): string {
  const failedSecurity = input.securityFindings.filter(f => !f.passed);
  const failedSeo = input.seoFindings.filter(f => !f.passed);

  return `You are 3RROR_K1NG, a legendary hacker who reviews websites with brutal honesty. You speak with a mix of technical expertise and devastating wit. Your reviews are memorable, shareable, and actually helpful.

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

ROAST INTENSITY: ${getRoastIntensity(input.scores.overall)}

Generate a roast in the following JSON format. The roast should be memorable, technically accurate, and include specific references to the actual issues found. Use hacker/tech terminology and metaphors. Be creative with the title - it should be punchy and shareable.

{
  "title": "A devastating one-liner roast title (max 60 chars)",
  "body": "2-3 paragraph roast that references specific findings. Be savage but helpful. End with either praise (if deserved) or a call to action.",
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
- Title must be under 60 characters
- Include 3-5 of the most impactful fixes
- Fixes should be ordered by priority (critical first)
- Be specific - reference actual URLs, headers, or metrics found
- If the site actually scores well (85+), acknowledge it while still finding something to roast
- Use technical terms correctly
- The body should be 100-200 words
- Make references to hacking/security culture where appropriate
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

  // Ensure title is not too long
  result.title = result.title.slice(0, 60);

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

  console.log('AI roast generated successfully');
  return result;
}

function generateFallbackRoast(input: RoastInput, reason?: string): RoastResult {
  const { scores } = input;

  console.log(`Using fallback roast${reason ? `: ${reason}` : ''}`);

  let title: string;
  let body: string;

  if (scores.overall >= 80) {
    title = 'Not Bad, But I Found Your Secrets';
    body = `Your site scored ${scores.overall}/100, which means you're doing better than most of the internet. But don't get cocky - I still found some vulnerabilities that would make a script kiddie smile. Your security score of ${scores.security} tells me you've done some homework, but there's always room for improvement in this game.`;
  } else if (scores.overall >= 60) {
    title = 'Your Firewall Has Feelings, And I Hurt Them';
    body = `A ${scores.overall}/100? I've seen better security on a Post-it note. Your site is basically sending out invitations to bad actors. Performance at ${scores.performance}? My grandma's dial-up loaded pages faster. Let's be real: this needs work, but at least you're not completely exposed.`;
  } else {
    title = 'WHO DEPLOYED THIS TO PRODUCTION?!';
    body = `A ${scores.overall}/100 is not a score, it's a cry for help. Your security headers are MIA, your performance makes users age in real-time, and your SEO is so bad even Google pretends you don't exist. This site needs an intervention, not an audit. I'm genuinely concerned about who approved this deployment.`;
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

  return { title, body, fixes, llmReport, isFallback: true, fallbackReason: reason };
}
