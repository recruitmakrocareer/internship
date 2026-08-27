/**
 * ui-harness.js — เครื่องมือร่วมสำหรับ UI test ของหน้าเว็บใน docs/
 *
 * เสิร์ฟโฟลเดอร์ docs/ ด้วย static server ในเครื่อง แล้ว stub ทุก request ที่ยิงไป
 * Apps Script จึงทดสอบได้โดยไม่แตะระบบจริง และไม่ต้องมี network
 *
 * ต้องติดตั้ง playwright ก่อน (ไม่ได้เป็น dependency ของโปรเจกต์):
 *   npm i -D playwright && npx playwright install chromium
 *
 * ตัวแปรที่ปรับได้:
 *   KM_UI_CHROMIUM     - path ของ chromium (ถ้าไม่ได้ติดตั้งผ่าน playwright)
 *   KM_UI_TAILWIND_CSS - ไฟล์ CSS ที่ build จาก Tailwind เพื่อให้ screenshot มีสไตล์
 *   KM_UI_OUT          - โฟลเดอร์เก็บ screenshot (ค่าเริ่มต้น: temp dir)
 */
'use strict';

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'docs');
const OUT = process.env.KM_UI_OUT || os.tmpdir();
const TW_FILE = process.env.KM_UI_TAILWIND_CSS || '';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

/** ตัวนับผลทดสอบพร้อมฟังก์ชัน check() */
function createChecker() {
  const state = { pass: 0, fail: 0 };
  const check = (name, cond, detail) => {
    if (cond) { state.pass++; console.log('  ✓ ' + name); }
    else { state.fail++; console.log('  ✗ ' + name + (detail !== undefined ? ' → ' + JSON.stringify(detail) : '')); }
  };
  const finish = () => {
    console.log(`\nสรุป: ผ่าน ${state.pass} / ล้มเหลว ${state.fail}`);
    process.exit(state.fail === 0 ? 0 : 1);
  };
  return { check, state, finish };
}

function startServer(port) {
  const server = http.createServer((req, res) => {
    const urlPath = req.url.split('?')[0];
    const file = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

/**
 * เปิดเบราว์เซอร์พร้อม stub ของ API
 * @param {Object} opts
 * @param {function(Object): Object} opts.api - รับ params ของ request คืน object ที่จะตอบกลับ
 * @param {number} [opts.port]
 * @returns {Promise<Object>} { page, calls, errors, appErrors, url, screenshot, close }
 */
async function startUiHarness(opts) {
  const { chromium } = require('playwright');
  const port = opts.port || 8099;
  const server = await startServer(port);

  const launchOpts = process.env.KM_UI_CHROMIUM ? { executablePath: process.env.KM_UI_CHROMIUM } : {};
  const browser = await chromium.launch(launchOpts);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const calls = [];
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  // Tailwind Play CDN อาจเข้าถึงไม่ได้ (เช่นใน CI ที่ไม่มี network) — ใส่ stub ให้
  // tailwind.config ไม่ throw และให้คลาส hidden ซ่อน element จริงเพื่อเช็ค modal ได้
  const twCss = TW_FILE && fs.existsSync(TW_FILE)
    ? fs.readFileSync(TW_FILE, 'utf8')
    : '.hidden{display:none !important}';
  await page.route('**cdn.tailwindcss.com**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/javascript',
    body: 'window.tailwind = { config: {} };\n' +
      'const st = document.createElement("style");\n' +
      'st.textContent = ' + JSON.stringify(twCss) + ';\n' +
      'document.head.appendChild(st);'
  }));
  await page.route('**fonts.googleapis.com**', (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));

  await page.route('**script.google.com/**', async (route) => {
    const req = route.request();
    let params = {};
    if (req.method() === 'POST') {
      try { params = JSON.parse(req.postData() || '{}'); } catch (e) { params = {}; }
    } else {
      params = Object.fromEntries(new URL(req.url()).searchParams.entries());
    }
    calls.push(params);

    const body = opts.api(params) || { success: false, error: 'unstubbed: ' + params.action };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  return {
    page,
    calls,
    errors,
    /** error ที่มาจากโค้ดหน้าเว็บจริง (ตัดเรื่องโหลดทรัพยากรภายนอกไม่ได้ออก) */
    appErrors: () => errors.filter((e) => !/Failed to load resource|ERR_CONNECTION|ERR_TUNNEL|net::/.test(e)),
    url: (hash) => `http://localhost:${port}/index.html${hash || ''}`,
    /**
     * เปิดหน้าเว็บที่ hash ที่ต้องการ
     * ถ้า URL เดิมเหมือนกันต้อง reload เพราะการเปลี่ยนแค่ fragment
     * ไม่ทำให้สคริปต์รันใหม่ (ทดสอบสลับบทบาทจะไม่เห็นผล)
     */
    open: async (hash) => {
      const target = `http://localhost:${port}/index.html${hash || ''}`;
      if (page.url() === target) await page.reload();
      else await page.goto(target);
    },
    /** ตั้งค่าผู้ใช้ที่ล็อกอินใน localStorage (ต้องเปิดหน้าเว็บแล้วก่อน) */
    login: (user) => page.evaluate((u) => localStorage.setItem('internship_user', JSON.stringify(u)), user),
    screenshot: (name, fullPage) => page.screenshot({ path: path.join(OUT, name), fullPage: !!fullPage }),
    close: async () => { await browser.close(); server.close(); }
  };
}

module.exports = { startUiHarness, createChecker, OUT };
