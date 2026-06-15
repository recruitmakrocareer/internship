// ==================== ปฏิทินแผนการฝึกงาน ====================
// แสดงแผนการฝึกรายหัวข้อเป็นปฏิทินรายเดือน รองรับการฝึกแบบไม่ต่อเนื่อง (วันเว้นวัน)

const THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                     'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const THAI_DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

async function renderTrainingCalendar() {
  if (!checkAuth()) return;
  const user = getCurrentUser();
  const content = initLayout(user);

  const now = new Date();
  window._calYear = now.getFullYear();
  window._calMonth = now.getMonth();
  window._calView = window._calView || 'month';
  window._calWeekStart = calMondayOf(now);

  content.innerHTML = `
    <div class="fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">ปฏิทินแผนการฝึกงาน</h2>
      <div id="cal-unplanned-banner"></div>
      <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-2">
            <button onclick="calToday()" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">วันนี้</button>
            <button onclick="calNavigate(-1)" class="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button onclick="calNavigate(1)" class="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
          <h3 id="cal-title" class="text-lg font-semibold text-gray-800 flex-1 text-center min-w-[160px]"></h3>
          <div class="inline-flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            <button id="cal-view-month" onclick="calSetView('month')" class="px-3 py-1.5 transition-colors">เดือน</button>
            <button id="cal-view-workweek" onclick="calSetView('workweek')" class="px-3 py-1.5 border-l border-gray-200 transition-colors">สัปดาห์ทำงาน</button>
            <button id="cal-view-fullweek" onclick="calSetView('fullweek')" class="px-3 py-1.5 border-l border-gray-200 transition-colors">สัปดาห์เต็ม</button>
          </div>
        </div>
        <div id="cal-grid">
          <div class="text-center py-12 text-gray-400">กำลังโหลด...</div>
        </div>
        <div class="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-green-400 rounded"></span>ผ่านแล้ว / เสร็จสิ้น</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-blue-400 rounded"></span>กำลังฝึก</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-red-400 rounded"></span>ไม่ผ่าน (ฝึกซ้ำ)</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-gray-300 rounded"></span>วางแผนไว้</span>
          <span class="text-gray-400">| เวลาระบุในวงเล็บ</span>
        </div>
      </div>
    </div>
  `;

  await loadCalendarEvents();
  renderCalGrid();
}

// แปลงเวลา "HH:MM" เป็นนาที (null ถ้าไม่ระบุ)
function calToMin(s) {
  const m = String(s || '').match(/^(\d{1,2}):(\d{2})/);
  return m ? (+m[1]) * 60 + (+m[2]) : null;
}

// คืนวันจันทร์ของสัปดาห์ที่มีวันที่ d
function calMondayOf(d) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function calDateStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function calToday() {
  const now = new Date();
  window._calYear = now.getFullYear();
  window._calMonth = now.getMonth();
  window._calWeekStart = calMondayOf(now);
  renderCalGrid();
}

function calSetView(view) {
  window._calView = view;
  renderCalGrid();
}

function calNavigate(delta) {
  if (window._calView === 'month') {
    window._calMonth += delta;
    if (window._calMonth < 0) { window._calMonth = 11; window._calYear--; }
    if (window._calMonth > 11) { window._calMonth = 0; window._calYear++; }
  } else {
    const ws = new Date(window._calWeekStart);
    ws.setDate(ws.getDate() + delta * 7);
    window._calWeekStart = ws;
  }
  renderCalGrid();
}

