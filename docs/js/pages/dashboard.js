// ==================== หน้าแดชบอร์ด ====================

function renderDashboard() {
  if (!checkAuth()) return;
  const user = getCurrentUser();
  const content = initLayout(user);

  if (user.role === 'ADMIN') {
    renderAdminDashboard(content);
  } else if (user.role === 'MENTOR') {
    renderMentorDashboard(content);
  } else {
    renderStudentDashboard(content);
  }
}

// ==================== Admin Dashboard ====================

function adminDashSvgIcon(name) {
  var icons = {
    users: '<svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>',
    userCheck: '<svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19 11l-2 2 4-4"/></svg>',
    clipboard: '<svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/></svg>',
    map: '<svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/></svg>'
  };
  return icons[name] || '';
}

// ==================== Admin Analytics (Recruitment Stats + Pipeline) ====================

var ADMIN_THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

var _adminAllStudents = [];
var _adminStatsState = { period: 'all' };

var ADMIN_STATS_PERIODS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'year', label: 'ปีนี้' },
  { key: '6m', label: '6 เดือน' },
  { key: '3m', label: '3 เดือน' }
];

function _parseStudentDate(dateStr) {
  if (!dateStr) return null;
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d;
}

function _adminFilteredStudents() {
  var period = _adminStatsState.period;
  if (period === 'all') return _adminAllStudents.slice();
  var now = new Date();
  var cutoff;
  if (period === 'year') {
    cutoff = new Date(now.getFullYear(), 0, 1);
  } else if (period === '6m') {
    cutoff = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  } else if (period === '3m') {
    cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  } else {
    return _adminAllStudents.slice();
  }
  return _adminAllStudents.filter(function(s) {
    var d = _parseStudentDate(s.startDate);
    return d && d >= cutoff && d <= now;
  });
}

