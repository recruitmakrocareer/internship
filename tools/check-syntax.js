#!/usr/bin/env node
/**
 * check-syntax.js — ตรวจว่าไฟล์ทุกไฟล์ parse ผ่าน
 *
 * โปรเจกต์นี้ไม่มี build step: ไฟล์ .gs ถูกวางตรงเข้า Apps Script Editor และไฟล์ใน
 * docs/js ถูกโหลดตรงด้วย <script> ถ้ามี syntax error จะรู้ตอนผู้ใช้เปิดหน้าเว็บหรือ
 * ตอน Apps Script รัน ซึ่งสายเกินไป สคริปต์นี้จับให้ก่อน commit/CI
 *
 *   node tools/check-syntax.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function listFiles(dir, ext, out) {
  out = out || [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, ext, out);
    else if (entry.name.endsWith(ext)) out.push(full);
  });
  return out;
}

const targets = [].concat(
  listFiles(path.join(ROOT, 'apps-script'), '.gs'),
  listFiles(path.join(ROOT, 'docs', 'js'), '.js'),
  listFiles(path.join(ROOT, 'tools'), '.js')
);

let failed = 0;
targets.forEach((file) => {
  const rel = path.relative(ROOT, file);
  try {
    // vm.Script parse โค้ดโดยไม่รัน — จับ syntax error ได้อย่างเดียวตามต้องการ
    new vm.Script(fs.readFileSync(file, 'utf8'), { filename: rel });
  } catch (err) {
    failed++;
    console.error('✗ ' + rel + ': ' + err.message);
  }
});

console.log(`ตรวจ ${targets.length} ไฟล์ (.gs ${targets.filter((f) => f.endsWith('.gs')).length}, .js ${targets.filter((f) => f.endsWith('.js')).length})`);
if (failed) {
  console.error(`พบ syntax error ${failed} ไฟล์`);
  process.exit(1);
}
console.log('✓ ทุกไฟล์ parse ผ่าน');
