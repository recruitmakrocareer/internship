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

  content.innerHTML = `
    <div class="fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">ปฏิทินแผนการฝึกงาน</h2>
      <div class="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <button onclick="changeCalMonth(-1)" class="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h3 id="cal-title" class="text-lg font-semibold text-gray-800"></h3>
          <button onclick="changeCalMonth(1)" class="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
        <div id="cal-grid">
          <div class="text-center py-12 text-gray-400">กำลังโหลด...</div>
        </div>
        <div class="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-green-400 rounded"></span>ผ่านแล้ว / เสร็จสิ้น</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-blue-400 rounded"></span>กำลังฝึก</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-red-400 rounded"></span>ไม่ผ่าน (ฝึกซ้ำ)</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-gray-300 rounded"></span>วางแผนไว้</span>
        </div>
      </div>
    </div>
  `;

  await loadCalendarEvents();
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

    (Array.isArray(progressList) ? progressList : []).forEach(p => {
      const step = stepMap[p.stepId];
      const title = (step && step.title) || p.stepTitle || 'หัวข้อการฝึก';

      // สีตามสถานะ: ไม่ผ่าน > ผ่าน/เสร็จ > กำลังฝึก > วางแผน
      const evalResult = String(p.evalResult || '').toUpperCase();
      const status = String(p.status || '').toUpperCase();
      let color = 'bg-gray-200 text-gray-600';
      if (evalResult === 'FAIL') color = 'bg-red-100 text-red-700 border-l-2 border-red-400';
      else if (evalResult === 'PASS' || status === 'COMPLETED') color = 'bg-green-100 text-green-700 border-l-2 border-green-400';
      else if (status === 'IN_PROGRESS') color = 'bg-blue-100 text-blue-700 border-l-2 border-blue-400';

      // วันที่ฝึก: ใช้รายวันถ้าระบุไว้ ไม่งั้นใช้ช่วง เริ่ม–สิ้นสุด
      let days = [];
      if (p.trainingDays) {
        days = String(p.trainingDays).split(',').map(s => s.trim()).filter(Boolean);
      } else if (p.startDate) {
        const start = dateInputValue(p.startDate);
        const end = dateInputValue(p.endDate) || start;
        if (start) {
          let d = new Date(start + 'T00:00:00');
          const endD = new Date(end + 'T00:00:00');
          let guard = 0;
          while (d <= endD && guard < 120) {
            days.push(d.toISOString().slice(0, 10));
            d.setDate(d.getDate() + 1);
            guard++;
          }
        }
      }

      days.forEach(day => {
        if (!window._calEvents[day]) window._calEvents[day] = [];
        window._calEvents[day].push({ title: title, color: color, trainer: p.trainerName || '' });
      });
    });
  } catch (e) {
    console.error('Error loading calendar events:', e);
    showToast('ไม่สามารถโหลดข้อมูลปฏิทินได้', 'error');
  }
}

function changeCalMonth(delta) {
  window._calMonth += delta;
  if (window._calMonth < 0) { window._calMonth = 11; window._calYear--; }
  if (window._calMonth > 11) { window._calMonth = 0; window._calYear++; }
  renderCalGrid();
}

function renderCalGrid() {
  const year = window._calYear;
  const month = window._calMonth;
  const events = window._calEvents || {};

  document.getElementById('cal-title').textContent = THAI_MONTHS[month] + ' ' + (year + 543);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

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
    const isToday = dateStr === todayStr;

    html += `
      <div class="bg-white min-h-[90px] p-1.5 ${isToday ? 'ring-2 ring-inset ring-primary-400' : ''}">
        <div class="text-xs ${isToday ? 'font-bold text-primary-600' : 'text-gray-500'} mb-1">${day}</div>
        <div class="space-y-0.5">
          ${dayEvents.slice(0, 3).map(ev => `
            <div class="${ev.color} text-[10px] leading-tight px-1 py-0.5 rounded truncate" title="${ev.title}${ev.trainer ? ' (ผู้สอน: ' + ev.trainer + ')' : ''}">${ev.title}</div>
          `).join('')}
          ${dayEvents.length > 3 ? `<div class="text-[10px] text-gray-400 px-1">+${dayEvents.length - 3} เพิ่มเติม</div>` : ''}
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
