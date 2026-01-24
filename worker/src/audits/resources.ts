import { Page } from 'playwright';

export interface ResourceEntry {
  url: string;
  type: 'script' | 'stylesheet' | 'image' | 'font' | 'xhr' | 'fetch' | 'document' | 'other';
  domain: string;
  isThirdParty: boolean;
  size: number;           // Transfer size in bytes
  duration: number;       // Total load time in ms
  startTime: number;      // When request started (relative to navigation)
  // Timing breakdown
  timing: {
    dns: number;          // DNS lookup
    connect: number;      // TCP connection
    ssl: number;          // SSL handshake
    ttfb: number;         // Time to first byte
    download: number;     // Content download
  };
  // Render blocking detection
  isRenderBlocking: boolean;
  // Cache status
  fromCache: boolean;
}

export interface ThirdPartyDomain {
  domain: string;
  resourceCount: number;
  totalSize: number;
  totalDuration: number;
  types: string[];
  // Impact assessment
  impact: 'high' | 'medium' | 'low';
  category?: string;  // analytics, ads, cdn, social, etc.
}

export interface ResourceAnalysis {
  // Summary stats
  totalResources: number;
  totalSize: number;
  totalDuration: number;

  // By type breakdown
  byType: Record<string, {
    count: number;
    size: number;
    duration: number;
  }>;

  // First vs third party
  firstParty: {
    count: number;
    size: number;
    duration: number;
  };
  thirdParty: {
    count: number;
    size: number;
    duration: number;
    domains: ThirdPartyDomain[];
  };

  // Render blocking resources
  renderBlocking: {
    scripts: ResourceEntry[];
    stylesheets: ResourceEntry[];
    totalBlockingTime: number;
  };

  // Largest resources (for optimization recommendations)
  largestResources: ResourceEntry[];

  // Slowest resources (for performance bottlenecks)
  slowestResources: ResourceEntry[];

  // Waterfall data (simplified for visualization)
  waterfall: Array<{
    url: string;
    shortUrl: string;
    type: string;
    startTime: number;
    duration: number;
    size: number;
    isThirdParty: boolean;
  }>;

  // Issues found
  issues: ResourceIssue[];
}

export interface ResourceIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  affectedResources?: string[];
}

// Known third-party categories
const THIRD_PARTY_CATEGORIES: Record<string, string> = {
  'google-analytics.com': 'analytics',
  'googletagmanager.com': 'analytics',
  'analytics.google.com': 'analytics',
  'hotjar.com': 'analytics',
  'mixpanel.com': 'analytics',
  'segment.io': 'analytics',
  'segment.com': 'analytics',
  'amplitude.com': 'analytics',
  'heap.io': 'analytics',
  'facebook.net': 'social',
  'facebook.com': 'social',
  'twitter.com': 'social',
  'linkedin.com': 'social',
  'pinterest.com': 'social',
  'doubleclick.net': 'ads',
  'googlesyndication.com': 'ads',
  'googleadservices.com': 'ads',
  'adsense.google.com': 'ads',
  'cloudflare.com': 'cdn',
  'cloudflareinsights.com': 'analytics',
  'jsdelivr.net': 'cdn',
  'unpkg.com': 'cdn',
  'cdnjs.cloudflare.com': 'cdn',
  'fastly.net': 'cdn',
  'akamai.net': 'cdn',
  'fonts.googleapis.com': 'fonts',
  'fonts.gstatic.com': 'fonts',
  'typekit.net': 'fonts',
  'use.fontawesome.com': 'fonts',
  'stripe.com': 'payment',
  'js.stripe.com': 'payment',
  'paypal.com': 'payment',
  'sentry.io': 'monitoring',
  'newrelic.com': 'monitoring',
  'datadog.com': 'monitoring',
  'intercom.io': 'chat',
  'crisp.chat': 'chat',
  'zendesk.com': 'support',
};

function categorizeThirdParty(domain: string): string | undefined {
  for (const [pattern, category] of Object.entries(THIRD_PARTY_CATEGORIES)) {
    if (domain.includes(pattern)) {
      return category;
    }
  }
  return undefined;
}

