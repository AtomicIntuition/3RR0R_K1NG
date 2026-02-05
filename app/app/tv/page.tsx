'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { TVPairingScreen } from './components/TVPairingScreen';
import { TVDashboard } from './components/TVDashboard';
import { TVFocusView } from './components/TVFocusView';
import type { Scan } from '@/types/scan';

type TVState = 'init' | 'pairing' | 'dashboard' | 'focus';

const STORAGE_KEY = 'crisp_tv_session';
const POLL_PAIRING_MS = 2_000;
const REFRESH_SCANS_MS = 60_000;

export default function TVPage() {
  const [state, setState] = useState<TVState>('init');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [scans, setScans] = useState<Scan[]>([]);
  const [focusedScan, setFocusedScan] = useState<Scan | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate a new pairing code
  const generateCode = useCallback(async () => {
    try {
      const res = await fetch('/api/tv/pair', { method: 'POST' });
      const data = await res.json();
      if (data.code) {
        setSessionId(data.sessionId);
        setCode(data.code);
        setExpiresAt(data.expiresAt);
        setState('pairing');
      }
    } catch (err) {
      console.error('Failed to generate pairing code:', err);
      // Retry after 3s
      setTimeout(generateCode, 3000);
    }
  }, []);

  // Poll session status
  const pollSession = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/tv/session?sessionId=${sid}`);
      const data = await res.json();

      if (data.status === 'active') {
        localStorage.setItem(STORAGE_KEY, sid);
        setScans(data.scans ?? []);
        setState('dashboard');
        return true;
      }

      if (data.status === 'expired') {
        localStorage.removeItem(STORAGE_KEY);
        generateCode();
        return true;
      }

      return false; // still pending
    } catch {
      return false;
    }
  }, [generateCode]);

  // Refresh scans for active session
  const refreshScans = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/tv/session?sessionId=${sessionId}`);
      const data = await res.json();
      if (data.status === 'active' && data.scans) {
        setScans(data.scans);
      } else if (data.status === 'expired' || data.error) {
        localStorage.removeItem(STORAGE_KEY);
        setState('init');
      }
    } catch {
      // Ignore transient errors
    }
  }, [sessionId]);

  // Initialize: check localStorage for existing session
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY);
    if (savedSession) {
      setSessionId(savedSession);
      pollSession(savedSession).then((activated) => {
        if (!activated) {
          // Session was pending or invalid, start fresh
          localStorage.removeItem(STORAGE_KEY);
          generateCode();
        }
      });
    } else {
      generateCode();
    }
  }, [generateCode, pollSession]);

  // Poll during pairing state
  useEffect(() => {
    if (state !== 'pairing' || !sessionId) return;

    pollRef.current = setInterval(async () => {
      const activated = await pollSession(sessionId);
      if (activated && pollRef.current) {
        clearInterval(pollRef.current);
      }
    }, POLL_PAIRING_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [state, sessionId, pollSession]);

  // Refresh scans periodically in dashboard state
  useEffect(() => {
    if (state !== 'dashboard') return;

    refreshRef.current = setInterval(refreshScans, REFRESH_SCANS_MS);
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, [state, refreshScans]);

  // Auto-focus if only 1 scan
  useEffect(() => {
    if (state === 'dashboard' && scans.length === 1) {
      setFocusedScan(scans[0]);
      setState('focus');
    }
  }, [state, scans]);

  // Handle code expiry — regenerate
  const handleExpired = useCallback(() => {
    generateCode();
  }, [generateCode]);

  // Focus a scan
  const handleSelectScan = useCallback((scan: Scan) => {
    setFocusedScan(scan);
    setState('focus');
  }, []);

  // Back from focus to dashboard
  const handleBackToDashboard = useCallback(() => {
    setFocusedScan(null);
    setState('dashboard');
  }, []);

  // Hide cursor after inactivity
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const show = () => {
      document.body.style.cursor = 'default';
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        document.body.style.cursor = 'none';
      }, 3000);
    };
    show();
    window.addEventListener('mousemove', show);
    return () => {
      window.removeEventListener('mousemove', show);
      document.body.style.cursor = 'default';
      clearTimeout(timeout);
    };
  }, []);

  if (state === 'init') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (state === 'pairing') {
    return (
      <TVPairingScreen
        code={code}
        expiresAt={expiresAt}
        onExpired={handleExpired}
      />
    );
  }

  if (state === 'focus' && focusedScan) {
    return (
      <TVFocusView
        scan={focusedScan}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <TVDashboard
      scans={scans}
      onSelectScan={handleSelectScan}
    />
  );
}
