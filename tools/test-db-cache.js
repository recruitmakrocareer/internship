/**
 * ทดสอบแคชการอ่านชีทระดับ request ใน Database.gs
 *
 * getRowById() อ่านทั้งชีทหนึ่งครั้งต่อการเรียกหนึ่งครั้ง และหลาย handler เรียกมันในลูป
 * (getSubmissions, getEvaluations, getStudentsByMentor, ภาพรวม Passport/KM) ทำให้
 * รายการไม่กี่สิบแถวกลายเป็นการอ่านชีทเป็นร้อยครั้ง ซึ่งเป็นงานที่ช้าที่สุดใน Apps Script
 *
 * เทสต์นี้นับจำนวนครั้งที่แตะ sheet.getDataRange() จริง และยืนยันว่า
 *   - อ่านชีทเดียวกันซ้ำในหนึ่ง request = อ่านจริงครั้งเดียว
 *   - เขียนข้อมูลแล้วต้องเห็นค่าใหม่ทันที (แคชถูกล้าง)
 *   - ผู้เรียกแก้ object ที่ได้ ต้องไม่กระทบการอ่านครั้งถัดไป
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

function load() {
  const reads = {};
  const sheets = {
    Users: [
      ['id', 'email', 'password', 'role', 'firstName', 'lastName', 'isActive'],
      ['S1', 's1@x.com', 'h1', 'STUDENT', 'สม', 'หญิง', 'true'],
      ['S2', 's2@x.com', 'h2', 'STUDENT', 'สม', 'ชาย', 'true'],
      ['M1', 'm1@x.com', 'h3', 'MENTOR', 'พี่', 'เลี้ยง', 'true']
    ],
    Assignments: [
      ['id', 'title', 'description', 'dueDate', 'maxScore', 'assignedTo', 'createdBy', 'isActive', 'createdAt', 'updatedAt', 'source', 'professorName'],
      ['A1', 'งานที่ 1', '', '', '100', '', 'A1', 'true', '', '', '', '']
    ],
    Submissions: [
      ['id', 'assignmentId', 'userId', 'content', 'fileUrl', 'fileName', 'status', 'score', 'feedback', 'submittedAt', 'reviewedAt', 'reviewedBy'],
      ['SUB1', 'A1', 'S1', 'งาน 1', '', '', 'submitted', '', '', '2026-08-01', '', ''],
      ['SUB2', 'A1', 'S2', 'งาน 2', '', '', 'submitted', '', '', '2026-08-02', '', ''],
      ['SUB3', 'A1', 'S1', 'งาน 3', '', '', 'submitted', '', '', '2026-08-03', '', '']
    ]
  };

  const fakeSheet = (name) => ({
    getName: () => name,
    getLastColumn: () => (sheets[name][0] ? sheets[name][0].length : 0),
    getFrozenRows: () => 1,
    setFrozenRows: () => {},
    getDataRange: () => {
      reads[name] = (reads[name] || 0) + 1;
      return { getValues: () => sheets[name].map((r) => r.slice()) };
    },
    getRange: (row, col, numRows, numCols) => ({
      getValues: () => [sheets[name][row - 1].slice(0, numCols)],
      setValues: (vals) => { sheets[name][row - 1] = vals[0].slice(); },
      setFontWeight: () => {}
    }),
    appendRow: (row) => { sheets[name].push(row.slice()); },
    deleteRow: (rowIndex) => { sheets[name].splice(rowIndex - 1, 1); }
  });

  const sandbox = {
    console, Date, JSON, Math, Object, String, Number, Array, RegExp, Error,
    Logger: { log: () => {} },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    Utilities: { getUuid: () => 'uuid-' + Object.keys(reads).length }
  };
  vm.createContext(sandbox);
  ['Config.gs', 'Database.gs'].forEach((f) => {
    vm.runInContext(fs.readFileSync(path.join(DIR, f), 'utf8'), sandbox, { filename: f });
  });
  sandbox.getSpreadsheet = () => ({
    getSheetByName: (n) => (sheets[n] ? fakeSheet(n) : null),
    insertSheet: (n) => { sheets[n] = [[]]; return fakeSheet(n); }
  });

  return { sandbox, reads, sheets };
}

console.log('\n[1] อ่านชีทเดียวกันหลายครั้งใน request เดียว');
(() => {
  const { sandbox, reads } = load();
  sandbox.getRowById('Users', 'S1');
  sandbox.getRowById('Users', 'S2');
  sandbox.getRowById('Users', 'M1');
  sandbox.getAllRows('Users');
  sandbox.getRows('Users', { role: 'STUDENT' });
  check('5 การเรียก → แตะชีทจริงครั้งเดียว', reads.Users === 1, reads);
  check('ข้อมูลถูกต้อง', sandbox.getRowById('Users', 'S2').email === 's2@x.com');
  check('ยังไม่มีการอ่านเพิ่ม', reads.Users === 1, reads);
})();

console.log('\n[2] จำลอง getSubmissions (N+1 เดิม)');
(() => {
  const { sandbox, reads } = load();
  const subs = sandbox.getAllRows('Submissions');
  subs.forEach((s) => {
    sandbox.getRowById('Users', s.userId);
    sandbox.getRowById('Assignments', s.assignmentId);
  });
  const total = (reads.Users || 0) + (reads.Assignments || 0) + (reads.Submissions || 0);
  check('3 แถว → อ่านชีทรวม 3 ครั้ง (เดิม 7 ครั้ง)', total === 3, reads);
})();

console.log('\n[3] เขียนข้อมูลแล้วต้องเห็นค่าใหม่ทันที');
(() => {
  const { sandbox, reads } = load();
  sandbox.getAllRows('Users');
  check('อ่านครั้งแรก 1 ครั้ง', reads.Users === 1, reads);

  sandbox.updateRow('Users', 'S1', { firstName: 'สมหญิงใหม่' });
  check('updateRow: เห็นค่าที่แก้ทันที', sandbox.getRowById('Users', 'S1').firstName === 'สมหญิงใหม่',
    sandbox.getRowById('Users', 'S1').firstName);
  // 3 = อ่านครั้งแรก + updateRow อ่านเองเพื่อหาแถว (ทำใน lock จึงต้องอ่านสด) + อ่านใหม่หลังแคชถูกล้าง
  check('updateRow: อ่านชีทใหม่หลังล้างแคช', reads.Users === 3, reads);

  sandbox.appendRow('Users', { id: 'S9', email: 's9@x.com', role: 'STUDENT', isActive: 'true' });
  check('appendRow: เห็นแถวใหม่ทันที', !!sandbox.getRowById('Users', 'S9'));
  check('appendRow: จำนวนแถวเพิ่มขึ้น', sandbox.getAllRows('Users').length === 4,
    sandbox.getAllRows('Users').length);

  sandbox.deleteRow('Users', 'S9');
  check('deleteRow: แถวหายไปทันที', sandbox.getRowById('Users', 'S9') === null);
  check('deleteRow: จำนวนแถวกลับเป็น 3', sandbox.getAllRows('Users').length === 3);
})();

console.log('\n[4] แคชแยกตามชีท');
(() => {
  const { sandbox, reads } = load();
  sandbox.getAllRows('Users');
  sandbox.getAllRows('Submissions');
  sandbox.updateRow('Submissions', 'SUB1', { status: 'reviewed' });
  sandbox.getAllRows('Users');
  sandbox.getAllRows('Submissions');
  check('เขียนชีท Submissions ไม่ล้างแคชของ Users', reads.Users === 1, reads);
  // 3 = อ่านครั้งแรก + updateRow อ่านเองในlock + อ่านใหม่หลังแคชถูกล้าง
  check('ชีท Submissions ถูกอ่านใหม่', reads.Submissions === 3, reads);
})();

console.log('\n[5] ผู้เรียกแก้ object ที่ได้ ต้องไม่เปื้อนแคช');
(() => {
  const { sandbox } = load();
  const user = sandbox.getRowById('Users', 'S1');
  delete user.password;          // getStudentsByMentor ทำแบบนี้
  user.studentName = 'เปื้อน';    // getSubmissions ทำแบบนี้

  const again = sandbox.getRowById('Users', 'S1');
  check('password ยังอยู่ในการอ่านครั้งถัดไป', again.password === 'h1', again);
  check('ฟิลด์ที่ผู้เรียกเพิ่มไม่ติดมาด้วย', again.studentName === undefined, again);

  const rows = sandbox.getAllRows('Users');
  rows[0].email = 'changed@x.com';
  check('getAllRows คืนสำเนาใหม่ทุกครั้ง', sandbox.getAllRows('Users')[0].email === 's1@x.com');
})();

console.log('\n[6] countRows / searchRows ใช้แคชร่วมกัน');
(() => {
  const { sandbox, reads } = load();
  sandbox.countRows('Users', { role: 'STUDENT' });
  sandbox.searchRows('Users', 'email', 's1');
  sandbox.getRows('Users', { isActive: 'true' });
  check('อ่านชีทจริงครั้งเดียว', reads.Users === 1, reads);
  check('countRows ได้ 2 นักศึกษา', sandbox.countRows('Users', { role: 'STUDENT' }) === 2);
  check('searchRows หาเจอ', sandbox.searchRows('Users', 'email', 's1').length === 1);
})();

console.log(`\nสรุป: ผ่าน ${pass} / ล้มเหลว ${fail}`);
process.exit(fail === 0 ? 0 : 1);
