import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://gdnvgwrruczxbxduiccc.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_v7G23pyPDFXpXa_VjPPE3g_yiOBc4VL';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 10 } },
});

export const isSupabaseConfigured = true;
