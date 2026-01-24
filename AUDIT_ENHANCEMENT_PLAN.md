# 3RROR_K1NG Audit Enhancement Plan

## Current State (97/100)
- Performance: 100/100
- Security: 90/100
- SEO: 100/100
- Accessibility: 100/100
- Code Quality: 100/100

## Architecture Overview
```
app/                    # Next.js 14 frontend (Vercel)
worker/                 # Node.js scan worker (Railway)
  src/
    audits/            # Individual audit modules
      security.ts      # Security header checks, SSL, CORS, SRI
      performance.ts   # Lighthouse integration
      seo.ts          # Meta tags, Open Graph, etc.
      accessibility.ts # axe-core integration
      codeQuality.ts  # Console errors, broken links
      techStack.ts    # Technology detection
      resources.ts    # Resource waterfall, third-party analysis
    roastGenerator.ts  # Claude AI roast + LLM report generation
    scanner.ts         # Orchestrates all audits
    lib/
      supabase.ts     # Database operations
supabase/              # Database migrations
```

---

# PHASE 1: Quick Wins (Estimated: 4-6 hours)

## 1.1 Vulnerable JavaScript Library Detection
**File:** `worker/src/audits/vulnerabilities.ts` (NEW)

**Implementation:**
```typescript
// Detect libraries and versions from page
// Check against a vulnerability database

interface VulnerableLibrary {
  name: string;
  detectedVersion: string;
  vulnerabilities: {
    severity: 'critical' | 'high' | 'medium' | 'low';
    cve: string;
    description: string;
    fixedIn: string;
    recommendation: string;
  }[];
}

// Detection approach:
// 1. Check window globals (jQuery, React, Vue, Angular, etc.)
// 2. Parse script src URLs for version numbers
// 3. Check known vulnerability patterns

// Use bundled vulnerability data or API:
// - Snyk Vulnerability DB (free tier)
// - OSV (Open Source Vulnerabilities) - free API
// - RetireJS patterns (bundled JSON)
```

**Page evaluation to detect libraries:**
```typescript
const libraryDetection = await page.evaluate(() => {
  const libs: {name: string, version: string}[] = [];

  // jQuery
  if ((window as any).jQuery) {
    libs.push({ name: 'jquery', version: (window as any).jQuery.fn.jquery });
  }

  // React
  if ((window as any).React) {
    libs.push({ name: 'react', version: (window as any).React.version });
  }

  // Vue
  if ((window as any).Vue) {
    libs.push({ name: 'vue', version: (window as any).Vue.version });
  }

  // Angular
  if ((window as any).angular) {
    libs.push({ name: 'angular', version: (window as any).angular.version?.full });
  }

  // Lodash
  if ((window as any)._?.VERSION) {
    libs.push({ name: 'lodash', version: (window as any)._.VERSION });
  }

  // Bootstrap
  if ((window as any).bootstrap) {
    libs.push({ name: 'bootstrap', version: (window as any).bootstrap.Alert?.VERSION });
  }

  // Also parse script tags for CDN versions
  document.querySelectorAll('script[src]').forEach(script => {
    const src = (script as HTMLScriptElement).src;
    // Parse patterns like jquery-3.6.0.min.js or @3.6.0 in URL
    const versionMatch = src.match(/[-@](\d+\.\d+\.\d+)/);
    if (versionMatch) {
      // Extract library name from URL
    }
  });

  return libs;
});
```

**Vulnerability data source (bundle RetireJS patterns):**
- Download from: https://github.com/RetireJS/retire.js/blob/master/repository/jsrepository.json
- Store as `worker/src/data/vulnerabilities.json`
- ~200KB, update periodically

**LLM Report Output:**
```markdown
### VULNERABLE LIBRARIES DETECTED

#### [CRITICAL] jQuery 3.4.1
- **CVE-2020-11022**: XSS vulnerability in jQuery.htmlPrefilter
- **Fixed in:** 3.5.0
- **Action:** Update to jQuery 3.7.1
- **Command:** `npm update jquery` or change CDN URL to:
  `https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js`
```

---

## 1.2 HTTP/2 and HTTP/3 Protocol Detection
**File:** `worker/src/audits/protocol.ts` (NEW)

**Implementation:**
```typescript
import https from 'https';
import http2 from 'http2';

interface ProtocolInfo {
  http2: boolean;
  http3: boolean;  // Check via Alt-Svc header
  alpn: string;    // Application-Layer Protocol Negotiation
  serverPush: boolean;
}

async function checkProtocol(url: string): Promise<ProtocolInfo> {
  // HTTP/2 check via http2 module
  const client = http2.connect(url);

  // HTTP/3 check via Alt-Svc header in response
  const altSvc = response.headers['alt-svc'];
  const supportsHttp3 = altSvc?.includes('h3');

  return { http2, http3, alpn, serverPush };
}
```

**Also check in resource timing:**
```typescript
const protocols = await page.evaluate(() => {
  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  return entries.map(e => ({
    url: e.name,
    protocol: e.nextHopProtocol // 'h2', 'http/1.1', 'h3'
  }));
});
```

