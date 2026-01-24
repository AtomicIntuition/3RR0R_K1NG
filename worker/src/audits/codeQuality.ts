import { Page } from 'playwright';

export interface CodeQualityIssue {
  id: string;
  type: 'console_error' | 'broken_link' | 'deprecated_api' | 'mixed_content';
  message: string;
  source?: string;
  count: number;
}

export interface CodeQualityAuditResult {
  score: number;
  issues: CodeQualityIssue[];
}

interface ConsoleError {
  type: string;
  text: string;
}

export async function runCodeQualityAudit(
  page: Page,
  consoleErrors: ConsoleError[],
  pageErrors: Error[]
): Promise<CodeQualityAuditResult> {
  const issues: CodeQualityIssue[] = [];

  // Process console errors
  const errorMap = new Map<string, number>();
  for (const error of consoleErrors) {
    const key = error.text.slice(0, 100); // Group similar errors
    errorMap.set(key, (errorMap.get(key) || 0) + 1);
  }

  for (const [message, count] of errorMap) {
    issues.push({
      id: `console-${issues.length}`,
      type: 'console_error',
      message,
      count,
    });
  }

  // Process page errors (uncaught exceptions)
  for (const error of pageErrors) {
    issues.push({
      id: `pageerror-${issues.length}`,
      type: 'console_error',
      message: error.message,
      source: error.stack?.split('\n')[1]?.trim(),
      count: 1,
    });
  }

  // Check for broken links - get links first, then check outside evaluate
  const linkHrefs = await page.evaluate(() => {
    const linkEls = document.querySelectorAll('a[href]');
    const hrefs: string[] = [];
    const max = Math.min(linkEls.length, 20);
    for (let i = 0; i < max; i++) {
      const href = linkEls[i].getAttribute('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        hrefs.push(href);
      }
    }
    return { hrefs, origin: window.location.origin };
  });

  const brokenLinks: string[] = [];
  for (const href of linkHrefs.hrefs) {
    try {
      const linkUrl = new URL(href, linkHrefs.origin);
      if (linkUrl.origin !== linkHrefs.origin) continue; // Skip external
      const resp = await page.request.head(linkUrl.href).catch(() => null);
      if (!resp || !resp.ok()) {
        brokenLinks.push(href);
      }
    } catch {
      // Skip
    }
  }

  if (brokenLinks.length > 0) {
    issues.push({
      id: 'broken-links',
      type: 'broken_link',
      message: `Found ${brokenLinks.length} broken internal link(s)`,
      source: brokenLinks.slice(0, 3).join(', '),
      count: brokenLinks.length,
    });
  }

  // Check for deprecated APIs
  const deprecatedApis = await page.evaluate(() => {
    const deprecated: string[] = [];

    // Check for common deprecated patterns
    if (typeof (document as any).all !== 'undefined') {
      deprecated.push('document.all');
    }

    // Check for inline event handlers (considered bad practice)
    const inlineHandlers = document.querySelectorAll('[onclick], [onmouseover], [onload], [onerror]');
    if (inlineHandlers.length > 5) {
      deprecated.push(inlineHandlers.length + ' inline event handlers');
    }

    // Check for document.write
    const scriptEls = document.querySelectorAll('script');
    for (let i = 0; i < scriptEls.length; i++) {
      const content = scriptEls[i].textContent;
      if (content && content.includes('document.write')) {
        deprecated.push('document.write()');
        break;
      }
    }

    return deprecated;
  });

  for (const api of deprecatedApis) {
    issues.push({
      id: `deprecated-${issues.length}`,
      type: 'deprecated_api',
      message: `Using deprecated: ${api}`,
      count: 1,
    });
  }

  // Check for mixed content
  const mixedContent = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const mixed: string[] = [];
    for (let i = 0; i < resources.length; i++) {
      if (resources[i].name.startsWith('http://')) {
        mixed.push(resources[i].name);
      }
    }
    return mixed;
  });

  if (mixedContent.length > 0) {
    issues.push({
      id: 'mixed-content',
      type: 'mixed_content',
      message: `${mixedContent.length} resource(s) loaded over insecure HTTP`,
      source: mixedContent.slice(0, 3).join(', '),
      count: mixedContent.length,
    });
  }

  // Calculate score
  let penalty = 0;
  for (const issue of issues) {
    switch (issue.type) {
      case 'console_error':
        penalty += 5 * Math.min(issue.count, 5); // Max 25 per error type
        break;
      case 'broken_link':
        penalty += 3 * issue.count;
        break;
      case 'deprecated_api':
        penalty += 10;
        break;
      case 'mixed_content':
        penalty += 15;
        break;
    }
  }

  const score = Math.max(0, 100 - penalty);

  return {
    score,
    issues,
  };
}
