// ==================== Shared App Logic ====================

function driveImageUrl(url) {
  if (!url) return '';
  var m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return 'https://lh3.googleusercontent.com/d/' + m[1];
  return url;
}

/**
 * แปลงค่าวันที่ (ISO string / Date) เป็นรูปแบบ yyyy-MM-dd สำหรับ <input type="date">
 * Google Sheets มักคืนวันที่เป็น ISO string ที่มีเวลา ซึ่ง input date ไม่รับ
 * @param {string} value
 * @returns {string}
 */
function dateInputValue(value) {
  if (!value) return '';
  var s = String(value);
  // วันที่ล้วน (ไม่มีเวลา) — ใช้ตามเดิม ไม่ต้องคำนวณ timezone
  var plain = s.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (plain) return plain[1];
  // สตริงที่มีเวลา: Google Sheets เก็บเซลล์วันที่เป็น serial ซึ่งถูกแปลงเป็น
  // เช่น '2026-06-11T17:00:00.000Z' (= เที่ยงคืนเวลาไทย) การตัดเอาวันที่ส่วน UTC
  // ตรง ๆ จะทำให้วันเลื่อนถอยหลังไป 1 วัน จึง parse แล้วใช้ "วันตามเวลาท้องถิ่น"
  // เพื่อคืนวันที่ที่ตั้งใจไว้จริง (แก้บั๊กปฏิทินบางวันไม่แสดง)
  var d = new Date(s);
  if (isNaN(d.getTime())) {
    var m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : '';
  }
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  var dd = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + mm + '-' + dd;
}

/**
 * วันที่วันนี้ในรูปแบบ yyyy-mm-dd (เวลาท้องถิ่น)
 */
function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/**
 * แปลงแผนการฝึกเป็นรายการวันที่ yyyy-mm-dd
 * ใช้วันรายวัน (trainingDays) ถ้าระบุไว้ ไม่งั้นขยายจากช่วง startDate–endDate
 */
function expandPlanDays(p) {
  if (!p) return [];
  if (p.trainingDays) {
    // normalize ทุก token ผ่าน dateInputValue เพื่อกันกรณีที่ Sheets แปลง
    // วันเดี่ยวเป็น date-serial (ISO datetime) ซึ่งจะทำให้ key วันคลาดเคลื่อน
    return String(p.trainingDays).split(',').map(s => dateInputValue(s.trim())).filter(Boolean).sort();
  }
  const start = dateInputValue(p.startDate);
  if (!start) return [];
  const end = dateInputValue(p.endDate) || start;
  const days = [];
  let d = new Date(start + 'T00:00:00');
  const endD = new Date(end + 'T00:00:00');
  let guard = 0;
  while (d <= endD && guard < 120) {
    days.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
    d.setDate(d.getDate() + 1);
    guard++;
  }
  return days;
}

/**
 * แปลงค่า dayTimes (JSON string) ของแผนการฝึกเป็น object { 'yyyy-mm-dd': {start, end} }
 */
function parsePlanDayTimes(p) {
  if (!p || !p.dayTimes) return {};
  try {
    const obj = JSON.parse(p.dayTimes);
    return (obj && typeof obj === 'object') ? obj : {};
  } catch (e) {
    return {};
  }
}

/**
 * แปลง Sheets date-serial time (1899-12-30T...) หรือ ISO datetime เป็น HH:MM (เวลาท้องถิ่น)
 */
function sanitizeTime(v) {
  if (!v && v !== 0) return '';
  var s = String(v).trim();
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) return s.substring(0, 5).padStart(5, '0');
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    var d = new Date(s);
    if (!isNaN(d.getTime())) {
      return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }
  }
  var n = typeof v === 'number' ? v : parseFloat(s);
  if (!isNaN(n) && n >= 0 && n < 1) {
    var totalMin = Math.round(n * 1440);
    return String(Math.floor(totalMin / 60)).padStart(2, '0') + ':' + String(totalMin % 60).padStart(2, '0');
  }
  return '';
}

/**
 * คืนช่วงเวลาฝึกของวันที่กำหนด: ใช้เวลารายวัน (dayTimes) ก่อน
 * ไม่มีก็ใช้เวลาเริ่ม–สิ้นสุดมาตรฐานของแผน (startTime/endTime)
 * @returns {{start: string, end: string}} เช่น {start:'09:00', end:'18:00'} หรือค่าว่างถ้าไม่ระบุ
 */