**LLM Report Output:**
```markdown
### PROTOCOL ANALYSIS

- **HTTP Version:** HTTP/1.1 ❌
- **HTTP/2 Supported:** No
- **HTTP/3 (QUIC):** No

**Recommendation:** Enable HTTP/2 on your server for:
- Multiplexed connections (faster parallel loading)
- Header compression (smaller requests)
- Server push capability

**Nginx Config:**
```nginx
server {
    listen 443 ssl http2;
    # ...
}
```
```

---

## 1.3 Image Optimization Audit
**File:** `worker/src/audits/images.ts` (NEW)

**Implementation:**
```typescript
interface ImageAudit {
  totalImages: number;
  totalSize: number;
  issues: ImageIssue[];
  optimizationPotential: number; // Estimated bytes saveable
}

interface ImageIssue {
  src: string;
  issue: 'no-lazy' | 'no-srcset' | 'not-webp' | 'oversized' | 'no-dimensions';
  currentSize?: number;
  displaySize?: { width: number; height: number };
  naturalSize?: { width: number; height: number };
  recommendation: string;
  savingsEstimate?: number;
}

// Page evaluation
const imageData = await page.evaluate(() => {
  const images: any[] = [];

  document.querySelectorAll('img').forEach(img => {
    images.push({
      src: img.src,
      loading: img.loading, // 'lazy' | 'eager' | ''
      srcset: img.srcset,
      sizes: img.sizes,
      width: img.width,
      height: img.height,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      hasWidthHeight: img.hasAttribute('width') && img.hasAttribute('height'),
      isInViewport: img.getBoundingClientRect().top < window.innerHeight,
      format: img.src.split('.').pop()?.split('?')[0],
    });
  });

  return images;
});
```

**Checks:**
1. **Lazy Loading:** Images below fold should have `loading="lazy"`
2. **Modern Formats:** Should use WebP or AVIF instead of PNG/JPG
3. **Srcset:** Responsive images should have srcset for different sizes
4. **Dimensions:** Images should have width/height to prevent CLS
5. **Oversized:** Serving 2000px image in 200px container

**LLM Report Output:**
```markdown
### IMAGE OPTIMIZATION (3 issues)

#### [HIGH] Missing Lazy Loading - 5 images
Below-the-fold images loading eagerly, blocking initial render.
- `/images/feature1.png`
- `/images/feature2.png`

**Fix:**
```html
<img src="/images/feature1.png" loading="lazy" alt="...">
```

#### [MEDIUM] Not Using Modern Formats - 8 images
Using PNG/JPG instead of WebP (30-50% smaller).

**Fix for Next.js:**
```jsx
import Image from 'next/image';
<Image src="/photo.jpg" alt="..." width={800} height={600} />
// Next.js automatically serves WebP
```

#### [LOW] Missing Dimensions - 2 images
Images without width/height cause layout shift.

**Fix:**
```html
<img src="..." width="800" height="600" alt="...">
```
```

---

## 1.4 Cache Headers Analysis
**File:** `worker/src/audits/caching.ts` (NEW)

**Implementation:**
```typescript
interface CacheAnalysis {
  score: number;
  resources: ResourceCacheInfo[];
  issues: CacheIssue[];
}

interface ResourceCacheInfo {
  url: string;
  type: string;
  cacheControl: string | null;
  expires: string | null;
  etag: string | null;
  lastModified: string | null;
  maxAge: number | null;
  isImmutable: boolean;
  isCacheable: boolean;
}

// Intercept responses to get cache headers
const cacheData: ResourceCacheInfo[] = [];

page.on('response', async (response) => {
  const headers = response.headers();
  cacheData.push({
    url: response.url(),
    type: headers['content-type'],
    cacheControl: headers['cache-control'],
    expires: headers['expires'],
    etag: headers['etag'],
    lastModified: headers['last-modified'],
    maxAge: parseCacheControl(headers['cache-control']).maxAge,
    isImmutable: headers['cache-control']?.includes('immutable'),
    isCacheable: !headers['cache-control']?.includes('no-store'),
  });
});
```

**Scoring:**
- Static assets (JS, CSS, fonts) should have long cache (1 year)
- Images should have long cache
- HTML should have short/no cache or revalidation
- API responses should have appropriate cache

**LLM Report Output:**
```markdown
### CACHE ANALYSIS (2 issues)

#### [HIGH] Static Assets Not Cached
Your JS/CSS files have no Cache-Control headers.

**Affected:**
- `/static/main.js` - No cache headers
- `/static/styles.css` - No cache headers

**Fix (Vercel - vercel.json):**
```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

#### [MEDIUM] Missing ETags
No ETag headers for conditional requests.
```

---

## 1.5 Security.txt Check
**File:** Update `worker/src/audits/security.ts`

**Implementation:**
```typescript
// Check for /.well-known/security.txt or /security.txt
async function checkSecurityTxt(baseUrl: string): Promise<{
  exists: boolean;
  valid: boolean;
  content?: string;
  issues: string[];
}> {
  const urls = [
    `${baseUrl}/.well-known/security.txt`,
    `${baseUrl}/security.txt`
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const content = await response.text();
        return {
          exists: true,
          valid: validateSecurityTxt(content),
          content,
          issues: getSecurityTxtIssues(content)
        };
      }
    } catch {}
  }

  return { exists: false, valid: false, issues: ['No security.txt found'] };
}

function validateSecurityTxt(content: string): boolean {
  // Must have Contact field
  return content.includes('Contact:');
}
```

**LLM Report Output:**
```markdown
### SECURITY.TXT (Missing)

