import { Page } from 'playwright';

export interface ImageAuditResult {
  score: number;
  totalImages: number;
  totalSize: number;
  issues: ImageIssue[];
  optimizationPotential: number;
  summary: {
    withLazyLoading: number;
    withoutLazyLoading: number;
    withSrcset: number;
    withoutSrcset: number;
    modernFormats: number;
    legacyFormats: number;
    withDimensions: number;
    withoutDimensions: number;
    oversized: number;
  };
}

export interface ImageIssue {
  src: string;
  issues: ImageIssueType[];
  currentSize?: number;
  displaySize?: { width: number; height: number };
  naturalSize?: { width: number; height: number };
  recommendations: string[];
  savingsEstimate?: number;
  severity: 'high' | 'medium' | 'low';
}

export type ImageIssueType =
  | 'no-lazy-loading'
  | 'no-srcset'
  | 'not-modern-format'
  | 'oversized'
  | 'no-dimensions'
  | 'missing-alt'
  | 'empty-alt-decorative'
  | 'large-file-size';

interface ImageData {
  src: string;
  loading: string | null;
  srcset: string | null;
  sizes: string | null;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  hasWidthHeight: boolean;
  isInViewport: boolean;
  format: string;
  alt: string | null;
  hasAlt: boolean;
  fileSize: number;
}

/**
 * Get format from URL or content-type
 */
function getImageFormat(src: string): string {
  const url = src.toLowerCase();
  if (url.includes('.webp') || url.includes('format=webp') || url.includes('f_webp')) return 'webp';
  if (url.includes('.avif') || url.includes('format=avif') || url.includes('f_avif')) return 'avif';
  if (url.includes('.png')) return 'png';
  if (url.includes('.jpg') || url.includes('.jpeg')) return 'jpg';
  if (url.includes('.gif')) return 'gif';
  if (url.includes('.svg')) return 'svg';
  if (url.includes('.ico')) return 'ico';
  if (url.includes('.bmp')) return 'bmp';
  return 'unknown';
}

/**
 * Check if format is modern (WebP, AVIF)
 */
function isModernFormat(format: string): boolean {
  return format === 'webp' || format === 'avif';
}

/**
 * Check if format should be optimized (exclude SVG, ICO)
 */
function shouldOptimize(format: string): boolean {
  return !['svg', 'ico', 'unknown'].includes(format);
}

/**
 * Estimate potential savings from format conversion
 */
function estimateSavings(format: string, fileSize: number): number {
  if (isModernFormat(format)) return 0;

  // Estimated savings from converting to WebP
  const savingsRatio: Record<string, number> = {
    jpg: 0.25, // ~25% smaller
    jpeg: 0.25,
    png: 0.45, // ~45% smaller
    gif: 0.20,
    bmp: 0.80, // ~80% smaller
  };

  return Math.round(fileSize * (savingsRatio[format] || 0.3));
}

/**
 * Collect image data from page
 */
async function collectImageData(page: Page): Promise<ImageData[]> {
  return await page.evaluate(() => {
    const images: ImageData[] = [];

    document.querySelectorAll('img').forEach(img => {
      const rect = img.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

      // Get format from src
      const src = img.src || img.currentSrc || '';
      let format = 'unknown';
      const urlLower = src.toLowerCase();
      if (urlLower.includes('.webp') || urlLower.includes('format=webp')) format = 'webp';
      else if (urlLower.includes('.avif') || urlLower.includes('format=avif')) format = 'avif';
      else if (urlLower.includes('.png')) format = 'png';
      else if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) format = 'jpg';
      else if (urlLower.includes('.gif')) format = 'gif';
      else if (urlLower.includes('.svg')) format = 'svg';
      else if (urlLower.includes('.ico')) format = 'ico';

      images.push({
        src,
        loading: img.loading || null,
        srcset: img.srcset || null,
        sizes: img.sizes || null,
        width: rect.width,
        height: rect.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        hasWidthHeight: img.hasAttribute('width') && img.hasAttribute('height'),
        isInViewport,
        format,
        alt: img.alt,
        hasAlt: img.hasAttribute('alt'),
        fileSize: 0, // Will be populated from resource timing
      });
    });

    // Also check picture elements with source
    document.querySelectorAll('picture source').forEach(source => {
      const srcset = (source as HTMLSourceElement).srcset;
      if (srcset) {
        const type = (source as HTMLSourceElement).type;
        if (type?.includes('webp') || type?.includes('avif')) {
          // Picture element is using modern formats, this is good
        }
      }
    });

    return images;
  });
}

/**
 * Get image file sizes from resource timing
 */
async function getImageSizes(page: Page): Promise<Map<string, number>> {
  const sizes = await page.evaluate(() => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const imageSizes: [string, number][] = [];

    entries.forEach(entry => {
      if (entry.initiatorType === 'img' || entry.name.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)/i)) {
        imageSizes.push([entry.name, entry.transferSize || entry.encodedBodySize || 0]);
      }
    });

    return imageSizes;
  });

  return new Map(sizes);
}

/**
 * Analyze images and generate issues
 */
