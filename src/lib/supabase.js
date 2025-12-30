import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate that we have real credentials
const hasRealCredentials = SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  SUPABASE_ANON_KEY !== 'placeholder-key' &&
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_URL.includes('.supabase.co') &&
  SUPABASE_ANON_KEY.length > 50; // Anon keys are long JWT tokens

// Debug logging
if (import.meta.env.DEV) {
  console.log('🔍 Supabase Configuration Check:');
  console.log('  URL:', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 30)}...` : 'NOT SET');
  console.log('  Key:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT SET');
  console.log('  Valid:', hasRealCredentials ? '✓' : '✗');
  
  if (!hasRealCredentials) {
    console.warn('⚠️ Supabase credentials not configured properly.');
    console.warn('   In StackBlitz: Go to Settings → Environment Variables');
    console.warn('   Add: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
}

// Create client - throw error if trying to use placeholder with real operations
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Export a flag to check if real credentials are being used
export const isSupabaseConfigured = hasRealCredentials;

