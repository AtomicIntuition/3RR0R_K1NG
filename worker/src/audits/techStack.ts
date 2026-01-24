import { Page, Response } from 'playwright';

export interface TechStackItem {
  name: string;
  category: 'framework' | 'library' | 'cms' | 'analytics' | 'cdn' | 'hosting' | 'other';
  version?: string;
  confidence: number;
  icon?: string;
}

// Detection patterns for various technologies
const TECH_PATTERNS = [
  // Frameworks
  {
    name: 'React',
    category: 'framework' as const,
    patterns: {
      scripts: [/react[\.\-]?dom/i, /react\.production/i],
      globals: ['__REACT_DEVTOOLS_GLOBAL_HOOK__', '__NEXT_DATA__'],
      html: ['data-reactroot', 'data-reactid'],
    },
  },
  {
    name: 'Next.js',
    category: 'framework' as const,
    patterns: {
      scripts: [/_next\/static/i],
      globals: ['__NEXT_DATA__', 'next'],
      html: ['id="__next"'],
      headers: { 'x-powered-by': /next/i },
    },
  },
  {
    name: 'Vue.js',
    category: 'framework' as const,
    patterns: {
      scripts: [/vue[\.\-]?/i],
      globals: ['Vue', '__VUE__'],
      html: ['data-v-', 'v-cloak'],
    },
  },
  {
    name: 'Nuxt.js',
    category: 'framework' as const,
    patterns: {
      scripts: [/_nuxt\//i],
      globals: ['__NUXT__', '$nuxt'],
      html: ['id="__nuxt"'],
    },
  },
  {
    name: 'Angular',
    category: 'framework' as const,
    patterns: {
      scripts: [/angular[\.\-]?/i, /@angular/i],
      globals: ['ng', 'getAllAngularRootElements'],
      html: ['ng-version', '_ngcontent-', 'ng-app'],
    },
  },
  {
    name: 'Svelte',
    category: 'framework' as const,
    patterns: {
      html: ['svelte-', '__svelte'],
      globals: ['__svelte'],
    },
  },
  {
    name: 'jQuery',
    category: 'library' as const,
    patterns: {
      scripts: [/jquery[\.\-]?/i],
      globals: ['jQuery', '$'],
    },
  },
  // CMS
  {
    name: 'WordPress',
    category: 'cms' as const,
    patterns: {
      scripts: [/wp-content/i, /wp-includes/i],
      html: ['wp-content', 'WordPress'],
      headers: { 'link': /wp-json/i },
    },
  },
  {
    name: 'Shopify',
    category: 'cms' as const,
    patterns: {
      scripts: [/cdn\.shopify/i],
      globals: ['Shopify'],
      html: ['shopify-section'],
    },
  },
  {
    name: 'Webflow',
    category: 'cms' as const,
    patterns: {
      scripts: [/webflow/i],
      globals: ['Webflow'],
      html: ['w-', 'wf-'],
    },
  },
  // Analytics
  {
    name: 'Google Analytics',
    category: 'analytics' as const,
    patterns: {
      scripts: [/google-analytics/i, /googletagmanager/i, /gtag/i],
      globals: ['ga', 'gtag', 'dataLayer'],
    },
  },
  {
    name: 'Hotjar',
    category: 'analytics' as const,
    patterns: {
      scripts: [/hotjar/i],
      globals: ['hj', 'hjSiteSettings'],
    },
  },
  {
    name: 'Mixpanel',
    category: 'analytics' as const,
    patterns: {
      scripts: [/mixpanel/i],
      globals: ['mixpanel'],
    },
  },
  {
    name: 'Segment',
    category: 'analytics' as const,
    patterns: {
      scripts: [/segment\.com/i, /analytics\.js/i],
      globals: ['analytics'],
    },
  },
  // CDN
  {
    name: 'Cloudflare',
    category: 'cdn' as const,
    patterns: {
      headers: { 'cf-ray': /.+/, 'server': /cloudflare/i },
    },
  },
  {
    name: 'Fastly',
    category: 'cdn' as const,
    patterns: {
      headers: { 'x-served-by': /cache/i, 'via': /varnish/i },
    },
  },
  {
    name: 'Akamai',
    category: 'cdn' as const,
    patterns: {
      headers: { 'x-akamai-transformed': /.+/ },
    },
  },
  // Hosting
  {
    name: 'Vercel',
    category: 'hosting' as const,
    patterns: {
      headers: { 'x-vercel-id': /.+/, 'server': /vercel/i },
    },
  },
  {
    name: 'Netlify',
    category: 'hosting' as const,
    patterns: {
      headers: { 'x-nf-request-id': /.+/, 'server': /netlify/i },
    },
  },
  {
    name: 'AWS',
    category: 'hosting' as const,
    patterns: {
      headers: { 'x-amz-cf-id': /.+/, 'server': /amazons3|awselb/i },
    },
  },
  // Libraries
  {
    name: 'Tailwind CSS',
    category: 'library' as const,
    patterns: {
      html: ['class="[^"]*(?:flex|grid|p-\\d|m-\\d|text-\\w+|bg-\\w+)[^"]*"'],
    },
  },
  {
    name: 'Bootstrap',
    category: 'library' as const,
    patterns: {
      // Only detect Bootstrap via script loading or specific Bootstrap-only classes
      scripts: [/bootstrap(?:\.bundle)?(?:\.min)?\.js/i, /cdn.*bootstrap/i],
      // Use Bootstrap-specific classes that aren't commonly used elsewhere
      html: ['class="[^"]*(?:btn-primary|btn-secondary|btn-success|btn-danger|btn-warning|btn-info|btn-light|btn-dark|btn-outline-)[^"]*"', 'data-bs-toggle', 'data-bs-target', 'class="[^"]*(?:card-body|card-header|modal-dialog|carousel-item)[^"]*"'],
      globals: ['bootstrap'],
    },
  },
];

export async function detectTechStack(page: Page, response: Response | null): Promise<TechStackItem[]> {
  const detected: TechStackItem[] = [];
  const headers = response?.headers() || {};

  // Get page HTML and scripts
  const pageData = await page.evaluate(() => {
    const html = document.documentElement.outerHTML;
    const scriptEls = document.querySelectorAll('script[src]');
    const scripts: string[] = [];
    for (let i = 0; i < scriptEls.length; i++) {
      scripts.push(scriptEls[i].getAttribute('src') || '');
    }

    // Get global variables
    const globals = Object.keys(window);

    return { html, scripts, globals };
  });

  for (const tech of TECH_PATTERNS) {
    let confidence = 0;
    let matchCount = 0;

    // Check scripts
    if (tech.patterns.scripts) {
      for (const pattern of tech.patterns.scripts) {
        if (pageData.scripts.some(s => pattern.test(s))) {
          matchCount++;
          confidence += 30;
        }
      }
    }

    // Check globals
    if (tech.patterns.globals) {
      for (const global of tech.patterns.globals) {
        if (pageData.globals.includes(global)) {
          matchCount++;
          confidence += 25;
        }
      }
    }

    // Check HTML patterns
    if (tech.patterns.html) {
      for (const pattern of tech.patterns.html) {
        if (pageData.html.includes(pattern) || new RegExp(pattern).test(pageData.html)) {
          matchCount++;
          confidence += 20;
        }
      }
    }

    // Check headers
    if (tech.patterns.headers) {
      for (const [header, pattern] of Object.entries(tech.patterns.headers)) {
        const value = headers[header.toLowerCase()];
        if (value && pattern.test(value)) {
          matchCount++;
          confidence += 35;
        }
      }
    }

    // If any matches found, add to detected list
    if (matchCount > 0) {
      // Cap confidence at 100
      confidence = Math.min(confidence, 100);

      detected.push({
        name: tech.name,
        category: tech.category,
        confidence,
      });
    }
  }

  // Sort by confidence
  detected.sort((a, b) => b.confidence - a.confidence);

  return detected;
}
