/**
 * Secrets Detection Audit
 * Scans code files for exposed API keys, credentials, and sensitive data
 */

export interface SecretsAuditResult {
  score: number;
  totalFilesScanned: number;
  findings: SecretFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
  };
}

export interface SecretFinding {
  type: string;
  file: string;
  line: number;
  column: number;
  match: string; // Redacted version
  severity: 'critical' | 'high' | 'medium';
  recommendation: string;
}

interface SecretPattern {
  name: string;
  pattern: RegExp;
  severity: 'critical' | 'high' | 'medium';
  recommendation: string;
}

interface UploadedFile {
  path: string;
  content: string;
}

/**
 * Secret detection patterns based on common API key formats
 */
const SECRET_PATTERNS: SecretPattern[] = [
  // AWS
  {
    name: 'AWS Access Key',
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    severity: 'critical',
    recommendation: 'Rotate this AWS access key immediately and use environment variables',
  },
  {
    name: 'AWS Secret Key',
    pattern: /\b[A-Za-z0-9/+=]{40}\b(?=.*aws|.*secret)/gi,
    severity: 'critical',
    recommendation: 'Remove hardcoded AWS secret key and use IAM roles or environment variables',
  },

  // GitHub
  {
    name: 'GitHub Personal Access Token',
    pattern: /\bghp_[a-zA-Z0-9]{36}\b/g,
    severity: 'critical',
    recommendation: 'Revoke this GitHub token and use GitHub secrets or environment variables',
  },
  {
    name: 'GitHub OAuth Token',
    pattern: /\bgho_[a-zA-Z0-9]{36}\b/g,
    severity: 'critical',
    recommendation: 'Revoke this GitHub OAuth token immediately',
  },
  {
    name: 'GitHub App Token',
    pattern: /\bghu_[a-zA-Z0-9]{36}\b/g,
    severity: 'critical',
    recommendation: 'Rotate this GitHub App token',
  },
  {
    name: 'GitHub Refresh Token',
    pattern: /\bghr_[a-zA-Z0-9]{36}\b/g,
    severity: 'critical',
    recommendation: 'Revoke this GitHub refresh token',
  },

  // Stripe
  {
    name: 'Stripe Live Secret Key',
    pattern: /\bsk_live_[a-zA-Z0-9]{24,}\b/g,
    severity: 'critical',
    recommendation: 'Roll this Stripe secret key immediately - it can access live payment data',
  },
  {
    name: 'Stripe Live Publishable Key',
    pattern: /\bpk_live_[a-zA-Z0-9]{24,}\b/g,
    severity: 'high',
    recommendation: 'Publishable keys are less sensitive but should use environment variables',
  },
  {
    name: 'Stripe Test Secret Key',
    pattern: /\bsk_test_[a-zA-Z0-9]{24,}\b/g,
    severity: 'medium',
    recommendation: 'Even test keys should be in environment variables',
  },

  // Slack
  {
    name: 'Slack Token',
    pattern: /\bxox[baprs]-[0-9]{10,13}-[a-zA-Z0-9-]+\b/g,
    severity: 'critical',
    recommendation: 'Revoke this Slack token and regenerate using proper OAuth flow',
  },
  {
    name: 'Slack Webhook URL',
    pattern: /hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[a-zA-Z0-9]+/g,
    severity: 'high',
    recommendation: 'Slack webhooks should be stored as environment variables',
  },

  // Google
  {
    name: 'Google API Key',
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,
    severity: 'high',
    recommendation: 'Restrict this Google API key and use environment variables',
  },
  {
    name: 'Google OAuth Client Secret',
    pattern: /\bGOCSPX-[a-zA-Z0-9_-]{28}\b/g,
    severity: 'critical',
    recommendation: 'Rotate this Google OAuth client secret',
  },

  // Firebase
  {
    name: 'Firebase Server Key',
    pattern: /\bAAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140}\b/g,
    severity: 'high',
    recommendation: 'Firebase server keys should never be in client-side code',
  },

  // Twilio
  {
    name: 'Twilio API Key',
    pattern: /\bSK[a-f0-9]{32}\b/g,
    severity: 'high',
    recommendation: 'Rotate this Twilio API key and use environment variables',
  },
  {
    name: 'Twilio Auth Token',
    pattern: /\b[a-f0-9]{32}\b(?=.*twilio)/gi,
    severity: 'high',
    recommendation: 'Rotate your Twilio auth token',
  },

  // SendGrid
  {
    name: 'SendGrid API Key',
    pattern: /\bSG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}\b/g,
    severity: 'high',
    recommendation: 'Revoke this SendGrid API key and use environment variables',
  },

  // Mailgun
  {
    name: 'Mailgun API Key',
    pattern: /\bkey-[a-zA-Z0-9]{32}\b/g,
    severity: 'high',
    recommendation: 'Rotate this Mailgun API key',
  },

  // npm
  {
    name: 'npm Token',
    pattern: /\bnpm_[a-zA-Z0-9]{36}\b/g,
    severity: 'critical',
    recommendation: 'Revoke this npm token - it can publish packages as you',
  },

  // PyPI
  {
    name: 'PyPI Token',
    pattern: /\bpypi-[a-zA-Z0-9]{32,}\b/g,
    severity: 'critical',
    recommendation: 'Revoke this PyPI token immediately',
  },

  // Heroku
  {
    name: 'Heroku API Key',
    pattern: /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b(?=.*heroku)/gi,
    severity: 'high',
    recommendation: 'Rotate your Heroku API key',
  },

  // Database URLs
  {
    name: 'PostgreSQL Connection String',
    pattern: /postgres(?:ql)?:\/\/[^:]+:[^@]+@[^\s]+/gi,
    severity: 'critical',
    recommendation: 'Database URLs with credentials should always use environment variables',
  },
  {
    name: 'MySQL Connection String',
    pattern: /mysql:\/\/[^:]+:[^@]+@[^\s]+/gi,
    severity: 'critical',
    recommendation: 'Database URLs with credentials should always use environment variables',
  },
  {
    name: 'MongoDB Connection String',
    pattern: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@[^\s]+/gi,
    severity: 'critical',
    recommendation: 'MongoDB connection strings with credentials are highly sensitive',
  },
  {
    name: 'Redis Connection String',
    pattern: /redis:\/\/[^:]+:[^@]+@[^\s]+/gi,
    severity: 'critical',
    recommendation: 'Redis URLs with credentials should use environment variables',
  },

  // Private Keys
  {
    name: 'RSA Private Key',
    pattern: /-----BEGIN RSA PRIVATE KEY-----/g,
    severity: 'critical',
    recommendation: 'Private keys should never be committed to version control',
  },
  {
    name: 'OpenSSH Private Key',
    pattern: /-----BEGIN OPENSSH PRIVATE KEY-----/g,
    severity: 'critical',
    recommendation: 'SSH private keys should never be in source code',
  },
  {
    name: 'PGP Private Key',
    pattern: /-----BEGIN PGP PRIVATE KEY BLOCK-----/g,
    severity: 'critical',
    recommendation: 'PGP private keys should never be committed',
  },
  {
    name: 'EC Private Key',
    pattern: /-----BEGIN EC PRIVATE KEY-----/g,
    severity: 'critical',
    recommendation: 'EC private keys should never be in source code',
  },

  // Generic Patterns (less specific, checked last)
  {
    name: 'Generic API Key Assignment',
    pattern: /(?:api[_-]?key|apikey)\s*[=:]\s*['"][a-zA-Z0-9_-]{20,}['"]/gi,
    severity: 'medium',
    recommendation: 'Use environment variables for API keys',
  },
  {
    name: 'Generic Secret Assignment',
    pattern: /(?:secret|private[_-]?key)\s*[=:]\s*['"][a-zA-Z0-9_-]{20,}['"]/gi,
    severity: 'medium',
    recommendation: 'Use environment variables for secrets',
  },
  {
    name: 'Password in Code',
    pattern: /(?:password|passwd|pwd)\s*[=:]\s*['"][^'"]{8,}['"]/gi,
    severity: 'high',
    recommendation: 'Passwords should never be hardcoded - use secure credential management',
  },
  {
    name: 'Bearer Token',
    pattern: /bearer\s+[a-zA-Z0-9._-]{20,}/gi,
    severity: 'high',
    recommendation: 'Bearer tokens should not be hardcoded in source files',
  },
  {
    name: 'Basic Auth Credentials',
    pattern: /basic\s+[a-zA-Z0-9+/=]{20,}/gi,
    severity: 'high',
    recommendation: 'Basic auth credentials should use environment variables',
  },
];

/**
 * Redact a secret, showing only first and last 4 characters
 */
function redact(secret: string): string {
  if (secret.length <= 8) return '***REDACTED***';
  return secret.slice(0, 4) + '...' + secret.slice(-4);
}

/**
 * Check if a value is likely a placeholder or example
 */
function isPlaceholder(value: string): boolean {
  const placeholderPatterns = [
    'your_api_key',
    'your-api-key',
    'xxx',
    'placeholder',
    'example',
    'test',
    'dummy',
    'fake',
    'sample',
    'changeme',
    'replace_me',
    'todo',
    'insert',
    '<your',
    '>',
    '{',
    '}',
    'process.env',
    'env.',
    'ENV[',
    'os.environ',
  ];

  const lowerValue = value.toLowerCase();
  return placeholderPatterns.some(p => lowerValue.includes(p));
}

/**
 * Check if we should skip this file
 */
function shouldSkipFile(path: string): boolean {
  const skipPatterns = [
    'node_modules',
    '.git/',
    'dist/',
    'build/',
    '.next/',
    'vendor/',
    '.min.js',
    '.bundle.js',
    '.map',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.lock',
    '.ico',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
  ];

  return skipPatterns.some(p => path.toLowerCase().includes(p));
}

/**
 * Check if a match is inside a comment
 */
function isInComment(line: string, column: number): boolean {
  // Check for single-line comment before the match
  const beforeMatch = line.slice(0, column);

  // JS/TS single-line comment
  if (beforeMatch.includes('//')) {
    const commentStart = beforeMatch.lastIndexOf('//');
    // Make sure it's not inside a string
    const quotes = (beforeMatch.slice(0, commentStart).match(/['"]/g) || []).length;
    if (quotes % 2 === 0) return true;
  }

  // Hash comment (Python, Shell, YAML)
  if (beforeMatch.includes('#') && !beforeMatch.includes('#{')) {
    const commentStart = beforeMatch.lastIndexOf('#');
    const quotes = (beforeMatch.slice(0, commentStart).match(/['"]/g) || []).length;
    if (quotes % 2 === 0) return true;
  }

  return false;
}

/**
 * Scan files for secrets
 */
export function scanForSecrets(files: UploadedFile[]): SecretsAuditResult {
  const findings: SecretFinding[] = [];

  for (const file of files) {
    // Skip non-analyzable files
    if (shouldSkipFile(file.path)) continue;

    const lines = file.content.split('\n');

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];

      // Skip empty lines and very long lines (likely minified)
      if (!line.trim() || line.length > 1000) continue;

      for (const secretPattern of SECRET_PATTERNS) {
        // Reset regex state for global patterns
        secretPattern.pattern.lastIndex = 0;

        let match;
        while ((match = secretPattern.pattern.exec(line)) !== null) {
          const column = match.index;

          // Skip if in comment
          if (isInComment(line, column)) continue;

          // Skip placeholder values
          if (isPlaceholder(match[0])) continue;

          // Skip if it's referencing an env variable
          if (line.slice(Math.max(0, column - 15), column).includes('process.env')) continue;

          findings.push({
            type: secretPattern.name,
            file: file.path,
            line: lineNum + 1,
            column: column + 1,
            match: redact(match[0]),
            severity: secretPattern.severity,
            recommendation: secretPattern.recommendation,
          });
        }
      }
    }
  }

  // Deduplicate findings by file + line + type
  const uniqueFindings = findings.filter(
    (finding, index, self) =>
      index ===
      self.findIndex(
        f => f.file === finding.file && f.line === finding.line && f.type === finding.type
      )
  );

  // Count by severity
  const summary = {
    critical: uniqueFindings.filter(f => f.severity === 'critical').length,
    high: uniqueFindings.filter(f => f.severity === 'high').length,
    medium: uniqueFindings.filter(f => f.severity === 'medium').length,
  };

  // Calculate score
  let penalty = 0;
  penalty += summary.critical * 30;
  penalty += summary.high * 20;
  penalty += summary.medium * 10;
  const score = Math.max(0, 100 - penalty);

  console.log(
    `Secrets audit complete: ${uniqueFindings.length} findings (${summary.critical} critical, ${summary.high} high)`
  );

  return {
    score,
    totalFilesScanned: files.filter(f => !shouldSkipFile(f.path)).length,
    findings: uniqueFindings,
    summary,
  };
}
