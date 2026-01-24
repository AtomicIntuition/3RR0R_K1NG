import { Page } from 'playwright';

export interface VulnerableLibrary {
  name: string;
  detectedVersion: string;
  vulnerabilities: Vulnerability[];
}

export interface Vulnerability {
  severity: 'critical' | 'high' | 'medium' | 'low';
  cve?: string;
  description: string;
  fixedIn: string;
  recommendation: string;
}

export interface VulnerabilityAuditResult {
  score: number;
  librariesDetected: DetectedLibrary[];
  vulnerableLibraries: VulnerableLibrary[];
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface DetectedLibrary {
  name: string;
  version: string;
  source: 'global' | 'script-url' | 'meta';
}

// Known vulnerable versions from RetireJS patterns (subset of most common)
// Full database: https://github.com/RetireJS/retire.js/blob/master/repository/jsrepository.json
const VULNERABILITY_DATABASE: Record<string, { below: string; severity: 'critical' | 'high' | 'medium' | 'low'; cve?: string; description: string; fixedIn: string }[]> = {
  'jquery': [
    { below: '3.5.0', severity: 'medium', cve: 'CVE-2020-11022', description: 'XSS vulnerability in jQuery.htmlPrefilter', fixedIn: '3.5.0' },
    { below: '3.4.0', severity: 'medium', cve: 'CVE-2019-11358', description: 'Prototype pollution in jQuery.extend', fixedIn: '3.4.0' },
    { below: '3.0.0', severity: 'medium', cve: 'CVE-2015-9251', description: 'XSS vulnerability when passing untrusted input', fixedIn: '3.0.0' },
    { below: '2.2.0', severity: 'medium', description: 'XSS vulnerability in text() method', fixedIn: '2.2.0' },
    { below: '1.12.0', severity: 'high', description: 'Multiple XSS vulnerabilities', fixedIn: '1.12.0' },
  ],
  'lodash': [
    { below: '4.17.21', severity: 'critical', cve: 'CVE-2021-23337', description: 'Command injection via template function', fixedIn: '4.17.21' },
    { below: '4.17.20', severity: 'high', cve: 'CVE-2020-28500', description: 'ReDoS vulnerability in trim functions', fixedIn: '4.17.20' },
    { below: '4.17.19', severity: 'high', cve: 'CVE-2020-8203', description: 'Prototype pollution in zipObjectDeep', fixedIn: '4.17.19' },
    { below: '4.17.12', severity: 'high', cve: 'CVE-2019-10744', description: 'Prototype pollution via defaultsDeep', fixedIn: '4.17.12' },
    { below: '4.17.5', severity: 'medium', cve: 'CVE-2018-16487', description: 'Prototype pollution in merge functions', fixedIn: '4.17.5' },
  ],
  'angular': [
    { below: '1.8.0', severity: 'high', description: 'Multiple XSS vulnerabilities in AngularJS', fixedIn: '1.8.0' },
    { below: '1.6.9', severity: 'high', cve: 'CVE-2019-10768', description: 'Prototype pollution', fixedIn: '1.6.9' },
    { below: '1.6.5', severity: 'medium', description: 'XSS via SVG/URL sanitization bypass', fixedIn: '1.6.5' },
  ],
  'vue': [
    { below: '2.6.14', severity: 'medium', description: 'Possible XSS via SSR', fixedIn: '2.6.14' },
    { below: '2.5.17', severity: 'low', description: 'Potential ReDoS in template parser', fixedIn: '2.5.17' },
  ],
  'react': [
    { below: '16.14.0', severity: 'low', description: 'XSS vulnerability in server renderer', fixedIn: '16.14.0' },
    { below: '16.4.2', severity: 'medium', cve: 'CVE-2018-6341', description: 'XSS via dangerouslySetInnerHTML', fixedIn: '16.4.2' },
  ],
  'bootstrap': [
    { below: '5.2.0', severity: 'medium', cve: 'CVE-2022-24785', description: 'XSS via data attributes', fixedIn: '5.2.0' },
    { below: '4.3.1', severity: 'medium', cve: 'CVE-2019-8331', description: 'XSS in data-template', fixedIn: '4.3.1' },
    { below: '3.4.1', severity: 'high', cve: 'CVE-2019-8331', description: 'XSS in tooltip/popover', fixedIn: '3.4.1' },
  ],
  'moment': [
    { below: '2.29.4', severity: 'high', cve: 'CVE-2022-31129', description: 'ReDoS in string parsing', fixedIn: '2.29.4' },
    { below: '2.29.2', severity: 'medium', cve: 'CVE-2022-24785', description: 'Path traversal vulnerability', fixedIn: '2.29.2' },
  ],
  'handlebars': [
    { below: '4.7.7', severity: 'critical', cve: 'CVE-2021-23369', description: 'Arbitrary code execution', fixedIn: '4.7.7' },
    { below: '4.6.0', severity: 'high', cve: 'CVE-2019-20920', description: 'Prototype pollution', fixedIn: '4.6.0' },
  ],
  'axios': [
    { below: '1.6.0', severity: 'medium', cve: 'CVE-2023-45857', description: 'CSRF token exposure', fixedIn: '1.6.0' },
    { below: '0.21.2', severity: 'high', cve: 'CVE-2021-3749', description: 'ReDoS vulnerability', fixedIn: '0.21.2' },
  ],
  'underscore': [
    { below: '1.13.6', severity: 'high', cve: 'CVE-2021-23358', description: 'Arbitrary code execution via template', fixedIn: '1.13.6' },
    { below: '1.12.1', severity: 'critical', cve: 'CVE-2021-23358', description: 'Template code injection', fixedIn: '1.12.1' },
  ],
  'dompurify': [
    { below: '3.0.6', severity: 'high', cve: 'CVE-2023-48217', description: 'XSS bypass via nested forms', fixedIn: '3.0.6' },
    { below: '2.4.0', severity: 'medium', description: 'Mutation XSS bypass', fixedIn: '2.4.0' },
  ],
  'express': [
    { below: '4.19.2', severity: 'medium', cve: 'CVE-2024-29041', description: 'Open redirect vulnerability', fixedIn: '4.19.2' },
  ],
};

/**
 * Compare semantic versions
 * Returns true if version is below target
 */
function isVersionBelow(version: string, target: string): boolean {
  const parseVersion = (v: string): number[] => {
    return v.replace(/^[^\d]*/, '').split('.').map(n => parseInt(n, 10) || 0);
  };

  const vParts = parseVersion(version);
  const tParts = parseVersion(target);

  for (let i = 0; i < Math.max(vParts.length, tParts.length); i++) {
    const vPart = vParts[i] || 0;
    const tPart = tParts[i] || 0;

    if (vPart < tPart) return true;
    if (vPart > tPart) return false;
  }

  return false;
}

/**
 * Detect libraries from window globals and script URLs
 */
async function detectLibraries(page: Page): Promise<DetectedLibrary[]> {
  const libraries = await page.evaluate(() => {
    const libs: Array<{ name: string; version: string; source: 'global' | 'script-url' | 'meta' }> = [];
    const win = window as any;

    // jQuery
    if (win.jQuery?.fn?.jquery) {
      libs.push({ name: 'jquery', version: win.jQuery.fn.jquery, source: 'global' });
    } else if (win.$?.fn?.jquery) {
      libs.push({ name: 'jquery', version: win.$.fn.jquery, source: 'global' });
    }

    // React
    if (win.React?.version) {
      libs.push({ name: 'react', version: win.React.version, source: 'global' });
    }

    // Vue
    if (win.Vue?.version) {
      libs.push({ name: 'vue', version: win.Vue.version, source: 'global' });
    }

    // Angular (AngularJS)
    if (win.angular?.version?.full) {
      libs.push({ name: 'angular', version: win.angular.version.full, source: 'global' });
    }

    // Lodash
    if (win._?.VERSION) {
      libs.push({ name: 'lodash', version: win._.VERSION, source: 'global' });
    }

    // Underscore
    if (win._?.VERSION && !win._.chain) {
      // Underscore doesn't have chain by default, lodash does
      libs.push({ name: 'underscore', version: win._.VERSION, source: 'global' });
    }

    // Moment.js
    if (win.moment?.version) {
      libs.push({ name: 'moment', version: win.moment.version, source: 'global' });
    }

    // Bootstrap
    if (win.bootstrap?.Alert?.VERSION) {
      libs.push({ name: 'bootstrap', version: win.bootstrap.Alert.VERSION, source: 'global' });
    } else if (win.$.fn?.tooltip?.Constructor?.VERSION) {
      libs.push({ name: 'bootstrap', version: win.$.fn.tooltip.Constructor.VERSION, source: 'global' });
    }

    // Handlebars
    if (win.Handlebars?.VERSION) {
      libs.push({ name: 'handlebars', version: win.Handlebars.VERSION, source: 'global' });
    }

    // Axios
    if (win.axios?.VERSION) {
      libs.push({ name: 'axios', version: win.axios.VERSION, source: 'global' });
    }

    // DOMPurify
    if (win.DOMPurify?.version) {
      libs.push({ name: 'dompurify', version: win.DOMPurify.version, source: 'global' });
    }

    // Parse script URLs for versions
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src;

      // Common CDN patterns: library-1.2.3.min.js, library@1.2.3, library/1.2.3/
      const patterns = [
        { regex: /jquery[.-](\d+\.\d+\.\d+)/i, name: 'jquery' },
        { regex: /lodash[.-](\d+\.\d+\.\d+)/i, name: 'lodash' },
        { regex: /underscore[.-](\d+\.\d+\.\d+)/i, name: 'underscore' },
        { regex: /angular[.-](\d+\.\d+\.\d+)/i, name: 'angular' },
        { regex: /vue[@.-](\d+\.\d+\.\d+)/i, name: 'vue' },
        { regex: /react[@.-](\d+\.\d+\.\d+)/i, name: 'react' },
        { regex: /bootstrap[.-](\d+\.\d+\.\d+)/i, name: 'bootstrap' },
        { regex: /moment[.-](\d+\.\d+\.\d+)/i, name: 'moment' },
        { regex: /handlebars[.-](\d+\.\d+\.\d+)/i, name: 'handlebars' },
        { regex: /axios[.-](\d+\.\d+\.\d+)/i, name: 'axios' },
        { regex: /dompurify[.-](\d+\.\d+\.\d+)/i, name: 'dompurify' },
      ];

      for (const { regex, name } of patterns) {
        const match = src.match(regex);
        if (match && !libs.some(l => l.name === name)) {
          libs.push({ name, version: match[1], source: 'script-url' });
        }
      }
    });

    return libs;
  });

  return libraries;
}

