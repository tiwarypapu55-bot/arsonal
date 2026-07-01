import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables or use the user's provided credentials as safe fallbacks.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://vuastgyyrscopjmnhaew.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4bkEqRrvnIrfc-szu_CDpw_tCs9ouIP';

export const supabase = createClient(supabaseUrl, supabaseKey);
