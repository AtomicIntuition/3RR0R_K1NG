/**
 * Package.json Dependency Vulnerability Scanner
 * Uses OSV (Open Source Vulnerabilities) API for vulnerability checking
 */

export interface DependencyAuditResult {
  score: number;
  totalDependencies: number;
  vulnerabilities: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
  details: VulnerabilityDetail[];
}

export interface VulnerabilityDetail {
  package: string;
  installedVersion: string;
  vulnerability: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  cve?: string;
  recommendation: string;
  patchedVersions: string;
}

interface OSVResponse {
  vulns?: OSVVulnerability[];
}

interface OSVVulnerability {
  id: string;
  summary?: string;
  details?: string;
  aliases?: string[];
  severity?: Array<{ type: string; score: string }>;
  affected?: Array<{
    ranges?: Array<{
      type: string;
      events: Array<{ introduced?: string; fixed?: string }>;
    }>;
  }>;
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface UploadedFile {
  path: string;
  content: string;
}

/**
 * Map OSV severity to our severity levels
 */
function mapSeverity(vuln: OSVVulnerability): 'critical' | 'high' | 'moderate' | 'low' {
  // Check CVSS score from severity array
  const cvss = vuln.severity?.find(s => s.type === 'CVSS_V3');
  if (cvss?.score) {
    const score = parseFloat(cvss.score);
    if (score >= 9.0) return 'critical';
    if (score >= 7.0) return 'high';
    if (score >= 4.0) return 'moderate';
    return 'low';
  }

  // Fall back to checking summary for severity keywords
  const summary = (vuln.summary || '').toLowerCase();
  const details = (vuln.details || '').toLowerCase();
  const text = summary + ' ' + details;

  if (text.includes('critical') || text.includes('remote code execution') || text.includes('rce')) {
    return 'critical';
  }
  if (text.includes('high') || text.includes('arbitrary code') || text.includes('injection')) {
    return 'high';
  }
  if (text.includes('moderate') || text.includes('medium') || text.includes('denial of service')) {
    return 'moderate';
  }

  return 'low';
}

/**
 * Get the fixed version from OSV vulnerability data
 */
function getFixedVersion(vuln: OSVVulnerability): string {
  const affected = vuln.affected?.[0];
  if (!affected?.ranges) return 'Unknown';

  for (const range of affected.ranges) {
    for (const event of range.events) {
      if (event.fixed) return event.fixed;
    }
  }

  return 'Unknown';
}

/**
 * Clean version string for OSV API
 */
function cleanVersion(version: string): string {
  // Remove common prefixes
  return version.replace(/^[\^~>=<]+/, '').trim();
}

/**
 * Query OSV API for a single package
 */
async function queryOSV(packageName: string, version: string): Promise<OSVVulnerability[]> {
  try {
    const cleanedVersion = cleanVersion(version);

    const response = await fetch('https://api.osv.dev/v1/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        package: { name: packageName, ecosystem: 'npm' },
        version: cleanedVersion,
      }),
    });

    if (!response.ok) {
      console.warn(`OSV API error for ${packageName}: ${response.status}`);
      return [];
    }

    const data = (await response.json()) as OSVResponse;
    return data.vulns || [];
  } catch (error) {
    console.warn(`OSV query failed for ${packageName}:`, error);
    return [];
  }
}

/**
 * Batch query OSV API for multiple packages (more efficient)
 */
