// Revise ONE idea's draft based on user feedback (and any council notes) via DeepSeek.
// Usage: node scripts/ai_revise.mjs <ideaId>
// Feedback is read from drafts/.revise-feedback.txt (written by serve.mjs).
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

const fbPath = path.join(root, 'drafts', '.revise-feedback.txt');
const feedback = fs.existsSync(fbPath) ? fs.readFileSync(fbPath, 'utf8').trim() : '';
if (!feedback) { console.error('✗ 没有修改意见'); process.exit(1); }

const promptPath = path.join(root, 'prompts', 'draft.md');
if (!fs.existsSync(promptPath)) { console.error('✗ 找不到 prompts/draft.md——先跑 ./scripts/init.sh'); process.exit(1); }
const rules = fs.readFileSync(promptPath, 'utf8');

const council = cur.council || [];
const councilText = council.length
  ? `## 评审团意见（必须逐条落实）\n` + council.map(x =>
      `### ${x.name}（${x.score}/10）\n${x.comment || ''}`).join('\n\n')
  : '';

const userMsg = [
  `## 选题\n${cur.idea || ideaId}`,
  `## 当前草稿\n${cur.text}`,
  councilText,
  `## 用户的修改意见\n${feedback}`,
  `## 修改要求
- 有评审团意见时：「⛔ 必须改」「🛠 改法」逐条落实，一条不漏
- 评委标出的「✦ 最强」句子原样保留，不许删改
- 只改被点名的部分；没被点名的段落保持原样，不要顺手重写
- 上方起草规则仍然全部有效
- 输出完整的新版草稿，格式与「输出格式」章节完全一致`,
].filter(Boolean).join('\n\n');

console.log(`→ 调用 DeepSeek 改稿：[${ideaId}] ${cur.idea}`);
console.log(`  意见：${feedback.slice(0, 80)}${feedback.length > 80 ? '…' : ''}`);

const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: rules },
      { role: 'user', content: userMsg },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  }),
  signal: AbortSignal.timeout(180000),
});
const j = await r.json();
if (!r.ok) { console.error('✗ DeepSeek 报错：', JSON.stringify(j).slice(0, 500)); process.exit(1); }
const text = j.choices?.[0]?.message?.content?.trim();
if (!text) { console.error('✗ 模型返回为空'); process.exit(1); }

const n = (cur.aiGen || 0) + 1;
const now = new Date();
cur.text = text;
cur.version = `AI-v${n}`;
cur.aiGen = n;
cur.updatedAt = now.toISOString();
(cur.revisions ||= []).push({ v: n, feedback, at: now.toISOString() });
delete cur.council; // revised draft invalidates old review
fs.writeFileSync(idxPath, JSON.stringify(idx, null, 2));
fs.unlinkSync(fbPath);

const slug = ideaId.replace(/[^\w-]/g, '');
fs.writeFileSync(path.join(root, 'drafts', `${now.toLocaleDateString('sv-SE')}-${slug}-AI-v${n}.md`),
  `# 草稿 AI-v${n}：${cur.idea}\n\n- 修改意见：${feedback}\n\n---\n\n${text}\n`);

console.log(`✓ 改稿完成：[${ideaId}] version = AI-v${n}（旧评审已清空）`);
console.log(`  tokens: ${j.usage?.total_tokens ?? '?'}`);