async function loadCalendarEvents() {
  const user = getCurrentUser();
  window._calEvents = {};
  try {
    const [roadmapRes, progressRes] = await Promise.all([
      callApi('getRoadmaps'),
      callApi('getRoadmapProgress', { userId: user.id })
    ]);

    const roadmaps = roadmapRes.success !== false ? (roadmapRes.data || []) : [];
    const progressList = progressRes.success !== false ? (progressRes.data || []) : [];

    const stepMap = {};
    (Array.isArray(roadmaps) ? roadmaps : []).forEach(r => {
      (r.steps || []).forEach(s => { stepMap[s.id] = s; });
    });

    const progressMap = {};
    (Array.isArray(progressList) ? progressList : []).forEach(p => { progressMap[p.stepId] = p; });

    (Array.isArray(progressList) ? progressList : []).forEach(p => {
      const step = stepMap[p.stepId];
      const title = escAttr(sanitizeSheetTitle((step && step.title) || p.stepTitle) || 'หัวข้อการฝึก');

      const status = deriveTrainingStatus(p);
      let color = 'bg-gray-200 text-gray-600';
      if (String(p.evalResult || '').toUpperCase() === 'FAIL') color = 'bg-red-100 text-red-700 border-l-2 border-red-400';
      else if (status === 'COMPLETED') color = 'bg-green-100 text-green-700 border-l-2 border-green-400';
      else if (status === 'IN_PROGRESS') color = 'bg-blue-100 text-blue-700 border-l-2 border-blue-400';

      expandPlanDays(p).forEach(day => {
        if (!window._calEvents[day]) window._calEvents[day] = [];
        const t = getPlanDayTime(p, day);
        const timeLabel = formatTimeRange(t);
        window._calEvents[day].push({
          title: title,
          color: color,
          trainer: escAttr(p.trainerName || ''),
          timeLabel: timeLabel,
          startMin: calToMin(t.start),
          endMin: calToMin(t.end)
        });
      });
    });

    let unplanned = 0;
    let missingTrainer = 0;
    Object.keys(stepMap).forEach(sid => {
      const pr = progressMap[sid];
      if (deriveTrainingStatus(pr) === 'NOT_PLANNED') unplanned++;
      if (pr && deriveTrainingStatus(pr) !== 'NOT_PLANNED' && deriveTrainingStatus(pr) !== 'COMPLETED' && !pr.trainerName) missingTrainer++;
    });
    const banner = document.getElementById('cal-unplanned-banner');
    if (banner) {
      let msgs = [];
      if (unplanned > 0) msgs.push(`<b>${unplanned}</b> หัวข้อยังไม่ได้วางแผน`);
      if (missingTrainer > 0) msgs.push(`<b>${missingTrainer}</b> หัวข้อยังไม่ระบุผู้สอน`);
      banner.innerHTML = msgs.length > 0 ? `
        <div class="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg class="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <span class="text-sm text-amber-700 flex-1">${msgs.join(' / ')}</span>
          <a href="#student-roadmap" class="text-sm font-medium text-amber-700 underline hover:text-amber-800 whitespace-nowrap">ไปวางแผน →</a>
        </div>` : '';
    }
  } catch (e) {
    console.error('Error loading calendar events:', e);
    showToast('ไม่สามารถโหลดข้อมูลปฏิทินได้', 'error');
  }
}

// Backward-compatible alias
function changeCalMonth(delta) { calNavigate(delta); }

function renderCalGrid() {
  // Highlight the active view-switcher button
  ['month', 'workweek', 'fullweek'].forEach(v => {
    const btn = document.getElementById('cal-view-' + v);
    if (btn) btn.className = 'px-3 py-1.5 transition-colors' +
      (v !== 'month' ? ' border-l border-gray-200' : '') +
      (window._calView === v ? ' bg-primary-600 text-white' : ' text-gray-600 hover:bg-gray-50');
  });

  if (window._calView === 'month') {
    renderMonthGrid();
  } else {
    renderWeekGrid(window._calView === 'fullweek');
  }
}

// ===== Time-grid week view =====
const CAL_START_HOUR = 7;
const CAL_END_HOUR = 18;
const CAL_HOUR_PX = 48;

// จัดคอลัมน์ event ที่เวลาทับซ้อนกันให้แสดงเคียงข้างกัน (Google-calendar style)
function calPackEvents(evs) {
  const list = evs.slice().sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
  let group = [], columns = [], lastEnd = null;
  function flush() {
    const n = columns.length || 1;
    group.forEach(e => { e._cols = n; });
    group = []; columns = []; lastEnd = null;
  }
  list.forEach(ev => {
    if (lastEnd !== null && ev.startMin >= lastEnd) flush();
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      if (columns[i] <= ev.startMin) { columns[i] = ev.endMin; ev._col = i; placed = true; break; }
    }
    if (!placed) { columns.push(ev.endMin); ev._col = columns.length - 1; }
    group.push(ev);
    lastEnd = (lastEnd === null) ? ev.endMin : Math.max(lastEnd, ev.endMin);
  });
  flush();
  return list;
}

