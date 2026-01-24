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

// Run a single Lighthouse attempt
async function runLighthouseAttempt(url: string, debuggingPort: number): Promise<PerformanceAuditResult | null> {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      `--remote-debugging-port=${debuggingPort}`,
    ],
  });

  try {
    // Small delay to ensure browser is ready
    await new Promise(resolve => setTimeout(resolve, 500));

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
      return null;
    }

    const { lhr } = result;
    const perfScore = Math.round((lhr.categories.performance?.score || 0) * 100);

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

    return { score: perfScore, metrics };
  } finally {
    await browser.close();
  }
}

export async function runPerformanceAudit(url: string): Promise<PerformanceAuditResult> {
  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const debuggingPort = await getAvailablePort();

      // Add delay between retries to let resources clean up
      if (attempt > 1) {
        console.log(`Lighthouse retry attempt ${attempt}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const result = await runLighthouseAttempt(url, debuggingPort);
      if (result) {
        return result;
      }
    } catch (error) {
      console.error(`Lighthouse attempt ${attempt} failed:`, error);

      // If this was the last attempt, fall through to return default
      if (attempt === maxRetries) {
        console.error('All Lighthouse attempts failed, using fallback score');
      }
    }
  }

  // Return default scores if all retries fail
  return {
    score: 50,
    metrics: [
      {
        id: 'error',
        name: 'Audit Error',
        value: 0,
        unit: '',
        score: 0,
        displayValue: 'Performance audit failed after retries',
      },
    ],
  };
}