function getPlanDayTime(p, day) {
  const dt = parsePlanDayTimes(p);
  if (dt[day] && (dt[day].start || dt[day].end)) {
    return { start: sanitizeTime(dt[day].start), end: sanitizeTime(dt[day].end) };
  }
  return { start: sanitizeTime((p && p.startTime) || ''), end: sanitizeTime((p && p.endTime) || '') };
}

/**
 * ข้อความช่วงเวลา เช่น "09:00–12:00" ("" ถ้าไม่ระบุ = ทั้งวัน)
 */
function formatTimeRange(t) {
  if (!t || (!t.start && !t.end)) return '';
  return (t.start || '–') + '–' + (t.end || '–');
}

/**
 * ตรวจว่าช่วงเวลาสองช่วงทับซ้อนกันหรือไม่ (รองรับกะข้ามคืน เช่น 22:00–06:00)
 * ช่วงที่ไม่ระบุเวลา = ทั้งวัน → ถือว่าทับซ้อนเสมอ
 */
function timeRangesOverlap(a, b) {
  if (!a || (!a.start && !a.end) || !b || (!b.start && !b.end)) return true;
  const toMin = s => { const m = String(s || '').match(/^(\d{1,2}):(\d{2})/); return m ? (+m[1]) * 60 + (+m[2]) : null; };
  let s1 = toMin(a.start), e1 = toMin(a.end), s2 = toMin(b.start), e2 = toMin(b.end);
  if (s1 === null || s2 === null) return true;
  if (e1 === null) e1 = 24 * 60;
  if (e2 === null) e2 = 24 * 60;
  if (e1 <= s1) e1 += 24 * 60; // กะข้ามคืน
  if (e2 <= s2) e2 += 24 * 60;
  return s1 < e2 && s2 < e1;
}

/**
 * คำนวณสถานะการฝึกอัตโนมัติจากแผนและผลประเมิน
 * COMPLETED   = ผู้สอนประเมินผ่านแล้ว
 * NOT_PLANNED = ยังไม่ได้กำหนดวันฝึก (ต้องไฮไลต์เตือน)
 * NOT_STARTED = วางแผนแล้ว แต่ยังไม่ถึงวันฝึกวันแรก
 * IN_PROGRESS = ถึงวันฝึกแล้ว แต่ยังไม่ผ่านการประเมิน
 */
function deriveTrainingStatus(p) {
  if (!p) return 'NOT_PLANNED';
  if (String(p.evalResult || '').toUpperCase() === 'PASS') return 'COMPLETED';
  const days = expandPlanDays(p);
  if (days.length === 0) return 'NOT_PLANNED';
  return todayStr() < days[0] ? 'NOT_STARTED' : 'IN_PROGRESS';
}

/**
 * นำทางไปยังหน้าที่ต้องการ
 * @param {string} page - ชื่อหน้า
 */
function navigateTo(page) {
  window.location.hash = '#' + page;
}

/**
 * แสดง Toast notification
 * @param {string} message - ข้อความ
 * @param {string} type - ประเภท (success, error, warning, info)
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  const icons = {
    success: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
    error: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
    warning: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  };

  const toast = document.createElement('div');
  toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 mb-2 transform transition-all duration-300 translate-x-0 opacity-100`;
  toast.innerHTML = `${icons[type] || ''}<span>${escAttr(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * แสดง Loading overlay
 */
function showLoading() {
  const el = document.getElementById('loading-overlay');
  if (el) el.classList.remove('hidden');
}

/**
 * ซ่อน Loading overlay
 */
function hideLoading() {
  const el = document.getElementById('loading-overlay');
  if (el) el.classList.add('hidden');
}

/**
 * จัดรูปแบบวันที่เป็นภาษาไทย
 * @param {string} dateStr - วันที่ในรูปแบบ string
 * @returns {string}
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * แปลงบทบาทเป็นภาษาไทย
 * @param {string} role
 * @returns {string}
 */
function getRoleLabel(role) {
  const labels = {
    'STUDENT': 'นักศึกษา',
    'MENTOR': 'พี่เลี้ยง',
    'ADMIN': 'ผู้ดูแลระบบ'
  };
  return labels[role] || role;
}

/**
 * แปลงสถานะเป็นภาษาไทย
 * @param {string} status
 * @returns {string}
 */
