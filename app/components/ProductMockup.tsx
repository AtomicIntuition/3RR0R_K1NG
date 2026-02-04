'use client';

import { memo } from 'react';

// A visual representation of the audit dashboard
export const ProductMockup = memo(function ProductMockup() {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Browser Chrome */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Browser Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-sm text-gray-500 max-w-md mx-auto">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>3rrork1ng.com/scan/abc123</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-12 gap-4">
            {/* Score Section */}
            <div className="col-span-12 md:col-span-4">
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                {/* Score Ring */}
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f0f0f0" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" stroke="#0071E3" strokeWidth="8"
                      strokeLinecap="round" strokeDasharray="198" strokeDashoffset="26"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">87</span>
                    <span className="text-xs text-gray-500">/100</span>
                  </div>
                </div>
                <div className="text-4xl font-bold text-success mb-1">B+</div>
                <div className="text-sm text-gray-500">Overall Score</div>
              </div>
            </div>

            {/* Categories */}
            <div className="col-span-12 md:col-span-8">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4 text-sm">Category Scores</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Security', score: 92, color: '#34C759' },
                    { name: 'Performance', score: 78, color: '#FF9500' },
                    { name: 'SEO', score: 95, color: '#34C759' },
                    { name: 'Accessibility', score: 84, color: '#34C759' },
                    { name: 'Code Quality', score: 88, color: '#34C759' },
                  ].map((cat) => (
                    <div key={cat.name} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-24">{cat.name}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
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
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Priority Fixes</h3>
                <div className="space-y-2">
                  {[
                    { priority: 'critical', title: 'Missing Content-Security-Policy header', color: '#FF3B30' },
                    { priority: 'high', title: 'Largest Contentful Paint exceeds threshold', color: '#FF9500' },
                    { priority: 'medium', title: 'Images missing alt attributes', color: '#0071E3' },
                  ].map((fix, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold uppercase rounded"
                        style={{ backgroundColor: `${fix.color}15`, color: fix.color }}
                      >
                        {fix.priority}
                      </span>
                      <span className="text-xs text-gray-700 truncate">{fix.title}</span>
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