function getResourceType(initiatorType: string, url: string): ResourceEntry['type'] {
  if (initiatorType === 'script' || url.endsWith('.js') || url.includes('.js?')) return 'script';
  if (initiatorType === 'css' || initiatorType === 'link' || url.endsWith('.css') || url.includes('.css?')) return 'stylesheet';
  if (initiatorType === 'img' || /\.(jpg|jpeg|png|gif|webp|svg|ico|avif)(\?|$)/i.test(url)) return 'image';
  if (/\.(woff2?|ttf|otf|eot)(\?|$)/i.test(url)) return 'font';
  if (initiatorType === 'xmlhttprequest') return 'xhr';
  if (initiatorType === 'fetch') return 'fetch';
  if (initiatorType === 'navigation') return 'document';
  return 'other';
}

function shortenUrl(url: string, maxLength = 60): string {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname + urlObj.search;
    if (path.length <= maxLength) return path;
    return path.slice(0, maxLength - 3) + '...';
  } catch {
    return url.slice(0, maxLength);
  }
}

function assessImpact(domain: ThirdPartyDomain): 'high' | 'medium' | 'low' {
  // High impact: >500KB or >1s total
  if (domain.totalSize > 500 * 1024 || domain.totalDuration > 1000) return 'high';
  // Medium impact: >100KB or >500ms
  if (domain.totalSize > 100 * 1024 || domain.totalDuration > 500) return 'medium';
  return 'low';
}

export async function runResourceAnalysis(page: Page): Promise<ResourceAnalysis> {
  const pageUrl = page.url();
  const pageDomain = new URL(pageUrl).hostname;

  // Default fallback values for when page.evaluate crashes
  const defaultResourceData = {
    resources: [] as Array<{
      name: string;
      initiatorType: string;
      transferSize: number;
      encodedBodySize: number;
      decodedBodySize: number;
      duration: number;
      startTime: number;
      domainLookupStart: number;
      domainLookupEnd: number;
      connectStart: number;
      connectEnd: number;
      secureConnectionStart: number;
      requestStart: number;
      responseStart: number;
      responseEnd: number;
    }>,
    navigation: null as { domContentLoaded: number; load: number } | null,
  };

  const defaultRenderBlockingData = {
    scripts: [] as string[],
    stylesheets: [] as string[],
  };

  // Collect resource timing data from the browser - wrapped in try-catch
  let resourceData = defaultResourceData;
  try {
    resourceData = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      // Limit to first 200 entries to prevent crashes on heavy pages
      const limitedEntries = entries.slice(0, 200);
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      return {
        resources: limitedEntries.map(entry => ({
          name: entry.name,
          initiatorType: entry.initiatorType,
          transferSize: entry.transferSize,
          encodedBodySize: entry.encodedBodySize,
          decodedBodySize: entry.decodedBodySize,
          duration: entry.duration,
          startTime: entry.startTime,
          domainLookupStart: entry.domainLookupStart,
          domainLookupEnd: entry.domainLookupEnd,
          connectStart: entry.connectStart,
          connectEnd: entry.connectEnd,
          secureConnectionStart: entry.secureConnectionStart,
          requestStart: entry.requestStart,
          responseStart: entry.responseStart,
          responseEnd: entry.responseEnd,
        })),
        navigation: navEntry ? {
          domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.startTime,
          load: navEntry.loadEventEnd - navEntry.startTime,
        } : null,
      };
    }).catch(() => defaultResourceData);
  } catch (e) {
    console.warn('Resource timing collection failed:', e);
    resourceData = defaultResourceData;
  }

  // Detect render-blocking resources - wrapped in try-catch
  let renderBlockingData = defaultRenderBlockingData;
  try {
    renderBlockingData = await page.evaluate(() => {
      const blocking: { scripts: string[]; stylesheets: string[] } = {
        scripts: [],
        stylesheets: [],
      };

      // Scripts in head without defer/async are render-blocking (limit to 20)
      const scriptEls = document.querySelectorAll('head script[src]');
      const maxScripts = Math.min(scriptEls.length, 20);
      for (let i = 0; i < maxScripts; i++) {
        const script = scriptEls[i] as HTMLScriptElement;
        if (!script.defer && !script.async) {
          blocking.scripts.push(script.src);
        }
      }

      // Stylesheets without media="print" are render-blocking (limit to 20)
      const linkEls = document.querySelectorAll('link[rel="stylesheet"]');
      const maxLinks = Math.min(linkEls.length, 20);
      for (let i = 0; i < maxLinks; i++) {
        const link = linkEls[i] as HTMLLinkElement;
        if (link.media !== 'print' && !link.href.includes('fonts.googleapis.com')) {
          blocking.stylesheets.push(link.href);
        }
      }

      return blocking;
    }).catch(() => defaultRenderBlockingData);
  } catch (e) {
    console.warn('Render-blocking detection failed:', e);
    renderBlockingData = defaultRenderBlockingData;
  }

  // Process resources
  const resources: ResourceEntry[] = [];
  const byType: ResourceAnalysis['byType'] = {};
  const domainMap = new Map<string, ThirdPartyDomain>();

  for (const entry of resourceData.resources) {
    try {
      const url = entry.name;
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const isThirdParty = domain !== pageDomain && !domain.endsWith(`.${pageDomain}`);
      const type = getResourceType(entry.initiatorType, url);

      const resource: ResourceEntry = {
        url,
        type,
        domain,
        isThirdParty,
        size: entry.transferSize || entry.encodedBodySize || 0,
        duration: entry.duration,
        startTime: entry.startTime,
        timing: {
          dns: entry.domainLookupEnd - entry.domainLookupStart,
          connect: entry.connectEnd - entry.connectStart,
          ssl: entry.secureConnectionStart > 0
            ? entry.connectEnd - entry.secureConnectionStart
            : 0,
          ttfb: entry.responseStart - entry.requestStart,
          download: entry.responseEnd - entry.responseStart,
        },
        isRenderBlocking: renderBlockingData.scripts.includes(url) ||
                         renderBlockingData.stylesheets.includes(url),
        fromCache: entry.transferSize === 0 && entry.encodedBodySize > 0,
      };

      resources.push(resource);

      // Aggregate by type
      if (!byType[type]) {
        byType[type] = { count: 0, size: 0, duration: 0 };
      }
      byType[type].count++;
      byType[type].size += resource.size;
      byType[type].duration += resource.duration;

      // Aggregate third-party domains
      if (isThirdParty) {
        if (!domainMap.has(domain)) {
          domainMap.set(domain, {
            domain,
            resourceCount: 0,
            totalSize: 0,
            totalDuration: 0,
            types: [],
            impact: 'low',
            category: categorizeThirdParty(domain),
          });
        }
        const domainInfo = domainMap.get(domain)!;
        domainInfo.resourceCount++;
        domainInfo.totalSize += resource.size;
        domainInfo.totalDuration += resource.duration;
        if (!domainInfo.types.includes(type)) {
          domainInfo.types.push(type);
        }
      }
    } catch (e) {
      // Skip invalid URLs
    }
  }

  // Calculate impact for third-party domains
  const thirdPartyDomains = Array.from(domainMap.values()).map(d => ({
    ...d,
    impact: assessImpact(d),
  })).sort((a, b) => b.totalSize - a.totalSize);

  // Separate first vs third party stats
  const firstPartyResources = resources.filter(r => !r.isThirdParty);
  const thirdPartyResources = resources.filter(r => r.isThirdParty);

  // Get render-blocking resources
  const renderBlockingScripts = resources.filter(r =>
    r.isRenderBlocking && r.type === 'script'
  );
  const renderBlockingStylesheets = resources.filter(r =>
    r.isRenderBlocking && r.type === 'stylesheet'
  );

  // Identify issues
  const issues: ResourceIssue[] = [];

  // Issue: Large third-party footprint
  const thirdPartySize = thirdPartyResources.reduce((sum, r) => sum + r.size, 0);
  const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
  if (thirdPartySize > totalSize * 0.5) {
    issues.push({
      severity: 'high',
      title: 'Heavy Third-Party Dependency',
      description: `Third-party resources account for ${Math.round(thirdPartySize / totalSize * 100)}% of page weight.`,
      recommendation: 'Audit third-party scripts. Consider self-hosting critical resources or lazy-loading non-essential ones.',
      affectedResources: thirdPartyDomains.slice(0, 5).map(d => d.domain),
    });
  }

  // Issue: Too many render-blocking resources
  const totalBlockingTime = [...renderBlockingScripts, ...renderBlockingStylesheets]
    .reduce((sum, r) => sum + r.duration, 0);
  if (renderBlockingScripts.length + renderBlockingStylesheets.length > 3) {
    issues.push({
      severity: 'high',
      title: 'Multiple Render-Blocking Resources',
      description: `${renderBlockingScripts.length} scripts and ${renderBlockingStylesheets.length} stylesheets block rendering.`,
      recommendation: 'Add defer/async to scripts. Inline critical CSS and load the rest asynchronously.',
      affectedResources: [...renderBlockingScripts, ...renderBlockingStylesheets]
        .slice(0, 5).map(r => shortenUrl(r.url)),
    });
  }

  // Issue: Large images
  const largeImages = resources.filter(r => r.type === 'image' && r.size > 200 * 1024);
  if (largeImages.length > 0) {
    issues.push({
      severity: 'medium',
      title: 'Large Unoptimized Images',
      description: `${largeImages.length} image(s) over 200KB detected.`,
      recommendation: 'Compress images, use WebP/AVIF format, and implement responsive images with srcset.',
      affectedResources: largeImages.slice(0, 5).map(r => `${shortenUrl(r.url)} (${Math.round(r.size / 1024)}KB)`),
    });
  }

  // Issue: No caching
  const uncachedResources = resources.filter(r => !r.fromCache && r.size > 10 * 1024);
  if (uncachedResources.length > resources.length * 0.7) {
    issues.push({
      severity: 'medium',
      title: 'Resources Not Cached',
      description: 'Most resources are not being served from cache.',
      recommendation: 'Implement proper Cache-Control headers. Use CDN for static assets.',
    });
  }

  // Issue: Slow DNS/Connection for third parties
  const slowConnections = thirdPartyResources.filter(r =>
    r.timing.dns > 100 || r.timing.connect > 200
  );
  if (slowConnections.length > 0) {
    issues.push({
      severity: 'low',
      title: 'Slow Third-Party Connections',
      description: `${slowConnections.length} third-party resource(s) have slow DNS/connection times.`,
      recommendation: 'Add dns-prefetch and preconnect hints for critical third-party origins.',
      affectedResources: [...new Set(slowConnections.map(r => r.domain))].slice(0, 5),
    });
  }

  // Build waterfall data (top 50 resources by start time)
  const waterfall = resources
    .sort((a, b) => a.startTime - b.startTime)
    .slice(0, 50)
    .map(r => ({
      url: r.url,
      shortUrl: shortenUrl(r.url, 40),
      type: r.type,
      startTime: Math.round(r.startTime),
      duration: Math.round(r.duration),
      size: r.size,
      isThirdParty: r.isThirdParty,
    }));

  return {
    totalResources: resources.length,
    totalSize,
    totalDuration: resourceData.navigation?.load || 0,
    byType,
    firstParty: {
      count: firstPartyResources.length,
      size: firstPartyResources.reduce((sum, r) => sum + r.size, 0),
      duration: firstPartyResources.reduce((sum, r) => sum + r.duration, 0),
    },
    thirdParty: {
      count: thirdPartyResources.length,
      size: thirdPartySize,
      duration: thirdPartyResources.reduce((sum, r) => sum + r.duration, 0),
      domains: thirdPartyDomains,
    },
    renderBlocking: {
      scripts: renderBlockingScripts,
      stylesheets: renderBlockingStylesheets,
      totalBlockingTime,
    },
    largestResources: [...resources]
      .sort((a, b) => b.size - a.size)
      .slice(0, 10),
    slowestResources: [...resources]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10),
    waterfall,
    issues,
  };
}
