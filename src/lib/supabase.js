import { createClient } from '@supabase/supabase-js';

// These will be set via environment variables
// For now, using placeholder values - user needs to set these
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a safe Supabase client that won't crash if credentials are missing
let supabase;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } else {
    // Create a dummy client that won't crash but will fail gracefully
    console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a minimal client to prevent crashes
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };

