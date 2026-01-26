'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  authEvent: AuthChangeEvent | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGithub: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authEvent, setAuthEvent] = useState<AuthChangeEvent | null>(null);

  // Fetch user profile from database with retry logic
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

      if (error) {
        // Wait a bit before retrying (profile might not exist yet after signup)
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    return null;
  }, []);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user) {
      setProfileLoading(true);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      setProfileLoading(false);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setProfileLoading(true);
        const profileData = await fetchProfile(session.user.id);
        if (!mounted) return;
        setProfile(profileData);
        setProfileLoading(false);
      }

      setLoading(false);
    }).catch(() => {
      // Ignore abort errors during cleanup
      if (mounted) setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setAuthEvent(event);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Only refetch and show loading on meaningful auth events
          // Skip TOKEN_REFRESHED to prevent badge flickering when tabbing back
          const shouldRefetch = event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY' || event === 'INITIAL_SESSION';

          if (shouldRefetch) {
            setProfileLoading(true);
            const profileData = await fetchProfile(session.user.id);
            if (!mounted) return;
            setProfile(profileData);
            setProfileLoading(false);
          }
          // For other events (TOKEN_REFRESHED), keep existing profile - don't touch it
        } else {
          // Only clear profile on explicit sign out, not on transient session states
          if (event === 'SIGNED_OUT') {
            setProfile(null);
          }
          // For other events where session is null, keep profile if we have one
          // This prevents flickering on tab visibility changes
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        profileLoading,
        authEvent,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithGithub,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
