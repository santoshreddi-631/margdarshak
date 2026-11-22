import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let adminClientInstance: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(env.SUPABASE_URL) &&
    Boolean(env.SUPABASE_ANON_KEY) &&
    !env.SUPABASE_URL.includes('your-project') &&
    !env.SUPABASE_ANON_KEY.includes('your-anon-key')
  );
};

export const getAdminClient = (): SupabaseClient => {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase credentials are not configured. Please supply valid SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
    );
  }

  if (!adminClientInstance) {
    const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
    adminClientInstance = createClient(env.SUPABASE_URL, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClientInstance;
};

export const getUserClient = (accessToken?: string): SupabaseClient => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials are not configured in backend .env.');
  }

  // If token is absent or not a genuine 3-segment JWT:
  const isValidJwt = Boolean(accessToken && accessToken.split('.').length === 3);
  if (!isValidJwt) {
    // Only in non-production local development do we permit dev mock tokens to access DB
    if (env.NODE_ENV !== 'production') {
      return getAdminClient();
    }
    // In production, strictly return an unprivileged anonymous client with no elevated privileges
    return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });
};
