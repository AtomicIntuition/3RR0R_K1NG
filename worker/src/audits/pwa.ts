/**
 * PWA (Progressive Web App) Audit
 * Checks manifest, service worker, icons, offline capability, and installability
 */

import { Page } from 'playwright';

export interface PWAAuditResult {
  score: number;
  installable: boolean;
  checks: {
    manifest: ManifestCheck;
    serviceWorker: ServiceWorkerCheck;
    icons: IconCheck;
    themeColor: boolean;
    viewport: boolean;
    https: boolean;
    startUrl: boolean;
  };
  issues: PWAIssue[];
  recommendations: string[];
}

export interface ManifestCheck {
  exists: boolean;
  valid: boolean;
  url?: string;
  name?: string;
  shortName?: string;
  display?: string;
  backgroundColor?: string;
  themeColor?: string;
  issues: string[];
}

export interface ServiceWorkerCheck {
  registered: boolean;
  scope?: string;
  scriptUrl?: string;
}

export interface IconCheck {
  has192: boolean;
  has512: boolean;
  hasMaskable: boolean;
  icons: Array<{ src: string; sizes: string; type?: string; purpose?: string }>;
}

export interface PWAIssue {
  severity: 'high' | 'medium' | 'low';
  category: string;
  description: string;
  recommendation: string;
}

interface ManifestData {
  name?: string;
  short_name?: string;
  start_url?: string;
  display?: string;
  background_color?: string;
  theme_color?: string;
  icons?: Array<{
    src: string;
    sizes: string;
    type?: string;
    purpose?: string;
  }>;
  description?: string;
  scope?: string;
}

/**
 * Run PWA audit on a page
 */
export async function runPWAAudit(page: Page, url: string): Promise<PWAAuditResult> {
  const issues: PWAIssue[] = [];
  const recommendations: string[] = [];

  // Check HTTPS
  const isHttps = url.startsWith('https://');
  if (!isHttps) {
    issues.push({
      severity: 'high',
      category: 'Security',
      description: 'Site is not served over HTTPS',
      recommendation: 'PWAs require HTTPS. Enable SSL/TLS on your server.',
    });
  }

  // Check viewport meta tag
  const hasViewport = await page.evaluate(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    return viewport !== null;
  });

  if (!hasViewport) {
    issues.push({
      severity: 'medium',
      category: 'Viewport',
      description: 'Missing viewport meta tag',
      recommendation:
        'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your <head>',
    });
  }

  // Check theme color meta tag
  const hasThemeColor = await page.evaluate(() => {
    const themeColor = document.querySelector('meta[name="theme-color"]');
    return themeColor !== null;
  });

  if (!hasThemeColor) {
    issues.push({
      severity: 'low',
      category: 'Theme',
      description: 'Missing theme-color meta tag',
      recommendation:
        'Add <meta name="theme-color" content="#your-color"> for browser UI theming',
    });
  }

  // Check manifest
  const manifestCheck = await checkManifest(page, url);
  if (!manifestCheck.exists) {
    issues.push({
      severity: 'high',
      category: 'Manifest',
      description: 'No web app manifest found',
      recommendation:
        'Create a manifest.json file and link it with <link rel="manifest" href="/manifest.json">',
    });
  } else if (!manifestCheck.valid) {
    issues.push({
      severity: 'high',
      category: 'Manifest',
      description: 'Web app manifest is invalid or incomplete',
      recommendation: `Fix manifest issues: ${manifestCheck.issues.join(', ')}`,
    });
  }

  // Check service worker
  const serviceWorkerCheck = await checkServiceWorker(page);
  if (!serviceWorkerCheck.registered) {
    issues.push({
      severity: 'medium',
      category: 'Service Worker',
      description: 'No service worker registered',
      recommendation:
        'Register a service worker for offline support and better performance. Use Workbox for easy setup.',
    });
  }

  // Check icons
  const iconCheck = await checkIcons(page, manifestCheck.url);
  if (!iconCheck.has192 || !iconCheck.has512) {
    issues.push({
      severity: 'medium',
      category: 'Icons',
      description: `Missing required icons: ${!iconCheck.has192 ? '192x192' : ''} ${!iconCheck.has512 ? '512x512' : ''}`.trim(),
      recommendation: 'Add icons with sizes 192x192 and 512x512 to your manifest',
    });
  }

  if (!iconCheck.hasMaskable) {
    issues.push({
      severity: 'low',
      category: 'Icons',
      description: 'No maskable icon defined',
      recommendation:
        'Add a maskable icon with "purpose": "maskable" for better Android adaptive icon support',
    });
  }

  // Check start_url
  const hasStartUrl =
    manifestCheck.exists &&
    manifestCheck.valid &&
    manifestCheck.url !== undefined;

  // Generate recommendations
  if (!serviceWorkerCheck.registered) {
    recommendations.push('Set up a service worker using Workbox or manual implementation');
  }
  if (!manifestCheck.exists || !manifestCheck.valid) {
    recommendations.push('Create a complete web app manifest with all required fields');
  }
  if (!iconCheck.has192 || !iconCheck.has512) {
    recommendations.push('Generate PWA icons using tools like pwa-asset-generator');
  }

  // Calculate installability
  const installable =
    isHttps &&
    manifestCheck.exists &&
    manifestCheck.valid &&
    serviceWorkerCheck.registered &&
    iconCheck.has192 &&
    iconCheck.has512;

  // Calculate score
  let score = 100;
  for (const issue of issues) {
    switch (issue.severity) {
      case 'high':
        score -= 25;
        break;
      case 'medium':
        score -= 15;
        break;
      case 'low':
        score -= 5;
        break;
    }
  }
  score = Math.max(0, score);

  return {
    score,
    installable,
    checks: {
      manifest: manifestCheck,
      serviceWorker: serviceWorkerCheck,
      icons: iconCheck,
      themeColor: hasThemeColor,
      viewport: hasViewport,
      https: isHttps,
      startUrl: hasStartUrl,
    },
    issues,
    recommendations,
  };
}

