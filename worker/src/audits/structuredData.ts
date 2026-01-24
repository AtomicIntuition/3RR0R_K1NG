/**
 * Structured Data (Schema.org) Audit
 * Validates JSON-LD and Microdata for SEO and rich snippets
 */

import { Page } from 'playwright';

export interface StructuredDataAuditResult {
  score: number;
  found: boolean;
  jsonLdCount: number;
  microdataCount: number;
  types: string[];
  items: StructuredDataItem[];
  errors: StructuredDataError[];
  recommendations: string[];
}

export interface StructuredDataItem {
  format: 'json-ld' | 'microdata';
  type: string;
  properties: Record<string, unknown>;
  isValid: boolean;
  issues: string[];
}

export interface StructuredDataError {
  type: string;
  property?: string;
  message: string;
  severity: 'error' | 'warning';
}

// Required properties for common Schema.org types
const REQUIRED_PROPERTIES: Record<string, string[]> = {
  Organization: ['name', 'url'],
  WebSite: ['name', 'url'],
  WebPage: ['name'],
  Article: ['headline', 'author', 'datePublished'],
  NewsArticle: ['headline', 'author', 'datePublished'],
  BlogPosting: ['headline', 'author', 'datePublished'],
  Product: ['name', 'image'],
  LocalBusiness: ['name', 'address'],
  Person: ['name'],
  BreadcrumbList: ['itemListElement'],
  FAQPage: ['mainEntity'],
  HowTo: ['name', 'step'],
  Recipe: ['name', 'recipeIngredient'],
  Event: ['name', 'startDate', 'location'],
  VideoObject: ['name', 'uploadDate', 'thumbnailUrl'],
  ImageObject: ['url'],
};

// Recommended properties for common types
const RECOMMENDED_PROPERTIES: Record<string, string[]> = {
  Organization: ['logo', 'sameAs', 'contactPoint'],
  WebSite: ['potentialAction'],
  Article: ['image', 'publisher', 'dateModified'],
  Product: ['description', 'offers', 'review', 'aggregateRating'],
  LocalBusiness: ['telephone', 'openingHours', 'geo'],
  Person: ['image', 'url', 'sameAs'],
};

/**
 * Run structured data audit
 */
