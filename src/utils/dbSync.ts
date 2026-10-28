import { supabase } from './supabaseClient';
import { DayData, TipItem, TipPopupFrequency, UserGamificationState } from '../types';

export interface AppStatePayload {
  records: Record<string, DayData>;
  security: {
    isPasswordEnabled: boolean;
    savedPassword: string;
    savedPin: string;
    isUnlocked: boolean;
    tips?: TipItem[];
    customTips?: TipItem[];
    favoriteTips?: string[];
    tipsFrequency?: TipPopupFrequency;
    zikrHistory?: Record<string, Record<string, boolean>>;
    khushuHistory?: Record<string, Record<string, boolean>>;
    earbudsHistory?: Record<string, Record<string, number>>;
    gamification?: UserGamificationState;
  };
  lastUpdated: number;
}

const STORE_ID = 'global_store';

// 1. Fetch full state from Supabase
export async function fetchSupabaseState(): Promise<AppStatePayload | null> {
  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('records, security, last_updated')
      .eq('id', STORE_ID)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      records: (data.records as Record<string, DayData>) || {},
      security: data.security || {
        isPasswordEnabled: true,
        savedPassword: 'iloveAllah',
        savedPin: '313',
        isUnlocked: true,
      },
      lastUpdated: Number(data.last_updated) || Date.now(),
    };
  } catch (err) {
    console.warn('fetchSupabaseState error:', err);
    return null;
  }
}

// 2. Save full state to Supabase (Upsert)
export async function saveSupabaseState(
  records: Record<string, DayData>,
  security?: any
): Promise<boolean> {
  try {
    const now = Date.now();
    const payload: any = {
      id: STORE_ID,
      records,
      last_updated: now,
    };
    if (security) {
      payload.security = security;
    }

    const { error } = await supabase
      .from('app_state')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('saveSupabaseState upsert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('saveSupabaseState exception:', err);
    return false;
  }
}

// 3. Subscribe to Realtime Updates
export function subscribeToSupabase(
  onUpdate: (state: AppStatePayload) => void
): () => void {
  try {
    const channel = supabase
      .channel('public:app_state')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_state', filter: `id=eq.${STORE_ID}` },
        (payload: any) => {
          if (payload.new) {
            onUpdate({
              records: payload.new.records || {},
              security: payload.new.security,
              lastUpdated: Number(payload.new.last_updated) || Date.now(),
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch {
    return () => {};
  }
}