function getStatusLabel(status) {
  const labels = {
    'PENDING': 'รอดำเนินการ',
    'IN_PROGRESS': 'กำลังดำเนินการ',
    'COMPLETED': 'เสร็จสิ้น',
    'APPROVED': 'อนุมัติแล้ว',
    'REJECTED': 'ถูกปฏิเสธ',
    'SUBMITTED': 'ส่งแล้ว',
    'REVIEWED': 'ตรวจแล้ว',
    'NOT_STARTED': 'ยังไม่เริ่ม',
    'ACTIVE': 'ใช้งาน',
    'INACTIVE': 'ไม่ใช้งาน',
    'DRAFT': 'ร่าง',
    'PUBLISHED': 'เผยแพร่แล้ว',
    'OVERDUE': 'เลยกำหนด',
    'GRADED': 'ให้คะแนนแล้ว'
  };
  return labels[status] || status;
}

/**
 * คืนค่า Tailwind CSS classes สำหรับ badge สถานะ
 * @param {string} status
 * @returns {string}
 */
function getStatusColor(status) {
  const colors = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'IN_PROGRESS': 'bg-blue-100 text-blue-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'APPROVED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800',
    'SUBMITTED': 'bg-indigo-100 text-indigo-800',
    'REVIEWED': 'bg-purple-100 text-purple-800',
    'NOT_STARTED': 'bg-gray-100 text-gray-800',
    'ACTIVE': 'bg-green-100 text-green-800',
    'INACTIVE': 'bg-gray-100 text-gray-800',
    'DRAFT': 'bg-gray-100 text-gray-800',
    'PUBLISHED': 'bg-green-100 text-green-800',
    'OVERDUE': 'bg-red-100 text-red-800',
    'GRADED': 'bg-teal-100 text-teal-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * สร้าง Status Badge HTML
 * @param {string} status
 * @returns {string}
 */
function statusBadge(status) {
  return `<span class="px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}">${getStatusLabel(status)}</span>`;
}

/**
 * สร้าง Sidebar HTML ตามบทบาท
 * @param {string} role
 * @returns {string}
 */
function buildSidebar(role) {
  const menus = {
    STUDENT: [
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/></svg>', label: 'แดชบอร์ด', page: 'dashboard' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>', label: 'ข้อมูลส่วนตัว', page: 'student-profile' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>', label: 'วางแผนการฝึกงาน', page: 'student-roadmap' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>', label: 'ปฏิทินฝึกงาน', page: 'training-calendar' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>', label: 'งานที่ได้รับมอบหมาย', page: 'student-assignments' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>', label: 'ประเมินผล', page: 'student-evaluations' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>', label: 'แหล่งเรียนรู้', page: 'student-resources' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>', label: 'ข้อมูลพี่เลี้ยง', page: 'student-mentors' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>', label: 'Training Passport', page: 'training-passport' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>', label: 'Knowledge Management', page: 'knowledge-management' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>', label: 'แบบประเมินหลังฝึกงาน', page: 'survey' }
    ],
    MENTOR: [
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/></svg>', label: 'แดชบอร์ด', page: 'dashboard' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>', label: 'นักศึกษาในความดูแล', page: 'mentor-students' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>', label: 'ตรวจงาน', page: 'mentor-assignments' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>', label: 'ประเมินผล', page: 'mentor-evaluations' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>', label: 'Training Passport', page: 'training-passport' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>', label: 'Knowledge Management', page: 'knowledge-management' }
    ],
    ADMIN: [
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/></svg>', label: 'แดชบอร์ด', page: 'dashboard' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>', label: 'จัดการนักศึกษา', page: 'admin-students' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>', label: 'จัดการพี่เลี้ยง', page: 'admin-mentors' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>', label: 'จัดการแผนฝึกงาน', page: 'admin-roadmaps' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>', label: 'จัดการงานมอบหมาย', page: 'admin-assignments' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>', label: 'ประเมินผล', page: 'admin-evaluations' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>', label: 'แหล่งเรียนรู้', page: 'admin-resources' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>', label: 'การแจ้งเตือน', page: 'admin-notifications' }
    ]
  };

  const currentHash = window.location.hash.slice(1) || 'dashboard';
  const items = menus[role] || menus.STUDENT;

  return `
    <aside id="sidebar" class="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 lg:translate-x-0 -translate-x-full">
      <div class="p-6 border-b border-gray-200">
        <h1 class="text-lg font-bold text-primary-700">ระบบฝึกงาน</h1>
        <p class="text-xs text-gray-500 mt-1">Internship Management</p>
      </div>
      <nav class="p-4 space-y-1 overflow-y-auto" style="max-height: calc(100vh - 100px);">
        ${items.map(item => `
          <a href="#${item.page}" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentHash === item.page ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}">
            ${item.icon}
            <span>${item.label}</span>
          </a>
        `).join('')}
      </nav>
    </aside>
  `;
}

