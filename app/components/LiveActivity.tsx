'use client';

import { useState, useEffect } from 'react';

interface ActivityItem {
  id: string;
  domain: string;
  score: number;
  timeAgo: string;
}

// Realistic domains for demo activity
const DEMO_DOMAINS = [
  'stripe.com', 'notion.com', 'linear.app', 'vercel.com', 'github.com',
  'figma.com', 'slack.com', 'discord.com', 'spotify.com', 'netflix.com',
  'airbnb.com', 'uber.com', 'shopify.com', 'twitch.tv', 'reddit.com',
  'medium.com', 'producthunt.com', 'dribbble.com', 'behance.net', 'webflow.io',
  'framer.com', 'supabase.com', 'railway.app', 'render.com', 'fly.io',
];

function generateDemoActivity(): ActivityItem[] {
  const items: ActivityItem[] = [];
  const times = ['just now', '1 min ago', '2 min ago', '3 min ago', '5 min ago'];

  for (let i = 0; i < 5; i++) {
    const domain = DEMO_DOMAINS[Math.floor(Math.random() * DEMO_DOMAINS.length)];
    items.push({
      id: `demo-${i}-${Date.now()}`,
      domain,
      score: Math.floor(Math.random() * 40) + 50, // 50-90 range
      timeAgo: times[i],
    });
  }

  return items;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-terminal';
  if (score >= 60) return 'text-neon-yellow';
  return 'text-danger';
}

interface LiveActivityProps {
  className?: string;
  compact?: boolean;
}

export function LiveActivity({ className = '', compact = false }: LiveActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Initialize with demo data
    setActivities(generateDemoActivity());

    // Rotate through activities every 4 seconds
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % 5);
        setIsVisible(true);
      }, 300);
    }, 4000);

    // Refresh demo data every 30 seconds
    const refreshInterval = setInterval(() => {
      setActivities(generateDemoActivity());
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(refreshInterval);
    };
  }, []);

  const current = activities[currentIndex];

  if (compact) {
    return (
      <div className={`flex items-center justify-center gap-2 text-sm min-h-[24px] ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal"></span>
        </span>
        {current && (
          <span
            className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <span className="text-gray-500">
              <span className="text-gray-300 font-medium">{current.domain}</span>
              {' '}scored{' '}
              <span className={`font-bold ${getScoreColor(current.score)}`}>{current.score}</span>
              {' '}{current.timeAgo}
            </span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-void-50/50 border border-void-100 rounded-lg p-3 min-h-[52px] ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal"></span>
          </span>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Live</span>
        </div>

        {current && (
          <div
            className={`flex-1 transition-all duration-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <span className="text-sm text-gray-400">
              <span className="text-gray-200 font-medium">{current.domain}</span>
              {' '}just got roasted —{' '}
              <span className={`font-bold ${getScoreColor(current.score)}`}>
                {current.score}/100
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