No security.txt file found. This file helps security researchers
report vulnerabilities responsibly.

**Create `public/.well-known/security.txt`:**
```
Contact: security@yoursite.com
Expires: 2025-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://yoursite.com/.well-known/security.txt
```
```

---

## 1.6 Screenshot Capture
**File:** Update `worker/src/scanner.ts`

**Implementation:**
```typescript
// Playwright already supports this
const screenshot = await page.screenshot({
  type: 'png',
  fullPage: false, // Just viewport
});

// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('screenshots')
  .upload(`${scanId}.png`, screenshot, {
    contentType: 'image/png',
    upsert: true
  });

const screenshotUrl = supabase.storage
  .from('screenshots')
  .getPublicUrl(`${scanId}.png`).data.publicUrl;

// Save URL to scan record
await updateScan(scanId, { screenshot_url: screenshotUrl });
```

**Supabase Setup:**
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true);

-- Allow public read
CREATE POLICY "Public read" ON storage.objects
FOR SELECT USING (bucket_id = 'screenshots');
```

---

## 1.7 Redirect Chain Analysis
**File:** `worker/src/audits/redirects.ts` (NEW)

**Implementation:**
```typescript
interface RedirectChain {
  hops: RedirectHop[];
  totalTime: number;
  issues: string[];
}

interface RedirectHop {
  url: string;
  statusCode: number;
  duration: number;
  location: string;
}

async function analyzeRedirects(url: string): Promise<RedirectChain> {
  const hops: RedirectHop[] = [];
  let currentUrl = url;

  while (true) {
    const start = Date.now();
    const response = await fetch(currentUrl, {
      redirect: 'manual',
      method: 'HEAD'
    });
    const duration = Date.now() - start;

    hops.push({
      url: currentUrl,
      statusCode: response.status,
      duration,
      location: response.headers.get('location') || ''
    });

    if (response.status >= 300 && response.status < 400) {
      currentUrl = response.headers.get('location')!;
      if (hops.length > 10) break; // Prevent infinite loops
    } else {
      break;
    }
  }

  return {
    hops,
    totalTime: hops.reduce((sum, h) => sum + h.duration, 0),
    issues: hops.length > 2 ? ['Too many redirects'] : []
  };
}
```

**LLM Report Output:**
```markdown
### REDIRECT CHAIN (3 hops - 450ms wasted)

```
http://example.com (301) → 85ms
  → https://example.com (301) → 120ms
    → https://www.example.com (301) → 130ms
      → https://www.example.com/ (200) → 115ms
```

**Fix:** Update links to use final URL directly:
`https://www.example.com/`
```

---

## 1.8 Integration into Scanner

**Update `worker/src/scanner.ts`:**
```typescript
import { detectVulnerableLibraries } from './audits/vulnerabilities.js';
import { checkProtocol } from './audits/protocol.js';
import { auditImages } from './audits/images.js';
import { analyzeCaching } from './audits/caching.js';
import { analyzeRedirects } from './audits/redirects.js';

// In runScan function, add:

// Phase 1 audits
const [vulnResult, protocolResult, imageResult, cacheResult, redirectResult] =
  await Promise.all([
    detectVulnerableLibraries(page),
    checkProtocol(url),
    auditImages(page),
    analyzeCaching(page),
    analyzeRedirects(url),
  ]);

await updateScan(scanId, {
  results_vulnerabilities: vulnResult,
  results_protocol: protocolResult,
  results_images: imageResult,
  results_caching: cacheResult,
  results_redirects: redirectResult,
});
```

**Update `worker/src/lib/supabase.ts` ScanUpdate interface:**
```typescript
results_vulnerabilities?: unknown;
results_protocol?: unknown;
results_images?: unknown;
results_caching?: unknown;
results_redirects?: unknown;
```

**Database Migration:**
```sql
ALTER TABLE scans
ADD COLUMN IF NOT EXISTS results_vulnerabilities jsonb,
ADD COLUMN IF NOT EXISTS results_protocol jsonb,
ADD COLUMN IF NOT EXISTS results_images jsonb,
ADD COLUMN IF NOT EXISTS results_caching jsonb,
ADD COLUMN IF NOT EXISTS results_redirects jsonb;
```

---

# PHASE 2: File Upload & Code Analysis (Estimated: 8-12 hours)

## 2.1 File Upload API

**File:** `app/app/api/upload/route.ts` (NEW)

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import AdmZip from 'adm-zip';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const scanId = formData.get('scanId') as string;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Handle different file types
  if (file.name.endsWith('.zip')) {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    const files: { path: string; content: string }[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory && isAnalyzableFile(entry.entryName)) {
        files.push({
          path: entry.entryName,
          content: entry.getData().toString('utf8')
        });
      }
    }

    // Store in Supabase or process directly
    return NextResponse.json({ files: files.length, scanId });

  } else {
    // Single file
    const content = buffer.toString('utf8');
    return NextResponse.json({
      files: 1,
      content,
      filename: file.name
    });
  }
}

function isAnalyzableFile(path: string): boolean {
  const extensions = [
    '.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs',
    '.json', '.yaml', '.yml', '.toml',
    '.html', '.css', '.scss', '.sass',
    '.env', '.env.example', '.env.local',
    '.gitignore', '.npmrc',
    'package.json', 'package-lock.json',
    'tsconfig.json', 'next.config.js', 'next.config.mjs',
    'vite.config.ts', 'webpack.config.js',
  ];
  return extensions.some(ext => path.endsWith(ext) || path.includes(ext));
}
```

