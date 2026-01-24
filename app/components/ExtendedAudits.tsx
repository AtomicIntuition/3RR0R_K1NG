'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { Scan } from '@/types/scan';

interface ExtendedAuditsProps {
  scan: Scan;
}

function ScoreBadge({ score, label }: { score: number; label?: string }) {
  const color = score >= 90 ? 'text-terminal bg-terminal/20'
    : score >= 70 ? 'text-neon-yellow bg-neon-yellow/20'
    : score >= 50 ? 'text-neon-orange bg-neon-orange/20'
    : 'text-danger bg-danger/20';

  return (
    <span className={clsx('px-2 py-1 rounded text-sm font-bold', color)}>
      {score}/100 {label && <span className="font-normal text-xs opacity-75">{label}</span>}
    </span>
  );
}

function Section({
  title,
  icon,
  score,
  children,
  defaultOpen = false
}: {
  title: string;
  icon: string;
  score?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-void-50 border border-void-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-void-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-medium text-gray-200">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {score !== undefined && <ScoreBadge score={score} />}
          <span className={clsx('text-gray-500 transition-transform', isOpen && 'rotate-180')}>
            ▼
          </span>
        </div>
      </button>
      {isOpen && (
        <div className="px-4 py-3 border-t border-void-100 text-sm">
          {children}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={clsx(
      'px-2 py-0.5 rounded text-xs font-medium',
      ok ? 'text-terminal bg-terminal/20' : 'text-danger bg-danger/20'
    )}>
      {ok ? '✓' : '✗'} {label}
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
      <h2 className="text-xl font-bold text-gray-100 mb-6">
        <span className="text-terminal">&gt;</span> Extended Analysis
      </h2>

      <div className="space-y-3">
        {/* Protocol Analysis */}
        {scan.resultsProtocol && (
          <Section title="Protocol Analysis" icon="🌐" score={scan.resultsProtocol.http2Supported ? (scan.resultsProtocol.http3Supported ? 100 : 85) : 50}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <StatusBadge ok={true} label={scan.resultsProtocol.httpVersion} />
                <StatusBadge ok={scan.resultsProtocol.http2Supported} label="HTTP/2" />
                <StatusBadge ok={scan.resultsProtocol.http3Supported} label="HTTP/3 (QUIC)" />
                {scan.resultsProtocol.alpn && (
                  <span className="px-2 py-0.5 rounded text-xs bg-void-100 text-gray-400">
                    ALPN: {scan.resultsProtocol.alpn}
                  </span>
                )}
              </div>
              {scan.resultsProtocol.recommendations.length > 0 && (
                <div className="mt-2 text-gray-400">
                  <p className="font-medium text-gray-300 mb-1">Recommendations:</p>
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
          <Section title="PWA Analysis" icon="📱" score={scan.resultsPwa.score}>
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
                  <p className="font-medium text-gray-300 mb-2">Issues:</p>
                  <div className="space-y-2">
                    {scan.resultsPwa.issues.map((issue, i) => (
                      <div key={i} className={clsx(
                        'p-2 rounded border-l-2',
                        issue.severity === 'high' ? 'border-danger bg-danger/10' :
                        issue.severity === 'medium' ? 'border-neon-orange bg-neon-orange/10' :
                        'border-neon-yellow bg-neon-yellow/10'
                      )}>
                        <p className="text-gray-200">{issue.description}</p>
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
          <Section title="Structured Data (Schema.org)" icon="🏷️" score={scan.resultsStructuredData.score}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4 text-gray-400">
                <span>JSON-LD Blocks: <strong className="text-gray-200">{scan.resultsStructuredData.jsonLdCount}</strong></span>
                <span>Microdata Items: <strong className="text-gray-200">{scan.resultsStructuredData.microdataCount}</strong></span>
              </div>
              {scan.resultsStructuredData.types.length > 0 && (
                <div>
                  <p className="text-gray-400 mb-1">Schema Types Found:</p>
                  <div className="flex flex-wrap gap-2">
                    {scan.resultsStructuredData.types.map((type, i) => (
                      <span key={i} className="px-2 py-1 bg-terminal/20 text-terminal rounded text-xs">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {scan.resultsStructuredData.errors.length > 0 && (
                <div>
                  <p className="font-medium text-gray-300 mb-2">
                    Errors ({scan.resultsStructuredData.errors.filter(e => e.severity === 'error').length}) /
                    Warnings ({scan.resultsStructuredData.errors.filter(e => e.severity === 'warning').length}):
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {scan.resultsStructuredData.errors.slice(0, 10).map((error, i) => (
                      <div key={i} className={clsx(
                        'text-xs p-1.5 rounded',
                        error.severity === 'error' ? 'bg-danger/10 text-danger' : 'bg-neon-yellow/10 text-neon-yellow'
                      )}>
                        <strong>{error.type}</strong>: {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {scan.resultsStructuredData.recommendations.length > 0 && (
                <div className="text-gray-400">
                  <p className="font-medium text-gray-300 mb-1">Recommendations:</p>
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
          <Section title="Link Audit" icon="🔗" score={scan.resultsLinks.score}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="bg-void-100 rounded p-2">
                  <div className="text-xl font-bold text-gray-200">{scan.resultsLinks.totalLinks}</div>
                  <div className="text-xs text-gray-500">Total Links</div>
                </div>
                <div className="bg-void-100 rounded p-2">
                  <div className="text-xl font-bold text-gray-200">{scan.resultsLinks.internalLinks}</div>
                  <div className="text-xs text-gray-500">Internal</div>
                </div>
                <div className="bg-void-100 rounded p-2">
                  <div className="text-xl font-bold text-gray-200">{scan.resultsLinks.externalLinks}</div>
                  <div className="text-xs text-gray-500">External</div>
                </div>
                <div className="bg-void-100 rounded p-2">
                  <div className="text-xl font-bold text-gray-200">{scan.resultsLinks.checkedLinks}</div>
                  <div className="text-xs text-gray-500">Checked</div>
                </div>
              </div>

              {scan.resultsLinks.brokenLinks.length > 0 && (
                <div>
                  <p className="font-medium text-danger mb-2">Broken Links ({scan.resultsLinks.brokenLinks.length}):</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {scan.resultsLinks.brokenLinks.map((link, i) => (
                      <div key={i} className="text-xs bg-danger/10 text-danger p-2 rounded truncate">
                        <span className="font-mono">{link.statusCode || 'ERR'}</span> - {link.url}
                        {link.error && <span className="text-danger/70"> ({link.error})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scan.resultsLinks.insecureLinks.length > 0 && (
                <div>
                  <p className="font-medium text-neon-orange mb-2">Insecure HTTP Links ({scan.resultsLinks.insecureLinks.length}):</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {scan.resultsLinks.insecureLinks.map((link, i) => (
                      <div key={i} className="text-xs bg-neon-orange/10 text-neon-orange p-2 rounded truncate">
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
          <Section title="Image Optimization" icon="🖼️" score={scan.resultsImages.score}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4 text-gray-400">
                <span>Total Images: <strong className="text-gray-200">{scan.resultsImages.totalImages}</strong></span>
                <span>Total Size: <strong className="text-gray-200">{(scan.resultsImages.totalSize / 1024).toFixed(1)}KB</strong></span>
                <span>Potential Savings: <strong className="text-terminal">{(scan.resultsImages.optimizationPotential / 1024).toFixed(1)}KB</strong></span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {scan.resultsImages.issues.map((issue, i) => (
                  <div key={i} className={clsx(
                    'p-2 rounded border-l-2',
                    issue.severity === 'high' ? 'border-danger bg-danger/10' :
                    issue.severity === 'medium' ? 'border-neon-orange bg-neon-orange/10' :
                    'border-neon-yellow bg-neon-yellow/10'
                  )}>
                    <p className="text-gray-300 text-xs font-mono truncate">{issue.src.split('/').pop()}</p>
                    <p className="text-gray-400 text-xs">{issue.issues.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* Cache Analysis */}
        {scan.resultsCaching && scan.resultsCaching.issues.length > 0 && (
          <Section title="Cache Headers" icon="💾" score={scan.resultsCaching.score}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4 text-gray-400">
                <span>Cached: <strong className="text-gray-200">{scan.resultsCaching.summary.cached}/{scan.resultsCaching.summary.totalResources}</strong></span>
                <span>Long Cache: <strong className="text-gray-200">{scan.resultsCaching.summary.longCache}</strong></span>
                <span>Immutable: <strong className="text-gray-200">{scan.resultsCaching.summary.immutable}</strong></span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {scan.resultsCaching.issues.slice(0, 5).map((issue, i) => (
                  <div key={i} className={clsx(
                    'p-2 rounded border-l-2 text-xs',
                    issue.severity === 'high' ? 'border-danger bg-danger/10' :
                    issue.severity === 'medium' ? 'border-neon-orange bg-neon-orange/10' :
                    'border-neon-yellow bg-neon-yellow/10'
                  )}>
                    <p className="text-gray-300">{issue.description}</p>
                    <p className="text-gray-500 mt-1">{issue.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* Redirect Chain */}
        {scan.resultsRedirects && scan.resultsRedirects.totalRedirects > 0 && (
          <Section title="Redirect Chain" icon="↪️" score={Math.max(0, 100 - scan.resultsRedirects.totalRedirects * 10)}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-4 text-gray-400">
                <span>Redirects: <strong className="text-neon-orange">{scan.resultsRedirects.totalRedirects}</strong></span>
                <span>Total Time: <strong className="text-gray-200">{scan.resultsRedirects.totalTime}ms</strong></span>
              </div>
              <div className="bg-void-100 rounded p-3 font-mono text-xs space-y-1">
                {scan.resultsRedirects.redirectChain.map((hop, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={clsx(
                      'px-1.5 py-0.5 rounded',
                      hop.statusCode >= 300 && hop.statusCode < 400 ? 'bg-neon-yellow/20 text-neon-yellow' :
                      hop.statusCode >= 200 && hop.statusCode < 300 ? 'bg-terminal/20 text-terminal' :
                      'bg-danger/20 text-danger'
                    )}>
                      {hop.statusCode}
                    </span>
                    <span className="text-gray-400 truncate flex-1">{hop.url}</span>
                    <span className="text-gray-600">{hop.duration}ms</span>
                  </div>
                ))}
              </div>
              {scan.resultsRedirects.finalUrl !== scan.url && (
                <p className="text-xs text-gray-500">
                  Tip: Update links to use final URL: <code className="text-terminal">{scan.resultsRedirects.finalUrl}</code>
                </p>
              )}
            </div>
          </Section>
        )}

        {/* Vulnerable Libraries */}
        {scan.resultsVulnerabilities && scan.resultsVulnerabilities.vulnerableLibraries.length > 0 && (
          <Section title="Vulnerable Libraries" icon="⚠️" score={scan.resultsVulnerabilities.score} defaultOpen={true}>
            <div className="space-y-3">
              {scan.resultsVulnerabilities.vulnerableLibraries.map((lib, i) => (
                <div key={i} className="bg-danger/10 border border-danger/30 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-danger">{lib.name}</span>
                    <span className="text-xs bg-void-100 px-2 py-0.5 rounded text-gray-400">v{lib.detectedVersion}</span>
                  </div>
                  <div className="space-y-2">
                    {lib.vulnerabilities.map((vuln, j) => (
                      <div key={j} className="text-xs">
                        <span className={clsx(
                          'px-1.5 py-0.5 rounded mr-2',
                          vuln.severity === 'critical' ? 'bg-danger text-white' :
                          vuln.severity === 'high' ? 'bg-danger/50 text-danger' :
                          'bg-neon-orange/50 text-neon-orange'
                        )}>
                          {vuln.severity.toUpperCase()}
                        </span>
                        {vuln.cve && <span className="text-gray-500 mr-2">{vuln.cve}</span>}
                        <span className="text-gray-400">{vuln.description}</span>
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
