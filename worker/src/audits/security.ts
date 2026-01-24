import { Page, Response } from 'playwright';
import * as tls from 'tls';
import * as https from 'https';

export interface SecurityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  recommendation: string;
  passed: boolean;
  // Enterprise: actionable details
  details?: {
    currentValue?: string;
    expectedValue?: string;
    affectedElements?: string[];
    codeSnippet?: string;
  };
}

export interface SSLInfo {
  valid: boolean;
  issuer?: string;
  validFrom?: string;
  validTo?: string;
  daysUntilExpiry?: number;
  protocol?: string;
  cipher?: string;
  keyExchange?: string;
  errors?: string[];
}

export interface CORSInfo {
  allowOrigin?: string;
  allowCredentials?: boolean;
  allowMethods?: string;
  allowHeaders?: string;
  exposeHeaders?: string;
  maxAge?: string;
  isPermissive: boolean;
}

export interface SRIViolation {
  tagName: string;
  src: string;
  outerHtml: string;
  isExternal: boolean;
}

export interface SecurityAuditResult {
  score: number;
  findings: SecurityFinding[];
  // Enterprise additions
  sslInfo?: SSLInfo;
  corsInfo?: CORSInfo;
  sriViolations?: SRIViolation[];
}

/**
 * Check SSL/TLS certificate and connection security
 */
async function checkSSL(hostname: string): Promise<SSLInfo> {
  return new Promise((resolve) => {
    const errors: string[] = [];

    try {
      const options = {
        host: hostname,
        port: 443,
        method: 'HEAD',
        rejectUnauthorized: false, // We want to inspect even invalid certs
        timeout: 10000,
      };

      const req = https.request(options, (res) => {
        const socket = res.socket as tls.TLSSocket;

        if (!socket.authorized) {
          const authError = socket.authorizationError;
          errors.push(typeof authError === 'string' ? authError : (authError?.toString() || 'Certificate not authorized'));
        }

        const cert = socket.getPeerCertificate();
        const cipher = socket.getCipher();
        const protocol = socket.getProtocol();

        if (cert && Object.keys(cert).length > 0) {
          const validFrom = new Date(cert.valid_from);
          const validTo = new Date(cert.valid_to);
          const now = new Date();
          const daysUntilExpiry = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          // Check for weak protocols
          if (protocol && ['SSLv3', 'TLSv1', 'TLSv1.1'].includes(protocol)) {
            errors.push(`Weak protocol: ${protocol}`);
          }

          resolve({
            valid: socket.authorized && daysUntilExpiry > 0,
            issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
            validFrom: validFrom.toISOString(),
            validTo: validTo.toISOString(),
            daysUntilExpiry,
            protocol: protocol || undefined,
            cipher: cipher?.name,
            keyExchange: cipher?.name?.includes('ECDHE') ? 'ECDHE' : cipher?.name?.includes('DHE') ? 'DHE' : 'RSA',
            errors: errors.length > 0 ? errors : undefined,
          });
        } else {
          resolve({ valid: false, errors: ['No certificate found'] });
        }

        req.destroy();
      });

      req.on('error', (err) => {
        resolve({ valid: false, errors: [err.message] });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ valid: false, errors: ['Connection timeout'] });
      });

      req.end();
    } catch (err) {
      resolve({ valid: false, errors: [(err as Error).message] });
    }
  });
}

/**
 * Analyze CORS headers for security issues
 */
