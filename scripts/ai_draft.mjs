// Generate a draft for ONE idea via DeepSeek, grounded in the voice guide.
// Reads drafts/index.json (keyed by ideaId), vault/vault.json (idea title),
// voice/voice-guide.md (writing style), prompts/draft.md (rules).
//
// Usage: node scripts/ai_draft.mjs <ideaId>
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

// idea title + angle from vault
let idea = ideaId, angle = '';
try {
  const v = JSON.parse(fs.readFileSync(path.join(root, 'vault', 'vault.json'), 'utf8'));
  const it = (v.ideas || []).find(x => x.id === ideaId);
  if (it) { idea = it.title || it.idea || ideaId; angle = it.angle || ''; }
} catch {}

// voice guide (may be empty / still a template)
let voice = '';
const vg = path.join(root, 'voice', 'voice-guide.md');
if (fs.existsSync(vg)) {
  const t = fs.readFileSync(vg, 'utf8');
  if (!/NOT YET GENERATED/.test(t)) voice = t;
}

const promptPath = path.join(root, 'prompts', 'draft.md');
if (!fs.existsSync(promptPath)) { console.error('✗ 找不到 prompts/draft.md——先跑 ./scripts/init.sh'); process.exit(1); }
const rules = fs.readFileSync(promptPath, 'utf8');

const userMsg = [
  `## 选题\n${idea}`,
  angle ? `## 角度\n${angle}` : '',
  voice ? `## 声音指南（务必贴合这个写作风格）\n${voice}` : '## 声音指南\n（未提供——用自然、口语化的中文短句，治愈系口吻）',
  `## 要求\n按上方起草规则，为这个选题写一版完整草稿。没有访谈材料，所有内容围绕选题本身展开，不要编造具体数字或故事。`,
].filter(Boolean).join('\n\n');

console.log(`→ 调用 DeepSeek 起草：[${ideaId}] ${idea}`);

const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: rules },
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

// persist into index.json[ideaId]
const idxPath = path.join(root, 'drafts', 'index.json');
const idx = fs.existsSync(idxPath) ? JSON.parse(fs.readFileSync(idxPath, 'utf8')) : {};
const prev = idx[ideaId] || {};
const n = (prev.aiGen || 0) + 1;
const now = new Date();
idx[ideaId] = {
  ideaId, idea, angle,
  version: `AI-v${n}`,
  aiGen: n,
  createdAt: prev.createdAt || now.toLocaleDateString('sv-SE'),
  updatedAt: now.toISOString(),
  text,
  revisions: prev.revisions || [],
};
delete idx[ideaId].council; // new draft invalidates old review
fs.writeFileSync(idxPath, JSON.stringify(idx, null, 2));

// archive a readable .md copy
const slug = ideaId.replace(/[^\w-]/g, '');
const date = now.toLocaleDateString('sv-SE');
fs.writeFileSync(path.join(root, 'drafts', `${date}-${slug}-AI-v${n}.md`),
  `# 草稿 AI-v${n}：${idea}\n\n- 生成时间：${now.toLocaleString('zh-CN')}\n\n---\n\n${text}\n`);

console.log(`✓ 草稿已生成：[${ideaId}] version = AI-v${n}`);
console.log(`  tokens: ${j.usage?.total_tokens ?? '?'}`);
