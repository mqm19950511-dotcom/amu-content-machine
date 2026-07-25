// Generate a 小红书 cover (1080×1440) with hook text over a background frame.
//
// Usage:
//   node scripts/cover.mjs --t "标题,用【】高亮" --s "副标题,用*加粗*" [options]
//
// Options:
//   --t   <title>      title; wrap a phrase in 【】 to highlight it (yellow box)
//   --s   <sub>        subtitle; wrap a phrase in *...* to bold it (yellow)
//   --k   <kicker>     top-left pill label (default "AI-native 内容"; "" hides it)
//   --w   <who>        brand chip (default "叮叮 · AI × 内容")
//   --video <path>     extract a frame from this video as the background
//   --at  <seconds>    which second to grab the frame from (default 1)
//   --img <path>       use this image as background instead of a video frame
//   --out <path>       output PNG (default docs/cover.png)
//   (no --video/--img  → clean cream layout, no photo)
//
// Renders via headless Chrome, same as the other diagrams. Cover PNGs are gitignored.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const opt = (name, def = '') => {
  const i = args.indexOf('--' + name);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : def;
};

const title = opt('t', '有了这套工作流,普通人也能像 【AI-native】 一样做内容');
const sub = opt('s', '它不帮你写,先帮你想清楚该发什么');
const kicker = args.includes('--k') ? opt('k', '') : 'AI-native 内容';
const who = opt('w', '叮叮 · AI × 内容');
const out = path.resolve(opt('out', path.join(root, 'docs', 'cover.png')));
const at = opt('at', '1');

// resolve background image
let bgPath = '';
const img = opt('img'), video = opt('video');
if (img) {
  bgPath = path.resolve(img);
} else if (video) {
  bgPath = path.join(root, 'docs', '.cover-frame.jpg');
  // grab a frame, crop/scale to 1080×1440 (3:4), center
  execSync(`ffmpeg -y -ss ${at} -i "${path.resolve(video)}" -vframes 1 ` +
    `-vf "scale=1080:1440:force_original_aspect_ratio=increase,crop=1080:1440" ` +
    `"${bgPath}"`, { stdio: 'ignore' });
  if (!fs.existsSync(bgPath)) { console.error('frame extraction failed'); process.exit(1); }
}

const chrome = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium'].find(p => fs.existsSync(p));
if (!chrome) { console.error('no Chrome found'); process.exit(1); }

const tpl = `file://${path.join(root, 'scripts', 'cover_template.html')}`;
const q = new URLSearchParams();
q.set('t', title); q.set('s', sub); q.set('k', kicker); q.set('w', who);
if (bgPath) q.set('bg', `file://${bgPath}`);
const url = `${tpl}?${q.toString()}`;

fs.mkdirSync(path.dirname(out), { recursive: true });
execSync(`"${chrome}" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 ` +
  `--window-size=1080,1440 --screenshot="${out}" "${url}"`, { stdio: 'ignore' });

console.log(`封面已生成 → ${path.relative(root, out)}  (1080×1440)`);
console.log(`  标题: ${title}`);
if (sub) console.log(`  副标题: ${sub}`);
