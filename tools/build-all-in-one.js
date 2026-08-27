#!/usr/bin/env node
/**
 * build-all-in-one.js
 *
 * รวมไฟล์ .gs ทุกโมดูลใน apps-script/ ให้เป็น ALL_IN_ONE.gs ไฟล์เดียว
 * สำหรับคนที่อยากวางโค้ดใน Apps Script Editor แค่ไฟล์เดียว
 *
 *   node tools/build-all-in-one.js          # สร้างไฟล์
 *   node tools/build-all-in-one.js --check  # ตรวจว่าไฟล์ตรงกับโมดูลหรือไม่ (ไม่เขียนทับ)
 *
 * เดิม ALL_IN_ONE.gs ถูกแก้ด้วยมือจนตกรุ่น (ขาด getMyMentors, addMentorContact,
 * removeMentorContact, changePassword) ทำให้หน้าเว็บเรียก action ที่ backend
 * ไม่มี ไฟล์นี้จึงถูก generate เท่านั้น ห้ามแก้ตรง ๆ
 */

'use strict';

const fs = require('fs');
const path = require('path');

const APPS_SCRIPT_DIR = path.join(__dirname, '..', 'apps-script');
const OUTPUT_FILE = path.join(APPS_SCRIPT_DIR, 'ALL_IN_ONE.gs');
const OUTPUT_NAME = 'ALL_IN_ONE.gs';

// ไฟล์ที่ต้องมาก่อนตามลำดับ (CONFIG ต้องถูกประกาศก่อนโค้ดที่อ่านค่าตอนโหลด)
const LEADING_FILES = ['Config.gs', 'Session.gs', 'Database.gs', 'Auth.gs', 'Code.gs'];

function listModules() {
  const all = fs.readdirSync(APPS_SCRIPT_DIR)
    .filter((f) => f.endsWith('.gs') && f !== OUTPUT_NAME)
    .sort();

  const missing = LEADING_FILES.filter((f) => !all.includes(f));
  if (missing.length) {
    throw new Error('ไม่พบไฟล์ที่จำเป็น: ' + missing.join(', '));
  }

  const rest = all.filter((f) => !LEADING_FILES.includes(f));
  return LEADING_FILES.concat(rest);
}

function banner(text) {
  const line = '═'.repeat(60);
  return `// ${line}\n// ${text}\n// ${line}\n`;
}

function build(modules) {
  const parts = [
    '/**',
    ' * ALL_IN_ONE.gs — ไฟล์รวม backend ทั้งหมด (GENERATED — ห้ามแก้ไฟล์นี้โดยตรง)',
    ' *',
    ' * สร้างจากไฟล์โมดูลใน apps-script/ ด้วยคำสั่ง: npm run build:gs',
    ' * ถ้าจะแก้โค้ด ให้แก้ที่ไฟล์โมดูลแล้ว generate ใหม่',
    ' *',
    ' * วิธีใช้: ใน Apps Script ให้เลือกอย่างใดอย่างหนึ่ง',
    ' *   ก) วางไฟล์โมดูลทั้งหมด (ไม่ต้องมีไฟล์นี้) — แนะนำ',
    ' *   ข) วางไฟล์นี้ไฟล์เดียว (ต้องไม่มีไฟล์โมดูลอื่นในโปรเจกต์)',
    ' * ห้ามวางทั้งสองแบบพร้อมกัน เพราะฟังก์ชันชื่อซ้ำกันจะทับกันเงียบ ๆ',
    ' *',
    ` * โมดูลที่รวมไว้ (${modules.length} ไฟล์): ${modules.join(', ')}`,
    ' */',
    ''
  ];

  modules.forEach((file) => {
    const code = fs.readFileSync(path.join(APPS_SCRIPT_DIR, file), 'utf8').replace(/\s+$/, '');
    parts.push('');
    parts.push(banner(file));
    parts.push(code);
    parts.push('');
  });

  return parts.join('\n').replace(/\n{4,}/g, '\n\n\n') + '\n';
}

/**
 * ตรวจความสอดคล้องของ backend ก่อน generate:
 *   1. ทุก action ใน switch ของ Code.gs ต้องมีนโยบายใน ACTION_POLICY_ (Session.gs)
 *   2. ทุกฟังก์ชันที่ switch เรียก ต้องมีอยู่จริงในโมดูล
 *   3. ห้ามมีฟังก์ชันชื่อซ้ำข้ามโมดูล
 * @returns {string[]} รายการปัญหาที่พบ
 */
function validate(modules) {
  const problems = [];
  const sources = {};
  modules.forEach((f) => {
    sources[f] = fs.readFileSync(path.join(APPS_SCRIPT_DIR, f), 'utf8');
  });

  const defined = new Map();
  Object.keys(sources).forEach((file) => {
    const re = /^function\s+([A-Za-z0-9_]+)\s*\(/gm;
    let m;
    while ((m = re.exec(sources[file])) !== null) {
      if (defined.has(m[1])) {
        problems.push(`ฟังก์ชันซ้ำ: ${m[1]}() อยู่ทั้งใน ${defined.get(m[1])} และ ${file}`);
      } else {
        defined.set(m[1], file);
      }
    }
  });

  const code = sources['Code.gs'];
  const policySrc = sources['Session.gs'];
  const actions = [];
  const caseRe = /case\s+'([A-Za-z0-9_]+)'\s*:/g;
  let cm;
  while ((cm = caseRe.exec(code)) !== null) actions.push(cm[1]);

  actions.forEach((action) => {
    const policyRe = new RegExp('^\\s{2}' + action + '\\s*:', 'm');
    if (!policyRe.test(policySrc)) {
      problems.push(`action '${action}' ไม่มีนโยบายใน ACTION_POLICY_ (Session.gs) — จะถูกบังคับให้ล็อกอินไว้ก่อน`);
    }
  });

  // ฟังก์ชันที่ switch เรียกใช้ (result = someFunction(...))
  const calledRe = /result\s*=\s*([A-Za-z0-9_]+)\s*\(/g;
  let km;
  const called = new Set();
  while ((km = calledRe.exec(code)) !== null) called.add(km[1]);
  called.forEach((fn) => {
    if (!defined.has(fn)) {
      problems.push(`switch เรียก ${fn}() แต่ไม่พบฟังก์ชันนี้ในโมดูลใด`);
    }
  });

  return problems;
}

function main() {
  const checkOnly = process.argv.includes('--check');
  const modules = listModules();

  const problems = validate(modules);
  problems.forEach((p) => console.error('⚠️  ' + p));

  const output = build(modules);
  const current = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, 'utf8') : '';

  if (checkOnly) {
    if (current !== output) {
      console.error(`✗ ${OUTPUT_NAME} ไม่ตรงกับไฟล์โมดูล — รัน: npm run build:gs`);
      process.exit(1);
    }
    console.log(`✓ ${OUTPUT_NAME} ตรงกับไฟล์โมดูลแล้ว (${modules.length} โมดูล)`);
  } else {
    fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
    const lines = output.split('\n').length;
    console.log(`✓ สร้าง ${OUTPUT_NAME} จาก ${modules.length} โมดูล (${lines} บรรทัด)`);
  }

  if (problems.length) {
    console.error(`\nพบปัญหา ${problems.length} รายการด้านบน`);
    process.exit(1);
  }
}

main();
