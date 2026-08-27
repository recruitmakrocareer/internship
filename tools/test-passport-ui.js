/**
 * Smoke test หน้า Training Passport
 *
 * โฟกัสที่บั๊กเดิม: หน้านี้เคยโหลดและลงชื่อ passport ของ "ผู้ล็อกอิน" เสมอ
 * ทำให้พี่เลี้ยงกดลงชื่อผู้ฝึกสอนแล้วไปเซ็นแถวของตัวเอง ไม่ใช่ของนักศึกษา
 *
 * วิธีรัน: npm run test:ui:passport (ต้องติดตั้ง playwright — ดู tools/ui-harness.js)
 */
'use strict';
const { startUiHarness, createChecker } = require('./ui-harness');

const { check, finish } = createChecker();

const STEPS = [0, 1, 2, 3].map((n) => ({
  id: 'STEP' + n, stepNumber: n, title: 'สัปดาห์ที่ ' + n, description: 'หัวข้อสัปดาห์ ' + n, isActive: 'true'
}));

const ROADMAPS = [{
  id: 'RM1', title: 'Training Passport - Makro Fresh Food (16 สัปดาห์)',
  description: '', department: 'Fresh Food', isActive: 'true', steps: STEPS
}];

const BY_MENTOR = [
  { userId: 'S5', name: 'สมหญิง ตั้งใจ', studentId: '6401001', department: 'Fresh Food',
    passport: { totalWeeks: 17, completedWeeks: 4, currentWeek: 5, progressPercent: 24, pendingTrainerSignOffs: 2, pendingStudentSignOffs: 0 } },
  { userId: 'S6', name: 'สมศักดิ์ ขยัน', studentId: '6401002', department: 'Dry Food',
    passport: { totalWeeks: 17, completedWeeks: 17, currentWeek: 0, progressPercent: 100, pendingTrainerSignOffs: 0, pendingStudentSignOffs: 0 } }
];

const OVERVIEW = BY_MENTOR.concat([
  { userId: 'S9', name: 'สมชาย เรียบร้อย', studentId: '6401003', department: 'Fresh Food',
    passport: { totalWeeks: 17, completedWeeks: 1, currentWeek: 2, progressPercent: 6, pendingTrainerSignOffs: 5, pendingStudentSignOffs: 1 } }
]);

const PROFILES = {
  S5: { id: 'S5', firstName: 'สมหญิง', lastName: 'ตั้งใจ', name: 'สมหญิง ตั้งใจ', email: 's5@x.com' },
  S6: { id: 'S6', firstName: 'สมศักดิ์', lastName: 'ขยัน', name: 'สมศักดิ์ ขยัน', email: 's6@x.com' }
};

/** ความคืบหน้าของ S5: สัปดาห์ 0 ผ่านแล้ว, สัปดาห์ 1 กำลังเรียนรู้ (ยังไม่มีผู้ฝึกสอนลงชื่อ) */
const PROGRESS_S5 = [
  { id: 'P1', userId: 'S5', roadmapId: 'RM1', stepId: 'STEP0', status: 'COMPLETED', evalResult: 'PASS',
    note: JSON.stringify({ trainerSigned: true, trainerDate: '2026-07-01', studentSigned: true, studentDate: '2026-07-01' }) },
  { id: 'P2', userId: 'S5', roadmapId: 'RM1', stepId: 'STEP1', status: 'IN_PROGRESS', evalResult: '',
    note: JSON.stringify({ trainerSigned: false, trainerDate: '', studentSigned: false, studentDate: '' }) }
];

function api(params) {
  switch (params.action) {
    case 'getRoadmaps': return { success: true, data: ROADMAPS };
    case 'getRoadmapProgress': return { success: true, data: params.userId === 'S5' ? PROGRESS_S5 : [] };
    case 'getUserProfile': return { success: true, data: PROFILES[params.userId] || { id: params.userId, name: params.userId } };
    case 'getTrainingPassportByMentor': return { success: true, data: BY_MENTOR };
    case 'getTrainingPassportOverview': return { success: true, data: OVERVIEW };
    case 'signOffWeek': return { success: true, message: 'ลงชื่อสำเร็จ' };
    case 'updateRoadmapProgress': return { success: true, message: 'อัพเดทสำเร็จ' };
    default: return { success: true, data: [] };
  }
}

