const $ = s => document.querySelector(s);
const status = (msg, ok) => { const el = $('#status'); el.textContent = msg; el.className = ok ? 'ok' : (ok === false ? 'err' : ''); };

// 载入配置 + 当前页信息
(async () => {
  const cfg = await chrome.storage.local.get('server');
  $('#server').value = cfg.server || 'http://localhost:8420';
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    $('#title').value = tab.title || '';
    $('#url').value = tab.url || '';
  }
})();

$('#server').addEventListener('change', e => chrome.storage.local.set({ server: e.target.value.trim() }));

// 抓取当前页正文（前 1500 字）
$('#grab').addEventListener('click', async () => {
  status('抓取中…');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const t = document.body ? document.body.innerText : '';
        return t.replace(/\s+/g, ' ').slice(0, 1500);
      },
    });
    if (result) { $('#note').value = result; status('已抓取正文到备注'); }
    else status('没抓到正文', false);
  } catch (e) { status('抓取失败：' + e.message, false); }
});

$('#save').addEventListener('click', async () => {
  const server = $('#server').value.trim().replace(/\/$/, '');
  const title = $('#title').value.trim();
  const url = $('#url').value.trim();
  const note = $('#note').value.trim();
  if (!server) { status('请先填写工作台地址', false); return; }
  if (!title && !url) { status('标题和链接至少填一个', false); return; }
  status('保存中…');
  try {
    const r = await fetch(server + '/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url, note, source: 'browser-extension' }),
    });
    const j = await r.json();
    if (j.error) { status('✗ ' + j.error, false); return; }
    status('✓ 已保存到素材库（' + j.total + ' 条）', true);
  } catch (e) {
    status('✗ 连不上工作台。确认 Mac 已启动服务，且地址正确（外网用 Tailscale 的 100.x 地址）', false);
  }
});
