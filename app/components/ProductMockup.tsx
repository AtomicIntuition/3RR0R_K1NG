'use client';

import { memo } from 'react';

// A visual representation of the audit dashboard
export const ProductMockup = memo(function ProductMockup() {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Browser Chrome */}
      <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
        {/* Browser Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-800">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-zinc-600" />
            <span className="w-3 h-3 rounded-full bg-zinc-500" />
            <span className="w-3 h-3 rounded-full bg-zinc-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-lg border border-gray-700 text-sm text-gray-400 max-w-md mx-auto">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>3rrork1ng.com/scan/abc123</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 bg-gray-800">
          <div className="grid grid-cols-12 gap-4">
            {/* Score Section */}
            <div className="col-span-12 md:col-span-4">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                {/* Score Ring */}
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#374151" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" stroke="#10B981" strokeWidth="8"
                      strokeLinecap="round" strokeDasharray="198" strokeDashoffset="26"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-50">87</span>
                    <span className="text-xs text-gray-400">/100</span>
                  </div>
                </div>
                <div className="text-4xl font-bold text-success mb-1">B+</div>
                <div className="text-sm text-gray-400">Overall Score</div>
              </div>
            </div>

            {/* Categories */}
            <div className="col-span-12 md:col-span-8">
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <h3 className="font-semibold text-gray-50 mb-4 text-sm">Category Scores</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Security', score: 92, color: '#34C759' },
                    { name: 'Performance', score: 78, color: '#FF9500' },
                    { name: 'SEO', score: 95, color: '#34C759' },
                    { name: 'Accessibility', score: 84, color: '#34C759' },
                    { name: 'Code Quality', score: 88, color: '#34C759' },
                  ].map((cat) => (
                    <div key={cat.name} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-24">{cat.name}</span>
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${cat.score}%`, backgroundColor: cat.color }}
                        />
                      </div>
                      <span className="text-xs font-semibold w-8" style={{ color: cat.color }}>
                        {cat.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fixes Preview */}
            <div className="col-span-12">
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <h3 className="font-semibold text-gray-50 mb-3 text-sm">Priority Fixes</h3>
                <div className="space-y-2">
                  {[
                    { priority: 'critical', title: 'Missing Content-Security-Policy header', color: '#FF3B30' },
                    { priority: 'high', title: 'Largest Contentful Paint exceeds threshold', color: '#FF9500' },
                    { priority: 'medium', title: 'Images missing alt attributes', color: '#10B981' },
                  ].map((fix, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800">
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold uppercase rounded"
                        style={{ backgroundColor: `${fix.color}15`, color: fix.color }}
                      >
                        {fix.priority}
                      </span>
                      <span className="text-xs text-gray-400 truncate">{fix.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -z-10 top-8 -left-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -z-10 bottom-8 -right-8 w-64 h-64 bg-success/10 rounded-full blur-3xl" />
    </div>
  );
});