/**
 * Check detected libraries against vulnerability database
 */
function checkVulnerabilities(libraries: DetectedLibrary[]): VulnerableLibrary[] {
  const vulnerableLibs: VulnerableLibrary[] = [];

  for (const lib of libraries) {
    const vulns = VULNERABILITY_DATABASE[lib.name];
    if (!vulns) continue;

    const foundVulns: Vulnerability[] = [];

    for (const vuln of vulns) {
      if (isVersionBelow(lib.version, vuln.below)) {
        foundVulns.push({
          severity: vuln.severity,
          cve: vuln.cve,
          description: vuln.description,
          fixedIn: vuln.fixedIn,
          recommendation: `Update ${lib.name} to version ${vuln.fixedIn} or later`,
        });
      }
    }

    if (foundVulns.length > 0) {
      vulnerableLibs.push({
        name: lib.name,
        detectedVersion: lib.version,
        vulnerabilities: foundVulns,
      });
    }
  }

  return vulnerableLibs;
}

/**
 * Calculate score based on vulnerabilities found
 */
function calculateScore(vulnerableLibraries: VulnerableLibrary[]): number {
  if (vulnerableLibraries.length === 0) return 100;

  let penalty = 0;

  for (const lib of vulnerableLibraries) {
    for (const vuln of lib.vulnerabilities) {
      switch (vuln.severity) {
        case 'critical':
          penalty += 25;
          break;
        case 'high':
          penalty += 15;
          break;
        case 'medium':
          penalty += 8;
          break;
        case 'low':
          penalty += 3;
          break;
      }
    }
  }

  return Math.max(0, 100 - penalty);
}

export async function runVulnerabilityAudit(page: Page): Promise<VulnerabilityAuditResult> {
  const librariesDetected = await detectLibraries(page);
  const vulnerableLibraries = checkVulnerabilities(librariesDetected);

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let totalVulnerabilities = 0;

  for (const lib of vulnerableLibraries) {
    for (const vuln of lib.vulnerabilities) {
      totalVulnerabilities++;
      switch (vuln.severity) {
        case 'critical':
          criticalCount++;
          break;
        case 'high':
          highCount++;
          break;
        case 'medium':
          mediumCount++;
          break;
        case 'low':
          lowCount++;
          break;
      }
    }
  }

  const score = calculateScore(vulnerableLibraries);

  return {
    score,
    librariesDetected,
    vulnerableLibraries,
    totalVulnerabilities,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
  };
}
