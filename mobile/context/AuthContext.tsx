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
  setIsAdmin: (admin: boolean) => Promise<void>;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
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
  IS_ADMIN: '@margdarshak_is_admin',
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
        const [savedLang, savedOnboarded, savedProfile, savedDevSession, savedIsAdmin] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.LANG),
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
          AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.DEV_SESSION),
          AsyncStorage.getItem(STORAGE_KEYS.IS_ADMIN),
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

        if (savedIsAdmin === 'true') {
          setIsAdminState(true);
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
            const userRole = data.session.user.user_metadata?.role || data.session.user.role || '';
            const isUserAdmin = userRole === 'admin' || userEmail.toLowerCase().includes('admin');
            setUser({
              id: data.session.user.id,
              email: userEmail,
              fullName: data.session.user.user_metadata?.full_name ?? '',
              role: isUserAdmin ? 'admin' : 'authenticated',
            });
            if (isUserAdmin) {
              setIsAdminState(true);
              await AsyncStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
            }
          }
        } else if (savedDevSession) {
          try {
            const parsedUser = JSON.parse(savedDevSession);
            setUser(parsedUser);
            if (parsedUser.role === 'admin' || parsedUser.email?.toLowerCase().includes('admin')) {
              setIsAdminState(true);
            }
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
          const userRole = session.user.user_metadata?.role || session.user.role || '';
          const isUserAdmin = userRole === 'admin' || userEmail.toLowerCase().includes('admin');
          setUser({
            id: session.user.id,
            email: userEmail,
            fullName: session.user.user_metadata?.full_name ?? '',
            role: isUserAdmin ? 'admin' : 'authenticated',
          });
          if (isUserAdmin) {
            setIsAdminState(true);
            AsyncStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
          }
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

  const setIsAdmin = async (admin: boolean) => {
    setIsAdminState(admin);
    if (admin) {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.IS_ADMIN);
    }
  };

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
    const isUserAdmin = email.toLowerCase().includes('admin');
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: isUserAdmin ? 'admin' : 'authenticated',
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
          role: isUserAdmin ? 'admin' : 'authenticated',
        });
        if (isUserAdmin) {
          await setIsAdmin(true);
        }
      }
      return {};
    }

    // Development Mode Offline Sandbox Fallback
    const mockUser: AuthUser = {
      id: `dev-user-${Date.now()}`,
      email,
      fullName,
      role: isUserAdmin ? 'admin' : 'authenticated',
    };
    await AsyncStorage.setItem(STORAGE_KEYS.DEV_SESSION, JSON.stringify(mockUser));
    setUser(mockUser);
    if (isUserAdmin) {
      await setIsAdmin(true);
    }
    return {};
  };

  const signIn = async (email: string, password: string) => {
    const isUserAdmin = email.toLowerCase().includes('admin');
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const userRole = data.user.user_metadata?.role || (isUserAdmin ? 'admin' : 'authenticated');
        setUser({
          id: data.user.id,
          email: data.user.email ?? email,
          fullName: data.user.user_metadata?.full_name ?? '',
          role: userRole,
        });
        if (userRole === 'admin' || isUserAdmin) {
          await setIsAdmin(true);
        }
      }
      return {};
    }

    // Development Mode Offline Sandbox Fallback
    const devUser: AuthUser = {
      id: 'dev-demo-user-1',
      email,
      fullName: email.split('@')[0] || 'Rahul Sharma',
      role: isUserAdmin ? 'admin' : 'authenticated',
    };
    await AsyncStorage.setItem(STORAGE_KEYS.DEV_SESSION, JSON.stringify(devUser));
    setUser(devUser);
    if (isUserAdmin) {
      await setIsAdmin(true);
    }
    return {};
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.DEV_SESSION),
      AsyncStorage.removeItem(STORAGE_KEYS.IS_ADMIN),
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
    setIsOnboarded(false);
    setUser(null);
    setProfile(null);
    setIsAdminState(false);
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDED),
      AsyncStorage.removeItem(STORAGE_KEYS.PROFILE),
      AsyncStorage.removeItem(STORAGE_KEYS.DEV_SESSION),
      AsyncStorage.removeItem(STORAGE_KEYS.IS_ADMIN),
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
        setIsAdmin,
        setLanguage,
        signUp,
        signIn,
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
