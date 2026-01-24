import { Page } from 'playwright';
import * as http2 from 'http2';
import * as https from 'https';

export interface ProtocolInfo {
  httpVersion: string; // 'HTTP/1.1', 'HTTP/2', 'HTTP/3'
  http2Supported: boolean;
  http3Supported: boolean;
  alpn?: string;
  altSvc?: string;
  serverPush: boolean;
  resourceProtocols: ResourceProtocol[];
  score: number;
  recommendations: string[];
}

export interface ResourceProtocol {
  url: string;
  protocol: string;
  type: string;
}

/**
 * Check if HTTP/2 is supported using http2 module
 */
async function checkHttp2Support(hostname: string): Promise<{ supported: boolean; alpn?: string }> {
  return new Promise((resolve) => {
    try {
      const client = http2.connect(`https://${hostname}`, {
        rejectUnauthorized: false,
      });

      const timeout = setTimeout(() => {
        client.close();
        resolve({ supported: false });
      }, 5000);

      client.on('connect', () => {
        clearTimeout(timeout);
        const alpn = (client as any).alpnProtocol;
        client.close();
        resolve({ supported: true, alpn });
      });

      client.on('error', () => {
        clearTimeout(timeout);
        client.close();
        resolve({ supported: false });
      });
    } catch {
      resolve({ supported: false });
    }
  });
}

/**
 * Check for HTTP/3 support via Alt-Svc header
 */
async function checkHttp3Support(url: string): Promise<{ supported: boolean; altSvc?: string }> {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);

      const req = https.request({
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname || '/',
        method: 'HEAD',
        rejectUnauthorized: false,
        timeout: 5000,
      }, (res) => {
        const altSvc = res.headers['alt-svc'];
        const altSvcStr = Array.isArray(altSvc) ? altSvc.join(', ') : altSvc;
        const supportsH3 = altSvcStr?.includes('h3') || altSvcStr?.includes('quic');
        resolve({
          supported: !!supportsH3,
          altSvc: altSvcStr,
        });
        req.destroy();
      });

      req.on('error', () => {
        resolve({ supported: false });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ supported: false });
      });

      req.end();
    } catch {
      resolve({ supported: false });
    }
  });
}

/**
 * Get protocol information from resource timing
 */
async function getResourceProtocols(page: Page): Promise<ResourceProtocol[]> {
  try {
    return await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const max = Math.min(entries.length, 200); // Limit entries
      const result: Array<{ url: string; protocol: string; type: string }> = [];
      for (let i = 0; i < max; i++) {
        result.push({
          url: entries[i].name,
          protocol: entries[i].nextHopProtocol || 'unknown',
          type: entries[i].initiatorType || 'other',
        });
      }
      return result;
    }).catch(() => []);
  } catch (e) {
    console.warn('Resource protocols check failed:', e);
    return [];
  }
}

/**
 * Determine the primary HTTP version being used
 */
function getPrimaryHttpVersion(resourceProtocols: ResourceProtocol[]): string {
  const protocolCounts: Record<string, number> = {};

  for (const resource of resourceProtocols) {
    const protocol = resource.protocol || 'unknown';
    protocolCounts[protocol] = (protocolCounts[protocol] || 0) + 1;
  }

  // Map protocol names to versions
  const versionMap: Record<string, string> = {
    'h2': 'HTTP/2',
    'h2c': 'HTTP/2',
    'http/1.1': 'HTTP/1.1',
    'http/1.0': 'HTTP/1.0',
    'h3': 'HTTP/3',
    'quic': 'HTTP/3',
  };

  let maxCount = 0;
  let primaryProtocol = 'unknown';

  for (const [protocol, count] of Object.entries(protocolCounts)) {
    if (count > maxCount && protocol !== 'unknown') {
      maxCount = count;
      primaryProtocol = protocol;
    }
  }

  return versionMap[primaryProtocol] || 'HTTP/1.1';
}

/**
 * Calculate score based on protocol support
 */
function calculateScore(
  http2Supported: boolean,
  http3Supported: boolean,
  resourceProtocols: ResourceProtocol[]
): number {
  let score = 100;

  // No HTTP/2 = significant penalty
  if (!http2Supported) {
    score -= 30;
  }

  // Check if resources are actually using HTTP/2
  const h2Resources = resourceProtocols.filter(r => r.protocol === 'h2').length;
  const totalResources = resourceProtocols.filter(r => r.protocol !== 'unknown').length;

  if (totalResources > 0) {
    const h2Ratio = h2Resources / totalResources;
    if (h2Ratio < 0.5) {
      score -= 15; // Less than 50% of resources using HTTP/2
    } else if (h2Ratio < 0.9) {
      score -= 5; // Less than 90% of resources using HTTP/2
    }
  }

  // HTTP/3 is a bonus (not having it is a minor issue)
  if (!http3Supported && http2Supported) {
    score -= 5; // Minor penalty for not having HTTP/3 if HTTP/2 is present
  }

  return Math.max(0, score);
}

/**
 * Generate recommendations based on protocol analysis
 */
function generateRecommendations(
  http2Supported: boolean,
  http3Supported: boolean,
  httpVersion: string
): string[] {
  const recommendations: string[] = [];

  if (!http2Supported || httpVersion === 'HTTP/1.1') {
    recommendations.push('Enable HTTP/2 on your server for multiplexed connections and header compression');
    recommendations.push('For Nginx: Add `http2` to your listen directive: `listen 443 ssl http2;`');
    recommendations.push('For Apache: Enable mod_http2 and add `Protocols h2 http/1.1`');
  }

  if (!http3Supported) {
    recommendations.push('Consider enabling HTTP/3 (QUIC) for improved performance on unreliable networks');
    recommendations.push('HTTP/3 reduces latency with 0-RTT connection establishment');
  }

  if (recommendations.length === 0) {
    recommendations.push('Protocol configuration is optimal');
  }

  return recommendations;
}

export async function runProtocolAudit(page: Page, url: string): Promise<ProtocolInfo> {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname;

  // Run checks in parallel
  const [http2Result, http3Result, resourceProtocols] = await Promise.all([
    checkHttp2Support(hostname),
    checkHttp3Support(url),
    getResourceProtocols(page),
  ]);

  const httpVersion = getPrimaryHttpVersion(resourceProtocols);
  const score = calculateScore(http2Result.supported, http3Result.supported, resourceProtocols);
  const recommendations = generateRecommendations(http2Result.supported, http3Result.supported, httpVersion);

  return {
    httpVersion,
    http2Supported: http2Result.supported,
    http3Supported: http3Result.supported,
    alpn: http2Result.alpn,
    altSvc: http3Result.altSvc,
    serverPush: false, // Server push is deprecated and rarely used
    resourceProtocols: resourceProtocols.slice(0, 50), // Limit to first 50 for storage
    score,
    recommendations,
  };
}
