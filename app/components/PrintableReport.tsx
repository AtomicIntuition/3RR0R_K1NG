import { getGrade } from '@/lib/scoring';
import type { Scan } from '@/types/scan';

function scoreColor(score: number): string {
  if (score >= 90) return '#10B981';
  if (score >= 70) return '#F59E0B';
  if (score >= 50) return '#F97316';
  return '#EF4444';
}

function statusLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Critical';
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#DC2626',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#6B7280',
};

const IMPACT_COLORS: Record<string, string> = {
  critical: '#DC2626',
  serious: '#F97316',
  moderate: '#F59E0B',
  minor: '#6B7280',
};

const CATEGORY_LABELS: Record<string, string> = {
  security: 'Security',
  performance: 'Performance',
  accessibility: 'Accessibility',
  seo: 'SEO',
  codeQuality: 'Code Quality',
  'code quality': 'Code Quality',
  'user experience': 'Accessibility',
};

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + '...';
}

/**
 * Generate a complete print-optimized HTML document from scan data.
 * Opens in a new window and triggers window.print() for PDF export.
 */
export function openPrintableReport(scan: Scan) {
  const score = scan.scoreOverall || 0;
  const grade = scan.letterGrade || getGrade(score);
  const status = statusLabel(score);
  const domain = scan.url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const scanDate = scan.completedAt
    ? new Date(scan.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const fixes = (scan.analysisFixes || []).slice(0, 15);
  const securityFindings = scan.resultsSecurity?.findings || [];
  const failedSecurity = securityFindings.filter(f => !f.passed).slice(0, 15);
  const passedSecurity = securityFindings.filter(f => f.passed).slice(0, 15);
  const perfMetrics = scan.resultsPerformance?.metrics || [];
  const seoFindings = (scan.resultsSeo?.findings || []).slice(0, 10);
  const a11yViolations = (scan.resultsAccessibility?.violations || []).slice(0, 10);
  const codeIssues = (scan.resultsCodeQuality?.issues || []).slice(0, 5);
  const techStack = scan.resultsTechStack || [];

  // Parse executive summary
  let execSummary: { keyStrength?: string; biggestRisk?: string; topPriority?: string } = {};
  try {
    const parsed = JSON.parse(scan.analysisBody || '');
    if (parsed.keyStrength) execSummary = parsed;
  } catch { /* not JSON */ }

  // Tech stack groups
  const techGroups: Record<string, typeof techStack> = {};
  for (const tech of techStack) {
    const cat = tech.category || 'other';
    if (!techGroups[cat]) techGroups[cat] = [];
    techGroups[cat].push(tech);
  }

  // Score ring SVG
  const ringSize = 120;
  const ringRadius = 48;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (score / 100) * ringCircumference;

  const ringSvg = `
    <svg width="${ringSize}" height="${ringSize}" viewBox="0 0 ${ringSize} ${ringSize}">
      <circle cx="${ringSize / 2}" cy="${ringSize / 2}" r="${ringRadius}" fill="none" stroke="#E5E7EB" stroke-width="10" />
      <circle cx="${ringSize / 2}" cy="${ringSize / 2}" r="${ringRadius}" fill="none" stroke="${scoreColor(score)}" stroke-width="10"
        stroke-linecap="round" stroke-dasharray="${ringCircumference}" stroke-dashoffset="${ringOffset}"
        transform="rotate(-90 ${ringSize / 2} ${ringSize / 2})" />
      <text x="${ringSize / 2}" y="${ringSize / 2 - 4}" text-anchor="middle" dominant-baseline="middle"
        style="font-size:36px;font-weight:700;fill:#111827">${score}</text>
      <text x="${ringSize / 2}" y="${ringSize / 2 + 18}" text-anchor="middle" dominant-baseline="middle"
        style="font-size:11px;fill:#6B7280">/ 100</text>
    </svg>`;

  // Category scores
  const categories = scan.scoringBreakdown?.breakdown || [];
  const categoryCardsHtml = categories.map(cat => {
    const c = scoreColor(cat.score);
    const label = CATEGORY_LABELS[cat.category.toLowerCase()] || cat.category;
    return `
      <div style="flex:1;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:14px 10px;text-align:center">
        <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">${esc(label)}</div>
        <div style="font-size:24px;font-weight:700;color:${c};margin-bottom:6px">${cat.score}</div>
        <div style="height:3px;background:#E5E7EB;border-radius:2px;overflow:hidden;margin-bottom:4px">
          <div style="height:100%;width:${cat.score}%;background:${c};border-radius:2px"></div>
        </div>
        <div style="font-size:9px;color:#6B7280">Weight: ${Math.round(cat.weight * 100)}%</div>
      </div>`;
  }).join('');

  // Executive summary
  const execHtml = (execSummary.keyStrength || execSummary.biggestRisk || execSummary.topPriority)
    ? `<div style="margin-bottom:28px">
        ${sectionTitle('Executive Summary')}
        <div style="display:flex;gap:10px">
          ${execSummary.keyStrength ? summaryCard('Key Strength', execSummary.keyStrength, '#10B981') : ''}
          ${execSummary.biggestRisk ? summaryCard('Biggest Risk', execSummary.biggestRisk, '#EF4444') : ''}
          ${execSummary.topPriority ? summaryCard('Top Priority', execSummary.topPriority, '#F59E0B') : ''}
        </div>
      </div>`
    : '';

  // Priority fixes
  const fixesHtml = fixes.length > 0
    ? `<div style="page-break-before:always;margin-bottom:28px">
        ${sectionTitle('Priority Fixes')}
        ${fixes.map((fix, i) => `
          <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 14px;border-bottom:${i < fixes.length - 1 ? '1px solid #E5E7EB' : 'none'};background:${i % 2 === 0 ? '#FFFFFF' : '#F9FAFB'}">
            <div style="width:22px;height:22px;border-radius:50%;background:${PRIORITY_COLORS[fix.priority] || '#6B7280'}18;color:${PRIORITY_COLORS[fix.priority] || '#6B7280'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:2px">${i + 1}</div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;flex-wrap:wrap">
                <span style="font-size:13px;font-weight:600;color:#111827">${esc(fix.title)}</span>
                <span style="display:inline-block;padding:1px 7px;border-radius:3px;font-size:9px;font-weight:600;text-transform:uppercase;background:${PRIORITY_COLORS[fix.priority] || '#6B7280'}18;color:${PRIORITY_COLORS[fix.priority] || '#6B7280'}">${esc(fix.priority)}</span>
                <span style="font-size:9px;color:#6B7280;text-transform:uppercase">${esc(fix.effort)} effort</span>
              </div>
              <div style="font-size:11px;color:#374151;line-height:1.5">${esc(truncate(fix.description, 200))}</div>
            </div>
          </div>
        `).join('')}
        ${(scan.analysisFixes || []).length > 15 ? `<div style="padding:6px 14px;font-size:11px;color:#6B7280;font-style:italic">... and ${(scan.analysisFixes || []).length - 15} more fixes</div>` : ''}
      </div>`
    : '';

  // Security
  const securityHtml = (failedSecurity.length > 0 || passedSecurity.length > 0)
    ? `<div style="page-break-before:always;margin-bottom:28px">
        ${sectionTitle('Security Findings')}
        ${failedSecurity.map(f => `
          <div style="padding:10px 14px;border-left:3px solid ${PRIORITY_COLORS[f.severity] || '#6B7280'};background:#F9FAFB;margin-bottom:6px;border-radius:0 6px 6px 0">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
              <span style="font-size:13px;color:#DC2626">&#x2717;</span>
              <span style="font-size:12px;font-weight:600;color:#111827">${esc(f.title)}</span>
              <span style="padding:1px 6px;border-radius:3px;font-size:9px;font-weight:600;text-transform:uppercase;background:${PRIORITY_COLORS[f.severity] || '#6B7280'}18;color:${PRIORITY_COLORS[f.severity] || '#6B7280'}">${esc(f.severity)}</span>
            </div>
            <div style="font-size:11px;color:#374151">${esc(truncate(f.description, 200))}</div>
            ${f.recommendation ? `<div style="font-size:10px;color:#10B981;font-weight:500;margin-top:3px">Fix: ${esc(truncate(f.recommendation, 150))}</div>` : ''}
          </div>
        `).join('')}
        ${passedSecurity.length > 0 ? `
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:12px">
            ${passedSecurity.map(f => `<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 8px;background:#F0FDF4;border-radius:4px;font-size:10px;color:#166534">&#x2713; ${esc(f.title)}</span>`).join('')}
          </div>
        ` : ''}
      </div>`
    : '';

  // Performance
  const perfHtml = perfMetrics.length > 0
    ? `<div style="margin-bottom:28px">
        ${sectionTitle('Performance Metrics')}
        <table style="width:100%;border-collapse:collapse;font-size:12px;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden">
          <thead>
            <tr style="background:#F9FAFB">
              <th style="padding:8px 14px;text-align:left;font-weight:600;color:#6B7280;font-size:10px;text-transform:uppercase">Metric</th>
              <th style="padding:8px 14px;text-align:center;font-weight:600;color:#6B7280;font-size:10px;text-transform:uppercase">Value</th>
              <th style="padding:8px 14px;text-align:center;font-weight:600;color:#6B7280;font-size:10px;text-transform:uppercase">Score</th>
            </tr>
          </thead>
          <tbody>
            ${perfMetrics.map((m, i) => `
              <tr style="border-top:1px solid #E5E7EB">
                <td style="padding:8px 14px;color:#111827;font-weight:500">${esc(m.name)}</td>
                <td style="padding:8px 14px;text-align:center;color:#374151">${esc(m.displayValue)}</td>
                <td style="padding:8px 14px;text-align:center">
                  <span style="display:inline-block;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600;background:${scoreColor(m.score)}18;color:${scoreColor(m.score)}">${m.score}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`
    : '';

  // A11y
  const a11yHtml = a11yViolations.length > 0
    ? `<div style="page-break-before:always;margin-bottom:28px">
        ${sectionTitle('Accessibility Issues')}
        ${a11yViolations.map(v => `
          <div style="padding:8px 14px;border-left:3px solid ${IMPACT_COLORS[v.impact] || '#6B7280'};background:#F9FAFB;margin-bottom:6px;border-radius:0 6px 6px 0">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
              <span style="font-size:12px;font-weight:600;color:#111827">${esc(v.help)}</span>
              <span style="padding:1px 6px;border-radius:3px;font-size:9px;font-weight:600;text-transform:uppercase;background:${IMPACT_COLORS[v.impact] || '#6B7280'}18;color:${IMPACT_COLORS[v.impact] || '#6B7280'}">${esc(v.impact)}</span>
              <span style="font-size:10px;color:#6B7280">${v.nodes} node${v.nodes !== 1 ? 's' : ''}</span>
            </div>
            <div style="font-size:11px;color:#374151">${esc(truncate(v.description, 200))}</div>
          </div>
        `).join('')}
      </div>`
    : '';

  // SEO
  const seoHtml = seoFindings.length > 0
    ? `<div style="margin-bottom:28px">
        ${sectionTitle('SEO Findings')}
        ${seoFindings.map((f, i) => `
          <div style="display:flex;align-items:flex-start;gap:6px;padding:6px 0;border-bottom:${i < seoFindings.length - 1 ? '1px solid #E5E7EB' : 'none'}">
            <span style="font-size:13px;color:${f.passed ? '#16A34A' : '#DC2626'};flex-shrink:0">${f.passed ? '&#x2713;' : '&#x2717;'}</span>
            <span style="font-size:12px;font-weight:500;color:#111827">${esc(f.title)}</span>
          </div>
        `).join('')}
      </div>`
    : '';

  // Code quality
  const codeHtml = codeIssues.length > 0
    ? `<div style="margin-bottom:28px">
        ${sectionTitle('Code Quality')}
        ${codeIssues.map(issue => `
          <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid #E5E7EB">
            <span style="padding:2px 6px;border-radius:3px;font-size:9px;font-weight:600;text-transform:uppercase;background:#6B728018;color:#6B7280;flex-shrink:0">${esc(issue.type.replace('_', ' '))}</span>
            <span style="flex:1;font-size:12px;color:#111827">${esc(truncate(issue.message, 200))}</span>
            ${issue.count > 1 ? `<span style="font-size:10px;color:#6B7280">x${issue.count}</span>` : ''}
          </div>
        `).join('')}
      </div>`
    : '';

  // Tech stack
  const techHtml = Object.keys(techGroups).length > 0
    ? `<div style="margin-bottom:28px">
        ${sectionTitle('Tech Stack')}
        ${Object.entries(techGroups).map(([cat, items]) => `
          <div style="margin-bottom:10px">
            <div style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">${esc(cat)}</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px">
              ${items.map(t => `<span style="display:inline-flex;align-items:center;gap:3px;padding:3px 10px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:4px;font-size:11px;color:#374151">${esc(t.name)}${t.version ? `<span style="font-size:9px;color:#6B7280">${esc(t.version)}</span>` : ''}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Crisp Audit Report - ${esc(domain)}</title>
  <style>
    @page { margin: 1.5cm; size: A4; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111827; line-height: 1.5; background: #fff; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-break { page-break-before: always; }
      .no-break { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div style="max-width:700px;margin:0 auto;padding:32px 0">

    <!-- Header -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #10B981">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:32px;height:32px;border-radius:8px;background:#10B981;display:flex;align-items:center;justify-content:center">
          <span style="color:#fff;font-size:14px;font-weight:700">C</span>
        </div>
        <div>
          <div style="font-size:18px;font-weight:700;color:#111827">Crisp</div>
          <div style="font-size:10px;color:#6B7280;letter-spacing:1px;text-transform:uppercase">Website Audit Report</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:12px;color:#374151">${esc(scanDate)}</div>
        <div style="font-size:10px;color:#6B7280;margin-top:2px">ID: ${esc(scan.id.slice(0, 8))}</div>
      </div>
    </div>

    <!-- Site info -->
    <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:12px 16px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase">URL</span>
        <span style="font-size:13px;font-weight:500;color:#111827">${esc(domain)}</span>
      </div>
    </div>

    <!-- Score hero -->
    <div class="no-break" style="display:flex;align-items:center;justify-content:center;gap:36px;margin-bottom:24px;padding:24px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px">
      ${ringSvg}
      <div style="text-align:center">
        <div style="font-size:52px;font-weight:800;color:${scoreColor(score)};line-height:1">${esc(grade)}</div>
        <div style="margin-top:8px;display:inline-block;padding:4px 16px;background:${scoreColor(score)}18;border-radius:16px;font-size:12px;font-weight:600;color:${scoreColor(score)}">${esc(status)}</div>
      </div>
    </div>

    <!-- Category cards -->
    ${categories.length > 0 ? `<div style="display:flex;gap:8px;margin-bottom:24px">${categoryCardsHtml}</div>` : ''}

    ${execHtml}
    ${fixesHtml}
    ${securityHtml}
    ${perfHtml}
    ${seoHtml}
    ${a11yHtml}
    ${codeHtml}
    ${techHtml}

    <!-- Footer -->
    <div style="border-top:1px solid #E5E7EB;padding-top:16px;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:6px">
        <div style="width:16px;height:16px;border-radius:4px;background:#10B981;display:flex;align-items:center;justify-content:center">
          <span style="color:#fff;font-size:8px;font-weight:700">C</span>
        </div>
        <span style="font-size:10px;color:#6B7280">Generated by Crisp &middot; ${esc(scanDate)}</span>
      </div>
      <div style="text-align:right">
        <div style="font-size:9px;color:#6B7280">Auto-generated report. Verify findings independently.</div>
      </div>
    </div>
  </div>

  <script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

function sectionTitle(title: string): string {
  return `<div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;gap:6px">
    <div style="width:3px;height:14px;background:#10B981;border-radius:2px"></div>
    ${esc(title)}
  </div>`;
}

function summaryCard(label: string, content: string, color: string): string {
  return `<div style="flex:1;border-left:3px solid ${color};background:#F9FAFB;border-radius:0 6px 6px 0;padding:12px 14px">
    <div style="font-size:9px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">${esc(label)}</div>
    <div style="font-size:11px;color:#374151;line-height:1.5">${esc(truncate(content, 200))}</div>
  </div>`;
}