/**
 * สร้าง Navbar HTML
 * @param {object} user - ข้อมูลผู้ใช้
 * @returns {string}
 */
function buildNavbar(user) {
  return `
    <header class="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white shadow-sm z-30 flex items-center justify-between px-6">
      <button id="sidebar-toggle" class="lg:hidden text-gray-600 hover:text-gray-900">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
      <div class="flex-1"></div>
      <div class="flex items-center gap-4">
        <div class="text-right">
          <p class="text-sm font-medium text-gray-700">${user.name || user.email || 'ผู้ใช้'}</p>
          <p class="text-xs text-gray-500">${getRoleLabel(user.role)}</p>
        </div>
        <div class="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
          <span class="text-primary-700 font-semibold text-sm">${(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
        </div>
        <button onclick="clearToken(); navigateTo('login');" class="text-gray-400 hover:text-red-500 transition-colors" title="ออกจากระบบ">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        </button>
      </div>
    </header>
  `;
}

/**
 * สร้างเลย์เอาต์แดชบอร์ด (sidebar + navbar + content area)
 * @param {object} user - ข้อมูลผู้ใช้
 * @returns {string} - HTML content area id
 */
function initLayout(user) {
  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    ${buildNavbar(user)}
    <main id="content" class="lg:ml-64 mt-16 p-6 min-h-screen">
    </main>
  `;

  // Sidebar toggle for mobile
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });

    // Remove listeners registered by a previous render to avoid stacking
    // duplicate handlers (and leaking the old sidebar DOM nodes) on every
    // SPA navigation.
    if (window._layoutOutsideClick) {
      document.removeEventListener('click', window._layoutOutsideClick);
    }
    if (window._layoutResize) {
      window.removeEventListener('resize', window._layoutResize);
    }

    // Close sidebar on mobile when clicking outside
    window._layoutOutsideClick = function (e) {
      const sb = document.getElementById('sidebar');
      const tb = document.getElementById('sidebar-toggle');
      if (!sb || !tb) return;
      if (!sb.contains(e.target) && !tb.contains(e.target)) {
        if (window.innerWidth < 1024 && !sb.classList.contains('-translate-x-full')) {
          sb.classList.add('-translate-x-full');
        }
      }
    };
    document.addEventListener('click', window._layoutOutsideClick);

    // Handle window resize - properly collapse/expand sidebar
    window._layoutResize = function () {
      const sb = document.getElementById('sidebar');
      if (!sb) return;
      if (window.innerWidth >= 1024) {
        sb.classList.remove('-translate-x-full');
      } else {
        sb.classList.add('-translate-x-full');
      }
    };
    window.addEventListener('resize', window._layoutResize);
  }

  return document.getElementById('content');
}

/**
 * สร้าง Modal HTML
 * @param {string} id - Modal ID
 * @param {string} title - หัวข้อ
 * @param {string} bodyHtml - เนื้อหา HTML
 * @param {string} footerHtml - ปุ่มด้านล่าง HTML
 * @returns {string}
 */
function buildModal(id, title, bodyHtml, footerHtml = '') {
  return `
    <div id="${id}" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h3 class="text-lg font-semibold text-gray-800">${title}</h3>
          <button onclick="closeModal('${id}')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto flex-1">${bodyHtml}</div>
        ${footerHtml ? `<div class="p-6 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">${footerHtml}</div>` : ''}
      </div>
    </div>
  `;
}

/**
 * เปิด Modal
 * @param {string} id
 */
function openModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

/**
 * ปิด Modal
 * @param {string} id
 */
function closeModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

/**
 * สร้าง input field HTML
 * @param {string} id
 * @param {string} label
 * @param {string} type
 * @param {string} value
 * @param {string} placeholder
 * @param {boolean} required
 * @returns {string}
 */
function escAttr(v) {
  return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/**
 * Google Sheets auto-converts time strings (e.g. "10:00") into Date serials
 * starting from 1899-12-30. This produces strings like "1899-12-30T02:17:56.000Z"
 * that look broken when displayed as titles. This helper detects such values
 * and extracts a readable HH:MM time from them, or returns the original string
 * if it's not a Sheets time-serial.
 */
function sanitizeSheetTitle(v) {
  if (!v) return '';
  var s = String(v);
  if (/^1899-12-\d{2}T/.test(s)) {
    var d = new Date(s);
    if (!isNaN(d.getTime())) {
      var h = d.getHours(), m = d.getMinutes();
      if (h || m) return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    }
    return 'หัวข้อการฝึก';
  }
  return s;
}

function debounce(fn, delay) {
  let timer = null;
  return function() {
    const args = arguments;
    const ctx = this;
    clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
  };
}

function displayName(obj, fallback) {
  if (!obj) return fallback || '';
  return (obj.name || ((obj.firstName || '') + ' ' + (obj.lastName || '')).trim()) || fallback || '';
}

async function withLoading(apiCall, successMsg, onSuccess) {
  showLoading();
  try {
    const result = await apiCall();
    hideLoading();
    if (result.success !== false) {
      if (successMsg) showToast(successMsg, 'success');
      if (onSuccess) onSuccess(result);
    } else {
      showToast(result.message || 'เกิดข้อผิดพลาด', 'error');
    }
    return result;
  } catch (e) {
    hideLoading();
    showToast('เกิดข้อผิดพลาด', 'error');
    return { success: false };
  }
}

function progressBar(pct, height) {
  const h = height || 'h-3';
  const color = pct >= 75 ? 'from-green-400 to-green-500' : pct >= 50 ? 'from-blue-400 to-blue-500' : 'from-yellow-400 to-yellow-500';
  return '<div class="bg-gray-200 rounded-full ' + h + '"><div class="bg-gradient-to-r ' + color + ' ' + h + ' rounded-full transition-all" style="width:' + Math.min(100, Math.max(0, pct)) + '%"></div></div>';
}

/**
 * Escapes a value for safe embedding inside a SINGLE-quoted JavaScript string
 * that itself lives inside a DOUBLE-quoted HTML attribute, e.g.
 *   onclick="doThing('${escJs(name)}')"
 * It first neutralises the JS-string context (backslash, single quote, newlines)
 * then HTML-escapes the result so it cannot break out of the attribute either.
 * @param {*} v
 * @returns {string}
 */
function escJs(v) {
  return escAttr(String(v == null ? '' : v).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' '));
}

/**
 * Returns a URL safe to place in an href/src attribute. Blocks dangerous
 * schemes (javascript:, data:, vbscript:) that would allow clickable XSS, and
 * HTML-escapes the result so it cannot break out of the attribute.
 * @param {*} v
 * @returns {string}
 */
function safeUrl(v) {
  var s = String(v == null ? '' : v).trim();
  if (/^\s*(javascript|data|vbscript):/i.test(s)) return '#';
  return escAttr(s);
}

function inputField(id, label, type = 'text', value = '', placeholder = '', required = true) {
  return `
    <div class="mb-4">
      <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">${label}${required ? ' <span class="text-red-500">*</span>' : ''}</label>
      <input type="${type}" id="${id}" value="${escAttr(value)}" placeholder="${escAttr(placeholder)}" ${required ? 'required' : ''}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
    </div>
  `;
}

/**
 * สร้าง select field HTML
 * @param {string} id
 * @param {string} label
 * @param {Array} options - [{value, text}]
 * @param {string} selected
 * @returns {string}
 */
function selectField(id, label, options, selected = '') {
  return `
    <div class="mb-4">
      <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
      <select id="${id}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
        ${options.map(o => `<option value="${o.value}" ${o.value === selected ? 'selected' : ''}>${o.text}</option>`).join('')}
      </select>
    </div>
  `;
}

/**
 * สร้าง textarea field HTML
 */
function textareaField(id, label, value = '', placeholder = '', rows = 3) {
  return `
    <div class="mb-4">
      <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
      <textarea id="${id}" rows="${rows}" placeholder="${placeholder}"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">${value}</textarea>
    </div>
  `;
}
