// Six reviewers score the current draft (Xiaohongshu AI content). Returns their scores.
//
// args: { lang: 'en' | 'zh' }   (defaults to Chinese)

export const meta = {
  name: 'council',
  description: 'Six reviewers score the current draft',
  phases: [{ title: 'Review' }],
}

const LANG = ((typeof args === 'string' ? JSON.parse(args) : args) || {}).lang || 'zh'
const OUT_LANG = LANG === 'en' ? 'English' : 'Simplified Chinese (简体中文)'
const ROOT = ((typeof args === 'string' ? JSON.parse(args) : args) || {}).root || process.env.CM_ROOT
if (!ROOT) throw new Error('pass args.root (repo absolute path) or set CM_ROOT')
const DRAFT = ROOT + '/drafts/current.json'

// Reviewer roles, tuned for Xiaohongshu AI content.
const REVIEWERS = [
  { key: 'hook',    en: 'Hook Critic',     brief: 'The first 3 seconds. Would the title + opening stop a scroll and pull the reader in? On Xiaohongshu the title decides life or death. Bad = it just states the topic; good = it opens a curiosity gap.' },
  { key: 'save',    en: 'Save-Value Judge', brief: 'Is this worth SAVING? On Xiaohongshu, saves beat likes. Is there a reusable framework / steps / reference-grade payoff, or does the reader bounce after reading?' },
  { key: 'truth',   en: 'Truth Checker',   brief: 'Any overclaim or empty phrasing? Does every assertion hold up? Is the core claim actually delivered, or is it clickbait?' },
  { key: 'craft',   en: 'Craft Editor',    brief: 'Sentence quality. Any filler, any AI-style parallelism and uniform length? Could it lose 30% without losing meaning?' },
  { key: 'slop',    en: 'AI-Slop Allergist', brief: 'Veto power. Find one thing only: any sentence a language model could produce with no knowledge of this author. Generic empowerment phrasing is a death sentence. Below 7 sends the whole draft back.' },
  { key: 'voice',   en: 'Voice/Fit Judge', brief: 'Does it sound like this specific author: elevating a small tool into a general capability, authority + specificity, written-to-be-saved, self-deprecating confidence, texting-a-friend tone?' },
]

const reviews = await parallel(REVIEWERS.map(r => async () => {
  const out = await agent(
    `You are "${r.en}", a Xiaohongshu content reviewer. Your lens: ${r.brief}\n\n` +
    `Read the draft in the "text" field of ${DRAFT}. Score strictly 1-10 (9 = would actively ` +
    `save it, 10 rare, 7 = publishable but the reader bounces).\n\n` +
    `Return only a JSON object: {"score": number, "comment": "1-2 sentences: strongest thing + ` +
    `the one thing that must change"}. Write the comment in ${OUT_LANG}.`,
    { label: r.en, phase: 'Review', agentType: 'general-purpose',
      schema: { type: 'object', required: ['score', 'comment'],
        properties: { score: { type: 'number' }, comment: { type: 'string' } } } }
  )
  return { name: r.en, score: out?.score ?? 0, comment: out?.comment || '' }
}))

return reviews.filter(Boolean)