/**
 * Check web app manifest
 */
async function checkManifest(page: Page, baseUrl: string): Promise<ManifestCheck> {
  const manifestInfo = await page.evaluate(() => {
    const link = document.querySelector('link[rel="manifest"]');
    if (!link) return null;
    return (link as HTMLLinkElement).href;
  });

  if (!manifestInfo) {
    return {
      exists: false,
      valid: false,
      issues: ['No manifest link found'],
    };
  }

  try {
    const manifestUrl = new URL(manifestInfo, baseUrl).toString();
    const response = await fetch(manifestUrl, { method: 'GET' });

    if (!response.ok) {
      return {
        exists: true,
        valid: false,
        url: manifestUrl,
        issues: [`Manifest returned status ${response.status}`],
      };
    }

    const manifest: ManifestData = await response.json();
    const issues: string[] = [];

    // Validate required fields
    if (!manifest.name && !manifest.short_name) {
      issues.push('Missing name or short_name');
    }
    if (!manifest.start_url) {
      issues.push('Missing start_url');
    }
    if (!manifest.display) {
      issues.push('Missing display mode');
    } else if (!['standalone', 'fullscreen', 'minimal-ui'].includes(manifest.display)) {
      issues.push('display should be "standalone", "fullscreen", or "minimal-ui" for app-like experience');
    }
    if (!manifest.icons || manifest.icons.length === 0) {
      issues.push('Missing icons array');
    }
    if (!manifest.background_color) {
      issues.push('Missing background_color');
    }
    if (!manifest.theme_color) {
      issues.push('Missing theme_color');
    }

    return {
      exists: true,
      valid: issues.length === 0,
      url: manifestUrl,
      name: manifest.name,
      shortName: manifest.short_name,
      display: manifest.display,
      backgroundColor: manifest.background_color,
      themeColor: manifest.theme_color,
      issues,
    };
  } catch (error) {
    return {
      exists: true,
      valid: false,
      issues: [`Failed to parse manifest: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}

/**
 * Check service worker registration
 */
async function checkServiceWorker(page: Page): Promise<ServiceWorkerCheck> {
  const swInfo = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) {
      return { registered: false };
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.active) {
        return {
          registered: true,
          scope: registration.scope,
          scriptUrl: registration.active.scriptURL,
        };
      }

      // Also check for controlling worker
      if (navigator.serviceWorker.controller) {
        return {
          registered: true,
          scriptUrl: navigator.serviceWorker.controller.scriptURL,
        };
      }

      return { registered: false };
    } catch {
      return { registered: false };
    }
  });

  return swInfo;
}

/**
 * Check manifest icons
 */
async function checkIcons(page: Page, manifestUrl: string | undefined): Promise<IconCheck> {
  const icons: Array<{ src: string; sizes: string; type?: string; purpose?: string }> = [];
  let has192 = false;
  let has512 = false;
  let hasMaskable = false;

  if (!manifestUrl) {
    return { has192, has512, hasMaskable, icons };
  }

  try {
    const response = await fetch(manifestUrl, { method: 'GET' });
    if (!response.ok) {
      return { has192, has512, hasMaskable, icons };
    }

    const manifest: ManifestData = await response.json();

    if (manifest.icons && Array.isArray(manifest.icons)) {
      for (const icon of manifest.icons) {
        icons.push({
          src: icon.src,
          sizes: icon.sizes,
          type: icon.type,
          purpose: icon.purpose,
        });

        // Check for required sizes
        if (icon.sizes) {
          const sizes = icon.sizes.toLowerCase();
          if (sizes.includes('192x192') || sizes === '192') {
            has192 = true;
          }
          if (sizes.includes('512x512') || sizes === '512') {
            has512 = true;
          }
        }

        // Check for maskable icon
        if (icon.purpose?.toLowerCase().includes('maskable')) {
          hasMaskable = true;
        }
      }
    }
  } catch {
    // Silently fail - manifest fetch already handled in checkManifest
  }

  return { has192, has512, hasMaskable, icons };
}