export async function runStructuredDataAudit(page: Page): Promise<StructuredDataAuditResult> {
  const errors: StructuredDataError[] = [];
  const recommendations: string[] = [];
  const items: StructuredDataItem[] = [];

  // Extract JSON-LD - wrapped in try-catch
  let jsonLdData: Array<any> = [];
  try {
    jsonLdData = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      const results: any[] = [];
      const max = Math.min(scripts.length, 20); // Limit scripts
      for (let i = 0; i < max; i++) {
        try {
          results.push(JSON.parse(scripts[i].textContent || ''));
        } catch {
          results.push({ _parseError: true, _raw: scripts[i].textContent?.slice(0, 200) });
        }
      }
      return results;
    }).catch(() => []);
  } catch (e) {
    console.warn('JSON-LD extraction failed:', e);
    jsonLdData = [];
  }

  // Process JSON-LD items
  for (const data of jsonLdData) {
    if (data._parseError) {
      errors.push({
        type: 'JSON-LD',
        message: `Failed to parse JSON-LD: ${data._raw}...`,
        severity: 'error',
      });
      continue;
    }

    // Handle @graph arrays
    const itemsToProcess = data['@graph'] ? data['@graph'] : [data];

    for (const item of itemsToProcess) {
      const type = item['@type'];
      if (!type) {
        errors.push({
          type: 'JSON-LD',
          message: 'Missing @type property',
          severity: 'error',
        });
        continue;
      }

      const typeStr = Array.isArray(type) ? type[0] : type;
      const itemIssues: string[] = [];

      // Check required properties
      const required = REQUIRED_PROPERTIES[typeStr] || [];
      for (const prop of required) {
        if (!item[prop] && !item[`@${prop}`]) {
          itemIssues.push(`Missing required property: ${prop}`);
          errors.push({
            type: typeStr,
            property: prop,
            message: `Missing required property "${prop}" for ${typeStr}`,
            severity: 'error',
          });
        }
      }

      // Check recommended properties
      const recommended = RECOMMENDED_PROPERTIES[typeStr] || [];
      for (const prop of recommended) {
        if (!item[prop] && !item[`@${prop}`]) {
          errors.push({
            type: typeStr,
            property: prop,
            message: `Missing recommended property "${prop}" for ${typeStr}`,
            severity: 'warning',
          });
        }
      }

      items.push({
        format: 'json-ld',
        type: typeStr,
        properties: item,
        isValid: itemIssues.length === 0,
        issues: itemIssues,
      });
    }
  }

  // Extract Microdata - wrapped in try-catch
  let microdataItems: Array<{ itemType: string | null; properties: Record<string, string> }> = [];
  try {
    microdataItems = await page.evaluate(() => {
      const scopes = document.querySelectorAll('[itemscope]');
      const results: Array<{ itemType: string | null; properties: Record<string, string> }> = [];
      const max = Math.min(scopes.length, 20); // Limit scopes
      for (let i = 0; i < max; i++) {
        const scope = scopes[i];
        const itemType = scope.getAttribute('itemtype');
        const properties: Record<string, string> = {};

        const props = scope.querySelectorAll('[itemprop]');
        const maxProps = Math.min(props.length, 30);
        for (let j = 0; j < maxProps; j++) {
          const prop = props[j];
          const propName = prop.getAttribute('itemprop');
          if (propName) {
            // Get value based on element type
            let value = '';
            if (prop instanceof HTMLMetaElement) {
              value = prop.content;
            } else if (prop instanceof HTMLAnchorElement || prop instanceof HTMLLinkElement) {
              value = prop.href;
            } else if (prop instanceof HTMLImageElement) {
              value = prop.src;
            } else if (prop instanceof HTMLTimeElement) {
              value = prop.dateTime || prop.textContent || '';
            } else {
              value = prop.textContent || '';
            }
            properties[propName] = value.trim();
          }
        }

        results.push({ itemType, properties });
      }
      return results;
    }).catch(() => []);
  } catch (e) {
    console.warn('Microdata extraction failed:', e);
    microdataItems = [];
  }

  // Process Microdata items
  for (const item of microdataItems) {
    if (!item.itemType) continue;

    // Extract type name from URL
    const typeName = item.itemType.split('/').pop() || item.itemType;
    const itemIssues: string[] = [];

    // Check required properties
    const required = REQUIRED_PROPERTIES[typeName] || [];
    for (const prop of required) {
      if (!item.properties[prop]) {
        itemIssues.push(`Missing required property: ${prop}`);
      }
    }

    items.push({
      format: 'microdata',
      type: typeName,
      properties: item.properties,
      isValid: itemIssues.length === 0,
      issues: itemIssues,
    });
  }

  // Get unique types
  const types = [...new Set(items.map(i => i.type))];

  // Generate recommendations
  if (items.length === 0) {
    recommendations.push(
      'Add structured data to improve search engine understanding and enable rich snippets'
    );
    recommendations.push(
      'Start with Organization or WebSite schema for basic site identity'
    );
  }

  if (!types.includes('Organization') && !types.includes('LocalBusiness')) {
    recommendations.push('Add Organization schema to identify your business/website');
  }

  if (!types.includes('WebSite')) {
    recommendations.push('Add WebSite schema with potentialAction for sitelinks search box');
  }

  if (!types.includes('BreadcrumbList')) {
    recommendations.push('Add BreadcrumbList schema for better navigation display in search');
  }

  // Calculate score
  let score = 100;

  // Penalize for missing structured data
  if (items.length === 0) {
    score -= 40;
  }

  // Penalize for errors
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;
  score -= errorCount * 10;
  score -= warningCount * 3;

  // Bonus for having recommended types
  const hasOrg = types.includes('Organization') || types.includes('LocalBusiness');
  const hasWebsite = types.includes('WebSite');
  const hasBreadcrumb = types.includes('BreadcrumbList');

  if (!hasOrg) score -= 10;
  if (!hasWebsite) score -= 10;
  if (!hasBreadcrumb) score -= 5;

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    found: items.length > 0,
    jsonLdCount: jsonLdData.filter(d => !d._parseError).length,
    microdataCount: microdataItems.length,
    types,
    items,
    errors,
    recommendations,
  };
}