(async () => {
  const h = await startUiHarness({ api, port: 8097 });
  const page = h.page;

  await page.goto(h.url());

  console.log('\n[1] พี่เลี้ยงเปิด Training Passport → ต้องเจอรายชื่อนักศึกษาก่อน');
  await h.login({ id: 'M1', name: 'พี่เลี้ยง ใจดี', role: 'MENTOR', email: 'm1@x.com', token: 'stub.token' });
  await h.open('#training-passport');
  await page.waitForSelector('#passport-picker-rows tr td');

  const byMentorCall = h.calls.filter((c) => c.action === 'getTrainingPassportByMentor').pop();
  check('เรียก getTrainingPassportByMentor ด้วย mentorId ของตัวเอง', byMentorCall && byMentorCall.mentorId === 'M1', byMentorCall);
  check('ไม่เรียก getTrainingPassportOverview (ของแอดมิน)', !h.calls.some((c) => c.action === 'getTrainingPassportOverview'));
  check('ไม่โหลด timeline ทันที (ยังไม่ได้เลือกนักศึกษา)', (await page.locator('#timeline-container').count()) === 0);

  const rowCount = await page.locator('#passport-picker-rows tr').count();
  check('แสดงนักศึกษา 2 คน', rowCount === 2, rowCount);
  const firstRow = await page.locator('#passport-picker-rows tr').first().innerText();
  check('เรียงคนที่มีสัปดาห์รอลงชื่อขึ้นก่อน (สมหญิง)', firstRow.includes('สมหญิง'), firstRow);
  check('แสดงจำนวนสัปดาห์ที่รอลงชื่อ', firstRow.includes('2 สัปดาห์'), firstRow);
  check('แสดงสัปดาห์ปัจจุบัน', firstRow.includes('สัปดาห์ที่ 5'), firstRow);

  const stats = await page.locator('#passport-picker-stats').innerText();
  check('การ์ดสรุป: 2 คน / เฉลี่ย 62% / รอลงชื่อ 2 / ฝึกครบ 1',
    /2/.test(stats) && /62%/.test(stats) && /1/.test(stats), stats.replace(/\n/g, ' | '));
  await h.screenshot('passport-picker.png', true);

  console.log('\n[2] เปิด Passport ของนักศึกษา → ต้องใช้ id ของนักศึกษา ไม่ใช่ของพี่เลี้ยง');
  await page.locator('#passport-picker-rows tr', { hasText: 'สมหญิง' }).getByText('เปิด Passport').click();
  await page.waitForSelector('#timeline-container .bg-white');

  const progressCalls = h.calls.filter((c) => c.action === 'getRoadmapProgress');
  const lastProgress = progressCalls[progressCalls.length - 1];
  check('getRoadmapProgress ใช้ userId ของนักศึกษา (S5)', lastProgress && lastProgress.userId === 'S5', lastProgress);
  check('ไม่มีการเรียกด้วย id ของพี่เลี้ยง (M1)', !progressCalls.some((c) => c.userId === 'M1'),
    progressCalls.map((c) => c.userId));
  check('hash มี userId ของนักศึกษา', page.url().includes('userId=S5'), page.url());
  check('หัวข้อหน้าแสดงชื่อนักศึกษา',
    (await page.locator('#passport-student-name').innerText()).includes('สมหญิง'),
    await page.locator('#passport-student-name').innerText());
  check('มีลิงก์กลับไปรายชื่อ', (await page.locator('a', { hasText: 'กลับไปรายชื่อนักศึกษา' }).count()) === 1);
  check('ความคืบหน้าคำนวณจากข้อมูลของนักศึกษา (1 จาก 4 สัปดาห์ = 25%)',
    (await page.locator('#progress-pct').innerText()) === '25%', await page.locator('#progress-pct').innerText());

  console.log('\n[3] ลงชื่อผู้ฝึกสอน → ต้องเซ็นแถวของนักศึกษา');
  await page.locator('#timeline-container .bg-white').nth(1).click();
  await page.waitForSelector('#modal-content');
  const modalText = await page.locator('#modal-content').innerText();
  check('ช่องนักศึกษาแสดงชื่อนักศึกษา ไม่ใช่ชื่อพี่เลี้ยง',
    modalText.includes('สมหญิง') && !modalText.includes('พี่เลี้ยง ใจดี'), modalText.slice(0, 300));
  check('มีปุ่มลงชื่อผู้ฝึกสอน', (await page.locator('#modal-content button', { hasText: 'ลงชื่อผู้ฝึกสอน' }).count()) === 1);

  await page.locator('#modal-content button', { hasText: 'ลงชื่อผู้ฝึกสอน' }).click();
  await page.waitForFunction(() => window.__signOffDone === undefined
    ? document.querySelectorAll('#toast-container div').length > 0 : true);
  const signCall = h.calls.filter((c) => c.action === 'signOffWeek').pop();
  check('signOffWeek ส่ง userId ของนักศึกษา', signCall && signCall.userId === 'S5', signCall);
  check('signOffWeek ส่ง role = trainer', signCall && signCall.role === 'trainer', signCall);
  check('signOffWeek ส่ง stepId ของสัปดาห์ที่เลือก', signCall && signCall.stepId === 'STEP1', signCall);

  console.log('\n[4] อัปเดตสถานะและบันทึกหมายเหตุก็ต้องเป็นของนักศึกษา');
  await page.locator('#timeline-container .bg-white').nth(2).click();
  await page.waitForSelector('#modal-content');
  await page.locator('#modal-content button', { hasText: 'กำลังเรียนรู้' }).click();
  await page.waitForTimeout(300);
  const updCall = h.calls.filter((c) => c.action === 'updateRoadmapProgress').pop();
  check('updateRoadmapProgress ใช้ userId ของนักศึกษา', updCall && updCall.userId === 'S5', updCall);

  console.log('\n[5] นักศึกษายังเห็น passport ของตัวเองทันที (ไม่มีหน้าเลือกคน)');
  await h.login({ id: 'S5', name: 'สมหญิง ตั้งใจ', role: 'STUDENT', email: 's5@x.com', token: 'stub.token' });
  await h.open('#training-passport');
  await page.waitForSelector('#timeline-container .bg-white');
  check('ไม่มีตารางเลือกนักศึกษา', (await page.locator('#passport-picker-rows').count()) === 0);
  check('ไม่มีลิงก์กลับไปรายชื่อ', (await page.locator('a', { hasText: 'กลับไปรายชื่อนักศึกษา' }).count()) === 0);
  const studentProgressCall = h.calls.filter((c) => c.action === 'getRoadmapProgress').pop();
  check('โหลดด้วย id ของตัวเอง', studentProgressCall.userId === 'S5', studentProgressCall);

  await page.locator('#timeline-container .bg-white').nth(1).click();
  await page.waitForSelector('#modal-content');
  check('นักศึกษาไม่เห็นปุ่มลงชื่อผู้ฝึกสอน',
    (await page.locator('#modal-content button', { hasText: 'ลงชื่อผู้ฝึกสอน' }).count()) === 0);

  console.log('\n[6] แอดมินเห็นภาพรวมนักศึกษาทั้งหมด');
  await h.login({ id: 'A1', name: 'ผู้ดูแล ระบบ', role: 'ADMIN', email: 'a1@x.com', token: 'stub.token' });
  await h.open('#training-passport');
  await page.waitForSelector('#passport-picker-rows tr td');
  check('เรียก getTrainingPassportOverview', h.calls.some((c) => c.action === 'getTrainingPassportOverview'));
  check('เห็นนักศึกษา 3 คน', (await page.locator('#passport-picker-rows tr').count()) === 3);
  check('เมนูข้างมี Training Passport', (await page.locator('#sidebar').innerText()).includes('Training Passport'));

  console.log('\n[7] ไม่มี JS error');
  check('ไม่มี error จากโค้ดหน้าเว็บ', h.appErrors().length === 0, h.appErrors().slice(0, 3));

  await h.close();
  finish();
})().catch((e) => { console.error(e); process.exit(1); });
