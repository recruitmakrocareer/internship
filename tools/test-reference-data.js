/**
 * ทดสอบการอ่านชีทข้อมูลอ้างอิง (StoreList / DepartmentList)
 * ชีทเหล่านี้นำเข้าจากภายนอก หัวตารางจึงไม่ตรงกับ CONFIG.HEADERS
 * (เช่น 'Store_No' แทน 'storeNo', 'Divison' ที่สะกดผิด) — โค้ดต้องจับคู่ให้ได้
 * และต้องไม่เขียนทับแถวหัวตารางของเจ้าของข้อมูล
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

/** สร้าง sandbox ใหม่พร้อมชีทจำลอง (คืน spy ของการเขียนหัวตาราง) */
function load(sheets) {
  const writes = [];
  const fakeSheet = (name, values) => ({
    getName: () => name,
    getLastColumn: () => (values[0] ? values[0].length : 0),
    getFrozenRows: () => 1,
    setFrozenRows: () => {},
    getDataRange: () => ({ getValues: () => values }),
    getRange: () => ({
      getValues: () => [values[0] || []],
      setValues: (v) => { writes.push({ sheet: name, values: v[0] }); },
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
  ['Config.gs', 'Database.gs', 'UserService.gs'].forEach((f) => {
    vm.runInContext(fs.readFileSync(path.join(DIR, f), 'utf8'), sandbox, { filename: f });
  });

  // Database.gs ประกาศ getSpreadsheet() ที่เรียก SpreadsheetApp — เขียนทับด้วย
  // ชีทจำลองหลังโหลดไฟล์เสร็จ (ต้องหลังโหลด ไม่งั้นถูกทับกลับ)
  sandbox.getSpreadsheet = () => ({
    getSheetByName: (n) => (sheets[n] ? fakeSheet(n, sheets[n]) : null),
    insertSheet: (n) => fakeSheet(n, [[]])
  });
  sandbox.__writes = writes;
  return sandbox;
}

console.log('\n[1] StoreList หัวตารางแบบชีทจริง (Store_No, Store_Name, Store_Name_TH)');
(() => {
  const s = load({
    StoreList: [
      ['Store_No', 'Store_Name', 'Store_Name_TH', 'Format', 'Sub_Region', 'Province', 'Province_TH'],
      ['101', 'Makro Ladprao', 'แม็คโคร ลาดพร้าว', 'L', 'BKK', 'Bangkok', 'กรุงเทพมหานคร'],
      ['', '', '', '', '', '', '']
    ]
  });
  const res = s.getStoreList();
  const first = res.data[0];
  check('อ่านสำเร็จและข้ามแถวว่าง', res.success === true && res.data.length === 1, res.data.length);
  check('Store_No → storeNo', first.storeNo === '101', first);
  check('Store_Name → storeName', first.storeName === 'Makro Ladprao', first);
  check('Store_Name_TH → storeNameTH', first.storeNameTH === 'แม็คโคร ลาดพร้าว', first);
  check('Province → province', first.province === 'Bangkok', first);
  check('คอลัมน์ที่จับคู่ไม่ได้ยังเก็บไว้ (Format)', first.Format === 'L', first);
})();

console.log('\n[2] StoreList หัวตารางแบบ camelCase (ต้องไม่พัง)');
(() => {
  const s = load({
    StoreList: [
      ['storeNo', 'storeName', 'storeNameTH', 'formatType', 'subregion', 'province', 'provinceTH'],
      ['202', 'Makro Rama 2', 'แม็คโคร พระราม 2', 'M', 'BKK', 'Bangkok', 'กรุงเทพมหานคร']
    ]
  });
  const first = s.getStoreList().data[0];
  check('storeNo/storeName/storeNameTH ครบ',
    first.storeNo === '202' && first.storeName === 'Makro Rama 2' && first.storeNameTH === 'แม็คโคร พระราม 2', first);
  check('formatType จับคู่ตรง', first.formatType === 'M', first);
})();

console.log('\n[3] StoreList หัวตารางที่จับคู่ไม่ได้เลย → ใช้ตำแหน่งคอลัมน์');
(() => {
  const s = load({ StoreList: [['A', 'B'], ['303', 'Makro Bangbon']] });
  const first = s.getStoreList().data[0];
  check('คอลัมน์ 1 → storeNo', first.storeNo === '303', first);
  check('คอลัมน์ 2 → storeName', first.storeName === 'Makro Bangbon', first);
})();

console.log('\n[4] DepartmentList หัวตาราง Divison (สะกดผิดในชีทจริง)');
(() => {
  const s = load({
    DepartmentList: [
      ['Divison', 'Department'],
      ['Fresh Food', 'Butchery'],
      ['Fresh Food', 'Bakery'],
      ['', '']
    ]
  });
  const res = s.getDepartmentList();
  check('ได้ 2 แผนก ข้ามแถวว่าง', res.data.length === 2, res.data);
  check('Divison → division', res.data[0].division === 'Fresh Food', res.data[0]);
  check('Department → department', res.data[0].department === 'Butchery', res.data[0]);
})();

console.log('\n[5] DepartmentList หัวตารางแบบเดิม (division, department)');
(() => {
  const s = load({ DepartmentList: [['division', 'department'], ['Dry Food', 'Beverage']] });
  const res = s.getDepartmentList();
  check('ยังอ่านได้ปกติ', res.data.length === 1 && res.data[0].division === 'Dry Food', res.data);
})();

console.log('\n[6] ชีทว่าง / ไม่มีชีท');
(() => {
  const s = load({});
  check('ไม่มีชีท StoreList → คืน array ว่าง', s.getStoreList().data.length === 0);
  check('ไม่มีชีท DepartmentList → คืน array ว่าง', s.getDepartmentList().data.length === 0);
})();
(() => {
  const s = load({ StoreList: [['Store_No', 'Store_Name']] });
  check('มีแต่หัวตาราง → คืน array ว่าง', s.getStoreList().data.length === 0);
})();

console.log('\n[7] ห้ามเขียนทับหัวตารางของชีทอ้างอิง');
(() => {
  const s = load({
    StoreList: [['Store_No', 'Store_Name'], ['101', 'Makro Ladprao']],
    DepartmentList: [['Divison', 'Department'], ['Fresh Food', 'Butchery']],
    Users: [['id', 'email']]
  });
  check('isReferenceSheet ระบุถูก',
    s.isReferenceSheet('StoreList') && s.isReferenceSheet('DepartmentList') && !s.isReferenceSheet('Users'));

  s.getSheet('StoreList');
  s.getSheet('DepartmentList');
  check('getSheet ไม่แตะหัวตารางชีทอ้างอิง', s.__writes.length === 0, s.__writes);

  const sync = s.syncAllHeaders();
  const storeMsg = sync.data.filter((r) => r.indexOf('StoreList') === 0)[0] || '';
  const deptMsg = sync.data.filter((r) => r.indexOf('DepartmentList') === 0)[0] || '';
  check('syncAllHeaders ข้ามชีทอ้างอิง (ไม่ขึ้น MISMATCH)',
    storeMsg.indexOf('skipped') !== -1 && deptMsg.indexOf('skipped') !== -1, [storeMsg, deptMsg]);
  check('syncAllHeaders ไม่เขียนหัวตารางชีทอ้างอิง',
    s.__writes.every((w) => w.sheet !== 'StoreList' && w.sheet !== 'DepartmentList'), s.__writes);
  check('ชีทข้อมูลระบบยังถูกเติมคอลัมน์ตามปกติ',
    s.__writes.some((w) => w.sheet === 'Users'), s.__writes);
})();

console.log(`\nสรุป: ผ่าน ${pass} / ล้มเหลว ${fail}`);
process.exit(fail === 0 ? 0 : 1);