function renderWeekGrid(fullWeek) {
  const events = window._calEvents || {};
  const today = todayStr();
  const numDays = fullWeek ? 7 : 5;
  const weekStart = new Date(window._calWeekStart);

  const days = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push(d);
  }

  // Title: week range
  const last = days[days.length - 1];
  const titleEl = document.getElementById('cal-title');
  if (titleEl) {
    const sameMonth = days[0].getMonth() === last.getMonth();
    titleEl.textContent = days[0].getDate() + (sameMonth ? '' : ' ' + THAI_MONTHS[days[0].getMonth()]) +
      ' - ' + last.getDate() + ' ' + THAI_MONTHS[last.getMonth()] + ' ' + (last.getFullYear() + 543);
  }

  const totalHeight = (CAL_END_HOUR - CAL_START_HOUR) * CAL_HOUR_PX;

  let html = '<div class="overflow-x-auto"><div class="min-w-[640px]">';

  // Day header row
  html += '<div class="flex border-b border-gray-200">';
  html += '<div class="w-14 flex-shrink-0"></div>';
  days.forEach(d => {
    const isToday = calDateStr(d) === today;
    html += `<div class="flex-1 text-center py-2 ${isToday ? 'bg-primary-50' : ''}">
        <div class="text-xs text-gray-500">${THAI_DAYS[d.getDay()]}</div>
        <div class="text-base font-semibold ${isToday ? 'text-primary-600' : 'text-gray-700'}">${d.getDate()}</div>
      </div>`;
  });
  html += '</div>';

  // All-day / untimed events row
  let hasAllDay = false;
  let allDayHtml = '<div class="flex border-b border-gray-200 bg-gray-50/50">';
  allDayHtml += '<div class="w-14 flex-shrink-0 text-[10px] text-gray-400 text-right pr-1 py-1">ทั้งวัน</div>';
  days.forEach(d => {
    const dayEvents = (events[calDateStr(d)] || []).filter(e => e.startMin == null || e.endMin == null || e.endMin <= e.startMin);
    if (dayEvents.length) hasAllDay = true;
    allDayHtml += '<div class="flex-1 border-l border-gray-100 p-1 space-y-0.5">' +
      dayEvents.map(ev => `<div class="${ev.color} text-[10px] leading-tight px-1 py-0.5 rounded truncate" title="${ev.title}">${ev.title}</div>`).join('') +
      '</div>';
  });
  allDayHtml += '</div>';
  if (hasAllDay) html += allDayHtml;

  // Time grid body
  html += '<div class="flex">';
  // Time axis
  html += '<div class="w-14 flex-shrink-0">';
  for (let h = CAL_START_HOUR; h < CAL_END_HOUR; h++) {
    html += `<div style="height:${CAL_HOUR_PX}px" class="text-[10px] text-gray-400 text-right pr-1 -mt-1.5">${String(h).padStart(2, '0')}:00</div>`;
  }
  html += '</div>';

  // Day columns
  days.forEach(d => {
    const isToday = calDateStr(d) === today;
    const timed = (events[calDateStr(d)] || []).filter(e => e.startMin != null && e.endMin != null && e.endMin > e.startMin);
    const packed = calPackEvents(timed);

    html += `<div class="flex-1 relative border-l border-gray-100 ${isToday ? 'bg-primary-50/30' : ''}" style="height:${totalHeight}px">`;
    // Hour gridlines
    for (let h = CAL_START_HOUR; h < CAL_END_HOUR; h++) {
      html += `<div class="border-b border-gray-100" style="height:${CAL_HOUR_PX}px"></div>`;
    }
    // Event blocks
    packed.forEach(ev => {
      const startMin = Math.max(ev.startMin, CAL_START_HOUR * 60);
      const endMin = Math.min(ev.endMin, CAL_END_HOUR * 60);
      const top = ((startMin - CAL_START_HOUR * 60) / 60) * CAL_HOUR_PX;
      const height = Math.max(((endMin - startMin) / 60) * CAL_HOUR_PX, 18);
      const widthPct = 100 / ev._cols;
      const leftPct = ev._col * widthPct;
      html += `<div class="absolute ${ev.color} rounded px-1 py-0.5 overflow-hidden shadow-sm" style="top:${top}px;height:${height}px;left:calc(${leftPct}% + 2px);width:calc(${widthPct}% - 4px)" title="${ev.title}${ev.timeLabel ? ' (' + ev.timeLabel + ')' : ''}${ev.trainer ? ' — ผู้สอน: ' + ev.trainer : ''}">
          <div class="text-[9px] font-medium leading-none">${ev.timeLabel || ''}</div>
          <div class="text-[10px] leading-tight truncate">${ev.title}</div>
        </div>`;
    });
    html += '</div>';
  });
  html += '</div>'; // body flex
  html += '</div></div>'; // min-w + overflow

  document.getElementById('cal-grid').innerHTML = html;
}

function renderMonthGrid() {
  const year = window._calYear;
  const month = window._calMonth;
  const events = window._calEvents || {};

  document.getElementById('cal-title').textContent = THAI_MONTHS[month] + ' ' + (year + 543);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayStr();

  let html = '<div class="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">';
  THAI_DAYS.forEach(d => {
    html += `<div class="bg-gray-50 py-2 text-center text-xs font-medium text-gray-500">${d}</div>`;
  });

  for (let i = 0; i < firstDay; i++) {
    html += '<div class="bg-white min-h-[90px]"></div>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const dayEvents = events[dateStr] || [];
    const isToday = dateStr === today;

    html += `
      <div class="bg-white min-h-[90px] p-1.5 ${isToday ? 'ring-2 ring-inset ring-primary-400' : ''}">
        <div class="text-xs ${isToday ? 'font-bold text-primary-600' : 'text-gray-500'} mb-1">${day}</div>
        <div class="space-y-0.5">
          ${dayEvents.sort((a,b) => (a.timeLabel||'').localeCompare(b.timeLabel||'')).map(ev => `
            <div class="${ev.color} text-[10px] leading-tight px-1 py-0.5 rounded truncate cursor-default" title="${ev.title}${ev.timeLabel ? ' (' + ev.timeLabel + ')' : ''}${ev.trainer ? ' — ผู้สอน: ' + ev.trainer : ''}">${ev.timeLabel ? '<span class="font-medium">' + ev.timeLabel + '</span> ' : ''}${ev.title}</div>
          `).join('')}
        </div>
      </div>`;
  }

  const totalCells = firstDay + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < trailing; i++) {
    html += '<div class="bg-white min-h-[90px]"></div>';
  }

  html += '</div>';
  document.getElementById('cal-grid').innerHTML = html;
}