**Add npm package:**
```bash
cd app && npm install adm-zip @types/adm-zip
```

---

## 2.2 Package.json Vulnerability Scanner

**File:** `worker/src/audits/dependencies.ts` (NEW)

**Implementation:**
```typescript
import { execSync } from 'child_process';

interface DependencyAudit {
  totalDependencies: number;
  vulnerabilities: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
  details: VulnerabilityDetail[];
}

interface VulnerabilityDetail {
  package: string;
  installedVersion: string;
  vulnerability: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  cve?: string;
  recommendation: string;
  patchedVersions: string;
}

// Option 1: Use npm audit (requires package-lock.json)
async function auditPackageJson(
  packageJson: string,
  packageLock?: string
): Promise<DependencyAudit> {
  // Create temp directory
  const tmpDir = `/tmp/audit-${Date.now()}`;
  fs.mkdirSync(tmpDir);
  fs.writeFileSync(`${tmpDir}/package.json`, packageJson);
  if (packageLock) {
    fs.writeFileSync(`${tmpDir}/package-lock.json`, packageLock);
  }

  try {
    // Run npm audit
    const result = execSync('npm audit --json', {
      cwd: tmpDir,
      encoding: 'utf8',
      timeout: 60000
    });
    return parseNpmAudit(JSON.parse(result));
  } catch (error) {
    // npm audit exits with non-zero if vulnerabilities found
    const output = (error as any).stdout;
    return parseNpmAudit(JSON.parse(output));
  } finally {
    fs.rmSync(tmpDir, { recursive: true });
  }
}

// Option 2: Use OSV API (no npm install needed)
async function auditWithOSV(dependencies: Record<string, string>): Promise<DependencyAudit> {
  const results: VulnerabilityDetail[] = [];

  for (const [pkg, version] of Object.entries(dependencies)) {
    const response = await fetch('https://api.osv.dev/v1/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        package: { name: pkg, ecosystem: 'npm' },
        version: version.replace(/[\^~]/, '')
      })
    });

    const data = await response.json();
    if (data.vulns?.length > 0) {
      for (const vuln of data.vulns) {
        results.push({
          package: pkg,
          installedVersion: version,
          vulnerability: vuln.summary,
          severity: mapSeverity(vuln.severity),
          cve: vuln.aliases?.find((a: string) => a.startsWith('CVE-')),
          recommendation: `Update ${pkg}`,
          patchedVersions: vuln.affected?.[0]?.ranges?.[0]?.fixed || 'Unknown'
        });
      }
    }
  }

  return {
    totalDependencies: Object.keys(dependencies).length,
    vulnerabilities: countBySeverity(results),
    details: results
  };
}
```

**LLM Report Output:**
```markdown
### DEPENDENCY VULNERABILITIES

**Summary:** 3 critical, 5 high, 12 moderate

#### [CRITICAL] lodash@4.17.15
- **CVE-2021-23337**: Command Injection
- **Fixed in:** 4.17.21
- **Run:** `npm update lodash`

#### [CRITICAL] axios@0.21.0
- **CVE-2021-3749**: ReDoS vulnerability
- **Fixed in:** 0.21.2
- **Run:** `npm update axios`

#### [HIGH] node-fetch@2.6.0
- **CVE-2022-0235**: Exposure of Sensitive Information
- **Fixed in:** 2.6.7
- **Run:** `npm update node-fetch`
```

---

## 2.3 Secrets Detection

**File:** `worker/src/audits/secrets.ts` (NEW)

