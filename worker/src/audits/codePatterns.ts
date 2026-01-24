/**
 * Code Pattern Analysis Audit
 * Detects dangerous coding patterns, security vulnerabilities, and code quality issues
 */

export interface CodePatternsAuditResult {
  score: number;
  totalFilesScanned: number;
  issues: CodePatternIssue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface CodePatternIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line: number;
  code: string;
  description: string;
  fix: string;
}

interface PatternDefinition {
  name: string;
  pattern: RegExp;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  fix: string;
  fileTypes?: string[];
}

interface UploadedFile {
  path: string;
  content: string;
}

/**
 * Code patterns to detect
 */
const CODE_PATTERNS: PatternDefinition[] = [
  // SQL Injection
  {
    name: 'SQL Injection Risk',
    pattern: /(?:query|execute|exec)\s*\(\s*[`'"].*\$\{/gi,
    severity: 'critical',
    description: 'String interpolation in SQL query - vulnerable to SQL injection',
    fix: 'Use parameterized queries or prepared statements instead of string interpolation',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },
  {
    name: 'SQL Injection - String Concat',
    pattern: /(?:query|execute)\s*\(\s*['"][^'"]*['"]\s*\+\s*\w+/gi,
    severity: 'critical',
    description: 'String concatenation in SQL query - vulnerable to SQL injection',
    fix: 'Use parameterized queries: query("SELECT * FROM users WHERE id = $1", [userId])',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },

  // XSS Vulnerabilities
  {
    name: 'XSS via innerHTML',
    pattern: /\.innerHTML\s*=\s*(?!\s*['"`])/g,
    severity: 'high',
    description: 'Direct innerHTML assignment with variable - vulnerable to XSS',
    fix: 'Use textContent for plain text, or sanitize HTML with DOMPurify before inserting',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },
  {
    name: 'XSS via document.write',
    pattern: /document\.write\s*\(/g,
    severity: 'high',
    description: 'document.write() can introduce XSS vulnerabilities and blocks page parsing',
    fix: 'Use DOM methods like appendChild() or innerHTML with sanitized content',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx', '.html'],
  },
  {
    name: 'React dangerouslySetInnerHTML',
    pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html:\s*[^}'"]+\}/g,
    severity: 'high',
    description: 'Using dangerouslySetInnerHTML with potentially unsanitized input',
    fix: 'Sanitize HTML with DOMPurify: dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}',
    fileTypes: ['.jsx', '.tsx'],
  },

  // Code Execution
  {
    name: 'eval() Usage',
    pattern: /\beval\s*\(/g,
    severity: 'critical',
    description: 'eval() can execute arbitrary code - major security risk',
    fix: 'Avoid eval(). Use JSON.parse() for JSON, or Function constructor if absolutely necessary',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },
  {
    name: 'new Function() with Variable',
    pattern: /new\s+Function\s*\([^)]*\+/g,
    severity: 'high',
    description: 'new Function() with string concatenation can execute arbitrary code',
    fix: 'Avoid dynamic function creation. Refactor to use predefined functions',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },
  {
    name: 'setTimeout/setInterval with String',
    pattern: /set(?:Timeout|Interval)\s*\(\s*['"`][^'"`]+['"`]/g,
    severity: 'medium',
    description: 'setTimeout/setInterval with string argument acts like eval()',
    fix: 'Pass a function reference: setTimeout(() => doSomething(), 1000)',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },

  // Insecure Randomness
  {
    name: 'Insecure Randomness',
    pattern: /Math\.random\s*\(\s*\)(?=.*(?:token|key|secret|password|id|uuid|session|auth))/gi,
    severity: 'medium',
    description: 'Math.random() is not cryptographically secure for generating tokens/keys',
    fix: 'Use crypto.randomUUID() or crypto.getRandomValues() for security-sensitive random values',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },

  // Hardcoded Values
  {
    name: 'Hardcoded Localhost',
    pattern: /['"`]https?:\/\/(?:localhost|127\.0\.0\.1)[:'"`]/g,
    severity: 'low',
    description: 'Hardcoded localhost URL - will not work in production',
    fix: 'Use environment variables: process.env.API_URL',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },
  {
    name: 'Hardcoded IP Address',
    pattern: /['"`]\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}['"`]/g,
    severity: 'low',
    description: 'Hardcoded IP address - use environment variables for configuration',
    fix: 'Move IP addresses to environment variables or configuration files',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },

  // Console Statements
  {
    name: 'Console.log in Production',
    pattern: /console\.(?:log|debug|info)\s*\(/g,
    severity: 'low',
    description: 'Console statements should be removed in production builds',
    fix: 'Remove console statements or use a proper logging library with log levels',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },
  {
    name: 'Console.error/warn (Check If Intentional)',
    pattern: /console\.(?:error|warn)\s*\(/g,
    severity: 'low',
    description: 'Console error/warn statements - verify these are intentional',
    fix: 'Consider using a proper error tracking service like Sentry',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },

  // ESLint Disabled
  {
    name: 'ESLint Disabled',
    pattern: /eslint-disable(?!-next-line)/g,
    severity: 'medium',
    description: 'ESLint rules disabled for entire file - may hide issues',
    fix: 'Fix the underlying issues instead of disabling linting. Use eslint-disable-next-line for specific cases',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },
  {
    name: '@ts-ignore Used',
    pattern: /@ts-ignore/g,
    severity: 'medium',
    description: '@ts-ignore suppresses TypeScript errors - may hide type issues',
    fix: 'Fix the type error or use @ts-expect-error with a comment explaining why',
    fileTypes: ['.ts', '.tsx'],
  },

  // Deprecated APIs
  {
    name: 'Deprecated __proto__',
    pattern: /__proto__/g,
    severity: 'medium',
    description: '__proto__ is deprecated and can lead to prototype pollution',
    fix: 'Use Object.getPrototypeOf() and Object.setPrototypeOf() instead',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },
  {
    name: 'arguments.callee (Deprecated)',
    pattern: /arguments\.callee/g,
    severity: 'medium',
    description: 'arguments.callee is deprecated in strict mode',
    fix: 'Use named function expressions instead',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },

  // Security Headers in Code
  {
    name: 'CORS Allow All Origins',
    pattern: /(?:Access-Control-Allow-Origin|cors)['":\s]*['"]\*['"]/gi,
    severity: 'high',
    description: 'CORS allows all origins - potential security risk',
    fix: 'Restrict CORS to specific trusted origins',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },

  // Unsafe Regex
  {
    name: 'Potential ReDoS Pattern',
    pattern: /\([^)]*\+\)\+|\(\.\*\)\+|\([^)]*\*\)\*/g,
    severity: 'medium',
    description: 'Regex pattern may be vulnerable to ReDoS (Regular Expression Denial of Service)',
    fix: 'Review and simplify the regex pattern. Consider using atomic groups or possessive quantifiers',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },

  // TODO/FIXME Comments
  {
    name: 'TODO Comment',
    pattern: /\/\/\s*TODO[:\s]/gi,
    severity: 'low',
    description: 'Unresolved TODO comment - track in issue tracker instead',
    fix: 'Create a ticket for this task and reference it in the code',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },
  {
    name: 'FIXME Comment',
    pattern: /\/\/\s*FIXME[:\s]/gi,
    severity: 'medium',
    description: 'FIXME comment indicates known issue that needs fixing',
    fix: 'Address the issue or create a high-priority ticket',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },
  {
    name: 'HACK/XXX Comment',
    pattern: /\/\/\s*(?:HACK|XXX)[:\s]/gi,
    severity: 'medium',
    description: 'HACK/XXX comment indicates technical debt',
    fix: 'Refactor to remove the hack and implement properly',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },

  // Async Issues
  {
    name: 'Missing await',
    pattern: /(?<!await\s)(?:fetch|axios\.(?:get|post|put|delete|patch)|\.json)\s*\(/g,
    severity: 'medium',
    description: 'Async call may be missing await - could cause race conditions',
    fix: 'Ensure async calls are properly awaited',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },

  // Error Handling
  {
    name: 'Empty Catch Block',
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g,
    severity: 'medium',
    description: 'Empty catch block silently swallows errors',
    fix: 'Log the error or handle it appropriately: catch (error) { console.error(error); }',
    fileTypes: ['.js', '.ts', '.jsx', '.tsx'],
  },

  // React Specific
  {
    name: 'React Array Index as Key',
    pattern: /key\s*=\s*\{?\s*(?:index|i|idx)\s*\}?/g,
    severity: 'low',
    description: 'Using array index as React key can cause rendering issues',
    fix: 'Use a unique, stable identifier as key: key={item.id}',
    fileTypes: ['.jsx', '.tsx'],
  },
];

/**
 * Check if file type matches pattern
 */
function matchesFileType(filePath: string, fileTypes?: string[]): boolean {
  if (!fileTypes) return true;

  const lowerPath = filePath.toLowerCase();
  return fileTypes.some(ext => lowerPath.endsWith(ext));
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
  ];

  return skipPatterns.some(p => path.toLowerCase().includes(p));
}

/**
 * Truncate code snippet for display
 */
function truncateCode(line: string, column: number, maxLength: number = 80): string {
  const start = Math.max(0, column - 20);
  const end = Math.min(line.length, column + 60);
  let snippet = line.slice(start, end).trim();

  if (start > 0) snippet = '...' + snippet;
  if (end < line.length) snippet = snippet + '...';

  return snippet.slice(0, maxLength);
}

/**
 * Scan files for dangerous code patterns
 */
export function scanCodePatterns(files: UploadedFile[]): CodePatternsAuditResult {
  const issues: CodePatternIssue[] = [];

  for (const file of files) {
    // Skip non-analyzable files
    if (shouldSkipFile(file.path)) continue;

    const lines = file.content.split('\n');

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];

      // Skip empty lines and very long lines (likely minified)
      if (!line.trim() || line.length > 1000) continue;

      for (const pattern of CODE_PATTERNS) {
        // Check file type matches
        if (!matchesFileType(file.path, pattern.fileTypes)) continue;

        // Reset regex state for global patterns
        pattern.pattern.lastIndex = 0;

        let match;
        while ((match = pattern.pattern.exec(line)) !== null) {
          issues.push({
            type: pattern.name,
            severity: pattern.severity,
            file: file.path,
            line: lineNum + 1,
            code: truncateCode(line, match.index),
            description: pattern.description,
            fix: pattern.fix,
          });
        }
      }
    }
  }

  // Deduplicate by file + line + type
  const uniqueIssues = issues.filter(
    (issue, index, self) =>
      index ===
      self.findIndex(i => i.file === issue.file && i.line === issue.line && i.type === issue.type)
  );

  // Limit to prevent overwhelming output
  // Sort by severity first
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  uniqueIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Take top issues (limit total)
  const limitedIssues = uniqueIssues.slice(0, 50);

  // Count by severity
  const summary = {
    critical: uniqueIssues.filter(i => i.severity === 'critical').length,
    high: uniqueIssues.filter(i => i.severity === 'high').length,
    medium: uniqueIssues.filter(i => i.severity === 'medium').length,
    low: uniqueIssues.filter(i => i.severity === 'low').length,
  };

  // Calculate score
  let penalty = 0;
  penalty += summary.critical * 25;
  penalty += summary.high * 15;
  penalty += summary.medium * 5;
  penalty += summary.low * 1;
  const score = Math.max(0, 100 - Math.min(penalty, 100));

  console.log(
    `Code patterns audit complete: ${uniqueIssues.length} issues (${summary.critical} critical, ${summary.high} high)`
  );

  return {
    score,
    totalFilesScanned: files.filter(f => !shouldSkipFile(f.path)).length,
    issues: limitedIssues,
    summary,
  };
}
