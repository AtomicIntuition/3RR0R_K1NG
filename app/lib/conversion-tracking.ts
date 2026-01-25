'use client';

import { STORAGE_KEYS, RATE_LIMITS } from './constants';

// Get scan count for the current session (anonymous users)
export function getSessionScanCount(): number {
  if (typeof window === 'undefined') return 0;
  const count = localStorage.getItem(STORAGE_KEYS.SCAN_COUNT);
  return count ? parseInt(count, 10) : 0;
}

// Increment scan count
export function incrementScanCount(): number {
  if (typeof window === 'undefined') return 0;
  const current = getSessionScanCount();
  const newCount = current + 1;
  localStorage.setItem(STORAGE_KEYS.SCAN_COUNT, newCount.toString());
  return newCount;
}

// Check if email has been captured
export function isEmailCaptured(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.EMAIL_CAPTURED) === 'true';
}

// Mark email as captured
export function setEmailCaptured(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.EMAIL_CAPTURED, 'true');
}

// Check if account creation was prompted
export function wasAccountPrompted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.ACCOUNT_PROMPTED) === 'true';
}

// Mark account creation as prompted
export function setAccountPrompted(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ACCOUNT_PROMPTED, 'true');
}

// Check if exit intent modal was shown
export function wasExitIntentShown(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.EXIT_INTENT_SHOWN) === 'true';
}

// Mark exit intent as shown
export function setExitIntentShown(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.EXIT_INTENT_SHOWN, 'true');
}

// Get daily scan count for free users
export function getDailyScanCount(): number {
  if (typeof window === 'undefined') return 0;

  const lastScanDate = localStorage.getItem(STORAGE_KEYS.LAST_SCAN_DATE);
  const today = new Date().toDateString();

  // Reset if it's a new day
  if (lastScanDate !== today) {
    localStorage.setItem(STORAGE_KEYS.LAST_SCAN_DATE, today);
    localStorage.setItem(STORAGE_KEYS.DAILY_SCAN_COUNT, '0');
    return 0;
  }

  const count = localStorage.getItem(STORAGE_KEYS.DAILY_SCAN_COUNT);
  return count ? parseInt(count, 10) : 0;
}

// Increment daily scan count
export function incrementDailyScanCount(): number {
  if (typeof window === 'undefined') return 0;

  const lastScanDate = localStorage.getItem(STORAGE_KEYS.LAST_SCAN_DATE);
  const today = new Date().toDateString();

  // Reset if it's a new day
  if (lastScanDate !== today) {
    localStorage.setItem(STORAGE_KEYS.LAST_SCAN_DATE, today);
    localStorage.setItem(STORAGE_KEYS.DAILY_SCAN_COUNT, '1');
    return 1;
  }

  const current = getDailyScanCount();
  const newCount = current + 1;
  localStorage.setItem(STORAGE_KEYS.DAILY_SCAN_COUNT, newCount.toString());
  return newCount;
}

// Check if user can scan (based on daily limit)
export function canScanToday(): boolean {
  const dailyCount = getDailyScanCount();
  return dailyCount < RATE_LIMITS.FREE_DAILY_LIMIT;
}

// Get remaining scans for today
export function getRemainingScansToday(): number {
  const dailyCount = getDailyScanCount();
  return Math.max(0, RATE_LIMITS.FREE_DAILY_LIMIT - dailyCount);
}

// Determine what gate to show based on current state
export type GateType = 'none' | 'email' | 'account' | 'paywall';

export function determineGateType(
  isLoggedIn: boolean,
  userTier: string | null
): GateType {
  // Pro users never see gates
  if (userTier === 'pro') return 'none';

  const scanCount = getSessionScanCount();
  const emailCaptured = isEmailCaptured();

  // First scan is always free, no gates
  if (scanCount === 0) return 'none';

  // After first scan, require email if not captured
  if (scanCount >= 1 && !emailCaptured && !isLoggedIn) {
    return 'email';
  }

  // After second scan, require account if not logged in
  if (scanCount >= 2 && !isLoggedIn) {
    return 'account';
  }

  // Check daily limit for free users
  if (!canScanToday() && userTier !== 'pro') {
    return 'paywall';
  }

  return 'none';
}

// Clear all conversion tracking (for testing)
export function clearConversionTracking(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
