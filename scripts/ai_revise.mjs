// Revise the current draft based on user feedback via DeepSeek.
// Reads drafts/current.json (needs text), drafts/.revise-feedback.txt (written by
// serve.mjs from the page textarea), applies prompts/draft.md rules.
//
// Usage: node scripts/ai_revise.mjs
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
const fbPath = path.join(root, 'drafts', '.revise-feedback.txt');
if (!fs.existsSync(curPath)) { console.error('✗ 还没有草稿——先生成'); process.exit(1); }
const cur = JSON.parse(fs.readFileSync(curPath, 'utf8'));
if (!(cur.text || '').trim()) { console.error('✗ 没有可修改的草稿'); process.exit(1); }
const feedback = fs.existsSync(fbPath) ? fs.readFileSync(fbPath, 'utf8').trim() : '';
if (!feedback) { console.error('✗ 没有修改意见——先在页面上填写'); process.exit(1); }

const draftPromptPath = path.join(root, 'prompts', 'draft.md');
if (!fs.existsSync(draftPromptPath)) { console.error('✗ 找不到 prompts/draft.md——先跑 ./scripts/init.sh（会从模板生成）'); process.exit(1); }
const rules = fs.readFileSync(draftPromptPath, 'utf8');
const qa = cur.interview?.qa || [];
const council = cur.council || [];
const councilText = council.length
  ? `## 评审团意见（必须逐条落实）\n` + council.map(x =>
      `### ${x.name}（${x.score}/10）\n${x.comment || ''}`).join('\n\n')
  : '';
const userMsg = [
  `## 选题\n${cur.idea || ''}`,
  qa.length ? `## 访谈问答（事实来源，不许超出）\n` + qa.map((x, i) => `**Q${i + 1}：${x.q}**\n\n${x.a}`).join('\n\n') : '',
  `## 当前草稿\n${cur.text}`,
  councilText,
  `## 用户的修改意见\n${feedback}`,
  `## 修改要求
- 有评审团意见时：每位评委「⛔ 必须改」和「🛠 改法」逐条落实，一条都不许漏
- 评委标出的「✦ 最强」句子必须原样保留，不许删改
- 只改被点名的部分；没被任何人点名的段落保持原样，不要顺手重写
- 上方起草规则仍然全部有效（事实只能来自访谈、正文 350-400 字、小红书体等）
- 输出完整的新版草稿，格式与「输出格式」章节完全一致（===标题=== 等各段齐全）`,
].filter(Boolean).join('\n\n');

console.log(`→ 调用 DeepSeek 改稿：${cur.idea}`);
console.log(`  修改意见：${feedback.slice(0, 80)}${feedback.length > 80 ? '…' : ''}`);
if (council.length) console.log(`  附带评审团 ${council.length} 位评委意见`);

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
const date = new Date().toLocaleDateString('sv-SE');
const slug = (cur.ideaId || 'draft').replace(/[^\w-]/g, '');
const md = `# 草稿 AI-v${n}：${cur.idea}\n\n- 生成时间：${new Date().toLocaleString('zh-CN')}\n- 修改意见：${feedback}\n\n---\n\n${text}\n`;
const file = path.join(root, 'drafts', `${date}-${slug}-AI-v${n}.md`);
fs.writeFileSync(file, md);

cur.text = md;
cur.version = `AI-v${n}`;
cur.aiGen = n;
(cur.revisions ||= []).push({ v: n, feedback, at: new Date().toISOString() });
delete cur.council; // revised draft invalidates old review
fs.writeFileSync(curPath, JSON.stringify(cur, null, 2));
fs.unlinkSync(fbPath); // feedback consumed

console.log(`✓ 改稿完成：${path.relative(root, file)}（version = AI-v${n}，旧评审已清空）`);
console.log(`  tokens: ${j.usage?.total_tokens ?? '?'}`);
