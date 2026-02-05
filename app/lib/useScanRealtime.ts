'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { dbScanToScan, type Scan, type DbScan } from '@/types/scan';

interface ScanProgress {
  phase: string;
  percentage: number;
  completedAudits: string[];
  currentPhase: string;
}

// Map internal phase names to display names and weights
const PHASE_CONFIG: Record<string, { displayName: string; description: string; weight: number }> = {
  security: { displayName: 'Security', description: 'Analyzing security headers...', weight: 12 },
  seo: { displayName: 'SEO', description: 'Checking SEO configuration...', weight: 10 },
  accessibility: { displayName: 'Accessibility', description: 'Testing accessibility...', weight: 12 },
  code_quality: { displayName: 'Code Quality', description: 'Auditing code quality...', weight: 8 },
  tech_stack: { displayName: 'Tech Stack', description: 'Detecting technologies...', weight: 5 },
  resources: { displayName: 'Resources', description: 'Analyzing resource waterfall...', weight: 8 },
  extended_audits: { displayName: 'Deep Scan', description: 'Running extended audits...', weight: 15 },
  performance: { displayName: 'Performance', description: 'Running Lighthouse audit...', weight: 20 },
  analysis: { displayName: 'AI Analysis', description: 'Generating report...', weight: 10 },
};

// Ordered list of phases for display
const PHASE_ORDER = [
  'security',
  'seo',
  'accessibility',
  'code_quality',
  'tech_stack',
  'resources',
  'extended_audits',
  'performance',
  'analysis',
];

// Display names for the UI grid
const DISPLAY_AUDITS = [
  'Security',
  'SEO',
  'Accessibility',
  'Code Quality',
  'Tech Stack',
  'Resources',
  'Deep Scan',
  'Performance',
];

function calculateProgress(scan: DbScan): ScanProgress {
  if (scan.status === 'pending') {
    return {
      phase: 'Waiting in queue...',
      percentage: 5,
      completedAudits: [],
      currentPhase: 'pending',
    };
  }

  if (scan.status === 'completed' || scan.status === 'failed') {
    return {
      phase: scan.status === 'completed' ? 'Complete!' : 'Failed',
      percentage: 100,
      completedAudits: DISPLAY_AUDITS,
      currentPhase: 'complete',
    };
  }

  // Use the new completed_phases array from the backend
  const rawCompletedPhases: string[] = (scan as any).completed_phases || [];
  const currentPhase: string = (scan as any).current_phase || 'security';

  // Map internal phase names to display names
  const completedAudits = rawCompletedPhases
    .map(phase => PHASE_CONFIG[phase]?.displayName)
    .filter(Boolean) as string[];

  // Calculate progress based on completed phase weights
  let totalWeight = 0;
  for (const phase of rawCompletedPhases) {
    totalWeight += PHASE_CONFIG[phase]?.weight || 0;
  }

  // Get current phase description
  const phaseDescription = PHASE_CONFIG[currentPhase]?.description || 'Processing...';

  return {
    phase: phaseDescription,
    percentage: Math.min(5 + totalWeight, 95),
    completedAudits,
    currentPhase,
  };
}

export function useScanRealtime(scanId: string) {
  const [scan, setScan] = useState<Scan | null>(null);
  const [progress, setProgress] = useState<ScanProgress>({
    phase: 'Connecting...',
    percentage: 0,
    completedAudits: [],
    currentPhase: 'pending',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchingRef = useRef(false);
  const doneRef = useRef(false);

  // Fetch scan data with guard against concurrent fetches
  const fetchScan = useCallback(async () => {
    if (fetchingRef.current) return null;
    fetchingRef.current = true;

    try {
      const { data, error: fetchError } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Scan not found');

      const dbScan = data as DbScan;
      setScan(dbScanToScan(dbScan));
      setProgress(calculateProgress(dbScan));

      if (dbScan.status === 'completed' || dbScan.status === 'failed') {
        doneRef.current = true;
        setIsLoading(false);
      }

      return dbScan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scan');
      setIsLoading(false);
      return null;
    } finally {
      fetchingRef.current = false;
    }
  }, [scanId]);

  useEffect(() => {
    doneRef.current = false;

    // Initial fetch
    fetchScan();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`scan-${scanId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scans',
          filter: `id=eq.${scanId}`,
        },
        async (payload) => {
          const dbScan = payload.new as DbScan;
          setProgress(calculateProgress(dbScan));

          if (dbScan.status === 'completed' || dbScan.status === 'failed') {
            // Realtime payloads may omit large JSONB columns.
            // Do a full fetch to ensure we have all result data.
            await fetchScan();
          } else {
            setScan(dbScanToScan(dbScan));
          }
        }
      )
      .subscribe();

    // Fallback polling in case Realtime isn't enabled or drops
    const pollInterval = setInterval(async () => {
      if (doneRef.current) return;
      await fetchScan();
    }, 3000);

    // Immediate re-fetch when tab becomes visible again
    // (browsers throttle setInterval in background tabs)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !doneRef.current) {
        fetchScan();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [scanId, fetchScan]);

  return { scan, progress, error, isLoading };
}
