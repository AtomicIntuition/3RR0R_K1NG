import * as https from 'https';
import * as http from 'http';

export interface RedirectAuditResult {
  score: number;
  redirectChain: RedirectHop[];
  totalRedirects: number;
  totalTime: number;
  issues: RedirectIssue[];
  finalUrl: string;
  recommendations: string[];
}

export interface RedirectHop {
  url: string;
  statusCode: number;
  duration: number;
  location: string | null;
  type: RedirectType;
}

export interface RedirectIssue {
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

export type RedirectType =
  | 'http-to-https'
  | 'www-normalization'
  | 'trailing-slash'
  | 'domain-change'
  | 'path-change'
  | 'permanent'
  | 'temporary'
  | 'other';

const MAX_REDIRECTS = 10;
const REQUEST_TIMEOUT = 5000;

/**
 * Determine the type of redirect
 */
function getRedirectType(from: string, to: string, statusCode: number): RedirectType {
  try {
    const fromUrl = new URL(from);
    const toUrl = new URL(to);

    // HTTP to HTTPS
    if (fromUrl.protocol === 'http:' && toUrl.protocol === 'https:') {
      return 'http-to-https';
    }

    // WWW normalization
    if (
      (fromUrl.hostname.startsWith('www.') && !toUrl.hostname.startsWith('www.')) ||
      (!fromUrl.hostname.startsWith('www.') && toUrl.hostname.startsWith('www.'))
    ) {
      return 'www-normalization';
    }

    // Domain change
    if (fromUrl.hostname !== toUrl.hostname) {
      return 'domain-change';
    }

    // Trailing slash normalization
    if (
      fromUrl.pathname.replace(/\/$/, '') === toUrl.pathname.replace(/\/$/, '') &&
      fromUrl.pathname !== toUrl.pathname
    ) {
      return 'trailing-slash';
    }

    // Path change
    if (fromUrl.pathname !== toUrl.pathname) {
      return 'path-change';
    }

    // Permanent vs temporary
    if (statusCode === 301 || statusCode === 308) {
      return 'permanent';
    }

    if (statusCode === 302 || statusCode === 307) {
      return 'temporary';
    }

    return 'other';
  } catch {
    return 'other';
  }
}

/**
 * Follow a single redirect
 */
function followRedirect(url: string): Promise<{
  statusCode: number;
  location: string | null;
  duration: number;
  error?: string;
}> {
  return new Promise((resolve) => {
    const start = Date.now();

    try {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        timeout: REQUEST_TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Crisp/1.0)',
        },
        rejectUnauthorized: false,
      };

      const req = client.request(options, (res) => {
        const duration = Date.now() - start;
        const location = res.headers.location || null;

        resolve({
          statusCode: res.statusCode || 0,
          location,
          duration,
        });

        req.destroy();
      });

      req.on('error', (err) => {
        resolve({
          statusCode: 0,
          location: null,
          duration: Date.now() - start,
          error: err.message,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          statusCode: 0,
          location: null,
          duration: Date.now() - start,
          error: 'Request timeout',
        });
      });

      req.end();
    } catch (err) {
      resolve({
        statusCode: 0,
        location: null,
        duration: Date.now() - start,
        error: (err as Error).message,
      });
    }
  });
}

/**
 * Resolve a relative URL against a base
 */
function resolveUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).toString();
  } catch {
    return relative;
  }
}

/**
 * Analyze redirect chain and generate issues
 */
