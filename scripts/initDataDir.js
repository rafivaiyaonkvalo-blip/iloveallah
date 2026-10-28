import fs from 'fs';
import path from 'path';

// Let's create the destination directory
const dataDir = path.resolve('src/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log('src/data directory ensured:', dataDir);
