/**
 * ทดสอบชั้นตรวจสิทธิ์ (Session.gs) โดยจำลอง runtime ของ Apps Script ด้วย node vm
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const crypto = require('crypto');
const path = require('path');

const DIR = path.join(__dirname, '..', 'apps-script');

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

let adminRows = [];

const sandbox = {
  console,
  Date,
  JSON,
  Math,
  Object,
  String,
  Number,
  Array,
  RegExp,
  Error,
  Logger: { log: () => {} },
  Utilities: {
    getUuid: () => crypto.randomUUID(),
    computeHmacSha256Signature: (value, key) =>
      Array.from(crypto.createHmac('sha256', key).update(String(value), 'utf8').digest()),
    base64EncodeWebSafe: (v) => b64url(typeof v === 'string' ? Buffer.from(v, 'utf8') : Buffer.from(v)),
    base64DecodeWebSafe: (s) => Array.from(Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64')),
    newBlob: (bytes) => ({ getDataAsString: () => Buffer.from(bytes).toString('utf8') }),
    computeDigest: () => [],
    DigestAlgorithm: { SHA_256: 'SHA_256' }
  },
  PropertiesService: (() => {
    const store = {};
    const api = {
      getProperty: (k) => (k in store ? store[k] : null),
      setProperty: (k, v) => { store[k] = v; return api; },
      deleteProperty: (k) => { delete store[k]; return api; }
    };
    return { getScriptProperties: () => api, getUserProperties: () => api };
  })(),
  // Database layer stub — ใช้แค่ตอนเช็ค bootstrap ของ setupSystem
  getRows: (sheet, filter) => (filter && filter.role === 'ADMIN' ? adminRows : [])
};

vm.createContext(sandbox);
['Config.gs', 'Session.gs'].forEach((f) => {
  vm.runInContext(fs.readFileSync(path.join(DIR, f), 'utf8'), sandbox, { filename: f });
});

const mint = (id, role, ttlMs) => {
  const payload = { u: id, r: role, e: Date.now() + (ttlMs === undefined ? 3600000 : ttlMs) };
  const p = sandbox.base64Url_(JSON.stringify(payload));
  return p + '.' + sandbox.signSessionPayload_(p);
};

const studentToken = mint('S1', 'STUDENT');
const mentorToken = mint('M1', 'MENTOR');
const adminToken = mint('A1', 'ADMIN');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (detail ? ' → ' + JSON.stringify(detail) : '')); }
}

function gate(action, params) {
  const p = Object.assign({ action: action }, params);
  const res = sandbox.authorizeRequest_(action, p);
  return { res, params: p };
}

console.log('\n[1] ผู้ไม่ล็อกอิน');
check('getStudents ถูกปฏิเสธ', gate('getStudents', {}).res.code === 'UNAUTHORIZED');
check('getUserProfile ถูกปฏิเสธ', gate('getUserProfile', { userId: 'S1' }).res.code === 'UNAUTHORIZED');
check('getAdminStats ถูกปฏิเสธ', gate('getAdminStats', { userId: 'A1' }).res.code === 'UNAUTHORIZED');
check('updateStudent ถูกปฏิเสธ', gate('updateStudent', { id: 'S1', role: 'ADMIN' }).res.code === 'UNAUTHORIZED');
check('login เข้าได้ (public)', gate('login', {}).res.allowed === true);
check('register เข้าได้ (public)', gate('register', {}).res.allowed === true);
check('getStoreList เข้าได้ (public)', gate('getStoreList', {}).res.allowed === true);
check('submitEvalByToken เข้าได้ (QR public)', gate('submitEvalByToken', { token: 'x' }).res.allowed === true);

console.log('\n[2] โทเคนปลอม / หมดอายุ');
check('ลายมือชื่อผิด', gate('getUserProfile', { authToken: mint('S1', 'ADMIN').split('.')[0] + '.AAAA' }).res.code === 'UNAUTHORIZED');
check('เปลี่ยน role ใน payload แล้วลายมือชื่อไม่ตรง', (() => {
  const forged = sandbox.base64Url_(JSON.stringify({ u: 'S1', r: 'ADMIN', e: Date.now() + 10000 }));
  const t = forged + '.' + mint('S1', 'STUDENT').split('.')[1];
  return gate('getStudents', { authToken: t }).res.code === 'UNAUTHORIZED';
})());
check('โทเคนหมดอายุ', gate('getStudents', { authToken: mint('A1', 'ADMIN', -1000) }).res.code === 'UNAUTHORIZED');
check('โทเคนว่าง', gate('getStudents', { authToken: '' }).res.code === 'UNAUTHORIZED');

console.log('\n[3] นักศึกษา');
check('getStudents ถูกห้าม (FORBIDDEN)', gate('getStudents', { authToken: studentToken }).res.code === 'FORBIDDEN');
check('createStudent ถูกห้าม', gate('createStudent', { authToken: studentToken }).res.code === 'FORBIDDEN');
check('getAdminStats ถูกห้าม', gate('getAdminStats', { authToken: studentToken }).res.code === 'FORBIDDEN');
check('sendBroadcast ถูกห้าม', gate('sendBroadcast', { authToken: studentToken }).res.code === 'FORBIDDEN');
check('getEvaluations ถูกห้าม', gate('getEvaluations', { authToken: studentToken }).res.code === 'FORBIDDEN');
check('createRoadmap ถูกห้าม', gate('createRoadmap', { authToken: studentToken }).res.code === 'FORBIDDEN');
(() => {
  const g = gate('getUserProfile', { authToken: studentToken, userId: 'S2' });
  check('อ่านโปรไฟล์คนอื่นถูกบังคับเป็นตัวเอง', g.res.allowed && g.params.userId === 'S1', g.params);
})();
(() => {
  const g = gate('getRoadmapProgress', { authToken: studentToken, userId: 'S2' });
  check('อ่าน progress คนอื่นถูกบังคับเป็นตัวเอง', g.params.userId === 'S1', g.params);
})();
(() => {
  const g = gate('getMyMentors', { authToken: studentToken, studentId: 'S2' });
  check('getMyMentors ถูกบังคับ studentId เป็นตัวเอง', g.params.studentId === 'S1', g.params);
})();
(() => {
  const g = gate('updateProfile', { authToken: studentToken, userId: 'S2', firstName: 'x' });
  check('updateProfile ถูกบังคับเป็นตัวเอง', g.params.userId === 'S1', g.params);
})();
(() => {
  const g = gate('submitAssignment', { authToken: studentToken, userId: 'S2' });
  check('submitAssignment ถูกบังคับเป็นตัวเอง', g.params.userId === 'S1', g.params);
})();
(() => {
  const g = gate('createEvaluation', { authToken: studentToken, evaluatorId: 'M1', evaluateeId: 'S9' });
  check('createEvaluation ถูกบังคับให้ประเมินตัวเองเท่านั้น',
    g.params.evaluatorId === 'S1' && g.params.evaluateeId === 'S1', g.params);
})();
(() => {
  const g = gate('signOffWeek', { authToken: studentToken, userId: 'S2', role: 'trainer' });
  check('นักศึกษาลงชื่อแทนผู้ฝึกสอนไม่ได้', g.params.role === 'student' && g.params.userId === 'S1', g.params);
})();
(() => {
  const g = gate('getSubmissions', { authToken: studentToken });
  check('getSubmissions ถูกจำกัดเป็นของตัวเอง', g.params.userId === 'S1', g.params);
})();
(() => {
  const g = gate('changePassword', { authToken: studentToken, userId: 'A1', newPassword: 'x' });
  check('changePassword ถูกบังคับเป็นบัญชีตัวเอง', g.params.userId === 'S1', g.params);
})();

console.log('\n[4] พี่เลี้ยง');
check('getStudents เข้าได้', gate('getStudents', { authToken: mentorToken }).res.allowed === true);
check('reviewSubmission เข้าได้', gate('reviewSubmission', { authToken: mentorToken }).res.allowed === true);
check('createStudent ถูกห้าม', gate('createStudent', { authToken: mentorToken }).res.code === 'FORBIDDEN');
check('getAdminStats ถูกห้าม', gate('getAdminStats', { authToken: mentorToken }).res.code === 'FORBIDDEN');
check('getTrainingPassportOverview ถูกห้าม', gate('getTrainingPassportOverview', { authToken: mentorToken }).res.code === 'FORBIDDEN');
(() => {
  const g = gate('getStudentsByMentor', { authToken: mentorToken, mentorId: 'M2' });
  check('ดูนักศึกษาของพี่เลี้ยงคนอื่นไม่ได้', g.params.mentorId === 'M1', g.params);
})();
(() => {
  const g = gate('reviewSubmission', { authToken: mentorToken, reviewerId: 'A1' });
  check('reviewerId ถูกบังคับเป็นตัวเอง', g.params.reviewerId === 'M1', g.params);
})();
(() => {
  const g = gate('getTrainingPassportSummary', { authToken: mentorToken, userId: 'S5' });
  check('ดู passport ของนักศึกษาได้ (ไม่ถูกบังคับ)', g.res.allowed && g.params.userId === 'S5', g.params);
})();
(() => {
  const g = gate('createEvaluation', { authToken: mentorToken, evaluatorId: 'M9', evaluateeId: 'S5' });
  check('ประเมินนักศึกษาได้ แต่ evaluatorId ถูกบังคับเป็นตัวเอง',
    g.res.allowed && g.params.evaluatorId === 'M1' && g.params.evaluateeId === 'S5', g.params);
})();

console.log('\n[5] แอดมิน');
['getStudents', 'createStudent', 'updateStudent', 'deactivateStudent', 'createMentor', 'assignMentor',
 'createRoadmap', 'deleteRoadmap', 'createAssignment', 'deleteAssignment', 'createResource',
 'sendBroadcast', 'getEvaluations', 'getAdminStats', 'syncAllHeaders', 'getTrainingPassportOverview',
 'listFiles', 'deleteFile'].forEach((a) => {
  check(a + ' เข้าได้', gate(a, { authToken: adminToken }).res.allowed === true);
});
(() => {
  const g = gate('getUserProfile', { authToken: adminToken, userId: 'S7' });
  check('อ่านโปรไฟล์นักศึกษาได้ (ไม่ถูกบังคับ)', g.res.allowed && g.params.userId === 'S7', g.params);
})();
(() => {
  const g = gate('sendBroadcast', { authToken: adminToken, senderId: 'S1' });
  check('senderId ถูกบังคับเป็นแอดมินที่ล็อกอิน', g.params.senderId === 'A1', g.params);
})();

console.log('\n[6] setupSystem (bootstrap)');
adminRows = [];
check('ยังไม่มีแอดมิน → เรียกได้โดยไม่ล็อกอิน', gate('setupSystem', {}).res.allowed === true);
adminRows = [{ id: 'A1', role: 'ADMIN' }];
check('มีแอดมินแล้ว → ผู้ไม่ล็อกอินถูกปฏิเสธ', gate('setupSystem', {}).res.code === 'UNAUTHORIZED');
check('มีแอดมินแล้ว → นักศึกษาถูกห้าม', gate('setupSystem', { authToken: studentToken }).res.code === 'FORBIDDEN');
check('มีแอดมินแล้ว → แอดมินเรียกได้', gate('setupSystem', { authToken: adminToken }).res.allowed === true);

console.log('\n[7] action ที่ไม่รู้จัก');
check('ต้องล็อกอินก่อน (fail closed)', gate('someNewAction', {}).res.code === 'UNAUTHORIZED');
check('ล็อกอินแล้วปล่อยผ่านให้ switch ตอบ Unknown action', gate('someNewAction', { authToken: adminToken }).res.allowed === true);

console.log('\n[8] uploadFile ตอนสมัครสมาชิก');
check('ยังไม่ล็อกอิน + profiles → อัปโหลดได้', gate('uploadFile', { subfolder: 'profiles' }).res.allowed === true);
check('ยังไม่ล็อกอิน + resources → ถูกปฏิเสธ', gate('uploadFile', { subfolder: 'resources' }).res.code === 'UNAUTHORIZED');
check('ยังไม่ล็อกอิน + submissions → ถูกปฏิเสธ', gate('uploadFile', { subfolder: 'submissions' }).res.code === 'UNAUTHORIZED');
check('ยังไม่ล็อกอิน + ไม่ระบุโฟลเดอร์ → ถูกปฏิเสธ', gate('uploadFile', {}).res.code === 'UNAUTHORIZED');
check('นักศึกษาอัปโหลดงานได้', gate('uploadFile', { authToken: studentToken, subfolder: 'submissions' }).res.allowed === true);
check('ผู้ไม่ล็อกอินลบไฟล์ไม่ได้', gate('deleteFile', { fileId: 'x' }).res.code === 'UNAUTHORIZED');

console.log('\n[9] session context');
gate('getUserProfile', { authToken: studentToken, userId: 'S1' });
check('session context ถูกตั้งเป็นผู้ใช้ในโทเคน', sandbox.getSessionContext_().userId === 'S1');
gate('login', {});
check('request ที่ไม่มีโทเคน → context ว่าง', sandbox.getSessionContext_() === null);

console.log(`\nสรุป: ผ่าน ${pass} / ล้มเหลว ${fail}`);
process.exit(fail === 0 ? 0 : 1);
