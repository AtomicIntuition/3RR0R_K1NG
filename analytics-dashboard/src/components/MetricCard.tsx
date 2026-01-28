'use client';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: string;
  color?: 'green' | 'cyan' | 'purple' | 'yellow' | 'red';
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  color = 'green',
}: MetricCardProps) {
  const colorClasses = {
    green: 'text-terminal',
    cyan: 'text-neon-cyan',
    purple: 'text-neon-purple',
    yellow: 'text-neon-yellow',
    red: 'text-danger',
  };

  const glowClasses = {
    green: 'glow-green',
    cyan: 'glow-cyan',
    purple: 'glow-purple',
    yellow: '',
    red: '',
  };

  return (
    <div className="bg-void-50 border border-void-200 rounded-xl p-6 card-hover">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-gray-500 uppercase tracking-wider">{title}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>

      <p className={`text-4xl font-bold ${colorClasses[color]} ${glowClasses[color]}`}>
        {value}
      </p>

      {change !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              change >= 0 ? 'text-terminal' : 'text-danger'
            }`}
          >
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          <span className="text-xs text-gray-600">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
