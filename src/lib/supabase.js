import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create client with safe defaults to prevent initialization errors
// The client will fail gracefully when making actual requests if credentials are invalid
let supabase;
try {
  supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    }
  );
} catch (error) {
  console.warn('Supabase client initialization failed, using fallback:', error);
  // Create a minimal client that won't crash the app
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };

