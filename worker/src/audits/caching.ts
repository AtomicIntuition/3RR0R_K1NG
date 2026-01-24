import { Page, Response } from 'playwright';

export interface CacheAuditResult {
  score: number;
  resources: ResourceCacheInfo[];
  issues: CacheIssue[];
  summary: {
    totalResources: number;
    cached: number;
    notCached: number;
    immutable: number;
    withEtag: number;
    withLastModified: number;
    shortCache: number;
    longCache: number;
  };
  recommendations: string[];
}

export interface ResourceCacheInfo {
  url: string;
  type: ResourceType;
  cacheControl: string | null;
  expires: string | null;
  etag: string | null;
  lastModified: string | null;
  maxAge: number | null;
  isImmutable: boolean;
  isCacheable: boolean;
  cacheStatus: 'optimal' | 'suboptimal' | 'none';
}

export interface CacheIssue {
  url: string;
  type: ResourceType;
  issue: CacheIssueType;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

export type ResourceType = 'script' | 'stylesheet' | 'image' | 'font' | 'document' | 'other';
export type CacheIssueType =
  | 'no-cache-headers'
  | 'short-cache'
  | 'no-immutable'
  | 'no-etag'
  | 'excessive-cache'
  | 'private-should-be-public';

// Recommended cache durations in seconds
const RECOMMENDED_CACHE = {
  script: 31536000, // 1 year
  stylesheet: 31536000,
  image: 31536000,
  font: 31536000,
  document: 0, // HTML should revalidate
  other: 86400, // 1 day
};

const SHORT_CACHE_THRESHOLD = 86400; // 1 day
const LONG_CACHE_THRESHOLD = 604800; // 1 week

/**
 * Parse Cache-Control header
 */
function parseCacheControl(cacheControl: string | null): {
  maxAge: number | null;
  sMaxAge: number | null;
  noStore: boolean;
  noCache: boolean;
  isPrivate: boolean;
  isPublic: boolean;
  isImmutable: boolean;
  mustRevalidate: boolean;
} {
  if (!cacheControl) {
    return {
      maxAge: null,
      sMaxAge: null,
      noStore: false,
      noCache: false,
      isPrivate: false,
      isPublic: false,
      isImmutable: false,
      mustRevalidate: false,
    };
  }

  const lower = cacheControl.toLowerCase();

  const maxAgeMatch = lower.match(/max-age=(\d+)/);
  const sMaxAgeMatch = lower.match(/s-maxage=(\d+)/);

  return {
    maxAge: maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : null,
    sMaxAge: sMaxAgeMatch ? parseInt(sMaxAgeMatch[1], 10) : null,
    noStore: lower.includes('no-store'),
    noCache: lower.includes('no-cache'),
    isPrivate: lower.includes('private'),
    isPublic: lower.includes('public'),
    isImmutable: lower.includes('immutable'),
    mustRevalidate: lower.includes('must-revalidate'),
  };
}

/**
 * Determine resource type from URL and content-type
 */
function getResourceType(url: string, contentType: string | null): ResourceType {
  const urlLower = url.toLowerCase();

  // Check by file extension first
  if (urlLower.match(/\.(js|mjs|cjs)(\?|$)/)) return 'script';
  if (urlLower.match(/\.(css)(\?|$)/)) return 'stylesheet';
  if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)(\?|$)/)) return 'image';
  if (urlLower.match(/\.(woff|woff2|ttf|otf|eot)(\?|$)/)) return 'font';
  if (urlLower.match(/\.(html|htm)(\?|$)/)) return 'document';

  // Check by content-type
  if (contentType) {
    const ctLower = contentType.toLowerCase();
    if (ctLower.includes('javascript')) return 'script';
    if (ctLower.includes('css')) return 'stylesheet';
    if (ctLower.includes('image')) return 'image';
    if (ctLower.includes('font')) return 'font';
    if (ctLower.includes('html')) return 'document';
  }

  return 'other';
}

/**
 * Determine cache status based on headers
 */
