// Run the six-judge Writer's Council on the current draft via DeepSeek.
// Reads drafts/current.json (needs text), prompts/council.md (split per judge),
// writes current.json.council = [{ name, score, comment }].
//
// Usage: node scripts/ai_council.mjs
// Env: DEEPSEEK_API_KEY (or .env.local at repo root)

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

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

const curPath = path.join(root, 'drafts', 'current.json');
if (!fs.existsSync(curPath)) { console.error('✗ 还没有草稿——先在「草稿」页生成'); process.exit(1); }
const cur = JSON.parse(fs.readFileSync(curPath, 'utf8'));
if (!(cur.text || '').trim()) { console.error('✗ current.json 里没有草稿正文——先生成草稿'); process.exit(1); }

// split prompts/council.md: shared rules + one section per judge ("## 评委 N：...")
const councilPromptPath = path.join(root, 'prompts', 'council.md');
if (!fs.existsSync(councilPromptPath)) { console.error('✗ 找不到 prompts/council.md——先跑 ./scripts/init.sh（会从模板生成）'); process.exit(1); }
const md = fs.readFileSync(councilPromptPath, 'utf8');
const parts = md.split(/^## 评委 /m);
const shared = parts[0];
const judges = parts.slice(1).map(sec => {
  const header = sec.split('\n')[0]; // e.g. "1：David Perell（观点密度）"
  const name = header.replace(/^\d+：/, '').trim();
  return { name, prompt: shared + '\n\n## 评委 ' + sec };
});
if (judges.length !== 6) console.log(`⚠ 提示词里解析到 ${judges.length} 位评委（预期 6 位），继续执行`);

console.log(`→ 评审团开庭：${judges.map(x => x.name).join(' / ')}`);

async function judge({ name, prompt }) {
  const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `以下是要评审的草稿（选题：${cur.idea}）：\n\n${cur.text}` },
      ],
      temperature: 0.3,
      max_tokens: 1500,
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
fs.writeFileSync(curPath, JSON.stringify(cur, null, 2));

const valid = results.filter(x => x.score > 0);
const avg = valid.length ? (valid.reduce((s, x) => s + x.score, 0) / valid.length).toFixed(1) : '?';
const slop = results.find(x => x.name.includes('AI 味'));
console.log(`✓ 评审完成，综合分 ${avg}/10${slop && slop.score < 7 ? '（AI 味鉴别师行使否决权，需改稿）' : ''}`);
