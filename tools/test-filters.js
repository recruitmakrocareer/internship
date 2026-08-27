/**
 * ทดสอบการกรองข้อมูลที่ router ส่ง params ทั้งก้อนเข้า handler
 *
 * getRows() เทียบทุกคีย์ใน filter กับค่าในแถว (fail closed) ดังนั้น handler ที่รับ
 * params ตรง ๆ ต้องคัดเฉพาะคอลัมน์จริงก่อน ไม่งั้น action/authToken ที่ติดมาจะทำให้
 * ไม่ตรงกับแถวไหนเลย — เป็นสาเหตุที่รายการงานที่ส่งและการประเมินเคยว่างเปล่าทั้งระบบ
 *
 * รวมทั้งตรวจว่าพี่เลี้ยงเห็นงานที่ส่งเฉพาะของนักศึกษาในความดูแล
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const DIR = path.join(__dirname, '..', 'apps-script');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? ' → ' + JSON.stringify(detail) : '')); }
}

const SHEETS = {
  Submissions: [
    ['id', 'assignmentId', 'userId', 'content', 'fileUrl', 'fileName', 'status', 'score', 'feedback', 'submittedAt', 'reviewedAt', 'reviewedBy'],
    ['SUB1', 'A1', 'S5', 'งานของ S5', '', '', 'submitted', '', '', '2026-08-01', '', ''],
    ['SUB2', 'A1', 'S7', 'งานของ S7', '', '', 'submitted', '', '', '2026-08-02', '', ''],
    ['SUB3', 'A2', 'S5', 'งานที่สองของ S5', '', '', 'reviewed', '80', 'ดี', '2026-08-03', '2026-08-04', 'M1']
  ],
  Assignments: [
    ['id', 'title', 'description', 'dueDate', 'maxScore', 'assignedTo', 'createdBy', 'isActive', 'createdAt', 'updatedAt', 'source', 'professorName'],
    ['A1', 'งานที่ 1', '', '2026-08-10', '100', '', 'A1', 'true', '', '', '', ''],
    ['A2', 'งานที่ 2', '', '2026-08-20', '100', '', 'A1', 'true', '', '', '', '']
  ],
  Evaluations: [
    ['id', 'type', 'evaluatorId', 'evaluateeId', 'period', 'scores', 'totalScore', 'maxScore', 'comment', 'createdAt', 'updatedAt'],
    ['E1', 'mentor-to-student', 'M1', 'S5', '2026-08', '{}', '40', '50', 'ok', '2026-08-02', ''],
    ['E2', 'post-internship-survey', 'S5', 'S5', '2026-08', '{}', '45', '50', '', '2026-08-05', '']
  ],
  Users: [
    ['id', 'email', 'password', 'role', 'firstName', 'lastName', 'studentId', 'isActive'],
    ['S5', 's5@x.com', 'h', 'STUDENT', 'สม', 'หญิง', '6401001', 'true'],
    ['S7', 's7@x.com', 'h', 'STUDENT', 'สม', 'ชาย', '6401002', 'true'],
    ['M1', 'm1@x.com', 'h', 'MENTOR', 'พี่', 'เลี้ยง', '', 'true']
  ],
  MentorStudents: [
    ['id', 'mentorId', 'studentId', 'assignedAt', 'isActive'],
    ['MS1', 'M1', 'S5', '2026-07-01', 'true'],
    ['MS2', 'M2', 'S7', '2026-07-01', 'true']
  ]
};

function load() {
  const fakeSheet = (name, values) => ({
    getName: () => name,
    getLastColumn: () => (values[0] ? values[0].length : 0),
    getFrozenRows: () => 1,
    setFrozenRows: () => {},
    getDataRange: () => ({ getValues: () => values.map((r) => r.slice()) }),
    getRange: () => ({
      getValues: () => [values[0] || []],
      setValues: () => {},
      setFontWeight: () => {}
    })
  });

  const sandbox = {
    console, Date, JSON, Math, Object, String, Number, Array, RegExp, Error,
    Logger: { log: () => {} },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    Utilities: { getUuid: () => 'uuid' }
  };

  vm.createContext(sandbox);
  fs.readdirSync(DIR)
    .filter((f) => f.endsWith('.gs') && f !== 'ALL_IN_ONE.gs')
    .forEach((f) => vm.runInContext(fs.readFileSync(path.join(DIR, f), 'utf8'), sandbox, { filename: f }));

  sandbox.getSpreadsheet = () => ({
    getSheetByName: (n) => (SHEETS[n] ? fakeSheet(n, SHEETS[n]) : null),
    insertSheet: (n) => fakeSheet(n, [[]])
  });
  return sandbox;
}

const ids = (res) => (res.data || []).map((r) => r.id).sort();

console.log('\n[1] getSubmissions ผ่าน router (params มี action ปนมา)');
(() => {
  const s = load();
  s.setSessionContext_(null);
  check('ระบุ userId → ได้งานของคนนั้น',
    JSON.stringify(ids(s.getSubmissions({ action: 'getSubmissions', userId: 'S5' }))) === '["SUB1","SUB3"]',
    ids(s.getSubmissions({ action: 'getSubmissions', userId: 'S5' })));
  check('ไม่ระบุ filter → ได้ทั้งหมด',
    ids(s.getSubmissions({ action: 'getSubmissions' })).length === 3,
    ids(s.getSubmissions({ action: 'getSubmissions' })));
  check('มี authToken ปนมาก็ไม่กระทบ',
    ids(s.getSubmissions({ action: 'getSubmissions', authToken: 'abc.def', userId: 'S5' })).length === 2);
  check('กรองด้วย assignmentId',
    JSON.stringify(ids(s.getSubmissions({ action: 'getSubmissions', assignmentId: 'A2' }))) === '["SUB3"]');
  check('กรองด้วย status',
    JSON.stringify(ids(s.getSubmissions({ action: 'getSubmissions', status: 'reviewed' }))) === '["SUB3"]');
  check('เติมชื่อนักศึกษาและชื่องานให้',
    s.getSubmissions({ action: 'getSubmissions', userId: 'S5' }).data[0].studentName.indexOf('สม') === 0);
})();

console.log('\n[2] getEvaluations ผ่าน router');
(() => {
  const s = load();
  s.setSessionContext_(null);
  check('ไม่ระบุ filter → ได้ทั้งหมด', ids(s.getEvaluations({ action: 'getEvaluations' })).length === 2);
  check('กรองด้วย type',
    JSON.stringify(ids(s.getEvaluations({ action: 'getEvaluations', type: 'mentor-to-student' }))) === '["E1"]');
  check('กรองด้วย evaluateeId + authToken ปนมา',
    ids(s.getEvaluations({ action: 'getEvaluations', authToken: 'x.y', evaluateeId: 'S5' })).length === 2);
  check('ค่ากรองว่างถูกมองข้าม (ไม่กลายเป็นกรองด้วยค่าว่าง)',
    ids(s.getEvaluations({ action: 'getEvaluations', type: '' })).length === 2);
})();

console.log('\n[3] พี่เลี้ยงเห็นงานที่ส่งเฉพาะนักศึกษาในความดูแล');
(() => {
  const s = load();
  s.setSessionContext_({ userId: 'M1', role: 'MENTOR' });
  check('ไม่ระบุ userId → เหลือแต่งานของ S5',
    JSON.stringify(ids(s.getSubmissions({ action: 'getSubmissions' }))) === '["SUB1","SUB3"]',
    ids(s.getSubmissions({ action: 'getSubmissions' })));

  s.setSessionContext_({ userId: 'A1', role: 'ADMIN' });
  check('แอดมินยังเห็นทั้งหมด', ids(s.getSubmissions({ action: 'getSubmissions' })).length === 3);

  s.setSessionContext_({ userId: 'S5', role: 'STUDENT' });
  check('นักศึกษา (ถูก gate บังคับ userId มาแล้ว) เห็นของตัวเอง',
    ids(s.getSubmissions({ action: 'getSubmissions', userId: 'S5' })).length === 2);
})();

console.log('\n[4] sheetFilter_');
(() => {
  const s = load();
  check('ตัดคีย์ที่ไม่ใช่คอลัมน์ออก',
    JSON.stringify(s.sheetFilter_('Submissions', { action: 'x', authToken: 't', userId: 'S5' }, ['userId', 'status']))
      === '{"userId":"S5"}');
  check('ตัดค่าว่างออก',
    JSON.stringify(s.sheetFilter_('Submissions', { userId: '', status: 'submitted' }, ['userId', 'status']))
      === '{"status":"submitted"}');
  check('ฟิลด์ที่ขออนุญาตแต่ไม่มีในชีทถูกข้าม',
    JSON.stringify(s.sheetFilter_('Submissions', { notAColumn: 'v' }, ['notAColumn'])) === '{}');
  check('params ว่าง → filter ว่าง', JSON.stringify(s.sheetFilter_('Submissions', null, ['userId'])) === '{}');
})();

console.log(`\nสรุป: ผ่าน ${pass} / ล้มเหลว ${fail}`);
process.exit(fail === 0 ? 0 : 1);