function getCacheStatus(
  resourceType: ResourceType,
  parsed: ReturnType<typeof parseCacheControl>,
  hasEtag: boolean,
  hasLastModified: boolean
): 'optimal' | 'suboptimal' | 'none' {
  // Documents should not be cached long-term
  if (resourceType === 'document') {
    if (parsed.noCache || parsed.noStore || parsed.mustRevalidate) {
      return 'optimal';
    }
    if (parsed.maxAge !== null && parsed.maxAge > 0) {
      return 'suboptimal'; // HTML shouldn't have long cache
    }
    return hasEtag || hasLastModified ? 'optimal' : 'suboptimal';
  }

  // Static assets should be cached
  const recommendedDuration = RECOMMENDED_CACHE[resourceType];

  if (parsed.noStore) {
    return 'none'; // Explicitly not cached
  }

  if (parsed.maxAge === null) {
    return hasEtag || hasLastModified ? 'suboptimal' : 'none';
  }

  if (parsed.maxAge >= recommendedDuration * 0.9) {
    return 'optimal';
  }

  if (parsed.maxAge >= SHORT_CACHE_THRESHOLD) {
    return 'suboptimal';
  }

  return 'none';
}

/**
 * Generate issues for a resource
 */
function analyzeResource(resource: ResourceCacheInfo): CacheIssue[] {
  const issues: CacheIssue[] = [];
  const parsed = parseCacheControl(resource.cacheControl);

  // Skip document type - different caching rules
  if (resource.type === 'document') {
    // Check if HTML has excessive caching
    if (parsed.maxAge && parsed.maxAge > 3600 && !parsed.mustRevalidate) {
      issues.push({
        url: resource.url,
        type: resource.type,
        issue: 'excessive-cache',
        severity: 'medium',
        description: `HTML document cached for ${Math.round(parsed.maxAge / 3600)} hours without revalidation`,
        recommendation: 'Use Cache-Control: no-cache or must-revalidate for HTML documents',
      });
    }
    return issues;
  }

  // Check for missing cache headers on static assets
  if (!resource.cacheControl && resource.type !== 'other') {
    issues.push({
      url: resource.url,
      type: resource.type,
      issue: 'no-cache-headers',
      severity: 'high',
      description: `${resource.type} has no Cache-Control header`,
      recommendation: `Add Cache-Control: public, max-age=31536000, immutable for static ${resource.type}s`,
    });
    return issues;
  }

  // Check for short cache on static assets
  if (parsed.maxAge !== null && parsed.maxAge < LONG_CACHE_THRESHOLD && resource.type !== 'other') {
    issues.push({
      url: resource.url,
      type: resource.type,
      issue: 'short-cache',
      severity: 'medium',
      description: `${resource.type} cached for only ${Math.round(parsed.maxAge / 3600)} hours`,
      recommendation: `Increase cache duration to 1 year (31536000 seconds) for static assets with versioned URLs`,
    });
  }

  // Check for missing immutable directive on versioned assets
  const hasHash = resource.url.match(/[.-][a-f0-9]{8,}[.-]/i) || resource.url.includes('_next/static');
  if (hasHash && !parsed.isImmutable && parsed.maxAge && parsed.maxAge > LONG_CACHE_THRESHOLD) {
    issues.push({
      url: resource.url,
      type: resource.type,
      issue: 'no-immutable',
      severity: 'low',
      description: 'Versioned asset missing immutable directive',
      recommendation: 'Add immutable to Cache-Control for content-hashed assets',
    });
  }

  // Check for missing ETag on assets without long cache
  if (!resource.etag && !resource.lastModified && parsed.maxAge && parsed.maxAge < LONG_CACHE_THRESHOLD) {
    issues.push({
      url: resource.url,
      type: resource.type,
      issue: 'no-etag',
      severity: 'low',
      description: 'Resource missing ETag/Last-Modified for conditional requests',
      recommendation: 'Add ETag header to enable efficient conditional requests',
    });
  }

  return issues;
}

/**
 * Calculate score based on caching analysis
 */