**Implementation:**
```typescript
interface SecretFinding {
  type: string;
  file: string;
  line: number;
  column: number;
  match: string;      // Redacted version
  rawMatch: string;   // For internal use only, never expose
  severity: 'critical' | 'high' | 'medium';
  recommendation: string;
}

const SECRET_PATTERNS: { name: string; pattern: RegExp; severity: 'critical' | 'high' | 'medium' }[] = [
  // API Keys
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g, severity: 'critical' },
  { name: 'AWS Secret Key', pattern: /[A-Za-z0-9/+=]{40}/g, severity: 'critical' },
  { name: 'GitHub Token', pattern: /ghp_[a-zA-Z0-9]{36}/g, severity: 'critical' },
  { name: 'GitHub OAuth', pattern: /gho_[a-zA-Z0-9]{36}/g, severity: 'critical' },
  { name: 'Stripe Secret Key', pattern: /sk_live_[a-zA-Z0-9]{24,}/g, severity: 'critical' },
  { name: 'Stripe Publishable', pattern: /pk_live_[a-zA-Z0-9]{24,}/g, severity: 'high' },
  { name: 'Slack Token', pattern: /xox[baprs]-[0-9]{10,}-[a-zA-Z0-9-]+/g, severity: 'critical' },
  { name: 'Slack Webhook', pattern: /hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[a-zA-Z0-9]+/g, severity: 'high' },
  { name: 'Google API Key', pattern: /AIza[0-9A-Za-z_-]{35}/g, severity: 'high' },
  { name: 'Firebase Key', pattern: /AAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140}/g, severity: 'high' },
  { name: 'Twilio API Key', pattern: /SK[a-f0-9]{32}/g, severity: 'high' },
  { name: 'SendGrid API Key', pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g, severity: 'high' },
  { name: 'Mailgun API Key', pattern: /key-[a-zA-Z0-9]{32}/g, severity: 'high' },
  { name: 'npm Token', pattern: /npm_[a-zA-Z0-9]{36}/g, severity: 'critical' },
  { name: 'PyPI Token', pattern: /pypi-[a-zA-Z0-9]{32,}/g, severity: 'critical' },
  { name: 'Heroku API Key', pattern: /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g, severity: 'high' },

  // Database URLs
  { name: 'Database URL', pattern: /(postgres|mysql|mongodb|redis):\/\/[^:]+:[^@]+@[^\s]+/g, severity: 'critical' },

  // Private Keys
  { name: 'RSA Private Key', pattern: /-----BEGIN RSA PRIVATE KEY-----/g, severity: 'critical' },
  { name: 'SSH Private Key', pattern: /-----BEGIN OPENSSH PRIVATE KEY-----/g, severity: 'critical' },
  { name: 'PGP Private Key', pattern: /-----BEGIN PGP PRIVATE KEY BLOCK-----/g, severity: 'critical' },

  // Generic patterns
  { name: 'Generic API Key', pattern: /api[_-]?key['":\s]*[=:]\s*['"][a-zA-Z0-9_-]{20,}['"]/gi, severity: 'medium' },
  { name: 'Generic Secret', pattern: /secret['":\s]*[=:]\s*['"][a-zA-Z0-9_-]{20,}['"]/gi, severity: 'medium' },
  { name: 'Password in Code', pattern: /password['":\s]*[=:]\s*['"][^'"]{8,}['"]/gi, severity: 'high' },
  { name: 'Bearer Token', pattern: /bearer\s+[a-zA-Z0-9_-]{20,}/gi, severity: 'high' },
];

function scanForSecrets(files: { path: string; content: string }[]): SecretFinding[] {
  const findings: SecretFinding[] = [];

  for (const file of files) {
    // Skip binary files, node_modules, etc.
    if (shouldSkipFile(file.path)) continue;

    const lines = file.content.split('\n');

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];

      for (const { name, pattern, severity } of SECRET_PATTERNS) {
        const matches = line.matchAll(new RegExp(pattern));
        for (const match of matches) {
          // Skip if in a comment
          if (isInComment(line, match.index!)) continue;

          // Skip example/placeholder values
          if (isPlaceholder(match[0])) continue;

          findings.push({
            type: name,
            file: file.path,
            line: lineNum + 1,
            column: match.index! + 1,
            match: redact(match[0]),
            rawMatch: match[0],
            severity,
            recommendation: getRecommendation(name)
          });
        }
      }
    }
  }

  return findings;
}

function redact(secret: string): string {
  if (secret.length <= 8) return '***REDACTED***';
  return secret.slice(0, 4) + '...' + secret.slice(-4);
}

function isPlaceholder(value: string): boolean {
  const placeholders = [
    'your_api_key', 'xxx', 'placeholder', 'example',
    'test', 'dummy', 'fake', 'sample', '<', '>', '{', '}'
  ];
  return placeholders.some(p => value.toLowerCase().includes(p));
}

function shouldSkipFile(path: string): boolean {
  const skipPatterns = [
    'node_modules', '.git', 'dist', 'build',
    '.min.js', '.bundle.js', 'vendor',
    '.lock', '-lock.', '.map'
  ];
  return skipPatterns.some(p => path.includes(p));
}
```

**LLM Report Output:**
```markdown
### SECRETS DETECTED IN CODE (CRITICAL!)

#### [CRITICAL] AWS Access Key Found
- **File:** `src/config/aws.ts`
- **Line:** 12
- **Found:** `AKIA...7XYZ`

**Immediate Action Required:**
1. Rotate this key immediately in AWS Console
2. Remove from code
3. Use environment variables instead:
```typescript
// Before (INSECURE)
const accessKey = 'AKIAXXXXXXXXXX';

// After (SECURE)
const accessKey = process.env.AWS_ACCESS_KEY_ID;
```

#### [CRITICAL] Database URL with Credentials
- **File:** `.env.production`
- **Line:** 5
- **Found:** `postgres://user:****@...`

**Fix:** This file should be in .gitignore!
```bash
echo ".env.production" >> .gitignore
git rm --cached .env.production
```
```

---

## 2.4 Code Pattern Analysis

**File:** `worker/src/audits/codePatterns.ts` (NEW)

**Detects:**
- SQL Injection patterns
- XSS vulnerabilities
- Insecure randomness
- Hardcoded IPs/URLs
- eval() usage
- dangerouslySetInnerHTML
- Deprecated APIs

```typescript
interface CodePatternIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line: number;
  code: string;
  description: string;
  fix: string;
}

