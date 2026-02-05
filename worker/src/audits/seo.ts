import { Page } from 'playwright';

export interface SeoFinding {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  value?: string;
}

export interface SeoAuditResult {
  score: number;
  findings: SeoFinding[];
}

export async function runSeoAudit(page: Page, url: string): Promise<SeoAuditResult> {
  const findings: SeoFinding[] = [];

  // Default SEO data for fallback
  const defaultSeoData = {
    title: '',
    metaDescription: null as string | null,
    metaKeywords: null as string | null,
    canonical: null as string | null,
    ogTitle: null as string | null,
    ogDescription: null as string | null,
    ogImage: null as string | null,
    ogUrl: null as string | null,
    twitterCard: null as string | null,
    twitterTitle: null as string | null,
    twitterDescription: null as string | null,
    twitterImage: null as string | null,
    viewport: null as string | null,
    robots: null as string | null,
    h1Count: 0,
    h1Text: null as string | null,
    imgWithoutAlt: 0,
    totalImages: 0,
    linksWithoutText: 0,
    hasLang: false,
    lang: null as string | null,
    headingHierarchy: [] as { level: number; text: string }[],
  };

  // Extract meta information from the page - wrapped in try-catch
  let seoData = defaultSeoData;
  try {
    seoData = await page.evaluate(() => {
      const canonicalEl = document.querySelector('link[rel="canonical"]');
      const h1El = document.querySelector('h1');

      const descEl = document.querySelector('meta[name="description"], meta[property="description"]');
      const keywordsEl = document.querySelector('meta[name="keywords"]');
      const ogTitleEl = document.querySelector('meta[property="og:title"]');
      const ogDescEl = document.querySelector('meta[property="og:description"]');
      const ogImageEl = document.querySelector('meta[property="og:image"]');
      const ogUrlEl = document.querySelector('meta[property="og:url"]');
      const twitterCardEl = document.querySelector('meta[name="twitter:card"]');
      const twitterTitleEl = document.querySelector('meta[name="twitter:title"]');
      const twitterDescEl = document.querySelector('meta[name="twitter:description"]');
      const twitterImageEl = document.querySelector('meta[name="twitter:image"]');
      const viewportEl = document.querySelector('meta[name="viewport"]');
      const robotsEl = document.querySelector('meta[name="robots"]');

      return {
        title: document.title,
        metaDescription: descEl ? descEl.getAttribute('content') : null,
        metaKeywords: keywordsEl ? keywordsEl.getAttribute('content') : null,
        canonical: canonicalEl ? canonicalEl.getAttribute('href') : null,
        ogTitle: ogTitleEl ? ogTitleEl.getAttribute('content') : null,
        ogDescription: ogDescEl ? ogDescEl.getAttribute('content') : null,
        ogImage: ogImageEl ? ogImageEl.getAttribute('content') : null,
        ogUrl: ogUrlEl ? ogUrlEl.getAttribute('content') : null,
        twitterCard: twitterCardEl ? twitterCardEl.getAttribute('content') : null,
        twitterTitle: twitterTitleEl ? twitterTitleEl.getAttribute('content') : null,
        twitterDescription: twitterDescEl ? twitterDescEl.getAttribute('content') : null,
        twitterImage: twitterImageEl ? twitterImageEl.getAttribute('content') : null,
        viewport: viewportEl ? viewportEl.getAttribute('content') : null,
        robots: robotsEl ? robotsEl.getAttribute('content') : null,
        h1Count: document.querySelectorAll('h1').length,
        h1Text: h1El ? h1El.textContent : null,
        imgWithoutAlt: document.querySelectorAll('img:not([alt])').length,
        totalImages: document.querySelectorAll('img').length,
        linksWithoutText: document.querySelectorAll('a:not([aria-label])').length,
        hasLang: document.documentElement.hasAttribute('lang'),
        lang: document.documentElement.getAttribute('lang'),
        headingHierarchy: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).slice(0, 20).map(el => ({
          level: parseInt(el.tagName[1]),
          text: (el.textContent || '').trim().slice(0, 80),
        })),
      };
    }).catch(() => defaultSeoData);
  } catch (e) {
    console.warn('SEO data extraction failed:', e);
    seoData = defaultSeoData;
  }

  // Title tag check
  const hasTitle = !!seoData.title && seoData.title.length > 0;
  const titleLength = seoData.title?.length || 0;
  const titleOptimal = titleLength >= 30 && titleLength <= 60;

  findings.push({
    id: 'title-tag',
    title: 'Page Title',
    description: hasTitle
      ? titleOptimal
        ? `Title tag present with optimal length (${titleLength} chars)`
        : `Title tag present but length (${titleLength}) is ${titleLength < 30 ? 'too short' : 'too long'}`
      : 'Missing title tag',
    passed: hasTitle && titleOptimal,
    value: seoData.title || undefined,
  });

  // Meta description check
  const descLength = seoData.metaDescription?.length || 0;
  const descOptimal = descLength >= 120 && descLength <= 160;

  findings.push({
    id: 'meta-description',
    title: 'Meta Description',
    description: seoData.metaDescription
      ? descOptimal
        ? `Meta description present with optimal length (${descLength} chars)`
        : `Meta description present but length (${descLength}) is ${descLength < 120 ? 'too short' : 'too long'}`
      : 'Missing meta description',
    passed: !!seoData.metaDescription && descOptimal,
    value: seoData.metaDescription || undefined,
  });

  // Canonical URL
  findings.push({
    id: 'canonical',
    title: 'Canonical URL',
    description: seoData.canonical
      ? 'Canonical URL is set'
      : 'Missing canonical URL tag',
    passed: !!seoData.canonical,
    value: seoData.canonical || undefined,
  });

  // H1 tag check
  findings.push({
    id: 'h1-tag',
    title: 'H1 Heading',
    description: seoData.h1Count === 1
      ? 'Single H1 tag found'
      : seoData.h1Count === 0
        ? 'No H1 tag found'
        : `Multiple H1 tags found (${seoData.h1Count})`,
    passed: seoData.h1Count === 1,
    value: seoData.h1Text || undefined,
  });

  // Viewport meta tag
  findings.push({
    id: 'viewport',
    title: 'Viewport Meta Tag',
    description: seoData.viewport
      ? 'Viewport meta tag is configured'
      : 'Missing viewport meta tag (mobile responsiveness)',
    passed: !!seoData.viewport,
    value: seoData.viewport || undefined,
  });

  // Language attribute
  findings.push({
    id: 'html-lang',
    title: 'HTML Lang Attribute',
    description: seoData.hasLang
      ? `Language attribute set: ${seoData.lang}`
      : 'Missing lang attribute on HTML element',
    passed: seoData.hasLang,
    value: seoData.lang || undefined,
  });

  // Open Graph tags
  const hasBasicOg = !!(seoData.ogTitle && seoData.ogDescription && seoData.ogImage);
  findings.push({
    id: 'og-tags',
    title: 'Open Graph Tags',
    description: hasBasicOg
      ? 'Essential Open Graph tags are present'
      : 'Missing some Open Graph tags (title, description, or image)',
    passed: hasBasicOg,
  });

  // Twitter Card tags
  const hasTwitterCard = !!(seoData.twitterCard && seoData.twitterTitle);
  findings.push({
    id: 'twitter-card',
    title: 'Twitter Card Tags',
    description: hasTwitterCard
      ? 'Twitter Card tags are present'
      : 'Missing Twitter Card tags for social sharing',
    passed: hasTwitterCard,
  });

  // Image alt attributes
  const imgAltRatio = seoData.totalImages > 0
    ? ((seoData.totalImages - seoData.imgWithoutAlt) / seoData.totalImages) * 100
    : 100;

  findings.push({
    id: 'img-alt',
    title: 'Image Alt Attributes',
    description: seoData.imgWithoutAlt === 0
      ? 'All images have alt attributes'
      : `${seoData.imgWithoutAlt} of ${seoData.totalImages} images missing alt attributes`,
    passed: seoData.imgWithoutAlt === 0,
    value: `${Math.round(imgAltRatio)}% coverage`,
  });

  // Robots meta tag analysis — catch noindex/nofollow that block search engines
  if (seoData.robots) {
    const robotsLower = seoData.robots.toLowerCase();
    const hasNoindex = robotsLower.includes('noindex');
    const hasNofollow = robotsLower.includes('nofollow');

    if (hasNoindex || hasNofollow) {
      findings.push({
        id: 'robots-meta',
        title: 'Robots Meta Tag',
        description: hasNoindex
          ? 'Page has noindex — search engines will NOT index this page'
          : 'Page has nofollow — search engines will not follow links on this page',
        passed: false,
        value: seoData.robots,
      });
    } else {
      findings.push({
        id: 'robots-meta',
        title: 'Robots Meta Tag',
        description: 'Robots meta tag allows indexing',
        passed: true,
        value: seoData.robots,
      });
    }
  }

  // Heading hierarchy — check for skipped levels (e.g. H1 → H3, missing H2)
  if (seoData.headingHierarchy.length > 0) {
    const levels = seoData.headingHierarchy.map(h => h.level);
    const skippedLevels: string[] = [];
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1] + 1) {
        skippedLevels.push(`H${levels[i - 1]} → H${levels[i]}`);
      }
    }

    findings.push({
      id: 'heading-hierarchy',
      title: 'Heading Hierarchy',
      description: skippedLevels.length === 0
        ? 'Heading hierarchy is well-structured'
        : `Heading levels are skipped: ${skippedLevels.slice(0, 3).join(', ')} (bad for SEO and accessibility)`,
      passed: skippedLevels.length === 0,
      value: seoData.headingHierarchy.slice(0, 5).map(h => `H${h.level}: ${h.text}`).join(' → '),
    });
  }

  // Canonical URL validation — check if self-referencing and absolute
  if (seoData.canonical) {
    const isAbsolute = seoData.canonical.startsWith('http');
    const normalizeUrl = (u: string) => u.replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '');
    const isSelfRef = normalizeUrl(seoData.canonical) === normalizeUrl(url);

    if (!isAbsolute) {
      findings.push({
        id: 'canonical-quality',
        title: 'Canonical URL Quality',
        description: `Canonical URL is relative ("${seoData.canonical}") — should be absolute`,
        passed: false,
        value: seoData.canonical,
      });
    } else if (!isSelfRef) {
      // Not an error — could be intentional consolidation — but worth noting
      findings.push({
        id: 'canonical-quality',
        title: 'Canonical URL Quality',
        description: `Canonical points to different URL (${seoData.canonical}) — make sure this is intentional`,
        passed: true,
        value: seoData.canonical,
      });
    }
  }

  // Check robots.txt
  try {
    const robotsUrl = new URL('/robots.txt', url).href;
    const robotsResponse = await page.goto(robotsUrl, { timeout: 5000 });
    const hasRobots = robotsResponse?.status() === 200;

    findings.push({
      id: 'robots-txt',
      title: 'Robots.txt',
      description: hasRobots
        ? 'robots.txt file is accessible'
        : 'robots.txt file not found',
      passed: hasRobots,
    });

    // Go back to original page
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  } catch {
    findings.push({
      id: 'robots-txt',
      title: 'Robots.txt',
      description: 'Could not check robots.txt',
      passed: false,
    });
  }

  // Check sitemap
  try {
    const sitemapUrl = new URL('/sitemap.xml', url).href;
    const sitemapResponse = await page.goto(sitemapUrl, { timeout: 5000 });
    const hasSitemap = sitemapResponse?.status() === 200;

    findings.push({
      id: 'sitemap',
      title: 'XML Sitemap',
      description: hasSitemap
        ? 'XML sitemap is accessible'
        : 'XML sitemap not found at /sitemap.xml',
      passed: hasSitemap,
    });

    // Go back to original page
    await page.goto(url, { waitUntil: 'domcontentloaded' });
  } catch {
    findings.push({
      id: 'sitemap',
      title: 'XML Sitemap',
      description: 'Could not check sitemap',
      passed: false,
    });
  }

  // Calculate score
  const passedCount = findings.filter(f => f.passed).length;
  const score = Math.round((passedCount / findings.length) * 100);

  return {
    score,
    findings,
  };
}
