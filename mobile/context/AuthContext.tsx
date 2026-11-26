import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import i18n from '@/i18n';
import { syncLanguagePreference } from '@/services/api';

export type SupportedLanguage = 'en' | 'te' | 'hi';

export interface UserProfile {
  name: string;
  ageRange: string;
  state: string;
  district: string;
  educationLevel: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  language: SupportedLanguage;
  isOnboarded: boolean;
  isDevMode: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: UserProfile) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const STORAGE_KEYS = {
  LANG: '@margdarshak_language',
  ONBOARDED: '@margdarshak_onboarded',
  PROFILE: '@margdarshak_user_profile',
  DEV_SESSION: '@margdarshak_dev_session',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [language, setLangState] = useState<SupportedLanguage>('en');
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isAdmin, setIsAdminState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load persisted state on mount
  useEffect(() => {
    async function loadStorageData() {
      try {
        const [savedLang, savedOnboarded, savedProfile, savedDevSession] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.LANG),
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
          AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.DEV_SESSION),
        ]);

        if (savedLang && (savedLang === 'en' || savedLang === 'te' || savedLang === 'hi')) {
          setLangState(savedLang as SupportedLanguage);
          await i18n.changeLanguage(savedLang);
        } else {
          await i18n.changeLanguage('en');
        }

        if (savedOnboarded === 'true') {
          setIsOnboarded(true);
        }

        if (savedProfile) {
          try {
            setProfile(JSON.parse(savedProfile));
          } catch {
            // ignore parse error
          }
        }

        // Initialize user from real Supabase or Dev Session
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const userEmail = data.session.user.email ?? '';
            const isUserAdmin = data.session.user.app_metadata?.role === 'admin';
            setUser({
              id: data.session.user.id,
              email: userEmail,
              fullName: data.session.user.user_metadata?.full_name ?? '',
              role: isUserAdmin ? 'admin' : 'authenticated',
            });
            setIsAdminState(isUserAdmin);
          }
        } else if (savedDevSession) {
          try {
            const parsedUser = JSON.parse(savedDevSession) as AuthUser;
            setUser({ ...parsedUser, role: 'authenticated' });
            setIsAdminState(false);
          } catch {
            // ignore parse error
          }
        }
      } catch (err) {
        console.error('Failed to load initial authentication state', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStorageData();

    // Listen to Supabase Auth state changes if available
    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const userEmail = session.user.email ?? '';
          const isUserAdmin = session.user.app_metadata?.role === 'admin';
          setUser({
            id: session.user.id,
            email: userEmail,
            fullName: session.user.user_metadata?.full_name ?? '',
            role: isUserAdmin ? 'admin' : 'authenticated',
          });
          setIsAdminState(isUserAdmin);
        } else {
          setUser(null);
          setIsAdminState(false);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const setLanguage = async (newLang: SupportedLanguage) => {
    setLangState(newLang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANG, newLang);
    await i18n.changeLanguage(newLang);
    try {
      await syncLanguagePreference(newLang);
    } catch {
      // offline-safe
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? email,
          fullName,
          role: 'authenticated',
        });
        setIsAdminState(false);
      }
      return {};
    }

    // Development Mode Offline Sandbox Fallback
    const mockUser: AuthUser = {
      id: `dev-user-${Date.now()}`,
      email,
      fullName,
      role: 'authenticated',
    };
    await AsyncStorage.setItem(STORAGE_KEYS.DEV_SESSION, JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAdminState(false);
    return {};
  };

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const isUserAdmin = data.user.app_metadata?.role === 'admin';
        setUser({
          id: data.user.id,
          email: data.user.email ?? email,
          fullName: data.user.user_metadata?.full_name ?? '',
          role: isUserAdmin ? 'admin' : 'authenticated',
        });
        setIsAdminState(isUserAdmin);
      }
      return {};
    }

    // Development Mode Offline Sandbox Fallback
    const devUser: AuthUser = {
      id: 'dev-demo-user-1',
      email,
      fullName: email.split('@')[0] || 'Rahul Sharma',
      role: 'authenticated',
    };
    await AsyncStorage.setItem(STORAGE_KEYS.DEV_SESSION, JSON.stringify(devUser));
    setUser(devUser);
    setIsAdminState(false);
    return {};
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Password reset is unavailable in offline development mode.' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return error ? { error: error.message } : {};
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.DEV_SESSION),
    ]);
    setUser(null);
    setIsAdminState(false);
  };

  const updateProfile = async (data: UserProfile) => {
    setProfile(data);
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data));
  };

  const completeOnboarding = async () => {
    setIsOnboarded(true);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
  };

  const resetOnboarding = async () => {
    await signOut();
    setIsOnboarded(false);
    setProfile(null);
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDED),
      AsyncStorage.removeItem(STORAGE_KEYS.PROFILE),
      AsyncStorage.removeItem(STORAGE_KEYS.DEV_SESSION),
    ]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        language,
        isOnboarded,
        isDevMode: !isSupabaseConfigured,
        isAdmin,
        isLoading,
        setLanguage,
        signUp,
        signIn,
        resetPassword,
        signOut,
        updateProfile,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