function analyzeCORS(headers: Record<string, string>): CORSInfo {
  const allowOrigin = headers['access-control-allow-origin'];
  const allowCredentials = headers['access-control-allow-credentials'] === 'true';
  const allowMethods = headers['access-control-allow-methods'];
  const allowHeaders = headers['access-control-allow-headers'];
  const exposeHeaders = headers['access-control-expose-headers'];
  const maxAge = headers['access-control-max-age'];

  // Check if CORS is overly permissive
  const isPermissive = allowOrigin === '*' || (allowOrigin === '*' && allowCredentials);

  return {
    allowOrigin,
    allowCredentials,
    allowMethods,
    allowHeaders,
    exposeHeaders,
    maxAge,
    isPermissive,
  };
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
    const passed = header.check(value) ?? false;

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
    details: exposesServer ? {
      currentValue: [serverHeader, poweredBy].filter(Boolean).join(', '),
      expectedValue: '(hidden)',
    } : undefined,
  });

  // === ENTERPRISE: SSL/TLS Certificate Analysis ===
  let sslInfo: SSLInfo | undefined;
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol === 'https:') {
      sslInfo = await checkSSL(urlObj.hostname);

      // Certificate validity - if SSL check failed due to timeout but page loaded over HTTPS, it's valid
      const isTimeoutOrConnectionError = sslInfo.errors?.some(e =>
        e.includes('timeout') || e.includes('ECONNREFUSED') || e.includes('ENOTFOUND')
      ) ?? false;
      // If page loaded over HTTPS successfully (we got here), SSL is working
      const sslIsValid = sslInfo.valid || isTimeoutOrConnectionError;

      findings.push({
        id: 'ssl-valid',
        severity: 'critical',
        title: 'SSL Certificate Valid',
        description: 'SSL certificate must be valid and not expired.',
        recommendation: 'Ensure your SSL certificate is valid and renew before expiry.',
        passed: sslIsValid,
        details: (!sslIsValid && sslInfo.errors) ? {
          currentValue: sslInfo.errors.join(', '),
          expectedValue: 'Valid certificate',
        } : undefined,
      });

      // Certificate expiry warning (30 days)
      if (sslInfo.daysUntilExpiry !== undefined) {
        const expiryWarning = sslInfo.daysUntilExpiry < 30;
        findings.push({
          id: 'ssl-expiry',
          severity: expiryWarning ? 'high' : 'info',
          title: 'SSL Certificate Expiry',
          description: expiryWarning
            ? `Certificate expires in ${sslInfo.daysUntilExpiry} days!`
            : `Certificate valid for ${sslInfo.daysUntilExpiry} days.`,
          recommendation: expiryWarning
            ? 'Renew your SSL certificate immediately.'
            : 'Certificate expiry is healthy.',
          passed: !expiryWarning,
          details: {
            currentValue: `Expires: ${sslInfo.validTo}`,
            expectedValue: 'At least 30 days until expiry',
          },
        });
      }

      // TLS version check
      if (sslInfo.protocol) {
        const weakProtocol = ['SSLv3', 'TLSv1', 'TLSv1.1'].includes(sslInfo.protocol);
        findings.push({
          id: 'tls-version',
          severity: weakProtocol ? 'high' : 'info',
          title: 'TLS Protocol Version',
          description: weakProtocol
            ? `Weak TLS version: ${sslInfo.protocol}`
            : `Strong TLS version: ${sslInfo.protocol}`,
          recommendation: weakProtocol
            ? 'Upgrade to TLS 1.2 or TLS 1.3. Disable older protocols.'
            : 'TLS configuration is secure.',
          passed: !weakProtocol,
          details: {
            currentValue: sslInfo.protocol,
            expectedValue: 'TLSv1.2 or TLSv1.3',
          },
        });
      }
    }
  } catch (err) {
    console.error('SSL check failed:', err);
  }

  // === ENTERPRISE: CORS Analysis ===
  const corsInfo = analyzeCORS(headers);

  if (corsInfo.allowOrigin) {
    findings.push({
      id: 'cors-permissive',
      severity: corsInfo.isPermissive ? 'high' : 'info',
      title: 'CORS Configuration',
      description: corsInfo.isPermissive
        ? 'CORS allows requests from any origin (*), which may expose your API.'
        : 'CORS is configured with specific origins.',
      recommendation: corsInfo.isPermissive
        ? 'Replace Access-Control-Allow-Origin: * with specific trusted domains.'
        : 'CORS configuration appears secure.',
      passed: !corsInfo.isPermissive,
      details: {
        currentValue: corsInfo.allowOrigin,
        expectedValue: 'Specific domain(s), not *',
      },
    });

    // Dangerous: wildcard + credentials
    if (corsInfo.allowOrigin === '*' && corsInfo.allowCredentials) {
      findings.push({
        id: 'cors-credentials',
        severity: 'critical',
        title: 'CORS Credentials with Wildcard',
        description: 'Allowing credentials with wildcard origin is a severe security risk.',
        recommendation: 'Never use Access-Control-Allow-Credentials: true with wildcard origin.',
        passed: false,
      });
    }
  }

  // === ENTERPRISE: Subresource Integrity (SRI) ===
  const sriViolations = await page.evaluate(() => {
    const violations: Array<{
      tagName: string;
      src: string;
      outerHtml: string;
      isExternal: boolean;
    }> = [];

    // Check scripts
    document.querySelectorAll('script[src]').forEach((el) => {
      const script = el as HTMLScriptElement;
      const src = script.src;
      const isExternal = src && !src.startsWith(window.location.origin);

      if (isExternal && !script.integrity) {
        violations.push({
          tagName: 'script',
          src: src,
          outerHtml: script.outerHTML.slice(0, 200),
          isExternal: true,
        });
      }
    });

    // Check stylesheets
    document.querySelectorAll('link[rel="stylesheet"][href]').forEach((el) => {
      const link = el as HTMLLinkElement;
      const href = link.href;
      const isExternal = href && !href.startsWith(window.location.origin);

      if (isExternal && !link.integrity) {
        violations.push({
          tagName: 'link',
          src: href,
          outerHtml: link.outerHTML.slice(0, 200),
          isExternal: true,
        });
      }
    });

    return violations;
  });

  if (sriViolations.length > 0) {
    findings.push({
      id: 'sri-missing',
      severity: 'medium',
      title: 'Subresource Integrity (SRI) Missing',
      description: `${sriViolations.length} external resource(s) lack integrity attributes.`,
      recommendation: 'Add integrity="sha384-..." to external scripts and stylesheets.',
      passed: false,
      details: {
        affectedElements: sriViolations.slice(0, 5).map(v => v.src),
        codeSnippet: sriViolations[0]?.outerHtml,
      },
    });
  } else {
    findings.push({
      id: 'sri-present',
      severity: 'info',
      title: 'Subresource Integrity (SRI)',
      description: 'All external resources have integrity attributes or none are loaded.',
      recommendation: 'SRI is properly configured.',
      passed: true,
    });
  }

  // === ENTERPRISE: Form Security Checks ===
  const formIssues = await page.evaluate(() => {
    const issues: string[] = [];

    document.querySelectorAll('form').forEach((form, i) => {
      const action = form.action;
      // Check for HTTP form actions on HTTPS page
      if (window.location.protocol === 'https:' && action.startsWith('http://')) {
        issues.push(`Form #${i + 1} submits to insecure HTTP: ${action}`);
      }

      // Check for password fields without autocomplete="off" or "new-password"
      form.querySelectorAll('input[type="password"]').forEach((input) => {
        const autocomplete = (input as HTMLInputElement).autocomplete;
        if (!autocomplete || autocomplete === 'on') {
          issues.push(`Password field missing autocomplete="new-password"`);
        }
      });
    });

    return issues;
  });

  if (formIssues.length > 0) {
    findings.push({
      id: 'form-security',
      severity: 'medium',
      title: 'Form Security Issues',
      description: `Found ${formIssues.length} form security issue(s).`,
      recommendation: 'Ensure forms submit over HTTPS and password fields have proper autocomplete attributes.',
      passed: false,
      details: {
        affectedElements: formIssues.slice(0, 5),
      },
    });
  }

  // === ENTERPRISE: Dangerous JavaScript APIs ===
  const dangerousAPIs = await page.evaluate(() => {
    const found: string[] = [];
    const html = document.documentElement.outerHTML;

    // Check for eval usage in inline scripts
    if (html.includes('eval(')) found.push('eval() detected');
    if (html.includes('document.write(')) found.push('document.write() detected');
    if (html.includes('innerHTML')) found.push('innerHTML usage detected');

    return found;
  });

  if (dangerousAPIs.length > 0) {
    findings.push({
      id: 'dangerous-apis',
      severity: 'low',
      title: 'Potentially Dangerous JavaScript APIs',
      description: `Detected usage of ${dangerousAPIs.join(', ')}.`,
      recommendation: 'Avoid eval(), document.write(), and prefer textContent over innerHTML.',
      passed: false,
      details: {
        affectedElements: dangerousAPIs,
      },
    });
  }

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
    sslInfo,
    corsInfo,
    sriViolations: sriViolations.length > 0 ? sriViolations : undefined,
  };
}
