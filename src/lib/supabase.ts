import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Get the current origin, defaulting to localhost:5173 for development
const getOrigin = () => {
  if (typeof window === 'undefined') return 'http://localhost:5173';
  return window.location.origin;
};

// Create a single Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'portfolio-auth',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Auth-Return-Url': `${getOrigin()}/auth/callback`
    }
  }
});

// Types for our database
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          is_premium: boolean;
          payment_id?: string;
          payment_completed_at?: string;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          is_premium?: boolean;
          payment_id?: string;
          payment_completed_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          is_premium?: boolean;
          payment_id?: string;
          payment_completed_at?: string;
        };
      };
    };
  };
};
