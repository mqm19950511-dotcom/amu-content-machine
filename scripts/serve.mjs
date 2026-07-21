// No-cache static server for the dashboard.
//
// Plain `python -m http.server` caches data.js/me.js, so rebuilt data silently
// doesn't show up (the avatar "bug" was this). This sends no-store on everything.
//
// Usage: node scripts/serve.mjs [port]

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(import.meta.dirname, '..', 'dashboard');
const port = +(process.argv[2] || 8420);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
                '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(dir, p);
  if (!file.startsWith(dir) || !fs.existsSync(file)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, {
    'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
    'Cache-Control': 'no-store, must-revalidate',
  });
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => {
  console.log(`Content Machine dashboard → http://localhost:${port}`);
  if (!fs.existsSync(path.join(dir, 'me.js'))) console.log('(no me.js — run scripts/build_dashboard.mjs)');
});
