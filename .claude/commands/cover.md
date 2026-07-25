---
description: Generate a 小红书 cover (1080×1440) with hook text over a video frame or screenshot
argument-hint: send a video/screenshot + a title; wrap the punchy phrase in 【】
---

Make a ready-to-post 小红书 cover. The user gives a video (or an image) and a hook title;
this pulls a frame, lays the title over it in their brand style, and outputs a 1080×1440 PNG.

## Flow

1. **Get the background.** If the user names a video (e.g. one in `~/Downloads`), extract a few
   candidate frames and show them — pick one where they're looking at camera, mouth mostly
   closed, face in the upper half (so bottom text doesn't cover it):
   ```bash
   ffmpeg -y -ss <sec> -i "<video>" -vframes 1 -vf "scale=540:-1" /tmp/frame.jpg
   ```
   If they send a screenshot (e.g. of the dashboard), use that directly as `--img`.

2. **Write the title in their voice.** Short and punchy for a cover — shorter than the video's
   spoken hook. Wrap the phrase to highlight (yellow box) in `【】`. Bold a phrase in the
   subtitle with `*...*`. Keep the kicker pill to 1–4 words.

3. **Generate:**
   ```bash
   node scripts/cover.mjs --video "<path>" --at <sec> \
     --t "标题,用【】高亮一个词" \
     --s "副标题,用*星号*加粗" \
     --k "数据科学家 · 自媒体" \
     --w "叮叮 · AI × 内容" \
     --out docs/cover.png
   ```
   Use `--img <path>` instead of `--video/--at` for a screenshot background; omit both for a
   clean cream layout (no photo).

4. **Show it, iterate.** Read the PNG back, check: is the title legible over the image? does it
   cover the face? does the line break land well? Offer 2–3 title variants or a different frame.

## 小红书 cover principles

- **The cover drives clicks** — it matters more than the video for reach. Big text, one hook.
- Title ≤ ~14 chars per line, 1–2 lines. Highlight the one word that carries the hook.
- Keep the face in the upper 60%; text sits in the lower third over a dark scrim.
- Brand-consistent: cream / black / yellow highlight, matches the dashboard.
- Outputs are gitignored (personal). The template + script are the reusable part.

## Files

- `scripts/cover.mjs` — the generator (ffmpeg frame grab + headless-Chrome render)
- `scripts/cover_template.html` — the layout (edit to restyle)
