/**
 * Smoke test หน้า Knowledge Management ฝั่งพี่เลี้ยง/แอดมิน
 *
 * เสิร์ฟโฟลเดอร์ docs/ ด้วย static server แล้ว stub ทุก request ที่ยิงไป
 * Apps Script จึงทดสอบได้โดยไม่แตะระบบจริง
 *
 * ต้องติดตั้ง playwright ก่อน (ไม่ได้เป็น dependency ของโปรเจกต์):
 *   npm i -D playwright && npx playwright install chromium
 *   npm run test:ui
 *
 * ตัวแปรที่ปรับได้:
 *   KM_UI_CHROMIUM     - path ของ chromium (ถ้าไม่ได้ติดตั้งผ่าน playwright)
 *   KM_UI_TAILWIND_CSS - ไฟล์ CSS ที่ build จาก Tailwind เพื่อให้ screenshot มีสไตล์
 *   KM_UI_OUT          - โฟลเดอร์เก็บ screenshot (ค่าเริ่มต้น: temp dir)
 */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'docs');
const PORT = 8099;
const OUT = process.env.KM_UI_OUT || require('os').tmpdir();
// ไฟล์ CSS ของ Tailwind (ถ้ามี) ใช้ให้หน้าจอมีสไตล์จริงตอนถ่าย screenshot
const TW_FILE = process.env.KM_UI_TAILWIND_CSS || '';

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  const file = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});

let pass = 0, fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? ' → ' + JSON.stringify(detail) : '')); }
};

const SUMMARIES = [
  { userId: 'S1', name: 'สมหญิง ตั้งใจ', studentId: '6401001', department: 'Fresh Food',
    km: { totalTopics: 6, completedTopics: 6, selectedTopic: { topicNumber: 3, topicName: 'การจัดการสินค้า' }, presentationScore: null, progressPercent: 100 } },
  { userId: 'S2', name: 'สมศักดิ์ ขยัน', studentId: '6401002', department: 'Dry Food',
    km: { totalTopics: 6, completedTopics: 4, selectedTopic: { topicNumber: 1, topicName: 'การจัดการทรัพยากรบุคคล' }, presentationScore: 81, progressPercent: 67 } },
  { userId: 'S3', name: 'สมชาย เรียบร้อย', studentId: '6401003', department: 'Fresh Food',
    km: { totalTopics: 6, completedTopics: 2, selectedTopic: null, presentationScore: null, progressPercent: 33 } }
];

