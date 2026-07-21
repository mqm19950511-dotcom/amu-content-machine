// Analyze each top Xiaohongshu creator: what their content is about and why it performs.
// One analyst agent per creator digest; each writes its own analysis JSON.
//
// args: { creators: [{id, name}], lang: 'en' | 'zh' }
//   (a bare array is also accepted and defaults to Chinese, for backward compat)

export const meta = {
  name: 'analyze-creators',
  description: 'Analyze each top Xiaohongshu creator (writes files directly)',
  phases: [{ title: 'Analyze' }],
}

const input = typeof args === 'string' ? JSON.parse(args) : args
const CREATORS = Array.isArray(input) ? input : input.creators
const LANG = (Array.isArray(input) ? 'zh' : input.lang) || 'zh'
const OUT_LANG = LANG === 'en' ? 'English' : 'Simplified Chinese (简体中文)'
const ROOT = (Array.isArray(input) ? '' : input.root) || process.env.CM_ROOT
if (!ROOT) throw new Error('pass args.root (repo absolute path) or set CM_ROOT')
const DIR = ROOT + '/analysis/creators'

const results = await parallel(CREATORS.map(c => async () => {
  const r = await agent(
    `You are a content analyst. Read ${DIR}/${c.id}-digest.md — the recent posts and engagement ` +
    `numbers of Xiaohongshu creator "${c.name}".\n\n` +
    `Analyze what their content is about and WHY it performs. On Xiaohongshu, saves (藏) relative ` +
    `to likes (赞) signal reference/tutorial content people return to; shares (转) signal ` +
    `identity/advocacy. Every claim must trace to a real title or number — quote real titles. ` +
    `No flattery, no hedging. Rank themes and top_performers by the actual numbers. Make ` +
    `what_to_borrow specific and actionable for a creator in the AI/career niche. blind_spots = ` +
    `what this creator does NOT do (the gap someone could fill).\n\n` +
    `Write a JSON object to ${DIR}/${c.id}-analysis.json with exactly this shape ` +
    `(keep every field short — this feeds a visual dashboard):\n` +
    `{"summary":"2 sentences: who they are, what niche they own",` +
    `"themes":[{"name":"<=8 chars/words","share":"% or prevalence","why_it_works":"1 sentence, cite a real title"}],` +
    `"top_performers":[{"title":"real title","why":"1 sentence: why this one won"}],` +
    `"formats":"1 sentence: video vs image, series, what performs best",` +
    `"hooks":["hook pattern, short"],"audience":"1 sentence: who reads, what job it does",` +
    `"what_to_borrow":["specific borrowable move, 1 sentence"],` +
    `"blind_spots":["gap they leave open, 1 sentence"]}\n` +
    `Limits: themes<=5, top_performers<=3, hooks<=4, what_to_borrow<=4, blind_spots<=3.\n\n` +
    `IMPORTANT: write ALL string values in ${OUT_LANG}. Keep post titles and proper nouns as-is. ` +
    `When done, reply only "done ${c.name}".`,
    { label: c.name, phase: 'Analyze', agentType: 'general-purpose' }
  )
  return { id: c.id, name: c.name, ok: /done/i.test(r || '') }
}))

return results.filter(Boolean)
