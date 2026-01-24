import { Page, Response } from 'playwright';

export interface SecurityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  recommendation: string;
  passed: boolean;
}

export interface SecurityAuditResult {
  score: number;
  findings: SecurityFinding[];
}

// Security header checks with severity weights
const SECURITY_HEADERS = [
  {
    name: 'Strict-Transport-Security',
    id: 'hsts',
    severity: 'high' as const,
    title: 'HTTP Strict Transport Security (HSTS)',
    description: 'HSTS forces browsers to only connect via HTTPS, preventing downgrade attacks.',
    recommendation: 'Add header: Strict-Transport-Security: max-age=31536000; includeSubDomains',
    check: (value: string | null) => {
      if (!value) return false;
      const maxAge = value.match(/max-age=(\d+)/);
      return maxAge && parseInt(maxAge[1]) >= 31536000;
    },
  },
  {
    name: 'Content-Security-Policy',
    id: 'csp',
    severity: 'high' as const,
    title: 'Content Security Policy (CSP)',
    description: 'CSP prevents XSS attacks by controlling which resources can be loaded.',
    recommendation: 'Implement a strict CSP that limits script sources and disables inline scripts.',
    check: (value: string | null) => !!value && value.length > 10,
  },
  {
    name: 'X-Content-Type-Options',
    id: 'x-content-type-options',
    severity: 'medium' as const,
    title: 'X-Content-Type-Options',
    description: 'Prevents MIME type sniffing which can lead to security vulnerabilities.',
    recommendation: 'Add header: X-Content-Type-Options: nosniff',
    check: (value: string | null) => value?.toLowerCase() === 'nosniff',
  },
  {
    name: 'X-Frame-Options',
    id: 'x-frame-options',
    severity: 'medium' as const,
    title: 'X-Frame-Options',
    description: 'Prevents clickjacking by controlling whether the site can be embedded in frames.',
    recommendation: 'Add header: X-Frame-Options: DENY or SAMEORIGIN',
    check: (value: string | null) => {
      if (!value) return false;
      const lower = value.toLowerCase();
      return lower === 'deny' || lower === 'sameorigin';
    },
  },
  {
    name: 'X-XSS-Protection',
    id: 'x-xss-protection',
    severity: 'low' as const,
    title: 'X-XSS-Protection',
    description: 'Legacy XSS filter (mostly deprecated but still useful for older browsers).',
    recommendation: 'Add header: X-XSS-Protection: 1; mode=block (or rely on CSP instead)',
    check: (value: string | null) => {
      if (!value) return false;
      return value.includes('1') && value.includes('mode=block');
    },
  },
  {
    name: 'Referrer-Policy',
    id: 'referrer-policy',
    severity: 'low' as const,
    title: 'Referrer-Policy',
    description: 'Controls how much referrer information is shared with other sites.',
    recommendation: 'Add header: Referrer-Policy: strict-origin-when-cross-origin',
    check: (value: string | null) => {
      if (!value) return false;
      const safe = ['no-referrer', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin'];
      return safe.some(p => value.toLowerCase().includes(p));
    },
  },
  {
    name: 'Permissions-Policy',
    id: 'permissions-policy',
    severity: 'low' as const,
    title: 'Permissions-Policy',
    description: 'Controls which browser features and APIs can be used.',
    recommendation: 'Add header to restrict unnecessary browser features like camera, microphone, geolocation.',
    check: (value: string | null) => !!value,
  },
];

// Severity weights for scoring
const SEVERITY_WEIGHTS = {
  critical: 25,
  high: 15,
  medium: 10,
  low: 5,
  info: 0,
};

export async function runSecurityAudit(
  page: Page,
  response: Response | null
): Promise<SecurityAuditResult> {
  const findings: SecurityFinding[] = [];
  const headers = response?.headers() || {};

  // Check security headers
  for (const header of SECURITY_HEADERS) {
    const value = headers[header.name.toLowerCase()] || null;
    const passed = header.check(value);

    findings.push({
      id: header.id,
      severity: header.severity,
      title: header.title,
      description: header.description,
      recommendation: header.recommendation,
      passed,
    });
  }

  // Check HTTPS
  const url = page.url();
  const isHttps = url.startsWith('https://');
  findings.push({
    id: 'https',
    severity: 'critical',
    title: 'HTTPS Connection',
    description: 'Site should be served over HTTPS to encrypt data in transit.',
    recommendation: 'Enable HTTPS and redirect all HTTP traffic to HTTPS.',
    passed: isHttps,
  });

  // Check for mixed content
  const mixedContent = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource');
    for (let i = 0; i < resources.length; i++) {
      if (resources[i].name.startsWith('http://')) {
        return true;
      }
    }
    return false;
  });

  findings.push({
    id: 'mixed-content',
    severity: 'high',
    title: 'Mixed Content',
    description: 'Insecure (HTTP) resources loaded on an HTTPS page compromise security.',
    recommendation: 'Ensure all resources (scripts, styles, images) are loaded over HTTPS.',
    passed: !mixedContent,
  });

  // Check cookies
  const cookies = await page.context().cookies();
  const insecureCookies = cookies.filter(c => !c.secure || !c.httpOnly);

  if (cookies.length > 0) {
    const hasSecureCookies = insecureCookies.length === 0;
    findings.push({
      id: 'secure-cookies',
      severity: 'medium',
      title: 'Secure Cookies',
      description: 'Cookies should have Secure and HttpOnly flags to prevent theft.',
      recommendation: 'Set Secure and HttpOnly flags on all sensitive cookies.',
      passed: hasSecureCookies,
    });

    // Check for SameSite attribute
    const missingSameSite = cookies.filter(c => c.sameSite === 'None' || !c.sameSite);
    findings.push({
      id: 'samesite-cookies',
      severity: 'low',
      title: 'SameSite Cookie Attribute',
      description: 'SameSite attribute prevents CSRF attacks.',
      recommendation: 'Set SameSite=Strict or SameSite=Lax on cookies.',
      passed: missingSameSite.length === 0,
    });
  }

  // Check for exposed server information
  const serverHeader = headers['server'];
  const poweredBy = headers['x-powered-by'];
  const exposesServer = !!(serverHeader || poweredBy);

  findings.push({
    id: 'server-info',
    severity: 'info',
    title: 'Server Information Disclosure',
    description: 'Server version information can help attackers find vulnerabilities.',
    recommendation: 'Remove or obfuscate Server and X-Powered-By headers.',
    passed: !exposesServer,
  });

  // Calculate score
  let totalPenalty = 0;
  let maxPenalty = 0;

  for (const finding of findings) {
    const weight = SEVERITY_WEIGHTS[finding.severity];
    maxPenalty += weight;
    if (!finding.passed) {
      totalPenalty += weight;
    }
  }

  const score = maxPenalty > 0
    ? Math.round(100 - (totalPenalty / maxPenalty) * 100)
    : 100;

  return {
    score,
    findings,
  };
}