const ENTRIES = (userId) => [1, 2, 3, 4, 5, 6].map((n) => ({
  id: userId + '-' + n, userId, topicNumber: n,
  topicName: ['การจัดการทรัพยากรบุคคล', 'การบริการลูกค้า', 'การจัดการสินค้า', 'การจัดการผลกำไรขาดทุน', 'ความปลอดภัยอาหาร', 'ความปลอดภัยการปฏิบัติงาน'][n - 1],
  keyTakeaways: n <= 3 ? 'สิ่งที่ได้เรียนรู้หัวข้อ ' + n : '',
  challenges: n <= 3 ? 'อุปสรรคหัวข้อ ' + n : '',
  knowledgeApply: '', feedback: '',
  isSelectedForPresentation: (userId === 'S1' && n === 3) || (userId === 'S2' && n === 1),
  fileUrl: n === 3 ? 'https://drive.google.com/file/d/abc123/view' : '',
  fileName: n === 3 ? 'km-topic3.pdf' : '',
  presentationScore: userId === 'S2' && n === 1 ? 81 : '',
  presentationScoreDetail: userId === 'S2' && n === 1
    ? { format: 8, content: 9, timeManagement: 7, presentationSkill: 8, qaSkill: 7, totalScore: 81 }
    : null,
  evaluatorId: '', hasContent: n <= 3, createdAt: '', updatedAt: ''
}));

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const launchOpts = process.env.KM_UI_CHROMIUM ? { executablePath: process.env.KM_UI_CHROMIUM } : {};
  const browser = await chromium.launch(launchOpts);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const calls = [];
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  // Tailwind CDN เข้าถึงไม่ได้ใน sandbox — ใส่ stub ให้ tailwind.config ไม่ throw
  // และให้คลาส hidden ซ่อน element จริง เพื่อตรวจการเปิด/ปิด modal ได้
  // ไม่มีไฟล์ CSS ก็ยังทดสอบได้ — ใส่แค่กฎ .hidden เพื่อให้เช็คการเปิด/ปิด modal ได้
  const TW_CSS = TW_FILE && fs.existsSync(TW_FILE)
    ? fs.readFileSync(TW_FILE, 'utf8')
    : '.hidden{display:none !important}';
  await page.route('**cdn.tailwindcss.com**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/javascript',
    body: 'window.tailwind = { config: {} };\n' +
      'const st = document.createElement("style");\n' +
      'st.textContent = ' + JSON.stringify(TW_CSS) + ';\n' +
      'document.head.appendChild(st);'
  }));
  // Google Fonts เข้าถึงไม่ได้ใน sandbox — ตอบ CSS ว่างเพื่อไม่ให้ค้าง
  await page.route('**fonts.googleapis.com**', (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }));

  // stub ทุก request ที่ยิงไป Apps Script
  await page.route('**script.google.com/**', async (route) => {
    const req = route.request();
    let params = {};
    if (req.method() === 'POST') {
      try { params = JSON.parse(req.postData() || '{}'); } catch (e) { params = {}; }
    } else {
      params = Object.fromEntries(new URL(req.url()).searchParams.entries());
    }
    calls.push(params);

    let body = { success: false, error: 'unstubbed: ' + params.action };
    if (params.action === 'getResources') body = { success: true, data: [] };
    else if (params.action === 'getAllKnowledgeSummaries') body = { success: true, data: SUMMARIES };
    else if (params.action === 'getKnowledgeEntries') body = { success: true, data: ENTRIES(params.userId) };
    else if (params.action === 'scorePresentationKM') {
      const w = Number(params.format) * 0.15 + Number(params.content) * 0.40 + Number(params.timeManagement) * 0.15 +
                Number(params.presentationSkill) * 0.15 + Number(params.qaSkill) * 0.15;
      body = { success: true, message: 'บันทึกคะแนนสำเร็จ', data: { totalScore: Math.round(w * 10) } };
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.goto(`http://localhost:${PORT}/index.html`);
  await page.evaluate(() => localStorage.setItem('internship_user', JSON.stringify(
    { id: 'M1', name: 'พี่เลี้ยง ใจดี', role: 'MENTOR', email: 'm1@x.com', token: 'stub.token' })));

  console.log('\n[1] พี่เลี้ยงเปิดหน้า Knowledge Management');
  await page.goto(`http://localhost:${PORT}/index.html#knowledge-management`);
  await page.waitForSelector('#km-review-rows tr td', { timeout: 10000 });

  check('เรียก getAllKnowledgeSummaries', calls.some((c) => c.action === 'getAllKnowledgeSummaries'));
  check('แนบ authToken ไปกับ request', calls.every((c) => c.authToken === 'stub.token'), calls.map((c) => c.action));

  const rowCount = await page.locator('#km-review-rows tr').count();
  check('แสดงนักศึกษา 3 คน', rowCount === 3, rowCount);

  const firstRow = await page.locator('#km-review-rows tr').first().innerText();
  check('เรียงคนที่รอให้คะแนนขึ้นก่อน (สมหญิง)', firstRow.includes('สมหญิง'), firstRow);

  const stats = await page.locator('#km-review-stats').innerText();
  check('สถิติ: นักศึกษา 3 / เลือกหัวข้อแล้ว 2 / รอให้คะแนน 1 / เฉลี่ย 81',
    /3/.test(stats) && /2/.test(stats) && /81\/100/.test(stats), stats.replace(/\n/g, ' | '));

  const noTopicRow = await page.locator('#km-review-rows tr', { hasText: 'สมชาย' }).innerText();
  check('คนที่ยังไม่เลือกหัวข้อขึ้นป้ายเตือน', noTopicRow.includes('ยังไม่เลือกหัวข้อ'), noTopicRow);
  const noTopicButtons = await page.locator('#km-review-rows tr', { hasText: 'สมชาย' }).locator('button').count();
  check('คนที่ยังไม่เลือกหัวข้อไม่มีปุ่มให้คะแนน', noTopicButtons === 1, noTopicButtons);

  await page.screenshot({ path: OUT + '/km-review-list.png', fullPage: true });

  console.log('\n[2] เปิดฟอร์มให้คะแนน (ยังไม่เคยให้คะแนน)');
  await page.locator('#km-review-rows tr', { hasText: 'สมหญิง' }).getByText('ให้คะแนน').click();
  await page.waitForSelector('#km-score-total');
  check('หัวข้อนำเสนอแสดงถูก', (await page.locator('#km-scoring-content').innerText()).includes('การจัดการสินค้า'));
  check('มี slider ครบ 5 ด้าน', (await page.locator('#km-scoring-content input[type=range]').count()) === 5);
  check('ค่าเริ่มต้น 5 ทุกด้าน → รวม 50/100', (await page.locator('#km-score-total').innerText()) === '50/100');
  check('แสดงลิงก์ไฟล์ที่แนบ', (await page.locator('#km-scoring-content a').count()) >= 1);

  // เนื้อหา 10, ที่เหลือ 5 → 0.15*5*4 + 0.40*10 = 3 + 4 = 7 → 70/100
  await page.locator('#km-score-content').fill('10');
  await page.locator('#km-score-content').dispatchEvent('input');
  check('เลื่อนคะแนนเนื้อหาเป็น 10 → รวม 70/100', (await page.locator('#km-score-total').innerText()) === '70/100',
    await page.locator('#km-score-total').innerText());
  await page.screenshot({ path: OUT + '/km-scoring-modal.png' });

  console.log('\n[3] บันทึกคะแนน');
  await page.locator('#km-score-submit').click();
  await page.waitForSelector('#toast-container div', { timeout: 5000 });
  const toast = await page.locator('#toast-container').innerText();
  check('ขึ้น toast คะแนนรวม 70', toast.includes('70'), toast);

  const scoreCall = calls.filter((c) => c.action === 'scorePresentationKM').pop();
  check('ส่ง userId ของนักศึกษา', scoreCall && scoreCall.userId === 'S1', scoreCall);
  check('ส่งคะแนนครบ 5 ด้าน',
    scoreCall && ['format', 'content', 'timeManagement', 'presentationSkill', 'qaSkill'].every((k) => scoreCall[k] !== undefined),
    scoreCall);
  check('ปิด modal หลังบันทึก', await page.locator('#km-scoring-modal').isHidden());

  console.log('\n[4] แก้ไขคะแนนที่เคยให้ไว้ (prefill)');
  await page.locator('#km-review-rows tr', { hasText: 'สมศักดิ์' }).getByText('แก้ไขคะแนน').click();
  await page.waitForSelector('#km-score-total');
  const vals = await page.locator('#km-scoring-content input[type=range]').evaluateAll((els) => els.map((e) => e.value));
  check('prefill คะแนนเดิม 8/9/7/8/7', JSON.stringify(vals) === '["8","9","7","8","7"]', vals);
  check('รวมตรงกับที่บันทึกไว้ 81/100', (await page.locator('#km-score-total').innerText()) === '81/100',
    await page.locator('#km-score-total').innerText());
  await page.locator('#km-scoring-content button', { hasText: 'ยกเลิก' }).click();
  check('ปุ่มยกเลิกปิด modal', await page.locator('#km-scoring-modal').isHidden());

  console.log('\n[5] ดูบันทึกการเรียนรู้ของนักศึกษา');
  await page.locator('#km-review-rows tr', { hasText: 'สมหญิง' }).getByText('ดูบันทึก').click();
  await page.waitForSelector('#km-entries-content div');
  const entriesText = await page.locator('#km-entries-content').innerText();
  check('แสดงครบ 6 หัวข้อ', (await page.locator('#km-entries-content > div').count()) === 6);
  check('ป้าย "หัวข้อนำเสนอ" อยู่ที่หัวข้อที่เลือก', entriesText.includes('หัวข้อนำเสนอ'));
  check('หัวข้อที่ยังไม่บันทึกขึ้น "ยังไม่ได้บันทึก"', entriesText.includes('ยังไม่ได้บันทึก'));
  check('แสดงไฟล์ที่แนบ', entriesText.includes('km-topic3.pdf'), entriesText.slice(0, 200));
  await page.screenshot({ path: OUT + '/km-entries-modal.png' });

  console.log('\n[6] นักศึกษายังเห็นหน้าเดิม (ไม่ถูกกระทบ)');
  await page.evaluate(() => localStorage.setItem('internship_user', JSON.stringify(
    { id: 'S1', name: 'สมหญิง ตั้งใจ', role: 'STUDENT', email: 's1@x.com', token: 'stub.token' })));
  await page.reload();
  await page.waitForSelector('#topics-grid');
  check('หน้านักศึกษายังเป็นการ์ด 6 หัวข้อ', (await page.locator('#topics-grid > div').count()) === 6);
  check('ไม่มีตารางให้คะแนนในหน้านักศึกษา', await page.locator('#km-review-rows').count() === 0);

  console.log('\n[7] แอดมินเข้าได้และเห็นเมนู KM');
  await page.evaluate(() => localStorage.setItem('internship_user', JSON.stringify(
    { id: 'A1', name: 'ผู้ดูแล ระบบ', role: 'ADMIN', email: 'a1@x.com', token: 'stub.token' })));
  await page.reload();
  await page.waitForSelector('#km-review-rows tr td');
  check('แอดมินเห็นตารางให้คะแนน', (await page.locator('#km-review-rows tr').count()) === 3);
  check('แอดมินเห็นปุ่มตั้งค่ากำหนดการ', await page.locator('button', { hasText: 'ตั้งค่ากำหนดการ' }).count() === 1);
  check('เมนูข้างมี Knowledge Management', (await page.locator('#sidebar').innerText()).includes('Knowledge Management'));

  console.log('\n[8] ไม่มี JS error');
  // sandbox บล็อกทรัพยากรภายนอก (Google Fonts) — ไม่เกี่ยวกับโค้ดหน้าเว็บ
  const appErrors = errors.filter((e) => !/Failed to load resource|ERR_CONNECTION|ERR_TUNNEL/.test(e));
  check('ไม่มี error จากโค้ดหน้าเว็บ', appErrors.length === 0, appErrors.slice(0, 3));

  await browser.close();
  server.close();
  console.log(`\nสรุป: ผ่าน ${pass} / ล้มเหลว ${fail}`);
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => { console.error(e); server.close(); process.exit(1); });