async function queryOSVBatch(
  packages: Array<{ name: string; version: string }>
): Promise<Map<string, OSVVulnerability[]>> {
  const results = new Map<string, OSVVulnerability[]>();

  // OSV batch endpoint
  const queries = packages.map(pkg => ({
    package: { name: pkg.name, ecosystem: 'npm' },
    version: cleanVersion(pkg.version),
  }));

  try {
    const response = await fetch('https://api.osv.dev/v1/querybatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries }),
    });

    if (!response.ok) {
      console.warn(`OSV batch API error: ${response.status}`);
      // Fall back to individual queries
      for (const pkg of packages) {
        const vulns = await queryOSV(pkg.name, pkg.version);
        results.set(pkg.name, vulns);
      }
      return results;
    }

    const data = (await response.json()) as { results: Array<{ vulns?: OSVVulnerability[] }> };

    for (let i = 0; i < packages.length; i++) {
      results.set(packages[i].name, data.results[i]?.vulns || []);
    }
  } catch (error) {
    console.warn('OSV batch query failed, falling back to individual queries:', error);
    // Fall back to individual queries with rate limiting
    for (const pkg of packages) {
      const vulns = await queryOSV(pkg.name, pkg.version);
      results.set(pkg.name, vulns);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Calculate score based on vulnerabilities found
 */
function calculateScore(details: VulnerabilityDetail[]): number {
  if (details.length === 0) return 100;

  let penalty = 0;

  for (const vuln of details) {
    switch (vuln.severity) {
      case 'critical':
        penalty += 30;
        break;
      case 'high':
        penalty += 20;
        break;
      case 'moderate':
        penalty += 10;
        break;
      case 'low':
        penalty += 5;
        break;
    }
  }

  return Math.max(0, 100 - penalty);
}

/**
 * Audit package.json for vulnerable dependencies
 */
export async function auditDependencies(files: UploadedFile[]): Promise<DependencyAuditResult> {
  // Find package.json
  const packageJsonFile = files.find(
    f => f.path === 'package.json' || f.path.endsWith('/package.json')
  );

  if (!packageJsonFile) {
    return {
      score: 100,
      totalDependencies: 0,
      vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0 },
      details: [],
    };
  }

  let packageJson: PackageJson;
  try {
    packageJson = JSON.parse(packageJsonFile.content) as PackageJson;
  } catch (error) {
    console.error('Failed to parse package.json:', error);
    return {
      score: 100,
      totalDependencies: 0,
      vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0 },
      details: [],
    };
  }

  // Combine dependencies and devDependencies
  const allDependencies: Record<string, string> = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const packages = Object.entries(allDependencies).map(([name, version]) => ({
    name,
    version,
  }));

  if (packages.length === 0) {
    return {
      score: 100,
      totalDependencies: 0,
      vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0 },
      details: [],
    };
  }

  console.log(`Scanning ${packages.length} dependencies for vulnerabilities...`);

  // Query OSV in batches
  const batchSize = 100;
  const allVulns = new Map<string, OSVVulnerability[]>();

  for (let i = 0; i < packages.length; i += batchSize) {
    const batch = packages.slice(i, i + batchSize);
    const batchResults = await queryOSVBatch(batch);
    batchResults.forEach((vulns, pkg) => allVulns.set(pkg, vulns));
  }

  // Process results
  const details: VulnerabilityDetail[] = [];
  const counts = { critical: 0, high: 0, moderate: 0, low: 0 };

  for (const [packageName, vulns] of allVulns) {
    const version = allDependencies[packageName];

    for (const vuln of vulns) {
      const severity = mapSeverity(vuln);
      const cve = vuln.aliases?.find(a => a.startsWith('CVE-'));

      details.push({
        package: packageName,
        installedVersion: cleanVersion(version),
        vulnerability: vuln.summary || vuln.id,
        severity,
        cve,
        recommendation: `Update ${packageName} to version ${getFixedVersion(vuln)} or later`,
        patchedVersions: getFixedVersion(vuln),
      });

      counts[severity]++;
    }
  }

  // Sort by severity (critical first)
  const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
  details.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const score = calculateScore(details);

  console.log(
    `Dependency audit complete: ${details.length} vulnerabilities found (${counts.critical} critical, ${counts.high} high)`
  );

  return {
    score,
    totalDependencies: packages.length,
    vulnerabilities: counts,
    details,
  };
}
