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

  // Extract meta information from the page - fully inlined to avoid tsx __name issue
  const seoData = await page.evaluate(() => {
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
    };
  });

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
