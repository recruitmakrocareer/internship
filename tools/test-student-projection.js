/**
 * ทดสอบการย่อข้อมูลใน "รายการนักศึกษา" (getStudents / getStudentsByMentor)
 *
 * เดิม 2 action นี้ส่งแถวผู้ใช้ทั้งแถว (80 คอลัมน์) ให้หน้ารายการที่ใช้จริงไม่ถึง 30
 * รวมข้อมูลอ่อนไหวที่หน้ารายการไม่ได้ใช้เลย เช่น เลขบัตรประชาชน วันเกิด ที่อยู่
 * ประวัติสุขภาพ สถานะทหาร ซึ่งไม่ควรถูกส่งออกไปโดยไม่จำเป็น
 *
 * เทสต์นี้ตรวจ 2 ด้าน:
 *   1. backend ส่งเฉพาะฟิลด์ใน STUDENT_LIST_FIELDS_ (+ mentor/assignedAt)
 *   2. โค้ดหน้าเว็บที่วาดรายการ ไม่ได้อ้างถึงฟิลด์ที่ถูกตัดออกไป
 *      (ถ้าหน้าไหนต้องใช้เพิ่ม ต้องดึงเต็มด้วย getStudent/getUserProfile ไม่ใช่ขยาย list)
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const DIR = path.join(__dirname, '..', 'apps-script');
const PAGES = path.join(__dirname, '..', 'docs', 'js', 'pages');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? ' → ' + JSON.stringify(detail) : '')); }
}

/** ฟิลด์อ่อนไหวที่ต้องไม่หลุดออกไปกับรายการ */
const SENSITIVE = ['password', 'idCardNumber', 'birthDate', 'address', 'currentAddress',
  'idCardAddress', 'militaryStatus', 'medicalCondition', 'gpa', 'advisorName', 'advisorContact',
  'preferredBranch1', 'preferredDept1', 'lineUserId', 'skills', 'interests'];

function load() {
  const sheets = {
    Users: [
      ['id', 'email', 'password', 'role', 'firstName', 'lastName', 'studentId', 'department',
       'phone', 'lineUserId', 'profileImage', 'isActive', 'createdAt', 'updatedAt', 'prefix',
       'nickname', 'birthDate', 'idCardNumber', 'university', 'faculty', 'major', 'year', 'gpa',
       'internshipType', 'startDate', 'endDate', 'address', 'skills', 'interests', 'advisorName',
       'advisorContact', 'branch', 'position', 'cvFileUrl', 'photoFileUrl', 'name',
       'currentAddress', 'militaryStatus', 'medicalCondition', 'preferredBranch1', 'preferredDept1'],
      ['S1', 's1@x.com', 'hash', 'STUDENT', 'สมหญิง', 'ตั้งใจ', '6401001', 'Fresh Food',
       '0800000001', 'U123', '', 'true', '2026-07-01', '', 'นางสาว',
       'หญิง', '2004-01-01', '1234567890123', 'ม.ทดสอบ', 'วิทยาศาสตร์', 'คอมพิวเตอร์', '3', '3.45',
       'สหกิจ', '2026-07-01', '2026-11-01', 'ที่อยู่เต็ม', 'JS', 'AI', 'อ.ที่ปรึกษา',
       '0900000000', 'สาขาลาดพร้าว', '', 'https://drive/cv', 'https://drive/photo', 'สมหญิง ตั้งใจ',
       'ที่อยู่ปัจจุบัน', 'ผ่านการเกณฑ์', 'ไม่มี', 'สาขา A', 'แผนก A'],
      ['M1', 'm1@x.com', 'hash', 'MENTOR', 'พี่', 'เลี้ยง', '', 'Fresh Food',
       '0800000002', '', '', 'true', '', '', '', '', '', '', '', '', '', '', '',
       '', '', '', '', '', '', '', '', '', '', '', '', 'พี่ เลี้ยง', '', '', '', '', '']
    ],
    MentorStudents: [
      ['id', 'mentorId', 'studentId', 'assignedAt', 'isActive'],
      ['MS1', 'M1', 'S1', '2026-07-01', 'true']
    ]
  };

  const fakeSheet = (name) => ({
    getName: () => name,
    getLastColumn: () => sheets[name][0].length,
    getFrozenRows: () => 1,
    setFrozenRows: () => {},
    getDataRange: () => ({ getValues: () => sheets[name].map((r) => r.slice()) }),
    getRange: (row, col, nr, nc) => ({
      getValues: () => [sheets[name][row - 1].slice(0, nc)],
      setValues: () => {},
      setFontWeight: () => {}
    })
  });

  const sandbox = {
    console, Date, JSON, Math, Object, String, Number, Array, RegExp, Error,
    Logger: { log: () => {} },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    Utilities: { getUuid: () => 'u' }
  };
  vm.createContext(sandbox);
  ['Config.gs', 'Database.gs', 'UserService.gs'].forEach((f) => {
    vm.runInContext(fs.readFileSync(path.join(DIR, f), 'utf8'), sandbox, { filename: f });
  });
  sandbox.getSpreadsheet = () => ({
    getSheetByName: (n) => (sheets[n] ? fakeSheet(n) : null),
    insertSheet: (n) => { sheets[n] = [[]]; return fakeSheet(n); }
  });
  return sandbox;
}

const sb = load();
const allowed = sb.STUDENT_LIST_FIELDS_;

