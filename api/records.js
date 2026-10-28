import { getStore, saveStore } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const store = await getStore();

  if (req.method === 'GET') {
    return res.status(200).json(store);
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const incoming = body.records || body;
      if (incoming && typeof incoming === 'object') {
        for (const [dateKey, dayData] of Object.entries(incoming)) {
          if (dayData === null) {
            delete store.records[dateKey];
          } else if (typeof dayData === 'object') {
            store.records[dateKey] = {
              ...(store.records[dateKey] || {}),
              ...dayData,
            };
          }
        }
      }

      await saveStore(store);
      return res.status(200).json({
        success: true,
        records: store.records,
        security: store.security,
        lastUpdated: store.lastUpdated,
      });
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON', message: e.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
