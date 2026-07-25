// No-cache static server for the dashboard, plus a voice-transcription endpoint.
//
//   GET  /*              -> dashboard files (no-store, so rebuilt data shows up)
//   POST /api/transcribe -> forwards audio to Mistral Voxtral, returns { text }
//
// The Mistral key is read at runtime from the repo-root .env.local (or MISTRAL_API_KEY)
// and never leaves the server — the browser records audio and posts it here, the
// server calls Mistral. The key is never sent to the client and never committed.
//
// Usage: node scripts/serve.mjs [port]

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dir = path.join(root, 'dashboard');
const port = +(process.argv[2] || 8420);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
                '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

function mistralKey() {
  if (process.env.MISTRAL_API_KEY) return process.env.MISTRAL_API_KEY.trim();
  const env = process.env.MISTRAL_ENV_PATH || path.resolve(root, '.env.local');
  if (fs.existsSync(env)) {
    const m = fs.readFileSync(env, 'utf8').match(/^MISTRAL_API_KEY=(.*)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

async function transcribe(req, res) {
  const key = mistralKey();
  if (!key) { res.writeHead(501, cors()); return res.end(JSON.stringify({ error: 'no MISTRAL_API_KEY' })); }
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', async () => {
    try {
      const audio = Buffer.concat(chunks);
      const ct = req.headers['content-type'] || 'audio/webm';
      const ext = ct.includes('mp4') ? 'mp4' : ct.includes('mpeg') ? 'mp3' : ct.includes('wav') ? 'wav' : 'webm';
      const form = new FormData();
      form.append('model', 'voxtral-mini-latest');
      form.append('file', new Blob([audio], { type: ct }), `audio.${ext}`);
      const r = await fetch('https://api.mistral.ai/v1/audio/transcriptions', {
        method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form,
      });
      const j = await r.json();
      res.writeHead(r.ok ? 200 : 502, cors());
      res.end(JSON.stringify({ text: j.text || '', raw: r.ok ? undefined : j }));
    } catch (e) {
      res.writeHead(500, cors());
      res.end(JSON.stringify({ error: String(e) }));
    }
  });
}

const cors = () => ({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type' });

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, cors()); return res.end(); }
  if (req.method === 'POST' && req.url.startsWith('/api/transcribe')) return transcribe(req, res);

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
  console.log(`Content Machine dashboard -> http://localhost:${port}`);
  console.log(mistralKey() ? '  voice transcription: enabled (Mistral Voxtral)' : '  voice transcription: off (no MISTRAL_API_KEY)');
  if (!fs.existsSync(path.join(dir, 'me.js'))) console.log('  (no me.js — run scripts/build_dashboard.mjs)');
});
