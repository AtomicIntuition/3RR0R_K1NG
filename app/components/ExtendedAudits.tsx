'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { Scan } from '@/types/scan';
import {
  Globe,
  Smartphone,
  FileText,
  Link,
  Image,
  Database,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';

interface ExtendedAuditsProps {
  scan: Scan;
}

function ScoreBadge({ score, label }: { score: number; label?: string }) {
  const color = score >= 90 ? 'text-success bg-success/10'
    : score >= 70 ? 'text-warning bg-warning/10'
    : score >= 50 ? 'text-orange-500 bg-orange-500/10'
    : 'text-danger bg-danger/10';

  return (
    <span className={clsx('px-2.5 py-1 rounded-lg text-sm font-semibold', color)}>
      {score}/100 {label && <span className="font-normal text-xs opacity-75">{label}</span>}
    </span>
  );
}

function Section({
  title,
  icon: Icon,
  score,
  children,
  defaultOpen = false
}: {
  title: string;
  icon: typeof Globe;
  score?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Icon size={18} className="text-gray-600" />
          </div>
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {score !== undefined && <ScoreBadge score={score} />}
          <ChevronDown
            size={18}
            className={clsx('text-gray-400 transition-transform', isOpen && 'rotate-180')}
          />
        </div>
      </button>
      {isOpen && (
        <div className="px-4 py-4 border-t border-gray-100 text-sm">
          {children}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
      ok ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
    )}>
      {ok ? <Check size={12} /> : <X size={12} />}
      {label}
    </span>
  );
}

export function ExtendedAudits({ scan }: ExtendedAuditsProps) {
  const hasExtendedData = scan.resultsProtocol || scan.resultsPwa ||
    scan.resultsStructuredData || scan.resultsLinks || scan.resultsImages ||
    scan.resultsCaching || scan.resultsRedirects || scan.resultsVulnerabilities;

  if (!hasExtendedData) return null;

  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Extended Analysis
      </h2>

      <div className="space-y-3">
        {/* Protocol Analysis */}
        {scan.resultsProtocol && (
          <Section title="Protocol Analysis" icon={Globe} score={scan.resultsProtocol.http2Supported ? (scan.resultsProtocol.http3Supported ? 100 : 85) : 50}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <StatusBadge ok={true} label={scan.resultsProtocol.httpVersion} />
                <StatusBadge ok={scan.resultsProtocol.http2Supported} label="HTTP/2" />
                <StatusBadge ok={scan.resultsProtocol.http3Supported} label="HTTP/3 (QUIC)" />
                {scan.resultsProtocol.alpn && (
                  <span className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 text-gray-600">
                    ALPN: {scan.resultsProtocol.alpn}
                  </span>
                )}
              </div>
              {scan.resultsProtocol.recommendations.length > 0 && (
                <div className="mt-2 text-gray-600">
                  <p className="font-medium text-gray-700 mb-1">Recommendations:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {scan.resultsProtocol.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* PWA Analysis */}
        {scan.resultsPwa && (
          <Section title="PWA Analysis" icon={Smartphone} score={scan.resultsPwa.score}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <StatusBadge ok={scan.resultsPwa.installable} label="Installable" />
                <StatusBadge ok={scan.resultsPwa.checks.https} label="HTTPS" />
                <StatusBadge ok={scan.resultsPwa.checks.manifest.exists && scan.resultsPwa.checks.manifest.valid} label="Manifest" />
                <StatusBadge ok={scan.resultsPwa.checks.serviceWorker.registered} label="Service Worker" />
                <StatusBadge ok={scan.resultsPwa.checks.icons.has192} label="192px Icon" />
                <StatusBadge ok={scan.resultsPwa.checks.icons.has512} label="512px Icon" />
                <StatusBadge ok={scan.resultsPwa.checks.themeColor} label="Theme Color" />
                <StatusBadge ok={scan.resultsPwa.checks.viewport} label="Viewport" />
              </div>
              {scan.resultsPwa.issues.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-gray-700 mb-2">Issues:</p>
                  <div className="space-y-2">
                    {scan.resultsPwa.issues.map((issue, i) => (
                      <div key={i} className={clsx(
                        'p-3 rounded-lg border-l-2',
                        issue.severity === 'high' ? 'border-danger bg-danger/5' :
                        issue.severity === 'medium' ? 'border-warning bg-warning/5' :
                        'border-gray-300 bg-gray-50'
                      )}>
                        <p className="text-gray-800">{issue.description}</p>
                        <p className="text-gray-500 text-xs mt-1">{issue.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Structured Data */}
        {scan.resultsStructuredData && (
          <Section title="Structured Data (Schema.org)" icon={FileText} score={scan.resultsStructuredData.score}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4 text-gray-600">
                <span>JSON-LD Blocks: <strong className="text-gray-900">{scan.resultsStructuredData.jsonLdCount}</strong></span>
                <span>Microdata Items: <strong className="text-gray-900">{scan.resultsStructuredData.microdataCount}</strong></span>
              </div>
              {scan.resultsStructuredData.types.length > 0 && (
                <div>
                  <p className="text-gray-600 mb-1">Schema Types Found:</p>
                  <div className="flex flex-wrap gap-2">
                    {scan.resultsStructuredData.types.map((type, i) => (
                      <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {scan.resultsStructuredData.errors.length > 0 && (
                <div>
                  <p className="font-medium text-gray-700 mb-2">
                    Errors ({scan.resultsStructuredData.errors.filter(e => e.severity === 'error').length}) /
                    Warnings ({scan.resultsStructuredData.errors.filter(e => e.severity === 'warning').length}):
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {scan.resultsStructuredData.errors.slice(0, 10).map((error, i) => (
                      <div key={i} className={clsx(
                        'text-xs p-2 rounded-lg',
                        error.severity === 'error' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                      )}>
                        <strong>{error.type}</strong>: {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {scan.resultsStructuredData.recommendations.length > 0 && (
                <div className="text-gray-600">
                  <p className="font-medium text-gray-700 mb-1">Recommendations:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {scan.resultsStructuredData.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Link Audit */}
        {scan.resultsLinks && (
          <Section title="Link Audit" icon={Link} score={scan.resultsLinks.score}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xl font-bold text-gray-900">{scan.resultsLinks.totalLinks}</div>
                  <div className="text-xs text-gray-500">Total Links</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xl font-bold text-gray-900">{scan.resultsLinks.internalLinks}</div>
                  <div className="text-xs text-gray-500">Internal</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xl font-bold text-gray-900">{scan.resultsLinks.externalLinks}</div>
                  <div className="text-xs text-gray-500">External</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xl font-bold text-gray-900">{scan.resultsLinks.checkedLinks}</div>
                  <div className="text-xs text-gray-500">Checked</div>
                </div>
              </div>

              {scan.resultsLinks.brokenLinks.length > 0 && (
                <div>
                  <p className="font-medium text-danger mb-2">Broken Links ({scan.resultsLinks.brokenLinks.length}):</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {scan.resultsLinks.brokenLinks.map((link, i) => (
                      <div key={i} className="text-xs bg-danger/10 text-danger p-2 rounded-lg truncate">
                        <span className="font-mono font-medium">{link.statusCode || 'ERR'}</span> - {link.url}
                        {link.error && <span className="text-danger/70"> ({link.error})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scan.resultsLinks.insecureLinks.length > 0 && (
                <div>
                  <p className="font-medium text-warning mb-2">Insecure HTTP Links ({scan.resultsLinks.insecureLinks.length}):</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {scan.resultsLinks.insecureLinks.map((link, i) => (
                      <div key={i} className="text-xs bg-warning/10 text-warning p-2 rounded-lg truncate">
                        {link.url}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Image Optimization */}
        {scan.resultsImages && scan.resultsImages.issues.length > 0 && (
          <Section title="Image Optimization" icon={Image} score={scan.resultsImages.score}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4 text-gray-600">
                <span>Total Images: <strong className="text-gray-900">{scan.resultsImages.totalImages}</strong></span>
                <span>Total Size: <strong className="text-gray-900">{(scan.resultsImages.totalSize / 1024).toFixed(1)}KB</strong></span>
                <span>Potential Savings: <strong className="text-success">{(scan.resultsImages.optimizationPotential / 1024).toFixed(1)}KB</strong></span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {scan.resultsImages.issues.map((issue, i) => (
                  <div key={i} className={clsx(
                    'p-3 rounded-lg border-l-2',
                    issue.severity === 'high' ? 'border-danger bg-danger/5' :
                    issue.severity === 'medium' ? 'border-warning bg-warning/5' :
                    'border-gray-300 bg-gray-50'
                  )}>
                    <p className="text-gray-700 text-xs font-mono truncate">{issue.src.split('/').pop()}</p>
                    <p className="text-gray-500 text-xs">{issue.issues.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* Cache Analysis */}
        {scan.resultsCaching && scan.resultsCaching.issues.length > 0 && (
          <Section title="Cache Headers" icon={Database} score={scan.resultsCaching.score}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4 text-gray-600">
                <span>Cached: <strong className="text-gray-900">{scan.resultsCaching.summary.cached}/{scan.resultsCaching.summary.totalResources}</strong></span>
                <span>Long Cache: <strong className="text-gray-900">{scan.resultsCaching.summary.longCache}</strong></span>
                <span>Immutable: <strong className="text-gray-900">{scan.resultsCaching.summary.immutable}</strong></span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {scan.resultsCaching.issues.slice(0, 5).map((issue, i) => (
                  <div key={i} className={clsx(
                    'p-3 rounded-lg border-l-2 text-xs',
                    issue.severity === 'high' ? 'border-danger bg-danger/5' :
                    issue.severity === 'medium' ? 'border-warning bg-warning/5' :
                    'border-gray-300 bg-gray-50'
                  )}>
                    <p className="text-gray-700">{issue.description}</p>
                    <p className="text-gray-500 mt-1">{issue.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* Redirect Chain */}
        {scan.resultsRedirects && scan.resultsRedirects.totalRedirects > 0 && (
          <Section title="Redirect Chain" icon={ArrowRight} score={Math.max(0, 100 - scan.resultsRedirects.totalRedirects * 10)}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4 text-gray-600">
                <span>Redirects: <strong className="text-warning">{scan.resultsRedirects.totalRedirects}</strong></span>
                <span>Total Time: <strong className="text-gray-900">{scan.resultsRedirects.totalTime}ms</strong></span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs space-y-2">
                {scan.resultsRedirects.redirectChain.map((hop, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={clsx(
                      'px-2 py-0.5 rounded-md font-medium',
                      hop.statusCode >= 300 && hop.statusCode < 400 ? 'bg-warning/20 text-warning' :
                      hop.statusCode >= 200 && hop.statusCode < 300 ? 'bg-success/20 text-success' :
                      'bg-danger/20 text-danger'
                    )}>
                      {hop.statusCode}
                    </span>
                    <span className="text-gray-600 truncate flex-1">{hop.url}</span>
                    <span className="text-gray-400">{hop.duration}ms</span>
                  </div>
                ))}
              </div>
              {scan.resultsRedirects.finalUrl !== scan.url && (
                <p className="text-xs text-gray-500">
                  Tip: Update links to use final URL: <code className="text-primary font-mono">{scan.resultsRedirects.finalUrl}</code>
                </p>
              )}
            </div>
          </Section>
        )}

        {/* Vulnerable Libraries */}
        {scan.resultsVulnerabilities && scan.resultsVulnerabilities.vulnerableLibraries.length > 0 && (
          <Section title="Vulnerable Libraries" icon={AlertTriangle} score={scan.resultsVulnerabilities.score} defaultOpen={true}>
            <div className="space-y-3">
              {scan.resultsVulnerabilities.vulnerableLibraries.map((lib, i) => (
                <div key={i} className="bg-danger/5 border border-danger/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-danger">{lib.name}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-md text-gray-600">v{lib.detectedVersion}</span>
                  </div>
                  <div className="space-y-2">
                    {lib.vulnerabilities.map((vuln, j) => (
                      <div key={j} className="text-xs">
                        <span className={clsx(
                          'px-2 py-0.5 rounded-md mr-2 font-medium',
                          vuln.severity === 'critical' ? 'bg-danger text-white' :
                          vuln.severity === 'high' ? 'bg-danger/20 text-danger' :
                          'bg-warning/20 text-warning'
                        )}>
                          {vuln.severity.toUpperCase()}
                        </span>
                        {vuln.cve && <span className="text-gray-500 mr-2">{vuln.cve}</span>}
                        <span className="text-gray-600">{vuln.description}</span>
                        <p className="mt-1 text-gray-500">Fix: Update to {vuln.fixedIn}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </section>
  );
}
