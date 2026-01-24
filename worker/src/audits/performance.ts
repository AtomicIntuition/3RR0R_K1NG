import lighthouse from 'lighthouse';
import { chromium } from 'playwright';

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  score: number;
  displayValue: string;
}

export interface PerformanceAuditResult {
  score: number;
  metrics: PerformanceMetric[];
}

// Find an available port for Chrome debugging
async function getAvailablePort(): Promise<number> {
  const net = await import('net');
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        const port = address.port;
        server.close(() => resolve(port));
      } else {
        reject(new Error('Could not get port'));
      }
    });
    server.on('error', reject);
  });
}

export async function runPerformanceAudit(url: string): Promise<PerformanceAuditResult> {
  let browser;
  const debuggingPort = await getAvailablePort();

  try {
    // Launch browser with remote debugging port for Lighthouse
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--remote-debugging-port=${debuggingPort}`,
      ],
    });

    // Run Lighthouse connecting to the debugging port
    const result = await lighthouse(url, {
      port: debuggingPort,
      output: 'json',
      onlyCategories: ['performance'],
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        disabled: false,
      },
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
      },
    });

    if (!result || !result.lhr) {
      throw new Error('Lighthouse failed to generate results');
    }

    const { lhr } = result;
    const perfScore = Math.round((lhr.categories.performance?.score || 0) * 100);

    // Extract key metrics
    const metrics: PerformanceMetric[] = [];

    const auditMappings = [
      { id: 'first-contentful-paint', name: 'First Contentful Paint', unit: 's' },
      { id: 'largest-contentful-paint', name: 'Largest Contentful Paint', unit: 's' },
      { id: 'total-blocking-time', name: 'Total Blocking Time', unit: 'ms' },
      { id: 'cumulative-layout-shift', name: 'Cumulative Layout Shift', unit: '' },
      { id: 'speed-index', name: 'Speed Index', unit: 's' },
      { id: 'interactive', name: 'Time to Interactive', unit: 's' },
    ];

    for (const mapping of auditMappings) {
      const audit = lhr.audits[mapping.id];
      if (audit) {
        metrics.push({
          id: mapping.id,
          name: mapping.name,
          value: audit.numericValue || 0,
          unit: mapping.unit,
          score: Math.round((audit.score || 0) * 100),
          displayValue: audit.displayValue || String(audit.numericValue),
        });
      }
    }

    return {
      score: perfScore,
      metrics,
    };
  } catch (error) {
    console.error('Lighthouse audit failed:', error);

    // Return default scores if Lighthouse fails
    return {
      score: 50, // Default to middle score
      metrics: [
        {
          id: 'error',
          name: 'Audit Error',
          value: 0,
          unit: '',
          score: 0,
          displayValue: 'Performance audit failed',
        },
      ],
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