function calculateScore(resources: ResourceCacheInfo[], issues: CacheIssue[]): number {
  if (resources.length === 0) return 100;

  let score = 100;

  // Penalize based on issues
  for (const issue of issues) {
    switch (issue.severity) {
      case 'high':
        score -= 10;
        break;
      case 'medium':
        score -= 5;
        break;
      case 'low':
        score -= 2;
        break;
    }
  }

  // Bonus for good caching
  const optimalCount = resources.filter(r => r.cacheStatus === 'optimal').length;
  const optimalRatio = optimalCount / resources.length;
  if (optimalRatio > 0.8) {
    score = Math.min(100, score + 10);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(resources: ResourceCacheInfo[], issues: CacheIssue[]): string[] {
  const recommendations: string[] = [];

  const noCacheCount = issues.filter(i => i.issue === 'no-cache-headers').length;
  const shortCacheCount = issues.filter(i => i.issue === 'short-cache').length;

  if (noCacheCount > 0) {
    recommendations.push(`Add Cache-Control headers to ${noCacheCount} static resources`);
  }

  if (shortCacheCount > 0) {
    recommendations.push(`Increase cache duration for ${shortCacheCount} resources to reduce repeat downloads`);
  }

  const hasVersionedAssets = resources.some(r =>
    r.url.match(/[.-][a-f0-9]{8,}[.-]/i) || r.url.includes('_next/static')
  );

  if (hasVersionedAssets) {
    recommendations.push('Consider using immutable directive for content-hashed assets');
  }

  if (recommendations.length === 0) {
    recommendations.push('Cache configuration is well optimized');
  }

  return recommendations;
}

export async function runCacheAudit(page: Page): Promise<CacheAuditResult> {
  const resources: ResourceCacheInfo[] = [];

  // Collect response headers during navigation
  const responseHeaders = new Map<string, {
    cacheControl: string | null;
    expires: string | null;
    etag: string | null;
    lastModified: string | null;
    contentType: string | null;
  }>();

  const responseHandler = async (response: Response) => {
    try {
      const headers = response.headers();
      responseHeaders.set(response.url(), {
        cacheControl: headers['cache-control'] || null,
        expires: headers['expires'] || null,
        etag: headers['etag'] || null,
        lastModified: headers['last-modified'] || null,
        contentType: headers['content-type'] || null,
      });
    } catch {
      // Ignore errors from failed responses
    }
  };

  page.on('response', responseHandler);

  // Wait for any in-flight requests
  await page.waitForTimeout(1000);

  // Process collected headers
  for (const [url, headers] of responseHeaders) {
    // Skip data URIs and blob URLs
    if (url.startsWith('data:') || url.startsWith('blob:')) continue;

    const resourceType = getResourceType(url, headers.contentType);
    const parsed = parseCacheControl(headers.cacheControl);
    const hasEtag = !!headers.etag;
    const hasLastModified = !!headers.lastModified;

    resources.push({
      url,
      type: resourceType,
      cacheControl: headers.cacheControl,
      expires: headers.expires,
      etag: headers.etag,
      lastModified: headers.lastModified,
      maxAge: parsed.maxAge,
      isImmutable: parsed.isImmutable,
      isCacheable: !parsed.noStore,
      cacheStatus: getCacheStatus(resourceType, parsed, hasEtag, hasLastModified),
    });
  }

  // Analyze resources and generate issues
  const issues: CacheIssue[] = [];
  for (const resource of resources) {
    issues.push(...analyzeResource(resource));
  }

  // Calculate summary
  const summary = {
    totalResources: resources.length,
    cached: resources.filter(r => r.isCacheable && r.maxAge !== null && r.maxAge > 0).length,
    notCached: resources.filter(r => !r.isCacheable || r.maxAge === null || r.maxAge === 0).length,
    immutable: resources.filter(r => r.isImmutable).length,
    withEtag: resources.filter(r => r.etag).length,
    withLastModified: resources.filter(r => r.lastModified).length,
    shortCache: resources.filter(r => r.maxAge !== null && r.maxAge > 0 && r.maxAge < LONG_CACHE_THRESHOLD).length,
    longCache: resources.filter(r => r.maxAge !== null && r.maxAge >= LONG_CACHE_THRESHOLD).length,
  };

  const score = calculateScore(resources, issues);
  const recommendations = generateRecommendations(resources, issues);

  // Remove response handler
  page.off('response', responseHandler);

  return {
    score,
    resources: resources.slice(0, 50), // Limit for storage
    issues: issues.slice(0, 20),
    summary,
    recommendations,
  };
}
