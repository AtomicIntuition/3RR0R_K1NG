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
const CYCLE_INTERVAL = 15_000;
const PAUSE_DURATION = 30_000;

export default function TVPage() {
  const [state, setState] = useState<TVState>('init');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [scans, setScans] = useState<Scan[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseUntil = useRef(0);

  // --- Pairing flow ---

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
      setTimeout(generateCode, 3000);
    }
  }, []);

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

      return false;
    } catch {
      return false;
    }
  }, [generateCode]);

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

  // Initialize
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY);
    if (savedSession) {
      setSessionId(savedSession);
      pollSession(savedSession).then((activated) => {
        if (!activated) {
          localStorage.removeItem(STORAGE_KEY);
          generateCode();
        }
      });
    } else {
      generateCode();
    }
  }, [generateCode, pollSession]);

  // Poll during pairing
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

  // Refresh scans periodically when active (dashboard or focus)
  useEffect(() => {
    if (state !== 'dashboard' && state !== 'focus') return;
    refreshRef.current = setInterval(refreshScans, REFRESH_SCANS_MS);
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, [state, refreshScans]);

  // --- Auto-cycle (runs in both dashboard and focus) ---

  const scheduleNext = useCallback(() => {
    if (cycleRef.current) clearTimeout(cycleRef.current);
    if (scans.length <= 1) return;

    cycleRef.current = setTimeout(() => {
      if (Date.now() < pauseUntil.current) {
        scheduleNext();
        return;
      }
      setCurrentIndex((prev) => (prev + 1) % scans.length);
      scheduleNext();
    }, CYCLE_INTERVAL);
  }, [scans.length]);

  useEffect(() => {
    if (state === 'dashboard' || state === 'focus') {
      scheduleNext();
    }
    return () => {
      if (cycleRef.current) clearTimeout(cycleRef.current);
    };
  }, [state, scheduleNext]);

  // Arrow key nav (left/right to manually cycle, pauses auto-cycle)
  useEffect(() => {
    if (state !== 'dashboard' && state !== 'focus') return;
    if (scans.length <= 1) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        pauseUntil.current = Date.now() + PAUSE_DURATION;
        setCurrentIndex((prev) => (prev + 1) % scans.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        pauseUntil.current = Date.now() + PAUSE_DURATION;
        setCurrentIndex((prev) => (prev - 1 + scans.length) % scans.length);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state, scans.length]);

  // Auto-focus if only 1 scan
  useEffect(() => {
    if (state === 'dashboard' && scans.length === 1) {
      setState('focus');
    }
  }, [state, scans]);

  // --- Handlers ---

  const handleExpired = useCallback(() => {
    generateCode();
  }, [generateCode]);

  const handleSelectScan = useCallback(() => {
    setState('focus');
  }, []);

  const handleBackToDashboard = useCallback(() => {
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

  // --- Render ---

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

  if (state === 'focus') {
    return (
      <TVFocusView
        scans={scans}
        currentIndex={currentIndex}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <TVDashboard
      scans={scans}
      currentIndex={currentIndex}
      onSelectScan={handleSelectScan}
    />
  );
}