const CODE_PATTERNS = [
  {
    name: 'SQL Injection',
    pattern: /query\s*\(\s*[`'"].*\$\{/g,
    severity: 'critical',
    description: 'String interpolation in SQL query - vulnerable to SQL injection',
    fix: 'Use parameterized queries instead'
  },
  {
    name: 'XSS via innerHTML',
    pattern: /\.innerHTML\s*=\s*[^'"]/g,
    severity: 'high',
    description: 'Direct innerHTML assignment with variable - vulnerable to XSS',
    fix: 'Use textContent or sanitize HTML'
  },
  {
    name: 'React dangerouslySetInnerHTML',
    pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html:\s*[^}]+\}/g,
    severity: 'high',
    description: 'Using dangerouslySetInnerHTML with unsanitized input',
    fix: 'Sanitize HTML with DOMPurify before using'
  },
  {
    name: 'Insecure Randomness',
    pattern: /Math\.random\(\)/g,
    severity: 'medium',
    description: 'Math.random() is not cryptographically secure',
    fix: 'Use crypto.randomUUID() or crypto.getRandomValues()'
  },
  {
    name: 'eval Usage',
    pattern: /\beval\s*\(/g,
    severity: 'critical',
    description: 'eval() can execute arbitrary code - security risk',
    fix: 'Avoid eval(). Use JSON.parse() for JSON, or Function constructor if absolutely necessary'
  },
  {
    name: 'Hardcoded Localhost',
    pattern: /['"]https?:\/\/(localhost|127\.0\.0\.1)/g,
    severity: 'low',
    description: 'Hardcoded localhost URL - will not work in production',
    fix: 'Use environment variables for URLs'
  },
  {
    name: 'Console.log in Production',
    pattern: /console\.(log|debug|info)\(/g,
    severity: 'low',
    description: 'Console statements should be removed in production',
    fix: 'Remove or use a proper logging library'
  },
  {
    name: 'Disabled ESLint',
    pattern: /eslint-disable(?!-next-line)/g,
    severity: 'medium',
    description: 'ESLint rules disabled for entire file',
    fix: 'Fix the underlying issues instead of disabling linting'
  },
  {
    name: 'TODO/FIXME Comments',
    pattern: /\/\/\s*(TODO|FIXME|HACK|XXX):/gi,
    severity: 'low',
    description: 'Unresolved TODO comment',
    fix: 'Address the TODO or create a ticket'
  },
];
```

---

## 2.5 Frontend Upload UI

**File:** `app/components/FileUpload.tsx` (NEW)

```tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
}

export function FileUpload({ onUpload, isUploading }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/json': ['.json'],
      'text/javascript': ['.js', '.ts', '.jsx', '.tsx'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <div
      {...getRootProps()}
      className={clsx(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-terminal bg-terminal/10' : 'border-void-200 hover:border-terminal/50',
        isUploading && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} disabled={isUploading} />
      <div className="text-4xl mb-4">📁</div>
      {isDragActive ? (
        <p className="text-terminal">Drop files here...</p>
      ) : (
        <>
          <p className="text-gray-300 mb-2">
            Drag & drop your project ZIP or files here
          </p>
          <p className="text-sm text-gray-500">
            Supports: .zip, package.json, .js, .ts, .jsx, .tsx
          </p>
        </>
      )}
    </div>
  );
}
```

**Add npm package:**
```bash
cd app && npm install react-dropzone
```

---

## 2.6 Database Schema Updates

```sql
-- Add file upload support
ALTER TABLE scans
ADD COLUMN IF NOT EXISTS scan_type text DEFAULT 'url' CHECK (scan_type IN ('url', 'upload')),
ADD COLUMN IF NOT EXISTS uploaded_files jsonb,
ADD COLUMN IF NOT EXISTS results_dependencies jsonb,
ADD COLUMN IF NOT EXISTS results_secrets jsonb,
ADD COLUMN IF NOT EXISTS results_code_patterns jsonb;

-- Create file storage table
CREATE TABLE IF NOT EXISTS scan_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid REFERENCES scans(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  file_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

---

# PHASE 3: Deep Analysis (Estimated: 12-16 hours)

## 3.1 PWA Audit

**File:** `worker/src/audits/pwa.ts` (NEW)

**Checks:**
- manifest.json present and valid
- Service worker registered
- Offline fallback page
- Icons (192x192, 512x512)
- Theme color
- Start URL
- Display mode
- App install prompt capability

```typescript
interface PWAAudit {
  score: number;
  installable: boolean;
  checks: {
    manifest: { valid: boolean; issues: string[] };
    serviceWorker: { registered: boolean; scope: string };
    icons: { has192: boolean; has512: boolean; maskable: boolean };
    offline: { tested: boolean; works: boolean };
    themeColor: boolean;
    viewport: boolean;
  };
}

async function auditPWA(page: Page, url: string): Promise<PWAAudit> {
  // Check manifest
  const manifestLink = await page.$('link[rel="manifest"]');
  let manifest = null;
  if (manifestLink) {
    const href = await manifestLink.getAttribute('href');
    const manifestUrl = new URL(href!, url).toString();
    const response = await fetch(manifestUrl);
    manifest = await response.json();
  }

  // Check service worker
  const swRegistration = await page.evaluate(() => {
    return navigator.serviceWorker?.controller ? {
      registered: true,
      scope: navigator.serviceWorker.controller.scriptURL
    } : { registered: false, scope: '' };
  });

  // Check offline capability
  await page.setOfflineMode(true);
  const offlineWorks = await page.evaluate(() => {
    return document.body.innerHTML.length > 100;
  });
  await page.setOfflineMode(false);

  // ... more checks
}
```

---

## 3.2 Schema.org Validation

**File:** `worker/src/audits/structuredData.ts` (NEW)

```typescript
interface StructuredDataAudit {
  found: boolean;
  types: string[];
  validItems: StructuredDataItem[];
  errors: StructuredDataError[];
  recommendations: string[];
}

async function auditStructuredData(page: Page): Promise<StructuredDataAudit> {
  // Extract JSON-LD
  const jsonLd = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    return Array.from(scripts).map(s => {
      try {
        return JSON.parse(s.textContent || '');
      } catch {
        return null;
      }
    }).filter(Boolean);
  });

  // Extract Microdata
  const microdata = await page.evaluate(() => {
    const items = document.querySelectorAll('[itemscope]');
    return Array.from(items).map(item => ({
      type: item.getAttribute('itemtype'),
      properties: {} // Extract itemprop values
    }));
  });

  // Validate against Schema.org
  const errors = validateSchemaOrg(jsonLd, microdata);

  return {
    found: jsonLd.length > 0 || microdata.length > 0,
    types: [...jsonLd.map(j => j['@type']), ...microdata.map(m => m.type)],
    validItems: jsonLd,
    errors,
    recommendations: getSchemaRecommendations(jsonLd, microdata)
  };
}
```

**LLM Report Output:**
```markdown
### STRUCTURED DATA (Schema.org)

**Found:** Organization, WebSite
**Missing Recommended:** BreadcrumbList, FAQPage

**Errors:**
- Organization missing `logo` property
- WebSite missing `potentialAction` for sitelinks search

**Add to your page:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company",
  "url": "https://yoursite.com",
  "logo": "https://yoursite.com/logo.png",
  "sameAs": [
    "https://twitter.com/yourcompany",
    "https://linkedin.com/company/yourcompany"
  ]
}
</script>
```
```

---

## 3.3 Unused CSS/JS Detection

**File:** `worker/src/audits/unused.ts` (NEW)

```typescript
interface UnusedCodeAudit {
  css: {
    totalBytes: number;
    usedBytes: number;
    unusedBytes: number;
    unusedPercent: number;
    files: { url: string; unusedPercent: number }[];
  };
  js: {
    totalBytes: number;
    usedBytes: number;
    unusedBytes: number;
    unusedPercent: number;
    files: { url: string; unusedPercent: number }[];
  };
}

async function auditUnusedCode(page: Page): Promise<UnusedCodeAudit> {
  // Enable coverage
  await page.coverage.startCSSCoverage();
  await page.coverage.startJSCoverage();

  // Interact with page to trigger more code paths
  await page.evaluate(() => {
    // Scroll through page
    window.scrollTo(0, document.body.scrollHeight);
    window.scrollTo(0, 0);

    // Hover over interactive elements
    document.querySelectorAll('button, a, [role="button"]').forEach(el => {
      el.dispatchEvent(new MouseEvent('mouseenter'));
    });
  });

  const [cssCoverage, jsCoverage] = await Promise.all([
    page.coverage.stopCSSCoverage(),
    page.coverage.stopJSCoverage(),
  ]);

  // Calculate unused
  const cssStats = calculateCoverage(cssCoverage);
  const jsStats = calculateCoverage(jsCoverage);

  return { css: cssStats, js: jsStats };
}
```

---

## 3.4 Complete SEO Deep Dive

**File:** `worker/src/audits/seoDeep.ts` (NEW)

**Additional checks beyond current:**
- XML sitemap validation
- robots.txt validation
- Canonical URL consistency
- Hreflang for i18n
- Internal link structure
- Orphan pages
- Keyword density
- Meta description length optimization
- Image alt text quality
- Heading hierarchy (H1 → H2 → H3)
- Mobile-friendliness
- Core Web Vitals correlation

---

## 3.5 Link Rot Detection

**File:** `worker/src/audits/links.ts` (NEW)

```typescript
interface LinkAudit {
  totalLinks: number;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: BrokenLink[];
  redirectedLinks: RedirectedLink[];
  insecureLinks: string[]; // HTTP links on HTTPS page
}

interface BrokenLink {
  url: string;
  statusCode: number;
  foundOn: string; // Page where link was found
  anchorText: string;
}

async function auditLinks(page: Page): Promise<LinkAudit> {
  // Get all links from page
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]')).map(a => ({
      href: (a as HTMLAnchorElement).href,
      text: a.textContent?.trim() || '',
      isExternal: (a as HTMLAnchorElement).host !== window.location.host
    }));
  });

  // Check each link (with concurrency limit)
  const results = await Promise.all(
    links.slice(0, 50).map(async link => { // Limit to 50 links
      try {
        const response = await fetch(link.href, {
          method: 'HEAD',
          timeout: 5000
        });
        return { ...link, status: response.status };
      } catch (error) {
        return { ...link, status: 0, error: true };
      }
    })
  );

  return {
    totalLinks: links.length,
    internalLinks: links.filter(l => !l.isExternal).length,
    externalLinks: links.filter(l => l.isExternal).length,
    brokenLinks: results.filter(r => r.status >= 400 || r.status === 0),
    redirectedLinks: results.filter(r => r.status >= 300 && r.status < 400),
    insecureLinks: links.filter(l => l.href.startsWith('http://')).map(l => l.href)
  };
}
```

---

## 3.6 Advanced Security Checks

**File:** Update `worker/src/audits/security.ts`

**Add:**
- DNS Security (DNSSEC, CAA records)
- Email security (SPF, DKIM, DMARC) for domain
- Subresource Integrity coverage
- Feature-Policy / Permissions-Policy completeness
- Report-To / Reporting-Endpoints headers
- Cross-Origin-Embedder-Policy
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy

---

## 3.7 Updated LLM Report Format

The final LLM report should be structured for maximum actionability:

```markdown
# Complete Website Audit Report
## URL: https://example.com
## Scan Date: 2026-01-24
## Overall Score: 85/100

---

# EXECUTIVE SUMMARY

| Category | Score | Critical Issues |
|----------|-------|-----------------|
| Security | 72/100 | 2 vulnerabilities, 1 exposed secret |
| Performance | 95/100 | 3 unoptimized images |
| SEO | 88/100 | Missing structured data |
| Accessibility | 100/100 | None |
| Code Quality | 90/100 | 5 TODOs, 2 deprecated APIs |
| PWA | 40/100 | No service worker |

---

# CRITICAL ISSUES (Fix Immediately)

## 1. [CRITICAL] Vulnerable Dependency: lodash@4.17.15
**File:** `package.json:24`
**CVE:** CVE-2021-23337 (Command Injection)

**Fix:**
```bash
npm update lodash
```

## 2. [CRITICAL] API Key Exposed in Code
**File:** `src/config/api.ts:12`
**Found:** `sk_live_...`

**Fix:**
```typescript
// Remove hardcoded key
- const stripeKey = 'sk_live_xxxxx';
+ const stripeKey = process.env.STRIPE_SECRET_KEY;
```

---

# HIGH PRIORITY ISSUES

[... detailed fixes ...]

---

# MEDIUM PRIORITY ISSUES

[... detailed fixes ...]

---

# LOW PRIORITY / RECOMMENDATIONS

[... suggestions ...]

---

# DETAILED AUDIT RESULTS

## Security Analysis
[... full details ...]

## Performance Analysis
[... full details ...]

## SEO Analysis
[... full details ...]

## Accessibility Analysis
[... full details ...]

## Code Quality Analysis
[... full details ...]

## Dependency Analysis
[... full details ...]

---

# COMMANDS TO RUN

```bash
# Fix all auto-fixable issues
npm update lodash axios node-fetch
npm audit fix

# Generate missing files
npx generate-security-txt
npx generate-manifest

# Run suggested optimizations
npx imagemin src/images/* --out-dir=src/images
```

---

# MONITORING RECOMMENDATIONS

1. Set up Dependabot for automatic dependency updates
2. Add security scanning to CI/CD pipeline
3. Configure CSP reporting endpoint
4. Set up Core Web Vitals monitoring
```

---

# IMPLEMENTATION ORDER

## Phase 1 (Do First - Quick Wins)
1. `worker/src/audits/vulnerabilities.ts` - Vulnerable library detection
2. `worker/src/audits/protocol.ts` - HTTP/2 detection
3. `worker/src/audits/images.ts` - Image optimization
4. `worker/src/audits/caching.ts` - Cache headers
5. `worker/src/audits/redirects.ts` - Redirect chain
6. Update `security.ts` - Add security.txt check
7. Update `scanner.ts` - Add screenshot capture
8. Database migration for new columns
9. Update `roastGenerator.ts` - Include new audits in LLM report

## Phase 2 (File Upload)
1. `app/app/api/upload/route.ts` - File upload endpoint
2. `app/components/FileUpload.tsx` - Upload UI
3. `worker/src/audits/dependencies.ts` - package.json scanning
4. `worker/src/audits/secrets.ts` - Secret detection
5. `worker/src/audits/codePatterns.ts` - Code pattern analysis
6. Database migration for upload support
7. Update frontend to support both URL and file upload modes

## Phase 3 (Deep Analysis)
1. `worker/src/audits/pwa.ts` - PWA audit
2. `worker/src/audits/structuredData.ts` - Schema.org
3. `worker/src/audits/unused.ts` - Unused CSS/JS
4. `worker/src/audits/seoDeep.ts` - Extended SEO
5. `worker/src/audits/links.ts` - Link rot detection
6. Update `security.ts` - Advanced security headers
7. Complete LLM report overhaul

---

# TESTING CHECKLIST

- [ ] Test vulnerable library detection with known vulnerable jQuery
- [ ] Test secret detection with fake API keys
- [ ] Test file upload with sample ZIP
- [ ] Test PWA audit on a known PWA site
- [ ] Test on sites with poor scores to verify detection
- [ ] Test on sites with good scores to verify no false positives
- [ ] Verify LLM report is actionable by pasting into Claude
- [ ] Load test with concurrent scans

---

# DEPENDENCIES TO ADD

```bash
# Worker
cd worker
npm install adm-zip  # ZIP extraction (if processing uploads in worker)

# App
cd app
npm install react-dropzone adm-zip @types/adm-zip
```

---

# ENVIRONMENT VARIABLES

```bash
# Optional: For enhanced vulnerability checking
SNYK_API_KEY=xxx  # For Snyk vulnerability database
OSV_API_URL=https://api.osv.dev  # Free, no key needed
```