function analyzeChain(chain: RedirectHop[]): RedirectIssue[] {
  const issues: RedirectIssue[] = [];

  // Too many redirects
  if (chain.length > 3) {
    issues.push({
      severity: 'high',
      description: `Redirect chain has ${chain.length - 1} hops (recommended: max 2)`,
      recommendation: 'Reduce redirect chain by updating links to point directly to final URL',
    });
  } else if (chain.length > 2) {
    issues.push({
      severity: 'medium',
      description: `Redirect chain has ${chain.length - 1} hop(s)`,
      recommendation: 'Consider reducing redirects for faster page load',
    });
  }

  // HTTP to HTTPS redirect (expected but adds latency)
  const httpToHttps = chain.find(h => h.type === 'http-to-https');
  if (httpToHttps) {
    issues.push({
      severity: 'low',
      description: 'HTTP to HTTPS redirect detected',
      recommendation: 'Consider HSTS preload to avoid HTTP roundtrip',
    });
  }

  // Multiple www/non-www redirects
  const wwwRedirects = chain.filter(h => h.type === 'www-normalization');
  if (wwwRedirects.length > 0) {
    issues.push({
      severity: 'low',
      description: 'WWW normalization redirect detected',
      recommendation: 'Update canonical links to use preferred domain format',
    });
  }

  // Temporary redirects for permanent URLs
  const tempRedirects = chain.filter(h => h.type === 'temporary');
  if (tempRedirects.length > 0) {
    issues.push({
      severity: 'medium',
      description: 'Temporary redirect (302/307) used instead of permanent (301/308)',
      recommendation: 'Use 301 or 308 for permanent redirects to improve SEO',
    });
  }

  // Slow redirects
  const slowRedirects = chain.filter(h => h.duration > 200);
  if (slowRedirects.length > 0) {
    const totalSlowTime = slowRedirects.reduce((sum, h) => sum + h.duration, 0);
    issues.push({
      severity: 'medium',
      description: `Slow redirects adding ${totalSlowTime}ms to page load`,
      recommendation: 'Optimize server response time for redirects',
    });
  }

  return issues;
}

/**
 * Calculate score based on redirect analysis
 */
function calculateScore(chain: RedirectHop[], issues: RedirectIssue[], totalTime: number): number {
  let score = 100;

  // Penalize based on number of redirects
  const redirectCount = chain.length - 1; // Exclude final destination
  if (redirectCount > 0) {
    score -= redirectCount * 10;
  }

  // Penalize based on total time
  if (totalTime > 500) {
    score -= 15;
  } else if (totalTime > 300) {
    score -= 10;
  } else if (totalTime > 100) {
    score -= 5;
  }

  // Penalize based on issues
  for (const issue of issues) {
    switch (issue.severity) {
      case 'high':
        score -= 15;
        break;
      case 'medium':
        score -= 8;
        break;
      case 'low':
        score -= 3;
        break;
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(
  chain: RedirectHop[],
  issues: RedirectIssue[],
  finalUrl: string,
  originalUrl: string
): string[] {
  const recommendations: string[] = [];

  if (chain.length > 1) {
    recommendations.push(`Update links to use final URL directly: ${finalUrl}`);
  }

  const httpToHttps = chain.find(h => h.type === 'http-to-https');
  if (httpToHttps) {
    recommendations.push('Enable HSTS with preload to skip HTTP redirect');
  }

  if (chain.length === 1 && issues.length === 0) {
    recommendations.push('No unnecessary redirects detected - configuration is optimal');
  }

  return recommendations;
}

export async function runRedirectAudit(url: string): Promise<RedirectAuditResult> {
  const chain: RedirectHop[] = [];
  let currentUrl = url;

  // Follow redirect chain
  while (chain.length < MAX_REDIRECTS) {
    const result = await followRedirect(currentUrl);

    const hop: RedirectHop = {
      url: currentUrl,
      statusCode: result.statusCode,
      duration: result.duration,
      location: result.location,
      type: 'other',
    };

    // Determine redirect type if there's a location
    if (result.location) {
      const resolvedLocation = resolveUrl(currentUrl, result.location);
      hop.type = getRedirectType(currentUrl, resolvedLocation, result.statusCode);
    }

    chain.push(hop);

    // Check if this is a redirect
    if (result.statusCode >= 300 && result.statusCode < 400 && result.location) {
      currentUrl = resolveUrl(currentUrl, result.location);
    } else {
      // Final destination or error
      break;
    }
  }

  const totalRedirects = chain.filter(h => h.statusCode >= 300 && h.statusCode < 400).length;
  const totalTime = chain.reduce((sum, h) => sum + h.duration, 0);
  const finalUrl = chain[chain.length - 1]?.url || url;

  const issues = analyzeChain(chain);
  const score = calculateScore(chain, issues, totalTime);
  const recommendations = generateRecommendations(chain, issues, finalUrl, url);

  return {
    score,
    redirectChain: chain,
    totalRedirects,
    totalTime,
    issues,
    finalUrl,
    recommendations,
  };
}
