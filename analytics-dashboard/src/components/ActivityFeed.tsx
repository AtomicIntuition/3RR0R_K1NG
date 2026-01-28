'use client';

import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'scan' | 'signup' | 'payment' | 'upgrade';
  title: string;
  description?: string;
  timestamp: Date | string | number;
  meta?: Record<string, unknown>;
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
}

const typeIcons: Record<Activity['type'], string> = {
  scan: '🔍',
  signup: '👤',
  payment: '💳',
  upgrade: '⬆️',
};

const typeColors: Record<Activity['type'], string> = {
  scan: 'bg-terminal/20 text-terminal',
  signup: 'bg-neon-cyan/20 text-neon-cyan',
  payment: 'bg-neon-purple/20 text-neon-purple',
  upgrade: 'bg-neon-yellow/20 text-neon-yellow',
};

export function ActivityFeed({ activities, title = 'Recent Activity' }: ActivityFeedProps) {
  return (
    <div className="bg-void-50 border border-void-200 rounded-xl">
      <div className="px-6 py-4 border-b border-void-200">
        <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
      </div>

      <div className="divide-y divide-void-200 max-h-[500px] overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="px-6 py-4 flex items-start gap-4 hover:bg-void-100 transition-colors">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeColors[activity.type]}`}>
              <span>{typeIcons[activity.type]}</span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200">{activity.title}</p>
              {activity.description && (
                <p className="text-xs text-gray-500 mt-1 truncate">{activity.description}</p>
              )}
            </div>

            <p className="text-xs text-gray-600 whitespace-nowrap">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
}
