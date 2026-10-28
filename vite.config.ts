import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataFilePath = path.resolve(__dirname, 'records.json')

interface ServerStore {
  records: Record<string, any>;
  security: {
    isPasswordEnabled: boolean;
    savedPassword: string;
    isUnlocked: boolean;
  };
  lastUpdated: number;
}

function loadStore(): ServerStore {
  const defaultStore: ServerStore = {
    records: {},
    security: {
      isPasswordEnabled: true,
      savedPassword: 'iloveAllah',
      isUnlocked: true,
    },
    lastUpdated: Date.now(),
  };

  if (!fs.existsSync(dataFilePath)) {
    return defaultStore;
  }

  try {
    const content = fs.readFileSync(dataFilePath, 'utf8');
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object') {
      if ('records' in parsed && 'security' in parsed) {
        return {
          records: parsed.records || {},
          security: {
            isPasswordEnabled: parsed.security?.isPasswordEnabled ?? true,
            savedPassword: parsed.security?.savedPassword || 'iloveAllah',
            isUnlocked: parsed.security?.isUnlocked ?? true,
          },
          lastUpdated: parsed.lastUpdated || Date.now(),
        };
      }
      // Wrap legacy root date keys
      return {
        records: parsed,
        security: defaultStore.security,
        lastUpdated: Date.now(),
      };
    }
    return defaultStore;
  } catch {
    return defaultStore;
  }
}

function saveStore(store: ServerStore) {
  store.lastUpdated = Date.now();
  fs.writeFileSync(dataFilePath, JSON.stringify(store, null, 2), 'utf8');
}

// Centralized automatic storage plugin for multi-device & multi-browser sync
const recordsStoragePlugin = () => ({
  name: 'records-storage-api',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      const url = req.url?.split('?')[0];

      if (url === '/api/state' || url === '/api/records' || url === '/api/security') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          const store = loadStore();

          if (url === '/api/security') {
            return res.end(JSON.stringify(store.security));
          }

          // Return full store for /api/state and /api/records
          return res.end(JSON.stringify(store));
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });

          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              const store = loadStore();

              if (url === '/api/security') {
                if (typeof parsed.isPasswordEnabled === 'boolean') {
                  store.security.isPasswordEnabled = parsed.isPasswordEnabled;
                }
                if (typeof parsed.savedPassword === 'string' && parsed.savedPassword.trim()) {
                  store.security.savedPassword = parsed.savedPassword.trim();
                }
                if (typeof parsed.isUnlocked === 'boolean') {
                  store.security.isUnlocked = parsed.isUnlocked;
                }
                saveStore(store);
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: true, security: store.security, lastUpdated: store.lastUpdated }));
              }

              // Update records
              const incoming = parsed.records || parsed;
              if (incoming && typeof incoming === 'object') {
                // Merge date entries safely
                for (const [dateKey, dayData] of Object.entries(incoming)) {
                  if (dayData === null) {
                    delete store.records[dateKey];
                  } else if (typeof dayData === 'object') {
                    store.records[dateKey] = {
                      ...(store.records[dateKey] || {}),
                      ...(dayData as any),
                    };
                  }
                }
              }

              // If security fields were also passed in POST /api/records or /api/state
              if (parsed.security && typeof parsed.security === 'object') {
                if (typeof parsed.security.isPasswordEnabled === 'boolean') {
                  store.security.isPasswordEnabled = parsed.security.isPasswordEnabled;
                }
                if (typeof parsed.security.savedPassword === 'string' && parsed.security.savedPassword.trim()) {
                  store.security.savedPassword = parsed.security.savedPassword.trim();
                }
                if (typeof parsed.security.isUnlocked === 'boolean') {
                  store.security.isUnlocked = parsed.security.isUnlocked;
                }
              }

              saveStore(store);
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: true, records: store.records, security: store.security, lastUpdated: store.lastUpdated }));
            } catch (e: any) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Invalid JSON', message: e.message }));
            }
          });
          return;
        }
      }

      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), recordsStoragePlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000
  }
});
