'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface Profile {
  id: string;
  email: string | null;
  tier: 'anonymous' | 'free' | 'pro';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  scan_credits: number;
  scans_today: number;
  last_scan_date: string | null;
  scans_this_month: number;
  billing_cycle_start: string | null;
  scans_this_hour: number;
  created_at: string;
}

// --- Session context (changes rarely: sign in/out) ---
interface AuthSessionContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGithub: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

// --- Profile context (changes on profile fetch) ---
interface ProfileContextType {
  profile: Profile | null;
  profileLoading: boolean;
  authEvent: AuthChangeEvent | null;
  refreshProfile: () => Promise<void>;
}

// --- Combined type for backward-compat useAuth() ---
interface AuthContextType extends AuthSessionContextType, ProfileContextType {}

const AuthSessionContext = createContext<AuthSessionContextType | undefined>(undefined);
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Inner provider for profile — needs access to user from session context
function ProfileProvider({ children, user }: { children: ReactNode; user: User | null }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authEvent, setAuthEvent] = useState<AuthChangeEvent | null>(null);

  const fetchProfile = useCallback(async (userId: string, retries = 3): Promise<Profile | null> => {
    for (let i = 0; i < retries; i++) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        return data as Profile;
      }

      if (error && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      setProfileLoading(true);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      setProfileLoading(false);
    }
  }, [user, fetchProfile]);

  // Listen for auth events to trigger profile fetches
  useEffect(() => {
    let mounted = true;

    if (user) {
      // Initial profile fetch
      setProfileLoading(true);
      fetchProfile(user.id).then(profileData => {
        if (!mounted) return;
        setProfile(profileData);
        setProfileLoading(false);
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (!mounted) return;
        setAuthEvent(event);

        if (event === 'SIGNED_OUT') {
          setProfile(null);
          return;
        }

        // Only refetch on meaningful events
        const shouldRefetch = event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY' || event === 'INITIAL_SESSION';
        if (shouldRefetch && user) {
          setProfileLoading(true);
          const profileData = await fetchProfile(user.id);
          if (!mounted) return;
          setProfile(profileData);
          setProfileLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [user, fetchProfile]);

  const value = useMemo(
    () => ({ profile, profileLoading, authEvent, refreshProfile }),
    [profile, profileLoading, authEvent, refreshProfile]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Auth methods — stable references via useCallback with [] deps
  // supabase client is a module-level singleton so no dependency needed
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error as Error | null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error as Error | null };
  }, []);

  const signInWithGithub = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error as Error | null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const sessionValue = useMemo(
    () => ({ user, session, loading, signIn, signUp, signInWithGoogle, signInWithGithub, signOut }),
    [user, session, loading, signIn, signUp, signInWithGoogle, signInWithGithub, signOut]
  );

  return (
    <AuthSessionContext.Provider value={sessionValue}>
      <ProfileProvider user={user}>
        {children}
      </ProfileProvider>
    </AuthSessionContext.Provider>
  );
}

// --- Hooks ---

/** Session-only hook — won't re-render when profile changes */
export function useSession() {
  const context = useContext(AuthSessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within an AuthProvider');
  }
  return context;
}

/** Profile-only hook — won't re-render when session changes */
export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within an AuthProvider');
  }
  return context;
}

/** Combined hook — backward compatible, returns everything */
export function useAuth(): AuthContextType {
  const sessionCtx = useContext(AuthSessionContext);
  const profileCtx = useContext(ProfileContext);
  if (sessionCtx === undefined || profileCtx === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return { ...sessionCtx, ...profileCtx };
}
