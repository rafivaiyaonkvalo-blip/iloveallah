import { put, list, del } from '@vercel/blob';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gdnvgwrruczxbxduiccc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_v7G23pyPDFXpXa_VjPPE3g_yiOBc4VL';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

const STORE_PREFIX = 'data/store_';
const LEGACY_BLOB = 'records.json';

export const defaultStore = {
  records: {
    "1448-04-18": {
      "maghrib_isha": "safe",
      "isha_fajr": "safe",
      "fajr_dhuhr": "unsafe",
      "dhuhr_asr": null,
      "asr_maghrib": "safe"
    },
    "1448-04-19": {
      "maghrib_isha": null,
      "isha_fajr": null,
      "fajr_dhuhr": "safe",
      "dhuhr_asr": null,
      "asr_maghrib": "safe"
    }
  },
  security: {
    isPasswordEnabled: true,
    savedPassword: "iloveAllah",
    savedPin: "313",
    isUnlocked: true
  },
  lastUpdated: Date.now()
};

let memoryStore = null;
let memoryStoreTime = 0;

export async function getStore() {
  const now = Date.now();
  if (memoryStore && now - memoryStoreTime < 800) {
    return memoryStore;
  }

  // 1. Primary Database: Supabase PostgreSQL
  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('records, security, last_updated')
      .eq('id', 'global_store')
      .maybeSingle();

    if (!error && data && data.records) {
      memoryStore = {
        records: {
          ...defaultStore.records,
          ...(data.records || {}),
        },
        security: data.security || defaultStore.security,
        lastUpdated: Number(data.last_updated) || Date.now(),
      };
      memoryStoreTime = now;
      return memoryStore;
    }
  } catch (e) {
    console.warn('Supabase getStore fallback:', e.message);
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return memoryStore || defaultStore;
  }

  try {
    const listRes = await list({ prefix: STORE_PREFIX, limit: 10, token });
    if (listRes && listRes.blobs && listRes.blobs.length > 0) {
      const sorted = listRes.blobs.sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      const latest = sorted[0];
      const res = await fetch(latest.url, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data && typeof data === 'object') {
            memoryStore = {
              records: {
                ...(defaultStore.records),
                ...(memoryStore?.records || {}),
                ...(data.records || {})
              },
              security: {
                isPasswordEnabled: data.security?.isPasswordEnabled ?? true,
                savedPassword: data.security?.savedPassword || 'iloveAllah',
                savedPin: '313',
                isUnlocked: data.security?.isUnlocked ?? true,
              },
              lastUpdated: data.lastUpdated || new Date(latest.uploadedAt).getTime(),
            };
            memoryStoreTime = now;
            return memoryStore;
          }
        } catch {
          // If response is not JSON (e.g. "Your store is blocked"), ignore and fallback
        }
      }
    }

    // Fallback: check legacy records.json blob
    const legacyList = await list({ prefix: LEGACY_BLOB, token });
    const legacyBlob = legacyList.blobs.find(b => b.pathname === LEGACY_BLOB);
    if (legacyBlob) {
      const res = await fetch(`${legacyBlob.url}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data && typeof data === 'object') {
            memoryStore = {
              records: {
                ...(defaultStore.records),
                ...(data.records || {})
              },
              security: {
                isPasswordEnabled: data.security?.isPasswordEnabled ?? true,
                savedPassword: data.security?.savedPassword || 'iloveAllah',
                savedPin: '313',
                isUnlocked: data.security?.isUnlocked ?? true,
              },
              lastUpdated: data.lastUpdated || Date.now(),
            };
            memoryStoreTime = now;
            return memoryStore;
          }
        } catch {}
      }
    }
  } catch (e) {
    console.error('getStore error (using fallback):', e.message);
  }

  return memoryStore || defaultStore;
}

export async function saveStore(store) {
  const now = Date.now();
  store.lastUpdated = now;
  memoryStore = store;
  memoryStoreTime = now;

  // 1. Primary Database: Save to Supabase
  try {
    await supabase.from('app_state').upsert({
      id: 'global_store',
      records: store.records,
      security: store.security,
      last_updated: now,
    }, { onConflict: 'id' });
  } catch (e) {
    console.warn('Supabase saveStore warning:', e.message);
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    try {
      const filename = `${STORE_PREFIX}${now}.json`;
      await put(filename, JSON.stringify(store, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        token,
      });

      // Cleanup older store versions asynchronously (keep 5 newest)
      list({ prefix: STORE_PREFIX, limit: 20, token })
        .then((listRes) => {
          if (listRes?.blobs?.length > 5) {
            const sorted = listRes.blobs.sort(
              (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
            );
            const toDelete = sorted.slice(5).map((b) => b.url);
            if (toDelete.length > 0) {
              del(toDelete, { token }).catch(() => {});
            }
          }
        })
        .catch(() => {});
    } catch (e) {
      console.warn('saveStore blob warning (memoryStore maintained):', e.message);
    }
  }

  return store;
}
