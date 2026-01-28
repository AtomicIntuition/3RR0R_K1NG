'use client';

interface FunnelStep {
  name: string;
  value: number;
  conversionRate?: number;
}

interface FunnelChartProps {
  steps: FunnelStep[];
  title?: string;
}

export function FunnelChart({ steps, title }: FunnelChartProps) {
  const maxValue = Math.max(...steps.map((s) => s.value));

  return (
    <div className="bg-void-50 border border-void-200 rounded-xl p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-200 mb-6">{title}</h3>
      )}

      <div className="space-y-4">
        {steps.map((step, index) => {
          const width = (step.value / maxValue) * 100;
          const prevStep = index > 0 ? steps[index - 1] : null;
          const dropoff = prevStep
            ? ((prevStep.value - step.value) / prevStep.value) * 100
            : 0;

          return (
            <div key={step.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-void-100 flex items-center justify-center text-xs text-gray-400">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-300">{step.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-white">
                    {step.value.toLocaleString()}
                  </span>
                  {step.conversionRate !== undefined && (
                    <span className="text-xs text-terminal">
                      {step.conversionRate.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="h-8 bg-void-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-terminal/80 to-terminal/40 rounded-lg transition-all duration-500"
                    style={{ width: `${width}%` }}
                  />
                </div>

                {dropoff > 0 && (
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full">
                    <span className="text-xs text-danger">
                      -{dropoff.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