function analyzeImages(images: ImageData[], sizes: Map<string, number>): ImageIssue[] {
  const issues: ImageIssue[] = [];

  for (const img of images) {
    const imgIssues: ImageIssueType[] = [];
    const recommendations: string[] = [];
    const fileSize = sizes.get(img.src) || img.fileSize;
    const format = getImageFormat(img.src);

    // Skip data URIs and very small images
    if (img.src.startsWith('data:') || (img.width < 50 && img.height < 50)) {
      continue;
    }

    // Check lazy loading for below-fold images
    if (!img.isInViewport && img.loading !== 'lazy') {
      imgIssues.push('no-lazy-loading');
      recommendations.push('Add loading="lazy" to defer loading of below-fold images');
    }

    // Check for srcset on responsive images
    if (!img.srcset && img.width > 100 && shouldOptimize(format)) {
      imgIssues.push('no-srcset');
      recommendations.push('Add srcset attribute for responsive image loading');
    }

    // Check for modern formats
    if (!isModernFormat(format) && shouldOptimize(format)) {
      imgIssues.push('not-modern-format');
      recommendations.push(`Convert from ${format.toUpperCase()} to WebP for 25-45% smaller file size`);
    }

    // Check for explicit dimensions
    if (!img.hasWidthHeight && shouldOptimize(format)) {
      imgIssues.push('no-dimensions');
      recommendations.push('Add width and height attributes to prevent layout shift (CLS)');
    }

    // Check for oversized images (serving 2x larger than display size)
    if (img.naturalWidth > img.width * 2 || img.naturalHeight > img.height * 2) {
      if (img.width > 50 && img.naturalWidth > 200) {
        imgIssues.push('oversized');
        recommendations.push(
          `Image is ${img.naturalWidth}x${img.naturalHeight} but displays at ${Math.round(img.width)}x${Math.round(img.height)}. Resize to save bandwidth.`
        );
      }
    }

    // Check for large file size (>200KB for JPEG, >500KB for PNG)
    const sizeThreshold = format === 'png' ? 500 * 1024 : 200 * 1024;
    if (fileSize > sizeThreshold) {
      imgIssues.push('large-file-size');
      recommendations.push(
        `Image is ${(fileSize / 1024).toFixed(0)}KB. Consider compressing or using a smaller resolution.`
      );
    }

    // Check for missing alt text
    if (!img.hasAlt) {
      imgIssues.push('missing-alt');
      recommendations.push('Add alt attribute for accessibility and SEO');
    }

    if (imgIssues.length > 0) {
      // Determine severity
      let severity: 'high' | 'medium' | 'low' = 'low';
      if (imgIssues.includes('large-file-size') || imgIssues.includes('oversized')) {
        severity = 'high';
      } else if (imgIssues.includes('no-lazy-loading') || imgIssues.includes('not-modern-format')) {
        severity = 'medium';
      }

      issues.push({
        src: img.src,
        issues: imgIssues,
        currentSize: fileSize,
        displaySize: { width: Math.round(img.width), height: Math.round(img.height) },
        naturalSize: { width: img.naturalWidth, height: img.naturalHeight },
        recommendations,
        savingsEstimate: estimateSavings(format, fileSize),
        severity,
      });
    }
  }

  return issues;
}

/**
 * Calculate score based on image optimization
 */
function calculateScore(images: ImageData[], issues: ImageIssue[]): number {
  if (images.length === 0) return 100;

  let score = 100;
  const totalImages = images.length;

  for (const issue of issues) {
    for (const issueType of issue.issues) {
      switch (issueType) {
        case 'large-file-size':
          score -= 10;
          break;
        case 'oversized':
          score -= 8;
          break;
        case 'no-lazy-loading':
          score -= 5;
          break;
        case 'not-modern-format':
          score -= 3;
          break;
        case 'no-dimensions':
          score -= 3;
          break;
        case 'no-srcset':
          score -= 2;
          break;
        case 'missing-alt':
          score -= 2;
          break;
        default:
          score -= 1;
      }
    }
  }

  // Scale penalty based on proportion of images with issues
  const issueRatio = issues.length / totalImages;
  if (issueRatio < 0.2) {
    // Less than 20% have issues, reduce penalty
    score = Math.max(score, 100 - (100 - score) * 0.5);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function runImageAudit(page: Page): Promise<ImageAuditResult> {
  const [images, sizes] = await Promise.all([
    collectImageData(page),
    getImageSizes(page),
  ]);

  // Enrich images with file sizes
  for (const img of images) {
    img.fileSize = sizes.get(img.src) || 0;
  }

  const issues = analyzeImages(images, sizes);
  const score = calculateScore(images, issues);

  // Calculate summary statistics
  const summary = {
    withLazyLoading: images.filter(i => i.loading === 'lazy').length,
    withoutLazyLoading: images.filter(i => i.loading !== 'lazy' && !i.isInViewport).length,
    withSrcset: images.filter(i => i.srcset).length,
    withoutSrcset: images.filter(i => !i.srcset && shouldOptimize(getImageFormat(i.src))).length,
    modernFormats: images.filter(i => isModernFormat(getImageFormat(i.src))).length,
    legacyFormats: images.filter(i => !isModernFormat(getImageFormat(i.src)) && shouldOptimize(getImageFormat(i.src))).length,
    withDimensions: images.filter(i => i.hasWidthHeight).length,
    withoutDimensions: images.filter(i => !i.hasWidthHeight && shouldOptimize(getImageFormat(i.src))).length,
    oversized: issues.filter(i => i.issues.includes('oversized')).length,
  };

  // Calculate total size and optimization potential
  let totalSize = 0;
  let optimizationPotential = 0;

  for (const img of images) {
    totalSize += img.fileSize;
  }

  for (const issue of issues) {
    optimizationPotential += issue.savingsEstimate || 0;
  }

  return {
    score,
    totalImages: images.length,
    totalSize,
    issues: issues.slice(0, 20), // Limit to first 20 issues
    optimizationPotential,
    summary,
  };
}
