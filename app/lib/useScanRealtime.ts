'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import { dbScanToScan, type Scan, type DbScan } from '@/types/scan';

interface ScanProgress {
  phase: string;
  percentage: number;
  completedAudits: string[];
}

const AUDIT_PHASES = [
  { key: 'results_security', name: 'Security', phase: 'Analyzing security headers...', weight: 15 },
  { key: 'results_seo', name: 'SEO', phase: 'Checking SEO configuration...', weight: 15 },
  { key: 'results_accessibility', name: 'Accessibility', phase: 'Testing accessibility...', weight: 15 },
  { key: 'results_code_quality', name: 'Code Quality', phase: 'Auditing code quality...', weight: 10 },
  { key: 'results_tech_stack', name: 'Tech Stack', phase: 'Detecting technologies...', weight: 5 },
  { key: 'results_performance', name: 'Performance', phase: 'Running Lighthouse audit...', weight: 25 },
  { key: 'roast_title', name: 'AI Roast', phase: 'Generating roast...', weight: 15 },
];

function calculateProgress(scan: DbScan): ScanProgress {
  if (scan.status === 'pending') {
    return {
      phase: 'Waiting in queue...',
      percentage: 5,
      completedAudits: [],
    };
  }

  if (scan.status === 'completed' || scan.status === 'failed') {
    return {
      phase: scan.status === 'completed' ? 'Complete!' : 'Failed',
      percentage: 100,
      completedAudits: AUDIT_PHASES.map(p => p.name),
    };
  }

  // Processing - calculate real progress
  const completedAudits: string[] = [];
  let totalWeight = 0;

  for (const audit of AUDIT_PHASES) {
    if ((scan as any)[audit.key]) {
      completedAudits.push(audit.name);
      totalWeight += audit.weight;
    }
  }

  // Find current phase (first incomplete audit)
  let currentPhase = 'Processing...';
  for (const audit of AUDIT_PHASES) {
    if (!(scan as any)[audit.key]) {
      currentPhase = audit.phase;
      break;
    }
  }

  return {
    phase: currentPhase,
    percentage: Math.min(5 + totalWeight, 95),
    completedAudits,
  };
}

export function useScanRealtime(scanId: string) {
  const [scan, setScan] = useState<Scan | null>(null);
  const [progress, setProgress] = useState<ScanProgress>({
    phase: 'Connecting...',
    percentage: 0,
    completedAudits: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial scan data
  const fetchScan = useCallback(async () => {
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
        setIsLoading(false);
      }

      return dbScan;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scan');
      setIsLoading(false);
      return null;
    }
  }, [scanId]);

  useEffect(() => {
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
        (payload) => {
          const dbScan = payload.new as DbScan;
          setScan(dbScanToScan(dbScan));
          setProgress(calculateProgress(dbScan));

          if (dbScan.status === 'completed' || dbScan.status === 'failed') {
            setIsLoading(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scanId, fetchScan]);

  return { scan, progress, error, isLoading };
}
