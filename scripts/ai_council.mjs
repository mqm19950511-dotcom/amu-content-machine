// Run the six-judge Writer's Council on ONE idea's draft via DeepSeek.
// Usage: node scripts/ai_council.mjs <ideaId>
// Env: DEEPSEEK_API_KEY (or .env.local at repo root)

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const ideaId = (process.argv[2] || '').trim();
if (!ideaId) { console.error('✗ 缺少 ideaId 参数'); process.exit(1); }

function apiKey() {
  if (process.env.DEEPSEEK_API_KEY) return process.env.DEEPSEEK_API_KEY.trim();
  const env = path.join(root, '.env.local');
  if (fs.existsSync(env)) {
    const m = fs.readFileSync(env, 'utf8').match(/^DEEPSEEK_API_KEY=(.*)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

const key = apiKey();
if (!key) { console.error('✗ 找不到 DEEPSEEK_API_KEY（.env.local）'); process.exit(1); }

const idxPath = path.join(root, 'drafts', 'index.json');
const idx = fs.existsSync(idxPath) ? JSON.parse(fs.readFileSync(idxPath, 'utf8')) : {};
const cur = idx[ideaId];
if (!cur || !(cur.text || '').trim()) { console.error(`✗ [${ideaId}] 还没有草稿——先生成`); process.exit(1); }

const promptPath = path.join(root, 'prompts', 'council.md');
if (!fs.existsSync(promptPath)) { console.error('✗ 找不到 prompts/council.md——先跑 ./scripts/init.sh'); process.exit(1); }
const md = fs.readFileSync(promptPath, 'utf8');

const parts = md.split(/^## 评委 /m);
const shared = parts[0];
const judges = parts.slice(1).map(sec => {
  const header = sec.split('\n')[0];
  const name = header.replace(/^\d+：/, '').trim();
  return { name, prompt: shared + '\n\n## 评委 ' + sec };
});
console.log(`→ 评审团开庭（[${ideaId}] ${cur.idea}）：${judges.map(x => x.name).join(' / ')}`);

async function judge({ name, prompt }) {
  const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-v4-pro',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `以下是要评审的草稿（选题：${cur.idea}）：\n\n${cur.text}` },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    }),
    signal: AbortSignal.timeout(180000),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`${name}: DeepSeek 报错 ${JSON.stringify(j).slice(0, 200)}`);
  const out = j.choices?.[0]?.message?.content || '';
  const grab = k => (out.match(new RegExp(`${k}:\\s*(.+)`)) || [])[1]?.trim() || '';
  const score = Math.min(10, Math.max(1, parseInt(grab('SCORE'), 10) || 0));
  const comment = [
    grab('STRONGEST') && `✦ 最强：${grab('STRONGEST')}`,
    grab('WEAKEST') && `✧ 最弱：${grab('WEAKEST')}`,
    grab('BLOCKING') && grab('BLOCKING') !== 'none' && `⛔ 必须改：${grab('BLOCKING')}`,
    grab('FIX') && `🛠 改法：${grab('FIX')}`,
  ].filter(Boolean).join('\n');
  console.log(`  ${name}: ${score}/10`);
  return { name, score, comment };
}

const results = await Promise.all(judges.map(j =>
  judge(j).catch(e => ({ name: j.name, score: 0, comment: `评审失败：${e.message}` }))
));

cur.council = results;
cur.councilAt = new Date().toISOString();
fs.writeFileSync(idxPath, JSON.stringify(idx, null, 2));

const valid = results.filter(x => x.score > 0);
const avg = valid.length ? (valid.reduce((s, x) => s + x.score, 0) / valid.length).toFixed(1) : '?';
const slop = results.find(x => x.name.includes('AI 味'));
console.log(`✓ 评审完成，综合分 ${avg}/10${slop && slop.score < 7 ? '（AI 味鉴别师行使否决权，需改稿）' : ''}`);
