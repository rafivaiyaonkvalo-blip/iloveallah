import { getStore, saveStore } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const store = await getStore();

  if (req.method === 'GET') {
    return res.status(200).json(store.security);
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (typeof body.isPasswordEnabled === 'boolean') {
        store.security.isPasswordEnabled = body.isPasswordEnabled;
      }
      if (typeof body.savedPassword === 'string' && body.savedPassword.trim()) {
        store.security.savedPassword = body.savedPassword.trim();
      }
      // Calculator disguise PIN is permanently locked to 313
      store.security.savedPin = '313';
      if (typeof body.isUnlocked === 'boolean') {
        store.security.isUnlocked = body.isUnlocked;
      }

      await saveStore(store);
      return res.status(200).json({
        success: true,
        security: store.security,
        lastUpdated: store.lastUpdated,
      });
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON', message: e.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
