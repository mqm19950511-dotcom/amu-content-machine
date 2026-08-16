// Generate a draft from the saved interview transcript via DeepSeek.
// Reads drafts/current.json (needs idea + interview.qa), prompts/draft.md,
// writes an archived .md and updates current.json { text, version }.
//
// Usage: node scripts/ai_draft.mjs
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
if (!fs.existsSync(curPath)) { console.error('✗ 还没有访谈逐字稿——先在「访谈」页填写并保存'); process.exit(1); }
const cur = JSON.parse(fs.readFileSync(curPath, 'utf8'));
const qa = cur.interview?.qa?.filter(x => (x.a || '').trim());
if (!qa?.length) { console.error('✗ current.json 里没有访谈问答——先在「访谈」页保存逐字稿'); process.exit(1); }

const draftPromptPath = path.join(root, 'prompts', 'draft.md');
if (!fs.existsSync(draftPromptPath)) { console.error('✗ 找不到 prompts/draft.md——先跑 ./scripts/init.sh（会从模板生成）'); process.exit(1); }
const sysPrompt = fs.readFileSync(draftPromptPath, 'utf8');
const userMsg = [
  `## 选题\n${cur.idea || ''}`,
  cur.angle ? `## 角度要求\n${cur.angle}` : '',
  `## 访谈问答\n` + qa.map((x, i) => `**Q${i + 1}：${x.q}**\n\n${x.a}`).join('\n\n'),
].filter(Boolean).join('\n\n');

console.log(`→ 调用 DeepSeek 起草：${cur.idea}（${qa.length} 轮问答）`);

const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: sysPrompt },
      { role: 'user', content: userMsg },
    ],
    temperature: 0.8,
    max_tokens: 4000,
  }),
  signal: AbortSignal.timeout(180000),
});
const j = await r.json();
if (!r.ok) { console.error('✗ DeepSeek 报错：', JSON.stringify(j).slice(0, 500)); process.exit(1); }
const text = j.choices?.[0]?.message?.content?.trim();
if (!text) { console.error('✗ 模型返回为空'); process.exit(1); }

// version: bump the AI generation counter
const n = (cur.aiGen || 0) + 1;
const date = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD local
const slug = (cur.ideaId || 'draft').replace(/[^\w-]/g, '');
const md = `# 草稿 AI-v${n}：${cur.idea}\n\n- 生成时间：${new Date().toLocaleString('zh-CN')}\n- 基于 ${qa.length} 轮访谈问答\n\n---\n\n${text}\n`;
const file = path.join(root, 'drafts', `${date}-${slug}-AI-v${n}.md`);
fs.writeFileSync(file, md);

cur.text = md;
cur.version = `AI-v${n}`;
cur.aiGen = n;
delete cur.council; // new draft invalidates old review
fs.writeFileSync(curPath, JSON.stringify(cur, null, 2));

console.log(`✓ 草稿已生成：${path.relative(root, file)}`);
console.log(`✓ current.json 已更新（version = AI-v${n}，旧评审已清空）`);
console.log(`  tokens: ${j.usage?.total_tokens ?? '?'}（约 ¥${((j.usage?.total_tokens ?? 0) * 0.000002).toFixed(4)}）`);