function _adminCountBy(students, field) {
  var counts = {};
  students.forEach(function(s) {
    var key = (s[field] || '').toString().trim() || 'ไม่ระบุ';
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.keys(counts).map(function(k) {
    return { label: k, value: counts[k] };
  }).sort(function(a, b) { return b.value - a.value; });
}

function _adminBarChartHtml(rows, topN) {
  if (!rows.length) {
    return '<p class="text-sm text-gray-400">ยังไม่มีข้อมูล</p>';
  }
  var top = rows.slice(0, topN || 8);
  var max = top[0].value || 1;
  return '<div class="space-y-2">' + top.map(function(r) {
    var pct = Math.round((r.value / max) * 100);
    return '<div class="flex items-center gap-2">' +
      '<div class="flex-1 min-w-0">' +
        '<div class="flex items-center justify-between mb-1">' +
          '<span class="text-xs text-gray-600 truncate" title="' + escAttr(r.label) + '">' + escAttr(r.label) + '</span>' +
          '<span class="text-xs font-semibold text-gray-700 ml-2 flex-shrink-0">' + r.value + '</span>' +
        '</div>' +
        '<div class="w-full bg-gray-100 rounded-full h-2">' +
          '<div class="bg-primary-500 h-2 rounded-full transition-all" style="width:' + pct + '%"></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('') + '</div>';
}

function renderAdminStatsPeriodControl() {
  var el = document.getElementById('admin-stats-period');
  if (!el) return;
  el.innerHTML = ADMIN_STATS_PERIODS.map(function(p) {
    var active = _adminStatsState.period === p.key;
    return '<button type="button" data-period="' + p.key + '" class="px-3 py-1 text-xs font-medium rounded-md transition-colors ' +
      (active ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700') + '">' + p.label + '</button>';
  }).join('');
  Array.prototype.forEach.call(el.querySelectorAll('button[data-period]'), function(btn) {
    btn.addEventListener('click', function() {
      _adminStatsState.period = btn.getAttribute('data-period');
      renderAdminStatsPeriodControl();
      renderAdminStatsCharts();
    });
  });
}

function renderAdminStatsCharts() {
  var uniEl = document.getElementById('admin-stats-universities');
  var typeEl = document.getElementById('admin-stats-types');
  var deptEl = document.getElementById('admin-stats-departments');
  if (!uniEl || !typeEl || !deptEl) return;

  var students = _adminFilteredStudents();

  // Universities horizontal bars
  uniEl.innerHTML = _adminBarChartHtml(_adminCountBy(students, 'university'), 8);

  // Department horizontal bars
  deptEl.innerHTML = _adminBarChartHtml(_adminCountBy(students, 'department'), 8);

  // Internship types donut
  var typeRows = _adminCountBy(students, 'internshipType');
  if (!typeRows.length) {
    typeEl.innerHTML = '<p class="text-sm text-gray-400">ยังไม่มีข้อมูล</p>';
  } else {
    var palette = ['#6366f1', '#22c55e', '#eab308', '#ec4899', '#06b6d4', '#f97316', '#8b5cf6', '#64748b'];
    var segments = typeRows.map(function(r, i) {
      return { value: r.value, color: palette[i % palette.length], label: r.label };
    });
    typeEl.innerHTML =
      '<div class="flex flex-col items-center gap-4">' +
        '<div class="flex-shrink-0">' + buildDonutChart(segments, 150) + '</div>' +
        '<div class="w-full space-y-2">' +
          segments.map(function(seg) {
            return '<div class="flex items-center justify-between">' +
              '<div class="flex items-center gap-2 min-w-0">' +
                '<span class="w-3 h-3 rounded-full flex-shrink-0" style="background:' + seg.color + '"></span>' +
                '<span class="text-xs text-gray-600 truncate" title="' + escAttr(seg.label) + '">' + escAttr(seg.label) + '</span>' +
              '</div>' +
              '<span class="text-xs font-semibold ml-2 flex-shrink-0" style="color:' + seg.color + '">' + seg.value + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
  }
}

// Feature: แยกประเภทจำนวนนักศึกษาเป็น 6 กลุ่ม + งานรอตรวจ
function renderAdminStudentBreakdown(students, pendingTasks) {
  var el = document.getElementById('admin-student-breakdown');
  if (!el) return;
  var t = todayStr();
  var total = students.length, active = 0, completed = 0, cancelled = 0, waiting = 0;
  students.forEach(function(s) {
    var status = String(s.status || '').toLowerCase();
    var start = dateInputValue(s.startDate);
    var end = dateInputValue(s.endDate);
    var isCancelled = ['cancel', 'ยกเลิก', 'inactive'].some(function(k) { return status.indexOf(k) !== -1; });
    var isDone = ['done', 'สำเร็จ', 'completed'].some(function(k) { return status.indexOf(k) !== -1; });
    if (isCancelled) cancelled++;
    else if (start && t < start) waiting++;
    else if (isDone || (end && t > end)) completed++;
    else active++;
  });

  var cards = [
    { label: 'นักศึกษาทั้งหมด', value: total, border: 'border-blue-500', text: 'text-blue-600', bg: 'bg-blue-50', iconColor: 'text-blue-200',
      icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
    { label: 'กำลังฝึกอยู่', value: active, border: 'border-green-500', text: 'text-green-600', bg: 'bg-green-50', iconColor: 'text-green-200',
      icon: 'M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z' },
    { label: 'รอเริ่มงาน', value: waiting, border: 'border-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', iconColor: 'text-amber-200',
      icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'สำเร็จการฝึก', value: completed, border: 'border-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', iconColor: 'text-emerald-200',
      icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'ยกเลิก', value: cancelled, border: 'border-red-400', text: 'text-red-500', bg: 'bg-red-50', iconColor: 'text-red-200',
      icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
    { label: 'งานที่รอตรวจ', value: pendingTasks || 0, border: 'border-violet-500', text: 'text-violet-600', bg: 'bg-violet-50', iconColor: 'text-violet-200',
      icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z' }
  ];

  el.innerHTML = cards.map(function(c) {
    return '<div class="' + c.bg + ' rounded-xl p-5 shadow-sm border-l-4 ' + c.border + ' relative overflow-hidden group hover:shadow-md transition-shadow">' +
      '<div class="absolute top-2 right-2 ' + c.iconColor + '"><svg class="w-9 h-9" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="' + c.icon + '"/></svg></div>' +
      '<p class="text-xs text-gray-500 mb-1">' + escAttr(c.label) + '</p>' +
      '<p class="text-3xl font-bold ' + c.text + '">' + c.value + '</p>' +
    '</div>';
  }).join('');
}

function renderAdminUpcomingInterns() {
  var el = document.getElementById('admin-upcoming-body');
  if (!el) return;

  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  var upcoming = _adminAllStudents.map(function(s) {
    return { student: s, date: _parseStudentDate(s.startDate) };
  }).filter(function(x) {
    return x.date && x.date > today;
  }).sort(function(a, b) { return a.date - b.date; });

  if (!upcoming.length) {
    el.innerHTML = '<p class="text-sm text-gray-400">ยังไม่มีนักศึกษาที่กำลังจะเริ่มฝึกงาน</p>';
    return;
  }

  // End of this week (Sunday-based week, end Saturday)
  var endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
  var endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  var groupsOrder = [];
  var groupsMap = {};
  function pushTo(key, item) {
    if (!groupsMap[key]) { groupsMap[key] = []; groupsOrder.push(key); }
    groupsMap[key].push(item);
  }

  upcoming.forEach(function(x) {
    var d = x.date;
    if (d <= endOfWeek) {
      pushTo('สัปดาห์นี้', x);
    } else if (d <= endOfMonth) {
      pushTo('เดือนนี้', x);
    } else {
      pushTo(ADMIN_THAI_MONTHS[d.getMonth()] + ' ' + d.getFullYear(), x);
    }
  });

  var header = '<div class="mb-4 inline-flex items-center gap-2 text-sm text-gray-600">' +
    '<span class="w-2 h-2 bg-primary-500 rounded-full"></span>' +
    'รอเริ่มฝึกงาน <span class="font-semibold text-gray-800">' + upcoming.length + '</span> คน' +
  '</div>';

  var body = groupsOrder.map(function(key) {
    var items = groupsMap[key];
    return '<div class="mb-5">' +
      '<div class="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">' +
        '<span class="text-sm font-semibold text-gray-700">' + key + '</span>' +
        '<span class="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">' + items.length + ' คน</span>' +
      '</div>' +
      '<div class="space-y-2">' +
        items.map(function(x) {
          var s = x.student;
          var initial = (s.name || '?').charAt(0);
          var uni = (s.university || '').toString().trim() || 'ไม่ระบุ';
          return '<div class="flex items-center gap-3">' +
            '<div class="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">' +
              '<span class="text-primary-600 font-semibold text-xs">' + escAttr(initial) + '</span>' +
            '</div>' +
            '<div class="min-w-0 flex-1">' +
              '<p class="text-sm font-medium text-gray-800 truncate">' + escAttr(s.name || '-') + '</p>' +
              '<p class="text-xs text-gray-400 truncate">' + escAttr(uni) + '</p>' +
            '</div>' +
            '<span class="text-xs text-gray-400 flex-shrink-0">' + formatDate(s.startDate) + '</span>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }).join('');

  el.innerHTML = header + body;
}

function buildDonutChart(segments, size) {
  size = size || 140;
  var r = size / 2 - 10;
  var cx = size / 2;
  var cy = size / 2;
  var circumference = 2 * Math.PI * r;
  var total = 0;
  segments.forEach(function(s) { total += s.value; });
  if (total === 0) total = 1;

  var svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#f3f4f6" stroke-width="18"/>';

  var offset = 0;
  segments.forEach(function(s) {
    var pct = s.value / total;
    var dashLen = circumference * pct;
    var dashGap = circumference - dashLen;
    var dashOffset = -offset * circumference / total + circumference * 0.25;
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + s.color + '" stroke-width="18" stroke-dasharray="' + dashLen + ' ' + dashGap + '" stroke-dashoffset="' + dashOffset + '" stroke-linecap="round" style="transition:stroke-dasharray 0.6s ease"/>';
    offset += s.value;
  });
  svg += '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" class="text-2xl font-bold fill-gray-800" style="font-size:22px;font-weight:700">' + total + '</text>';
  svg += '<text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" class="fill-gray-400" style="font-size:11px">งานทั้งหมด</text>';
  svg += '</svg>';
  return svg;
}

function buildProgressRing(pct, color, label, size) {
  size = size || 56;
  var r = size / 2 - 5;
  var circumference = 2 * Math.PI * r;
  var dashLen = circumference * (pct / 100);
  var dashGap = circumference - dashLen;
  var svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';
  svg += '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="#f3f4f6" stroke-width="5"/>';
  svg += '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="5" stroke-dasharray="' + dashLen + ' ' + dashGap + '" stroke-dashoffset="' + (circumference * 0.25) + '" stroke-linecap="round" style="transition:stroke-dasharray 0.6s ease"/>';
  svg += '<text x="' + size / 2 + '" y="' + (size / 2 + 4) + '" text-anchor="middle" style="font-size:12px;font-weight:600" class="fill-gray-700">' + pct + '%</text>';
  svg += '</svg>';
  return svg;
}

function buildSparkline(values, color) {
  if (!values || values.length === 0) values = [0];
  var w = 120, h = 32;
  var max = Math.max.apply(null, values) || 1;
  var step = w / Math.max(values.length - 1, 1);
  var points = values.map(function(v, i) {
    return (i * step).toFixed(1) + ',' + (h - (v / max) * (h - 4) - 2).toFixed(1);
  }).join(' ');
  return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '"><polyline points="' + points + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

async function renderAdminDashboard(content) {
  content.innerHTML = `
    <div class="fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">แดชบอร์ดผู้ดูแลระบบ</h2>
      <div id="admin-student-breakdown" class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        ${[1,2,3,4,5,6].map(() => `
          <div class="bg-white rounded-xl p-5 shadow-sm animate-pulse">
            <div class="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div class="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        `).join('')}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">สรุปการส่งงาน</h3>
          <div id="assignment-summary" class="flex items-center justify-center py-8">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">ภาพรวมระบบ</h3>
          <div id="system-overview" class="space-y-4">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
      </div>
      <div id="admin-quick-actions"></div>

      <div id="admin-recruitment-stats" class="bg-white rounded-xl shadow-sm p-6 mt-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 class="text-lg font-semibold text-gray-800">สถิติการรับนักศึกษา</h3>
          <div id="admin-stats-period" class="inline-flex flex-wrap gap-1 bg-gray-100 rounded-lg p-1"></div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-3">Top สถาบันการศึกษา</h4>
            <div id="admin-stats-universities"><p class="text-sm text-gray-400">กำลังโหลด...</p></div>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-3">รูปแบบการฝึกงาน</h4>
            <div id="admin-stats-types"><p class="text-sm text-gray-400">กำลังโหลด...</p></div>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-3">สถิติแผนกที่ฝึกงาน</h4>
            <div id="admin-stats-departments"><p class="text-sm text-gray-400">กำลังโหลด...</p></div>
          </div>
        </div>
      </div>

      <div id="admin-upcoming-interns" class="bg-white rounded-xl shadow-sm p-6 mt-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Pipeline นักศึกษาที่กำลังจะเริ่มฝึก</h3>
        <div id="admin-upcoming-body"><p class="text-sm text-gray-400">กำลังโหลด...</p></div>
      </div>
    </div>
  `;

  try {
    var result = await callApi('getAdminStats', { userId: getCurrentUser().id });
    var studentsRes = await callApi('getStudents');
    if (!result.success) return;
    var stats = result.data;
    var u = stats.users || {};
    var a = stats.assignments || {};
    var r = stats.roadmaps || {};
    var recent = stats.recentActivity || {};

    // 6-card KPI rendered by renderAdminStudentBreakdown (replaces old 4+4 layout)

    // Donut chart for assignment summary
    var submitted = (a.totalSubmissions || 0) - (a.reviewedSubmissions || 0) - (a.pendingSubmissions || 0);
    if (submitted < 0) submitted = 0;
    var segments = [
      { value: a.reviewedSubmissions || 0, color: '#22c55e', label: 'ตรวจแล้ว' },
      { value: a.pendingSubmissions || 0, color: '#eab308', label: 'รอตรวจ' },
      { value: submitted, color: '#6366f1', label: 'ส่งแล้ว' }
    ];

    var summary = document.getElementById('assignment-summary');
    summary.innerHTML = `
      <div class="flex flex-col sm:flex-row items-center gap-6 w-full">
        <div class="flex-shrink-0">
          ${buildDonutChart(segments, 160)}
        </div>
        <div class="flex-1 space-y-3 w-full">
          ${segments.map(function(seg) {
            return '<div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full flex-shrink-0" style="background:' + seg.color + '"></span><span class="text-sm text-gray-600">' + seg.label + '</span></div><span class="text-sm font-semibold" style="color:' + seg.color + '">' + seg.value + '</span></div>';
          }).join('')}
          <div class="pt-2 border-t border-gray-100">
            <div class="flex justify-between text-xs text-gray-400 mb-1">
              <span>อัตราการตรวจ</span>
              <span class="font-medium text-gray-600">${a.completionRate || 0}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div class="bg-green-500 h-1.5 rounded-full transition-all" style="width:${a.completionRate || 0}%"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // System overview with progress rings and sparkline
    var mentorPct = (u.totalStudents || 0) > 0 ? Math.round(((u.studentsWithMentor || 0) / u.totalStudents) * 100) : 0;
    var roadmapPct = (r.overallCompletion || 0);
    var sparkData = recent.dailySubmissions || [0, 1, 2, 1, 3, 2, 1];

    var overview = document.getElementById('system-overview');
    overview.innerHTML = `
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
          ${buildProgressRing(mentorPct, '#22c55e', 'มีพี่เลี้ยง')}
          <div>
            <p class="text-xs text-gray-500">มีพี่เลี้ยงแล้ว</p>
            <p class="text-sm font-semibold text-gray-800">${u.studentsWithMentor || 0} <span class="text-xs font-normal text-gray-400">/ ${u.totalStudents || 0}</span></p>
          </div>
        </div>
        <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
          ${buildProgressRing(roadmapPct, '#8b5cf6', 'Roadmap')}
          <div>
            <p class="text-xs text-gray-500">Roadmap รวม</p>
            <p class="text-sm font-semibold text-gray-800">${roadmapPct}%</p>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between bg-gray-50 rounded-lg p-3">
        <div>
          <p class="text-xs text-gray-500">การส่งงาน 7 วันล่าสุด</p>
          <p class="text-lg font-bold text-blue-600">${recent.submissionsLast7Days || 0} <span class="text-xs font-normal text-gray-400">งาน</span></p>
        </div>
        <div>${buildSparkline(sparkData, '#3b82f6')}</div>
      </div>
      <div class="flex items-center justify-between bg-red-50 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 bg-red-500 rounded-full"></span>
          <span class="text-sm text-gray-600">ยังไม่มีพี่เลี้ยง</span>
        </div>
        <span class="text-sm font-semibold text-red-600">${u.studentsWithoutMentor || 0} คน</span>
      </div>
    `;

    // Quick Actions
    document.getElementById('admin-quick-actions').innerHTML = `
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">ทางลัดการจัดการ</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a href="#admin-students" class="flex flex-col items-center gap-2 p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors group">
            <div class="w-10 h-10 bg-primary-100 group-hover:bg-primary-200 rounded-lg flex items-center justify-center transition-colors">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            </div>
            <span class="text-xs font-medium text-primary-700 text-center">เพิ่มนักศึกษา</span>
          </a>
          <a href="#admin-mentors" class="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group">
            <div class="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
            </div>
            <span class="text-xs font-medium text-green-700 text-center">จัดสรรพี่เลี้ยง</span>
          </a>
          <a href="#admin-assignments" class="flex flex-col items-center gap-2 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors group">
            <div class="w-10 h-10 bg-yellow-100 group-hover:bg-yellow-200 rounded-lg flex items-center justify-center transition-colors">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/></svg>
            </div>
            <span class="text-xs font-medium text-yellow-700 text-center">ตรวจงานที่ค้าง</span>
          </a>
          <a href="#admin-roadmaps" class="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group">
            <div class="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/></svg>
            </div>
            <span class="text-xs font-medium text-purple-700 text-center">จัดการ Roadmap</span>
          </a>
        </div>
      </div>
    `;

    // Feature 4 + 5: client-side analytics from students data
    var students = Array.isArray(studentsRes && (studentsRes.data || studentsRes))
      ? (studentsRes.data || studentsRes) : [];
    _adminAllStudents = students;
    renderAdminStudentBreakdown(students, a.pendingSubmissions || 0);
    renderAdminStatsPeriodControl();
    renderAdminStatsCharts();
    renderAdminUpcomingInterns();
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    document.getElementById('admin-stats').innerHTML = `
      <div class="col-span-full bg-red-50 text-red-600 p-4 rounded-lg text-sm">ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง</div>
    `;
  }
}

// ==================== Student Dashboard ====================

function studentDashDeptBadge(dept) {
  if (!dept) return '<span class="text-sm text-gray-400">ไม่ระบุ</span>';
  var colors = {
    'Support': 'bg-blue-100 text-blue-700',
    'Floor': 'bg-green-100 text-green-700',
    'O2O': 'bg-orange-100 text-orange-700',
    'B2B Sales': 'bg-purple-100 text-purple-700'
  };
  var found = '';
  Object.keys(colors).forEach(function(key) {
    if (dept.toLowerCase().indexOf(key.toLowerCase()) !== -1) found = colors[key];
  });
  if (!found) found = 'bg-gray-100 text-gray-700';
  return '<span class="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ' + found + '">' + escAttr(dept) + '</span>';
}

async function renderStudentDashboard(content) {
  var user = getCurrentUser();
  content.innerHTML = `
    <div class="fade-in">
      <div class="bg-gradient-to-r from-primary-600 to-blue-500 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div class="flex items-center gap-4">
          <div id="dash-avatar" class="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            <span class="text-2xl font-bold text-white">${escAttr((user.name || 'S').charAt(0))}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-xl font-bold truncate">สวัสดี, ${escAttr(user.name || 'นักศึกษา')}</h2>
            <p class="text-sm text-blue-100 truncate">${escAttr(user.email || '')}</p>
          </div>
          <div id="dash-countdown" class="flex-shrink-0 text-right"></div>
        </div>
      </div>

      <div id="dash-profile-info" class="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div class="flex items-start gap-2">
            <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/></svg>
            </div>
            <div>
              <p class="text-xs text-gray-400">แผนก</p>
              <div id="dash-dept" class="text-sm font-medium text-gray-800">-</div>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
            </div>
            <div>
              <p class="text-xs text-gray-400">ตำแหน่ง</p>
              <p id="dash-position" class="text-sm font-medium text-gray-800">-</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <div class="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.15c0 .415.336.75.75.75z"/></svg>
            </div>
            <div>
              <p class="text-xs text-gray-400">สาขาที่ฝึก</p>
              <p id="dash-branch" class="text-sm font-medium text-gray-800">-</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <div class="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/></svg>
            </div>
            <div>
              <p class="text-xs text-gray-400">มหาวิทยาลัย</p>
              <p id="dash-university" class="text-sm font-medium text-gray-800">-</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
            </div>
            <div>
              <p class="text-xs text-gray-400">สาขาวิชา</p>
              <p id="dash-major" class="text-sm font-medium text-gray-800">-</p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <div class="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z"/></svg>
            </div>
            <div>
              <p class="text-xs text-gray-400">ประเภท</p>
              <p id="dash-internship-type" class="text-sm font-medium text-gray-800">-</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-primary-500 relative overflow-hidden">
          <div class="absolute top-4 right-4 text-primary-100">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
          </div>
          <p class="text-sm text-gray-500 mb-1">ความคืบหน้าแผนฝึกงาน</p>
          <p id="dash-roadmap-progress" class="text-3xl font-bold text-gray-800">-</p>
          <p id="dash-roadmap-context" class="text-xs text-gray-400 mt-1">- ขั้นตอน</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500 relative overflow-hidden">
          <div class="absolute top-4 right-4 text-yellow-100">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
          </div>
          <p class="text-sm text-gray-500 mb-1">งานที่ส่งแล้ว</p>
          <p id="dash-submitted-assignments" class="text-3xl font-bold text-gray-800">-</p>
          <p id="dash-assignments-context" class="text-xs text-gray-400 mt-1">- งานทั้งหมด</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500 relative overflow-hidden">
          <div class="absolute top-4 right-4 text-green-100">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>
          </div>
          <p class="text-sm text-gray-500 mb-1">การแจ้งเตือนที่ยังไม่อ่าน</p>
          <p id="dash-unread-notifs" class="text-3xl font-bold text-gray-800">-</p>
          <p id="dash-notifs-context" class="text-xs text-gray-400 mt-1">- รายการทั้งหมด</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">ตารางเรียนวันนี้</h3>
          <span class="text-xs text-gray-400">${escAttr(formatDate(todayStr()))}</span>
        </div>
        <div id="dash-today-schedule">
          <p class="text-sm text-gray-500">กำลังโหลด...</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">ความคืบหน้าแผนฝึกงาน</h3>
          <div id="dash-progress-detail" class="space-y-3">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800">งานที่ต้องทำ / แจ้งเตือน</h3>
            <button id="dash-mark-all-read" onclick="dashMarkAllNotifRead()" class="hidden text-xs text-primary-600 hover:text-primary-700 hover:underline font-medium">อ่านทั้งหมด</button>
          </div>
          <div id="dash-notifications" class="space-y-2 overflow-y-auto flex-1" style="max-height: 320px;">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    var [progressRes, submissionRes, notifRes, profileRes, assignmentRes, roadmapRes] = await Promise.all([
      callApi('getRoadmapProgress', { userId: user.id }),
      callApi('getSubmissions', { userId: user.id }),
      callApi('getNotifications', { userId: user.id }),
      callApi('getUserProfile', { userId: user.id }),
      callApi('getAssignments'),
      callApi('getRoadmaps')
    ]);

    var progressList = Array.isArray(progressRes.data || progressRes) ? (progressRes.data || progressRes) : [];
    var submissions = Array.isArray(submissionRes.data || submissionRes) ? (submissionRes.data || submissionRes) : [];
    var notifications = Array.isArray(notifRes.data || notifRes) ? (notifRes.data || notifRes) : [];
    var assignments = Array.isArray(assignmentRes.data || assignmentRes) ? (assignmentRes.data || assignmentRes) : [];
    var roadmaps = Array.isArray(roadmapRes.data || roadmapRes) ? (roadmapRes.data || roadmapRes) : [];

    var profile = profileRes.success ? profileRes.data : {};
    if (profile) {
      var setField = function(id, val) {
        var el = document.getElementById(id);
        if (!el) return;
        if (!val || val === '-') {
          el.innerHTML = '<span class="text-gray-400">ไม่ระบุ</span>';
        } else {
          el.textContent = val;
        }
      };
      var deptEl = document.getElementById('dash-dept');
      if (deptEl) deptEl.innerHTML = studentDashDeptBadge(profile.department);
      setField('dash-position', profile.position);
      setField('dash-branch', profile.branch);
      setField('dash-university', profile.university);
      setField('dash-major', profile.major);
      setField('dash-internship-type', profile.internshipType);

      // Feature: avatar image (fallback to initial on missing/broken image)
      var avatarEl = document.getElementById('dash-avatar');
      var photo = profile.photoFileUrl || profile.profileImage || profile.photoUrl || user.profileImage || user.photoFileUrl;
      if (avatarEl && photo) {
        avatarEl.innerHTML = '<img src="' + safeUrl(driveImageUrl(photo)) + '" alt="โปรไฟล์" class="w-full h-full object-cover" ' +
          'onerror="dashAvatarError(this, \'' + escJs((user.name || 'S').charAt(0)) + '\')">';
      }

      // Feature: internship duration + countdown badge
      var cd = document.getElementById('dash-countdown');
      if (cd) {
        var sd = dateInputValue(profile.startDate);
        var ed = dateInputValue(profile.endDate);
        var t = todayStr();
        var dayDiff = function(a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000); };
        var label = '', big = '';
        if (sd && t < sd) {
          label = 'เริ่มฝึกในอีก'; big = dayDiff(t, sd) + ' วัน';
        } else if (ed && t > ed) {
          label = 'สถานะ'; big = 'ฝึกครบแล้ว';
        } else if (ed) {
          label = 'เหลือเวลาฝึกอีก'; big = Math.max(0, dayDiff(t, ed)) + ' วัน';
        } else if (sd) {
          label = 'เริ่มฝึกเมื่อ'; big = formatDate(sd);
        }
        if (big) {
          cd.innerHTML = '<div class="text-xs text-blue-100">' + escAttr(label) + '</div>' +
            '<div class="text-2xl font-bold leading-tight">' + escAttr(big) + '</div>' +
            ((sd || ed) ? '<div class="text-[11px] text-blue-100 mt-0.5">' + escAttr((sd ? formatDate(sd) : '?') + ' – ' + (ed ? formatDate(ed) : '?')) + '</div>' : '');
        }
      }
    }

    // Subject (วิชา) stats derived from assigned roadmaps + progress, matching the
    // roadmap page semantics (status computed from plan dates + eval result).
    var progressMap = {};
    progressList.forEach(function(p) { progressMap[p.stepId] = p; });
    var assignedRoadmaps = roadmaps.filter(function(r) {
      return (r.steps || []).some(function(s) { return progressMap[s.id]; });
    });
    var subjRoadmaps = assignedRoadmaps.length > 0 ? assignedRoadmaps : roadmaps;

    var totalCount = 0, completedCount = 0, enrolledCount = 0;
    var inProgressSteps = [];
    subjRoadmaps.forEach(function(r) {
      (r.steps || []).forEach(function(s) {
        totalCount++;
        var st = deriveTrainingStatus(progressMap[s.id]);
        if (st === 'COMPLETED') { completedCount++; enrolledCount++; }
        else if (st === 'IN_PROGRESS' || st === 'NOT_STARTED') {
          enrolledCount++;
          if (st === 'IN_PROGRESS') inProgressSteps.push({ stepTitle: s.title || 'ขั้นตอน' });
        }
      });
    });
    var remainingCount = Math.max(0, totalCount - enrolledCount);
    var progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    document.getElementById('dash-roadmap-progress').textContent = progressPct + '%';
    document.getElementById('dash-roadmap-context').textContent = completedCount + ' / ' + totalCount + ' วิชา';

    // Feature: Today's mini schedule (vertical timeline of today's classes)
    var todaySched = document.getElementById('dash-today-schedule');
    if (todaySched) {
      var t = todayStr();
      var toMin = function(x) { var m = String(x || '').match(/^(\d{1,2}):(\d{2})/); return m ? (+m[1]) * 60 + (+m[2]) : 9999; };
      var todayEvents = [];
      subjRoadmaps.forEach(function(r) {
        (r.steps || []).forEach(function(s) {
          var p = progressMap[s.id];
          if (!p || expandPlanDays(p).indexOf(t) === -1) return;
          var tm = getPlanDayTime(p, t);
          todayEvents.push({
            title: sanitizeSheetTitle(s.title) || s.title || 'หัวข้อการฝึก',
            time: tm,
            startMin: toMin(tm.start),
            pass: String(p.evalResult || '').toUpperCase() === 'PASS'
          });
        });
      });
      todayEvents.sort(function(a, b) { return a.startMin - b.startMin; });

      if (todayEvents.length > 0) {
        todaySched.innerHTML = '<div class="space-y-2">' + todayEvents.map(function(ev) {
          var timeLabel = formatTimeRange(ev.time) || 'ทั้งวัน';
          return '<div class="flex items-stretch gap-3">' +
            '<div class="flex-shrink-0 w-20 text-xs font-medium text-gray-500 pt-2 text-right">' + escAttr(timeLabel) + '</div>' +
            '<div class="flex-shrink-0 w-1.5 rounded-full ' + (ev.pass ? 'bg-green-400' : 'bg-primary-500') + '"></div>' +
            '<div class="flex-1 min-w-0 bg-primary-50 rounded-lg px-3 py-2">' +
              '<p class="text-sm font-medium text-gray-800 truncate">' + escAttr(ev.title) + '</p>' +
              (ev.pass ? '<span class="text-[11px] text-green-600">✓ ผ่านการประเมินแล้ว</span>' : '') +
            '</div>' +
          '</div>';
        }).join('') + '</div>';
      } else {
        todaySched.innerHTML = '<div class="flex flex-col items-center justify-center py-8 text-gray-400">' +
          '<svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' +
          '<p class="text-sm">วันนี้ไม่มีวิชาที่ต้องฝึก</p>' +
          '<a href="#student-roadmap" class="text-xs text-primary-600 hover:underline mt-1">ไปวางแผนการฝึกงาน</a>' +
        '</div>';
      }
    }
    document.getElementById('dash-submitted-assignments').textContent = submissions.length;
    document.getElementById('dash-assignments-context').textContent = '/ ' + assignments.length + ' งานทั้งหมด';
    var unread = notifications.filter(function(n) { return String(n.isRead) !== 'true'; }).length;
    document.getElementById('dash-unread-notifs').textContent = unread;
    document.getElementById('dash-notifs-context').textContent = notifications.length + ' รายการทั้งหมด';

    // Progress detail — segmented bar (completed / enrolled-pending / remaining) + metrics
    var pendingCount = Math.max(0, enrolledCount - completedCount);
    var compW = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    var pendW = totalCount > 0 ? (pendingCount / totalCount) * 100 : 0;
    var remW = totalCount > 0 ? (remainingCount / totalCount) * 100 : 0;
    var progressDetail = document.getElementById('dash-progress-detail');
    progressDetail.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm text-gray-600">ความสำเร็จ</span>
        <span class="text-xl font-bold ${progressPct >= 75 ? 'text-green-600' : progressPct >= 50 ? 'text-blue-600' : 'text-yellow-600'}">${progressPct}%</span>
      </div>
      <div class="flex w-full h-4 rounded-full overflow-hidden bg-gray-200 mb-4">
        <div class="h-4 bg-green-500 transition-all" style="width:${compW}%" title="ฝึกสำเร็จแล้ว"></div>
        <div class="h-4 bg-blue-500 transition-all" style="width:${pendW}%" title="ลงฝึกแล้วแต่ยังไม่จบ"></div>
        <div class="h-4 bg-gray-200 transition-all" style="width:${remW}%" title="ยังไม่ลงฝึก"></div>
      </div>
      <div class="grid grid-cols-3 gap-2 mb-4">
        <div class="text-center bg-blue-50 rounded-lg p-3">
          <p class="text-lg font-bold text-blue-600">${enrolledCount}<span class="text-xs font-normal text-gray-400">/${totalCount}</span></p>
          <p class="text-[11px] text-gray-500 mt-0.5">ลงฝึกแล้ว</p>
        </div>
        <div class="text-center bg-gray-50 rounded-lg p-3">
          <p class="text-lg font-bold text-gray-600">${remainingCount}</p>
          <p class="text-[11px] text-gray-500 mt-0.5">ยังไม่ลงฝึก</p>
        </div>
        <div class="text-center bg-green-50 rounded-lg p-3">
          <p class="text-lg font-bold text-green-600">${completedCount}</p>
          <p class="text-[11px] text-gray-500 mt-0.5">ฝึกสำเร็จแล้ว</p>
        </div>
      </div>
      ${inProgressSteps.length > 0 ? `
        <div class="flex items-center gap-2 mb-3">
          <span class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
            <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            กำลังดำเนินการ ${inProgressSteps.length} ขั้นตอน
          </span>
        </div>
        ${inProgressSteps.slice(0, 3).map(function(p) {
          return '<div class="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg"><div class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div><span class="text-sm text-blue-700">' + escAttr(p.stepTitle || p.stepId || 'ขั้นตอน') + '</span></div>';
        }).join('')}
      ` : '<p class="text-sm text-gray-400">ไม่มีขั้นตอนที่กำลังดำเนินการ</p>'}
    `;

    // Notifications - actionable cards (คลิกเพื่อทำเครื่องหมายว่าอ่านแล้ว + ไปยังหน้าที่เกี่ยวข้อง)
    var notifContainer = document.getElementById('dash-notifications');
    var markAllBtn = document.getElementById('dash-mark-all-read');
    if (markAllBtn) markAllBtn.classList.toggle('hidden', unread === 0);
    if (notifications.length > 0) {
      notifContainer.innerHTML = notifications.slice(0, 8).map(function(n) {
        var isUnread = String(n.isRead) !== 'true';
        var typeIcon = '';
        var navHash = '';
        var actionLabel = '';
        var title = n.title || n.message || '';
        var titleLower = title.toLowerCase();

        if (titleLower.indexOf('พี่เลี้ยง') !== -1 || titleLower.indexOf('mentor') !== -1) {
          typeIcon = '<svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"/></svg>';
          navHash = '#student-mentors';
          actionLabel = 'ดูโปรไฟล์พี่เลี้ยง';
        } else if (titleLower.indexOf('งาน') !== -1 || titleLower.indexOf('assignment') !== -1 || titleLower.indexOf('ส่ง') !== -1) {
          typeIcon = '<svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>';
          navHash = '#student-assignments';
          actionLabel = 'ดูงาน';
        } else if (titleLower.indexOf('roadmap') !== -1 || titleLower.indexOf('แผน') !== -1 || titleLower.indexOf('ตาราง') !== -1 || titleLower.indexOf('วิชา') !== -1) {
          typeIcon = '<svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/></svg>';
          navHash = '#student-roadmap';
          actionLabel = 'ไปวางแผนการฝึกงาน';
        } else {
          typeIcon = '<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>';
        }

        var arrow = navHash ? '<svg class="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>' : '';

        return '<div data-notif-id="' + escAttr(n.id) + '" data-unread="' + (isUnread ? 'true' : 'false') + '" ' +
          'onclick="dashGoToNotif(\'' + escJs(n.id) + '\', \'' + escJs(navHash) + '\', this)" ' +
          'class="flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-gray-100 ' + (isUnread ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50') + '">' +
          '<div class="flex-shrink-0 mt-0.5">' + typeIcon + '</div>' +
          '<div class="flex-1 min-w-0">' +
            '<p class="text-sm ' + (isUnread ? 'font-semibold text-gray-800' : 'font-medium text-gray-600') + ' truncate">' + escAttr(title) + '</p>' +
            '<p class="text-xs text-gray-400 mt-0.5">' + formatDate(n.createdAt || n.date) + '</p>' +
            (actionLabel ? '<span class="text-xs text-primary-600 mt-1 inline-block">' + escAttr(actionLabel) + ' &rsaquo;</span>' : '') +
          '</div>' +
          (isUnread ? '<span data-unread-dot class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>' : arrow) +
        '</div>';
      }).join('');
    } else {
      notifContainer.innerHTML = '<div class="flex flex-col items-center justify-center py-8 text-gray-400"><svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg><p class="text-sm">ไม่มีการแจ้งเตือน</p></div>';
    }
  } catch (error) {
    console.error('Error loading student dashboard:', error);
    document.getElementById('dash-progress-detail').innerHTML = '<p class="text-sm text-red-500">ไม่สามารถโหลดข้อมูลได้</p>';
    document.getElementById('dash-notifications').innerHTML = '<p class="text-sm text-red-500">ไม่สามารถโหลดข้อมูลได้</p>';
  }
}

// รูปโปรไฟล์โหลดไม่ได้ → กลับไปแสดงตัวอักษรย่อ
function dashAvatarError(img, initial) {
  var p = img.parentNode;
  if (p) p.innerHTML = '<span class="text-2xl font-bold text-white">' + escAttr(initial) + '</span>';
}

// คลิกการแจ้งเตือน: ทำเครื่องหมายว่าอ่านแล้ว (optimistic) + นำทางไปหน้าที่เกี่ยวข้อง
function dashGoToNotif(id, navHash, el) {
  if (el && el.getAttribute('data-unread') === 'true') {
    el.setAttribute('data-unread', 'false');
    el.classList.remove('bg-blue-50', 'border', 'border-blue-100');
    el.classList.add('bg-gray-50');
    var dot = el.querySelector('[data-unread-dot]');
    if (dot) dot.remove();
    var cntEl = document.getElementById('dash-unread-notifs');
    if (cntEl) {
      var n = parseInt(cntEl.textContent, 10) || 0;
      if (n > 0) cntEl.textContent = n - 1;
      if (n - 1 <= 0) {
        var allBtn = document.getElementById('dash-mark-all-read');
        if (allBtn) allBtn.classList.add('hidden');
      }
    }
    if (id) callApiPost('markAsRead', { notificationId: id }).catch(function() {});
  }
  if (navHash) window.location.hash = navHash;
}

async function dashMarkAllNotifRead() {
  var user = getCurrentUser();
  var container = document.getElementById('dash-notifications');
  if (container) {
    Array.prototype.forEach.call(container.querySelectorAll('[data-notif-id][data-unread="true"]'), function(el) {
      el.setAttribute('data-unread', 'false');
      el.classList.remove('bg-blue-50', 'border', 'border-blue-100');
      el.classList.add('bg-gray-50');
      var dot = el.querySelector('[data-unread-dot]');
      if (dot) dot.remove();
    });
  }
  var cntEl = document.getElementById('dash-unread-notifs');
  if (cntEl) cntEl.textContent = '0';
  var allBtn = document.getElementById('dash-mark-all-read');
  if (allBtn) allBtn.classList.add('hidden');
  try {
    await callApiPost('markAllAsRead', { userId: user.id });
    showToast('ทำเครื่องหมายว่าอ่านแล้วทั้งหมด', 'success');
  } catch (e) {
    showToast('เกิดข้อผิดพลาด', 'error');
  }
}

// ==================== Mentor Dashboard ====================

async function renderMentorDashboard(content) {
  var user = getCurrentUser();
  content.innerHTML = `
    <div class="fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">สวัสดี, ${escAttr(user.name || 'พี่เลี้ยง')}</h2>
      <p class="text-gray-500 mb-6">ภาพรวมการดูแลนักศึกษาฝึกงาน</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-primary-500">
          <p class="text-sm text-gray-500 mb-1">นักศึกษาในความดูแล</p>
          <p id="dash-mentor-students" class="text-3xl font-bold text-gray-800">-</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
          <p class="text-sm text-gray-500 mb-1">งานที่รอตรวจ</p>
          <p id="dash-mentor-pending" class="text-3xl font-bold text-gray-800">-</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
          <p class="text-sm text-gray-500 mb-1">ตรวจแล้ว</p>
          <p id="dash-mentor-reviewed" class="text-3xl font-bold text-gray-800">-</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">งานที่รอตรวจ</h3>
          <div id="dash-mentor-submissions" class="space-y-3">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">นักศึกษาในความดูแล</h3>
          <div id="dash-mentor-student-list" class="space-y-3">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    var [studentsRes, submissionsRes] = await Promise.all([
      callApi('getStudentsByMentor', { mentorId: user.id }),
      callApi('getSubmissions')
    ]);

    var students = Array.isArray(studentsRes.data || studentsRes) ? (studentsRes.data || studentsRes) : [];
    var allSubmissions = Array.isArray(submissionsRes.data || submissionsRes) ? (submissionsRes.data || submissionsRes) : [];
    var pendingSubmissions = allSubmissions.filter(function(s) { return String(s.status).toUpperCase() === 'SUBMITTED'; });
    var reviewedSubmissions = allSubmissions.filter(function(s) { var st = String(s.status).toUpperCase(); return st === 'REVIEWED' || st === 'GRADED'; });

    document.getElementById('dash-mentor-students').textContent = students.length;
    document.getElementById('dash-mentor-pending').textContent = pendingSubmissions.length;
    document.getElementById('dash-mentor-reviewed').textContent = reviewedSubmissions.length;

    var submissionsEl = document.getElementById('dash-mentor-submissions');
    if (pendingSubmissions.length > 0) {
      submissionsEl.innerHTML = pendingSubmissions.slice(0, 5).map(function(s) {
        return '<a href="#mentor-assignments" class="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"><p class="text-sm font-medium text-gray-700">' + escAttr(s.assignmentTitle || s.assignmentId || 'งาน') + '</p><p class="text-xs text-gray-400 mt-1">ส่งเมื่อ: ' + formatDate(s.submittedAt || s.createdAt) + '</p></a>';
      }).join('');
    } else {
      submissionsEl.innerHTML = '<p class="text-sm text-gray-400">ไม่มีงานที่รอตรวจ</p>';
    }

    var studentList = document.getElementById('dash-mentor-student-list');
    if (students.length > 0) {
      studentList.innerHTML = students.slice(0, 5).map(function(s) {
        return '<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"><span class="text-primary-700 font-semibold text-xs">' + escAttr((s.name || s.firstName || '?').charAt(0)) + '</span></div><div><p class="text-sm font-medium text-gray-700">' + escAttr(s.name || (s.firstName + ' ' + s.lastName) || s.email || '-') + '</p><p class="text-xs text-gray-400">' + escAttr(s.university || '') + '</p></div></div>';
      }).join('');
    } else {
      studentList.innerHTML = '<p class="text-sm text-gray-400">ยังไม่มีนักศึกษาในความดูแล</p>';
    }
  } catch (error) {
    console.error('Error loading mentor dashboard:', error);
    document.getElementById('dash-mentor-submissions').innerHTML = '<p class="text-sm text-red-500">ไม่สามารถโหลดข้อมูลได้</p>';
    document.getElementById('dash-mentor-student-list').innerHTML = '<p class="text-sm text-red-500">ไม่สามารถโหลดข้อมูลได้</p>';
  }
}
