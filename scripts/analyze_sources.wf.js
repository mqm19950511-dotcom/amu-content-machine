// Analyze X and Substack accounts. One agent each; writes analysis JSON directly.
//
// args: { x: [{handle, name}], sub: [{slug, name}], lang: 'en' | 'zh' }

export const meta = {
  name: 'analyze-sources',
  description: 'Analyze X and Substack accounts (writes files directly)',
  phases: [{ title: 'X' }, { title: 'Substack' }],
}

const cfg = typeof args === 'string' ? JSON.parse(args) : args
const LANG = cfg.lang || 'zh'
const OUT_LANG = LANG === 'en' ? 'English' : 'Simplified Chinese (简体中文)'
const ROOT = cfg.root || process.env.CM_ROOT
if (!ROOT) throw new Error('pass args.root (repo absolute path) or set CM_ROOT')

const xJobs = (cfg.x || []).map(c => async () => {
  const r = await agent(
    `You are a content analyst. Read ${ROOT}/analysis/x/${c.handle}-digest.md — recent tweets ` +
    `and engagement (likes/retweets/bookmarks/replies/views) of X account @${c.handle} (${c.name}).\n\n` +
    `Analyze what this account talks about, what performs best, and its tone. Write a JSON object ` +
    `to ${ROOT}/analysis/x/${c.handle}-analysis.json with this shape (keep it short):\n` +
    `{"summary":"2 sentences: who they are, what they cover",` +
    `"themes":[{"name":"short","share":"prevalence","why_it_works":"1 sentence"}],` +
    `"top_performers":[{"title":"first 50 chars of the tweet","why":"1 sentence: why it landed"}],` +
    `"formats":"1 sentence: style/format","hooks":["short hook pattern"],` +
    `"audience":"1 sentence","what_to_borrow":["borrowable for an AI/career creator, 1 sentence"],` +
    `"blind_spots":["gap they leave open, 1 sentence"]}\n` +
    `Limits: themes<=5, top_performers<=3, hooks<=4, what_to_borrow<=4, blind_spots<=3. Cite real ` +
    `tweets. Write ALL string values in ${OUT_LANG}. Reply only "done ${c.handle}".`,
    { label: '@' + c.handle, phase: 'X', agentType: 'general-purpose' }
  )
  return { handle: c.handle, ok: /done/i.test(r || '') }
})

const subJobs = (cfg.sub || []).map(c => async () => {
  const r = await agent(
    `You are a content analyst. Read ${ROOT}/analysis/sub/${c.slug}-digest.md — recent article ` +
    `titles and excerpts from the Substack publication "${c.name}". NOTE: Substack exposes no ` +
    `public engagement, so analyze THEMES and ANGLE, not "why it performs".\n\n` +
    `Write a JSON object to ${ROOT}/analysis/sub/${c.slug}-analysis.json with this shape:\n` +
    `{"summary":"2 sentences: who this publication is, its angle",` +
    `"themes":[{"name":"short","share":"","why_it_works":"1 sentence: what this theme covers"}],` +
    `"top_performers":[{"title":"real article title","why":"1 sentence: the angle of this piece"}],` +
    `"formats":"1 sentence: deep essay / weekly / interview etc.","hooks":["angle pattern, short"],` +
    `"audience":"1 sentence","what_to_borrow":["topic/angle an AI/career creator could adapt, 1 sentence"],` +
    `"blind_spots":["gap they leave open, 1 sentence"]}\n` +
    `Limits: themes<=5, top_performers<=3, hooks<=4, what_to_borrow<=4, blind_spots<=3. Cite real ` +
    `titles. Write ALL string values in ${OUT_LANG}. Reply only "done ${c.slug}".`,
    { label: c.name, phase: 'Substack', agentType: 'general-purpose' }
  )
  return { slug: c.slug, ok: /done/i.test(r || '') }
})

const results = await parallel([...xJobs, ...subJobs])
return results.filter(Boolean)