console.log('\n[1] getStudents ส่งเฉพาะฟิลด์ของรายการ');
(() => {
  const res = sb.getStudents();
  check('สำเร็จและได้นักศึกษา 1 คน', res.success === true && res.data.length === 1, res.data && res.data.length);

  const s = res.data[0];
  const extraKeys = Object.keys(s).filter((k) => allowed.indexOf(k) === -1 && k !== 'mentor');
  check('ไม่มีฟิลด์นอกรายการที่กำหนด', extraKeys.length === 0, extraKeys);

  const leaked = SENSITIVE.filter((f) => s[f] !== undefined);
  check('ไม่มีข้อมูลอ่อนไหวหลุดออกมา', leaked.length === 0, leaked);

  check('ยังมีฟิลด์ที่ตารางต้องใช้',
    s.id === 'S1' && s.studentId === '6401001' && s.name === 'สมหญิง ตั้งใจ' &&
    s.department === 'Fresh Food' && s.university === 'ม.ทดสอบ' && s.startDate === '2026-07-01' &&
    s.internshipType === 'สหกิจ' && s.isActive === 'true' && s.photoFileUrl === 'https://drive/photo', s);
  check('ยังแนบข้อมูลพี่เลี้ยงมาด้วย', s.mentor && s.mentor.id === 'M1', s.mentor);
})();

console.log('\n[2] getStudentsByMentor ก็ย่อเหมือนกัน');
(() => {
  const res = sb.getStudentsByMentor('M1');
  check('ได้นักศึกษาในความดูแล 1 คน', res.success === true && res.data.length === 1, res.data && res.data.length);

  const s = res.data[0];
  const extraKeys = Object.keys(s).filter((k) => allowed.indexOf(k) === -1 && k !== 'assignedAt');
  check('ไม่มีฟิลด์นอกรายการที่กำหนด', extraKeys.length === 0, extraKeys);
  check('ไม่มีข้อมูลอ่อนไหว (พี่เลี้ยงไม่ควรเห็นเลขบัตร/ประวัติสุขภาพในหน้ารายการ)',
    SENSITIVE.every((f) => s[f] === undefined), SENSITIVE.filter((f) => s[f] !== undefined));
  check('มีวันที่มอบหมาย', s.assignedAt === '2026-07-01', s.assignedAt);
  check('มีฟิลด์ที่การ์ดนักศึกษาใช้',
    s.photoFileUrl && s.university && s.major && s.email && s.phone && s.cvFileUrl, s);
})();

console.log('\n[3] getStudent ยังคืนข้อมูลเต็ม (หน้ารายละเอียด/พิมพ์ใช้ตัวนี้)');
(() => {
  const res = sb.getStudent('S1');
  check('คืนข้อมูลเต็ม', res.success === true && res.data.idCardNumber === '1234567890123', res.data && Object.keys(res.data).length);
  check('ไม่มี password', res.data.password === undefined);
  check('มีข้อมูลพี่เลี้ยง', res.data.mentor && res.data.mentor.id === 'M1');
})();

console.log('\n[4] โค้ดหน้าเว็บที่วาดรายการ ต้องไม่อ้างถึงฟิลด์ที่ถูกตัด');
(() => {
  // ฟังก์ชันที่กินผลจาก getStudents / getStudentsByMentor โดยตรง
  // (viewStudentDetail / printStudentProfile / openEditStudentModal ไม่อยู่ในนี้
  //  เพราะดึงข้อมูลเต็มเองด้วย getStudent)
  const CONSUMERS = {
    'admin-students.js': ['loadStudents', 'applyStudentPeriodFilter', 'renderStudentsTable',
      'deriveStudentStatusLabel', 'studentStatusBadge'],
    'dashboard.js': ['_adminFilteredStudents', '_adminCountBy', 'renderAdminStudentBreakdown',
      'renderAdminUpcomingInterns', 'renderAdminStatsCharts'],
    'admin-mentors.js': ['openMentorStudentsModal', 'openAssignStudentModal'],
    'mentor-students.js': ['loadMentorStudents']
  };

  const userFields = fs.readFileSync(path.join(DIR, 'Config.gs'), 'utf8')
    .match(/Users:\s*\[([\s\S]*?)\n {4}\]/)[1]
    .split(',').map((x) => x.trim().replace(/^'|'$/g, '')).filter(Boolean);

  Object.keys(CONSUMERS).forEach((file) => {
    const lines = fs.readFileSync(path.join(PAGES, file), 'utf8').split('\n');
    const starts = [];
    lines.forEach((l, i) => {
      const m = l.match(/^(?:async )?function ([A-Za-z0-9_]+)/);
      if (m) starts.push({ name: m[1], line: i });
    });

    CONSUMERS[file].forEach((fnName) => {
      const idx = starts.findIndex((s) => s.name === fnName);
      if (idx === -1) {
        check(file + ' → ' + fnName + ' (ยังมีอยู่ในไฟล์)', false, 'ไม่พบฟังก์ชัน — อาจถูกเปลี่ยนชื่อ ต้องอัปเดตเทสต์');
        return;
      }
      const end = idx + 1 < starts.length ? starts[idx + 1].line : lines.length;
      const code = lines.slice(starts[idx].line, end).join('\n');

      const missing = userFields.filter((f) =>
        allowed.indexOf(f) === -1 && new RegExp('[.\\[\'"]' + f + '\\b').test(code));
      check(file + ' → ' + fnName + ' ใช้เฉพาะฟิลด์ที่ list ส่งมา', missing.length === 0, missing);
    });
  });
})();

console.log(`\nสรุป: ผ่าน ${pass} / ล้มเหลว ${fail}`);
process.exit(fail === 0 ? 0 : 1);
