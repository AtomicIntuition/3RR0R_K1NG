import Anthropic from '@anthropic-ai/sdk';
import type { SecurityFinding } from './audits/security.js';
import type { PerformanceMetric } from './audits/performance.js';
import type { SeoFinding } from './audits/seo.js';
import type { AccessibilityViolation } from './audits/accessibility.js';
import type { CodeQualityIssue } from './audits/codeQuality.js';
import type { TechStackItem } from './audits/techStack.js';

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
${finding.value ? `- **Current Value:** \`${finding.value}\`` : ''}

`;
    }
  }

  // Accessibility issues with CSS selectors
  if (input.accessibilityViolations.length > 0) {
    report += `### ACCESSIBILITY ISSUES (${input.accessibilityViolations.length} violations)\n\n`;
    for (const violation of input.accessibilityViolations) {
      report += `#### [${violation.impact.toUpperCase()}] ${violation.description}
- **Rule:** ${violation.id}
- **Fix:** ${violation.help}
- **Elements Affected:** ${violation.nodes} elements
${(violation as any).selectors?.length ? `- **CSS Selectors:**
\`\`\`css
${(violation as any).selectors.slice(0, 5).join('\n')}
\`\`\`` : ''}
${(violation as any).failureSummary ? `- **Details:** ${(violation as any).failureSummary}` : ''}
- **Reference:** ${violation.helpUrl}

`;
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

  // Code quality issues
  if (input.codeQualityIssues.length > 0) {
    report += `### CODE QUALITY ISSUES (${input.codeQualityIssues.length} issues)\n\n`;
    for (const issue of input.codeQualityIssues) {
      report += `#### [${issue.type.toUpperCase()}] ${issue.message}
${(issue as any).source ? `- **Source:** \`${(issue as any).source}\`` : ''}
- **Count:** ${issue.count}

`;
    }
  }

  // Performance metrics
  report += `### PERFORMANCE METRICS\n\n`;
  for (const metric of input.performanceMetrics) {
    const status = metric.score >= 90 ? '✅' : metric.score >= 50 ? '⚠️' : '❌';
    report += `- ${status} **${metric.name}:** ${metric.displayValue} (score: ${metric.score}/100)\n`;
  }

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
${input.accessibilityViolations.slice(0, 5).map(v => `- [${v.impact.toUpperCase()}] ${v.description} (${v.nodes} elements)`).join('\n') || 'None found'}

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

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

export async function generateRoast(input: RoastInput): Promise<RoastResult> {
  try {
    const client = getAnthropicClient();
    const prompt = buildPrompt(input);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text content
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const result = JSON.parse(jsonMatch[0]) as RoastResult;

    // Validate and sanitize
    if (!result.title || !result.body || !Array.isArray(result.fixes)) {
      throw new Error('Invalid roast format');
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

    return result;
  } catch (error) {
    console.error('Roast generation failed:', error);

    // Return fallback roast
    return generateFallbackRoast(input);
  }
}

function generateFallbackRoast(input: RoastInput): RoastResult {
  const { scores } = input;

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

  return { title, body, fixes, llmReport };
}
