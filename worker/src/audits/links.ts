/**
 * Link Audit
 * Checks for broken links, redirects, and insecure HTTP links
 */

import { Page } from 'playwright';

export interface LinkAuditResult {
  score: number;
  totalLinks: number;
  internalLinks: number;
  externalLinks: number;
  checkedLinks: number;
  brokenLinks: BrokenLink[];
  redirectedLinks: RedirectedLink[];
  insecureLinks: InsecureLink[];
  issues: LinkIssue[];
}

export interface BrokenLink {
  url: string;
  statusCode: number;
  anchorText: string;
  isExternal: boolean;
  error?: string;
}

export interface RedirectedLink {
  url: string;
  statusCode: number;
  redirectTo?: string;
  anchorText: string;
  isExternal: boolean;
}

export interface InsecureLink {
  url: string;
  anchorText: string;
}

export interface LinkIssue {
  severity: 'high' | 'medium' | 'low';
  type: string;
  description: string;
  count: number;
  examples: string[];
}

interface LinkInfo {
  href: string;
  text: string;
  isExternal: boolean;
}

// Max links to check to avoid excessive requests
const MAX_LINKS_TO_CHECK = 30;

// Timeout for link checking
const LINK_CHECK_TIMEOUT = 5000;

/**
 * Run link audit
 */
export async function runLinkAudit(page: Page, baseUrl: string): Promise<LinkAuditResult> {
  const issues: LinkIssue[] = [];
  const brokenLinks: BrokenLink[] = [];
  const redirectedLinks: RedirectedLink[] = [];
  const insecureLinks: InsecureLink[] = [];

  // Extract all links from page
  const allLinks = await page.evaluate(() => {
    const anchors = document.querySelectorAll('a[href]');
    return Array.from(anchors)
      .map(a => {
        const anchor = a as HTMLAnchorElement;
        return {
          href: anchor.href,
          text: (a.textContent || '').trim().slice(0, 50),
          isExternal: anchor.host !== window.location.host,
        };
      })
      .filter(link => {
        // Filter out non-HTTP links
        return (
          link.href.startsWith('http://') ||
          link.href.startsWith('https://')
        );
      });
  });

  // Remove duplicates
  const uniqueLinks = allLinks.filter(
    (link, index, self) =>
      index === self.findIndex(l => l.href === link.href)
  );

  const totalLinks = uniqueLinks.length;
  const internalLinks = uniqueLinks.filter(l => !l.isExternal).length;
  const externalLinks = uniqueLinks.filter(l => l.isExternal).length;

  // Check for insecure HTTP links on HTTPS page
  const isHttpsSite = baseUrl.startsWith('https://');
  if (isHttpsSite) {
    for (const link of uniqueLinks) {
      if (link.href.startsWith('http://')) {
        insecureLinks.push({
          url: link.href,
          anchorText: link.text,
        });
      }
    }
  }

  // Prioritize internal links, then take some external
  const internalLinksToCheck = uniqueLinks
    .filter(l => !l.isExternal)
    .slice(0, Math.ceil(MAX_LINKS_TO_CHECK * 0.7));

  const externalLinksToCheck = uniqueLinks
    .filter(l => l.isExternal)
    .slice(0, MAX_LINKS_TO_CHECK - internalLinksToCheck.length);

  const linksToCheck = [...internalLinksToCheck, ...externalLinksToCheck];

  // Check links with concurrency limit
  const concurrency = 5;
  const results: Array<{
    link: LinkInfo;
    status: number;
    error?: string;
    redirectTo?: string;
  }> = [];

  for (let i = 0; i < linksToCheck.length; i += concurrency) {
    const batch = linksToCheck.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async link => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), LINK_CHECK_TIMEOUT);

          const response = await fetch(link.href, {
            method: 'HEAD',
            redirect: 'manual',
            signal: controller.signal,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (compatible; 3RROR_K1NG/1.0; Link Checker)',
            },
          });

          clearTimeout(timeout);

          return {
            link,
            status: response.status,
            redirectTo: response.headers.get('location') || undefined,
          };
        } catch (error) {
          return {
            link,
            status: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    results.push(...batchResults);
  }

  // Process results
  for (const result of results) {
    const { link, status, error, redirectTo } = result;

    // Broken links (4xx, 5xx, or connection errors)
    if (status === 0 || status >= 400) {
      brokenLinks.push({
        url: link.href,
        statusCode: status,
        anchorText: link.text,
        isExternal: link.isExternal,
        error,
      });
    }

    // Redirected links (3xx)
    if (status >= 300 && status < 400) {
      redirectedLinks.push({
        url: link.href,
        statusCode: status,
        redirectTo,
        anchorText: link.text,
        isExternal: link.isExternal,
      });
    }
  }

  // Generate issues summary
  if (brokenLinks.length > 0) {
    issues.push({
      severity: 'high',
      type: 'Broken Links',
      description: `${brokenLinks.length} broken links found that return errors`,
      count: brokenLinks.length,
      examples: brokenLinks.slice(0, 3).map(l => l.url),
    });
  }

  if (redirectedLinks.length > 0) {
    // Only flag excessive redirects as medium priority
    const permanentRedirects = redirectedLinks.filter(l => l.statusCode === 301);
    if (permanentRedirects.length > 0) {
      issues.push({
        severity: 'low',
        type: 'Permanent Redirects',
        description: `${permanentRedirects.length} links point to URLs that permanently redirect. Update to final URLs for better performance.`,
        count: permanentRedirects.length,
        examples: permanentRedirects.slice(0, 3).map(l => l.url),
      });
    }
  }

  if (insecureLinks.length > 0) {
    issues.push({
      severity: 'medium',
      type: 'Insecure Links',
      description: `${insecureLinks.length} HTTP links found on HTTPS site (mixed content)`,
      count: insecureLinks.length,
      examples: insecureLinks.slice(0, 3).map(l => l.url),
    });
  }

  // Calculate score
  let score = 100;

  // Penalize for broken links (high impact)
  score -= brokenLinks.length * 10;

  // Penalize for insecure links (medium impact)
  score -= insecureLinks.length * 5;

  // Small penalty for redirects
  score -= redirectedLinks.length * 1;

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    totalLinks,
    internalLinks,
    externalLinks,
    checkedLinks: linksToCheck.length,
    brokenLinks,
    redirectedLinks,
    insecureLinks,
    issues,
  };
}
