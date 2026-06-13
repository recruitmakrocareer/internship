// ==================== หน้าแผนการฝึกงาน (นักศึกษา) ====================

async function renderStudentRoadmap() {
  if (!checkAuth()) return;
  const user = getCurrentUser();
  const content = initLayout(user);

  content.innerHTML = `
    <div class="fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">แผนการฝึกงาน</h2>
      <div id="roadmap-overview-cal" class="mb-6"></div>
      <div id="roadmap-container">
        <div class="grid grid-cols-1 gap-6">
          ${[1, 2].map(() => `
            <div class="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div class="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Modal อัปเดตสถานะ -->
    <div id="roadmap-step-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800" id="step-modal-title">อัปเดตสถานะ</h3>
          <button onclick="document.getElementById('roadmap-step-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="p-6" id="step-modal-body"></div>
      </div>
    </div>

    <!-- Modal QR Code สำหรับผู้ประเมิน -->
    <div id="step-qr-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div class="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">QR Code สำหรับผู้ประเมิน</h3>
          <button onclick="document.getElementById('step-qr-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="p-6 text-center" id="step-qr-body"></div>
      </div>
    </div>
  `;

  loadStudentRoadmaps();
}

async function loadStudentRoadmaps() {
  const user = getCurrentUser();
  try {
    showLoading();
    const [roadmapRes, progressRes] = await Promise.all([
      callApi('getRoadmaps'),
      callApi('getRoadmapProgress', { userId: user.id })
    ]);
    hideLoading();

    const roadmaps = roadmapRes.success !== false ? (roadmapRes.data || roadmapRes) : [];
    const progressList = progressRes.success !== false ? (progressRes.data || progressRes) : [];

    // สร้าง map ของ progress ตาม stepId
    const progressMap = {};
    if (Array.isArray(progressList)) {
      progressList.forEach(p => {
        progressMap[p.stepId] = p;
      });
    }

    // เก็บไว้ใน window สำหรับใช้ใน modal
    window._studentRoadmaps = Array.isArray(roadmaps) ? roadmaps : [];
    window._studentProgressMap = progressMap;

    // Filter to only show roadmaps that have been assigned to this student
    // A roadmap is "assigned" if any of its steps have progress entries for this user
    const assignedRoadmaps = window._studentRoadmaps.filter(roadmap => {
      if (!roadmap.steps || roadmap.steps.length === 0) return false;
      return roadmap.steps.some(step => progressMap[step.id]);
    });
    // Show assigned roadmaps if any, otherwise show all (for new students)
    const displayRoadmaps = assignedRoadmaps.length > 0 ? assignedRoadmaps : window._studentRoadmaps;

    renderRoadmapCards(displayRoadmaps, progressMap);
    renderOverviewCalendar();
  } catch (error) {
    hideLoading();
    console.error('Error loading roadmaps:', error);
    document.getElementById('roadmap-container').innerHTML = `
      <div class="bg-red-50 text-red-600 p-4 rounded-lg text-sm">ไม่สามารถโหลดข้อมูลแผนการฝึกงานได้ กรุณาลองใหม่อีกครั้ง</div>
    `;
  }
}

function renderRoadmapCards(roadmaps, progressMap) {
  const container = document.getElementById('roadmap-container');

  if (!Array.isArray(roadmaps) || roadmaps.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
        </svg>
        <p class="text-gray-400">ยังไม่มีแผนการฝึกงาน</p>
        <p class="text-sm text-gray-400 mt-1">กรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่าแผนการฝึกงาน</p>
      </div>
    `;
    return;
  }

  let html = '';
  roadmaps.forEach((roadmap, rIndex) => {
    const steps = roadmap.steps || [];
    const totalSteps = steps.length;

    // นับสถานะจากการคำนวณอัตโนมัติ (ตามวันฝึก + ผลประเมิน)
    let completedSteps = 0;
    let inProgressSteps = 0;
    let notPlannedSteps = 0;
    steps.forEach(step => {
      const st = deriveTrainingStatus(progressMap[step.id]);
      if (st === 'COMPLETED') completedSteps++;
      else if (st === 'IN_PROGRESS') inProgressSteps++;
      else if (st === 'NOT_PLANNED') notPlannedSteps++;
    });

    const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    // สีของ progress bar
    let progressColor = 'from-blue-500 to-blue-600';
    if (progressPct >= 100) progressColor = 'from-green-500 to-green-600';
    else if (progressPct >= 50) progressColor = 'from-blue-500 to-green-500';

    html += `
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-800">${roadmap.title || 'แผนฝึกงาน'}</h3>
              ${roadmap.description ? `<p class="text-sm text-gray-500 mt-1">${roadmap.description}</p>` : ''}
            </div>
            <div class="text-right ml-4">
              <span class="text-2xl font-bold text-primary-600">${progressPct}%</span>
              <p class="text-xs text-gray-500">ความคืบหน้า</p>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="bg-gray-200 rounded-full h-3 mb-3">
            <div class="bg-gradient-to-r ${progressColor} h-3 rounded-full transition-all duration-500" style="width: ${progressPct}%"></div>
          </div>

          <!-- Summary -->
          <div class="flex flex-wrap gap-4 text-xs text-gray-500">
            <span class="flex items-center gap-1">
              <span class="w-2 h-2 bg-green-500 rounded-full"></span>
              เสร็จสิ้น ${completedSteps}
            </span>
            <span class="flex items-center gap-1">
              <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
              กำลังดำเนินการ ${inProgressSteps}
            </span>
            <span class="flex items-center gap-1">
              <span class="w-2 h-2 bg-gray-300 rounded-full"></span>
              ยังไม่เริ่ม ${totalSteps - completedSteps - inProgressSteps - notPlannedSteps}
            </span>
            <span class="flex items-center gap-1">
              <span class="w-2 h-2 bg-amber-400 rounded-full"></span>
              ยังไม่ได้วางแผน ${notPlannedSteps}
            </span>
            <span class="ml-auto">ทั้งหมด ${totalSteps} ขั้นตอน</span>
          </div>

          ${notPlannedSteps > 0 ? `
          <div class="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-amber-700">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            มี ${notPlannedSteps} หัวข้อที่ยังไม่ได้วางแผนการฝึก — คลิกที่หัวข้อสีเหลืองเพื่อกำหนดวันฝึกและผู้สอน
          </div>` : ''}
        </div>

        <!-- Steps -->
        <div class="divide-y divide-gray-50">
          ${steps.map((step, sIndex) => {
            const p = progressMap[step.id] || {};
            const status = deriveTrainingStatus(progressMap[step.id]);

            let statusIcon, statusClass, statusLabel, badgeClass;
            if (status === 'COMPLETED') {
              statusIcon = '<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
              statusClass = 'bg-green-50';
              statusLabel = 'เสร็จสิ้น';
              badgeClass = 'bg-green-100 text-green-700';
            } else if (status === 'IN_PROGRESS') {
              statusIcon = '<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
              statusClass = 'bg-blue-50';
              statusLabel = 'กำลังดำเนินการ';
              badgeClass = 'bg-blue-100 text-blue-700';
            } else if (status === 'NOT_PLANNED') {
              statusIcon = '<svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
              statusClass = 'bg-amber-50 border-l-4 border-l-amber-400';
              statusLabel = 'ยังไม่ได้วางแผน';
              badgeClass = 'bg-amber-100 text-amber-700';
            } else {
              statusIcon = '<svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
              statusClass = '';
              statusLabel = 'ยังไม่เริ่ม';
              badgeClass = 'bg-gray-100 text-gray-500';
            }

            // Warning badges (Change E)
            const warnBadges = [];
            if ((status === 'IN_PROGRESS' || status === 'NOT_STARTED') && !p.trainerName) {
              warnBadges.push('<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 whitespace-nowrap">! ยังไม่ระบุผู้สอน</span>');
            }
            const planDays = expandPlanDays(p);
            const lastDay = planDays.length > 0 ? planDays[planDays.length - 1] : (dateInputValue(p.endDate) || '');
            if (lastDay && todayStr() > lastDay && status !== 'COMPLETED' && !String(p.evalResult || '').toUpperCase().match(/^(PASS|FAIL)$/)) {
              warnBadges.push('<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap">! เลยกำหนดยังไม่ประเมิน</span>');
            }

            return `
              <div class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${statusClass}" draggable="true" data-roadmap="${rIndex}" data-step="${sIndex}" data-step-id="${step.id}" onclick="openStepModal('${step.id}', ${rIndex}, ${sIndex})" ondragstart="handleStepDragStart(event)" ondragover="handleStepDragOver(event)" ondrop="handleStepDrop(event)" ondragend="handleStepDragEnd(event)">
                <div class="flex-shrink-0 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing" onmousedown="event.stopPropagation()">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8-16a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>
                </div>
                <div class="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                  ${sIndex + 1}
                </div>
                <div class="flex-shrink-0">${statusIcon}</div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">${step.title || 'ขั้นตอนที่ ' + (sIndex + 1)}</p>
                  ${step.description ? `<p class="text-xs text-gray-500 mt-0.5 truncate">${step.description}</p>` : ''}
                  ${p.trainerName || p.startDate ? `<p class="text-xs text-gray-400 mt-0.5 truncate">${p.trainerName ? '👤 ' + p.trainerName : ''}${p.startDate ? (p.trainerName ? ' • ' : '') + '📅 ' + formatDate(p.startDate) + (p.endDate ? ' – ' + formatDate(p.endDate) : '') : ''}${(p.startTime || p.endTime) ? ' (' + formatTimeRange({start: p.startTime, end: p.endTime}) + ')' : ''}</p>` : ''}
                  ${warnBadges.length > 0 ? '<div class="flex flex-wrap gap-1 mt-1">' + warnBadges.join('') + '</div>' : ''}
                </div>
                <div class="flex-shrink-0 flex items-center gap-2">
                  ${String(p.evalResult || '').toUpperCase() === 'PASS' ? '<span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">✓ ผ่าน</span>' : String(p.evalResult || '').toUpperCase() === 'FAIL' ? '<span class="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">✗ ไม่ผ่าน</span>' : ''}
                  <span class="text-xs px-2 py-1 rounded-full ${badgeClass}">${statusLabel}</span>
                  ${step.durationDays ? `<span class="text-xs text-gray-400">${step.durationDays} วัน</span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function openStepModal(stepId, roadmapIndex, stepIndex) {
  const roadmap = window._studentRoadmaps[roadmapIndex];
  const step = roadmap.steps[stepIndex];
  const p = window._studentProgressMap[stepId] || {};

  // วันฝึกแบบระบุวัน (ไม่ต่อเนื่อง)
  window._planDays = p.trainingDays ? String(p.trainingDays).split(',').map(s => s.trim()).filter(Boolean) : [];

  // Per-day time overrides (keyed by date string, value: {start, end})
  window._planDayTimes = parsePlanDayTimes(p);

  // วันที่หัวข้ออื่นใช้อยู่ — เก็บช่วงเวลาจริงแทน AM/PM
  window._busyDays = {};
  Object.keys(window._studentProgressMap).forEach(sid => {
    if (String(sid) === String(stepId)) return;
    const pr = window._studentProgressMap[sid];
    expandPlanDays(pr).forEach(day => {
      if (!window._busyDays[day]) window._busyDays[day] = [];
      const t = getPlanDayTime(pr, day);
      window._busyDays[day].push({ title: pr.stepTitle || 'หัวข้ออื่น', time: t });
    });
  });

  // เดือนเริ่มต้นของปฏิทินเลือกวัน
  const initDay = (window._planDays.length > 0 ? [...window._planDays].sort()[0] : '') || dateInputValue(p.startDate) || todayStr();
  window._miniCalYear = parseInt(initDay.substring(0, 4));
  window._miniCalMonth = parseInt(initDay.substring(5, 7)) - 1;

  document.getElementById('step-modal-title').textContent = step.title || 'ขั้นตอนที่ ' + (stepIndex + 1);

  // ส่วนแสดงผลการประเมิน
  const evalResult = String(p.evalResult || '').toUpperCase();
  let evalHtml = '';
  if (evalResult === 'PASS') {
    evalHtml = `
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-sm font-semibold text-green-700">✓ ผ่านการประเมิน</span>
        </div>
        ${p.evalComment ? `<p class="text-sm text-gray-600 mt-1">💬 ${p.evalComment}</p>` : ''}
        <p class="text-xs text-gray-400 mt-1">ประเมินโดย ${p.evalBy || '-'}${p.evalByPosition ? ' (' + p.evalByPosition + ')' : ''} เมื่อ ${formatDate(p.evalAt)}</p>
      </div>`;
  } else if (evalResult === 'FAIL') {
    evalHtml = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-sm font-semibold text-red-700">✗ ไม่ผ่านการประเมิน — ต้องฝึกเพิ่มเติมและประเมินใหม่</span>
        </div>
        ${Number(p.attemptCount) > 0 ? `<p class="text-xs text-red-500">ไม่ผ่านมาแล้ว ${p.attemptCount} ครั้ง</p>` : ''}
        ${p.evalComment ? `<p class="text-sm text-gray-600 mt-1">💬 ${p.evalComment}</p>` : ''}
        <p class="text-xs text-gray-400 mt-1">ประเมินโดย ${p.evalBy || '-'}${p.evalByPosition ? ' (' + p.evalByPosition + ')' : ''} เมื่อ ${formatDate(p.evalAt)}</p>
      </div>`;
  } else {
    evalHtml = `
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p class="text-sm text-gray-500">ยังไม่ได้รับการประเมิน — เมื่อฝึกเสร็จให้ผู้สอนสแกน QR Code เพื่อประเมิน</p>
      </div>`;
  }

  document.getElementById('step-modal-body').innerHTML = `
    <div class="space-y-5">
      <!-- รายละเอียด -->
      ${step.description ? `
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-sm font-medium text-gray-700 mb-1">รายละเอียด</h4>
          <p class="text-sm text-gray-600">${step.description}</p>
        </div>
      ` : ''}

      ${step.durationDays ? `
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          ระยะเวลามาตรฐาน: ${step.durationDays} วัน
        </div>
      ` : ''}

      ${step.resources ? `
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          แหล่งข้อมูล: ${step.resources}
        </div>
      ` : ''}

      <!-- ผลการประเมิน -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-medium text-gray-700">ผลการประเมิน</h4>
          <button onclick="showStepQr('${stepId}')" class="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
            QR ให้ผู้สอนประเมิน
          </button>
        </div>
        ${evalHtml}
      </div>

      <!-- ผู้ฝึกสอน -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-700 mb-3">ผู้ฝึกสอนหัวข้อนี้</h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs text-gray-500 mb-1">ชื่อผู้สอน</label>
            <input type="text" id="plan-trainer-name" value="${p.trainerName || ''}" placeholder="ชื่อ-นามสกุล"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">ตำแหน่ง</label>
            <input type="text" id="plan-trainer-position" value="${p.trainerPosition || ''}" placeholder="เช่น หัวหน้าแผนก"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">ช่องทางติดต่อ</label>
            <input type="text" id="plan-trainer-contact" value="${p.trainerContact || ''}" placeholder="เบอร์โทร / Line"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </div>

      <!-- ระยะเวลาการฝึก -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-700 mb-3">ระยะเวลาการฝึก</h4>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div>
            <label class="block text-xs text-gray-500 mb-1">วันที่เริ่ม</label>
            <input type="date" id="plan-start-date" value="${dateInputValue(p.startDate)}"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">วันที่สิ้นสุด</label>
            <input type="date" id="plan-end-date" value="${dateInputValue(p.endDate)}"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">เวลาเริ่ม</label>
            <input type="time" id="plan-start-time" value="${p.startTime || '09:00'}"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">เวลาสิ้นสุด</label>
            <input type="time" id="plan-end-time" value="${p.endTime || '17:00'}"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-2">จิ้มวันในปฏิทินเพื่อเลือกวันฝึกเป็นรายวัน (กรณีฝึกไม่ต่อเนื่อง เช่น วันเว้นวัน) — <span class="text-gray-400">จุดส้ม = เวลาซ้อนกัน, จุดเขียว = ไม่ซ้อน</span></label>
          <div id="plan-mini-cal" class="border border-gray-200 rounded-lg p-2"></div>
          <div id="plan-days-chips" class="flex flex-wrap gap-1.5 mt-2"></div>
        </div>
      </div>

      <!-- สถานะ (คำนวณอัตโนมัติ) -->
      <div class="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between">
        <span class="text-sm text-gray-600">สถานะปัจจุบัน <span class="text-xs text-gray-400">(อัปเดตอัตโนมัติตามวันฝึกและผลประเมิน)</span></span>
        <span class="text-xs px-2.5 py-1 rounded-full font-medium ${
          deriveTrainingStatus(p) === 'COMPLETED' ? 'bg-green-100 text-green-700' :
          deriveTrainingStatus(p) === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
          deriveTrainingStatus(p) === 'NOT_PLANNED' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'
        }">${
          deriveTrainingStatus(p) === 'COMPLETED' ? 'เสร็จสิ้น' :
          deriveTrainingStatus(p) === 'IN_PROGRESS' ? 'กำลังดำเนินการ' :
          deriveTrainingStatus(p) === 'NOT_PLANNED' ? 'ยังไม่ได้วางแผน' : 'ยังไม่เริ่ม'
        }</span>
      </div>

      <!-- บันทึก -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">บันทึก / หมายเหตุ</label>
        <textarea id="step-note-input" rows="3" placeholder="เพิ่มบันทึกเกี่ยวกับขั้นตอนนี้..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">${p.note || ''}</textarea>
      </div>

      <!-- ปุ่ม -->
      <div class="flex justify-end gap-3 pt-2">
        <button onclick="document.getElementById('roadmap-step-modal').classList.add('hidden')"
          class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
          ยกเลิก
        </button>
        <button onclick="saveStepProgress('${stepId}')"
          class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors">
          บันทึก
        </button>
      </div>
    </div>
  `;

  renderMiniCal();
  renderPlanDayChips();
  document.getElementById('roadmap-step-modal').classList.remove('hidden');
}

// ==================== ปฏิทินเลือกวันฝึกใน Modal ====================

function renderMiniCal() {
  const container = document.getElementById('plan-mini-cal');
  if (!container) return;

  const year = window._miniCalYear;
  const month = window._miniCalMonth;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayStr();
  const busy = window._busyDays || {};
  const selected = window._planDays || [];

  // Current step's global time range (from the time inputs)
  const startTimeEl = document.getElementById('plan-start-time');
  const endTimeEl = document.getElementById('plan-end-time');
  const currentTime = {
    start: startTimeEl ? startTimeEl.value : '09:00',
    end: endTimeEl ? endTimeEl.value : '17:00'
  };

  let html = `
    <div class="flex items-center justify-between mb-1">
      <button onclick="changeMiniCalMonth(-1)" class="p-1 hover:bg-gray-100 rounded text-gray-500 text-sm px-2">&lsaquo;</button>
      <span class="text-sm font-medium text-gray-700">${THAI_MONTHS[month]} ${year + 543}</span>
      <button onclick="changeMiniCalMonth(1)" class="p-1 hover:bg-gray-100 rounded text-gray-500 text-sm px-2">&rsaquo;</button>
    </div>
    <div class="grid grid-cols-7 gap-0.5 text-center">`;

  THAI_DAYS.forEach(d => {
    html += `<div class="text-[10px] text-gray-400 py-1">${d}</div>`;
  });

  for (let i = 0; i < firstDay; i++) html += '<div></div>';

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const isSelected = selected.includes(dateStr);
    const busyItems = busy[dateStr];
    const isToday = dateStr === today;

    // Per-day time override for current step
    const dayTime = (window._planDayTimes && window._planDayTimes[dateStr]) || currentTime;

    // Check overlap: orange = time overlaps, green = no overlap
    let hasOverlap = false;
    let allOverlap = false;
    if (busyItems && busyItems.length > 0) {
      const overlapping = busyItems.filter(b => timeRangesOverlap(dayTime, b.time));
      hasOverlap = overlapping.length > 0;
      allOverlap = overlapping.length === busyItems.length && busyItems.length > 0;
    }

    let cls = 'relative text-xs py-1.5 rounded cursor-pointer select-none transition-colors ';
    if (isSelected) cls += 'bg-primary-600 text-white font-semibold ';
    else if (busyItems && allOverlap) cls += 'bg-red-50 text-red-400 hover:bg-primary-100 ';
    else if (busyItems && hasOverlap) cls += 'bg-amber-50 text-gray-600 hover:bg-primary-100 ';
    else if (busyItems) cls += 'bg-green-50 text-gray-600 hover:bg-primary-100 ';
    else cls += 'text-gray-700 hover:bg-primary-50 ';
    if (isToday && !isSelected) cls += 'ring-1 ring-primary-400 ';

    const busyTooltip = busyItems ? busyItems.map(b => b.title + (formatTimeRange(b.time) ? ' (' + formatTimeRange(b.time) + ')' : ' (ทั้งวัน)')).join(', ') : '';

    html += `
      <div class="${cls}" onclick="togglePlanDay('${dateStr}')" title="${busyItems ? 'นัดแล้ว: ' + busyTooltip : 'ว่าง'}">
        ${day}
        ${busyItems && !isSelected ? `<span class="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-px">${hasOverlap ? '<span class="w-1 h-1 bg-orange-400 rounded-full"></span>' : '<span class="w-1 h-1 bg-green-400 rounded-full"></span>'}</span>` : ''}
      </div>`;
  }

  html += '</div>';
  container.innerHTML = html;
}

function changeMiniCalMonth(delta) {
  window._miniCalMonth += delta;
  if (window._miniCalMonth < 0) { window._miniCalMonth = 11; window._miniCalYear--; }
  if (window._miniCalMonth > 11) { window._miniCalMonth = 0; window._miniCalYear++; }
  renderMiniCal();
}

function togglePlanDay(dateStr) {
  if (window._planDays.includes(dateStr)) {
    window._planDays = window._planDays.filter(x => x !== dateStr);
    if (window._planDayTimes) delete window._planDayTimes[dateStr];
  } else {
    if (window._busyDays && window._busyDays[dateStr]) {
      const items = window._busyDays[dateStr];
      const startTimeEl = document.getElementById('plan-start-time');
      const endTimeEl = document.getElementById('plan-end-time');
      const currentTime = {
        start: startTimeEl ? startTimeEl.value : '',
        end: endTimeEl ? endTimeEl.value : ''
      };
      const overlapping = items.filter(b => timeRangesOverlap(currentTime, b.time));
      if (overlapping.length > 0) {
        const labels = overlapping.map(b => b.title + (formatTimeRange(b.time) ? ' ' + formatTimeRange(b.time) : '')).join(', ');
        showToast('เวลาซ้อนกับ: ' + labels + ' — สามารถแก้เวลารายวันได้ที่ชิป', 'warning');
      }
    }
    window._planDays.push(dateStr);
  }
  renderMiniCal();
  renderPlanDayChips();
}

function renderPlanDayChips() {
  const c = document.getElementById('plan-days-chips');
  if (!c) return;
  if (!window._planDays || window._planDays.length === 0) {
    c.innerHTML = '<span class="text-xs text-gray-400">ยังไม่ได้ระบุวัน — ระบบจะใช้ช่วงวันที่เริ่ม–สิ้นสุดแทน</span>';
    return;
  }
  const globalS = document.getElementById('plan-start-time') ? document.getElementById('plan-start-time').value : '';
  const globalE = document.getElementById('plan-end-time') ? document.getElementById('plan-end-time').value : '';
  const dt = window._planDayTimes || {};
  c.innerHTML = [...window._planDays].sort().map(d => {
    const ov = dt[d];
    const timeLabel = ov ? formatTimeRange(ov) : (globalS || globalE ? formatTimeRange({start: globalS, end: globalE}) : '');
    return `
    <span class="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">
      ${formatDate(d)}${timeLabel ? ' <span class="text-primary-400">' + timeLabel + '</span>' : ''}
      <button onclick="editDayTime('${d}')" class="hover:text-blue-500" title="แก้เวลา">&#x270E;</button>
      <button onclick="removePlanDay('${d}')" class="hover:text-red-500 font-bold">&times;</button>
    </span>`;
  }).join('');
}

function editDayTime(dateStr) {
  const dt = window._planDayTimes || {};
  const cur = dt[dateStr] || {};
  const globalS = document.getElementById('plan-start-time') ? document.getElementById('plan-start-time').value : '09:00';
  const globalE = document.getElementById('plan-end-time') ? document.getElementById('plan-end-time').value : '17:00';
  const s = cur.start || globalS;
  const e = cur.end || globalE;
  const html = `<div class="flex items-center gap-2 text-xs"><span>${formatDate(dateStr)}</span>` +
    `<input type="time" id="dt-s-${dateStr}" value="${s}" class="border rounded px-1 py-0.5 text-xs w-24">` +
    `<span>–</span><input type="time" id="dt-e-${dateStr}" value="${e}" class="border rounded px-1 py-0.5 text-xs w-24">` +
    `<button onclick="saveDayTime('${dateStr}')" class="text-primary-600 font-medium">OK</button>` +
    `<button onclick="clearDayTime('${dateStr}')" class="text-gray-400">ใช้ค่าเริ่มต้น</button></div>`;
  const c = document.getElementById('plan-days-chips');
  if (c) c.insertAdjacentHTML('beforeend', '<div id="dt-edit-row" class="mt-1">' + html + '</div>');
}

function saveDayTime(dateStr) {
  if (!window._planDayTimes) window._planDayTimes = {};
  const sEl = document.getElementById('dt-s-' + dateStr);
  const eEl = document.getElementById('dt-e-' + dateStr);
  window._planDayTimes[dateStr] = { start: sEl ? sEl.value : '', end: eEl ? eEl.value : '' };
  const row = document.getElementById('dt-edit-row');
  if (row) row.remove();
  renderPlanDayChips();
  renderMiniCal();
}

function clearDayTime(dateStr) {
  if (window._planDayTimes) delete window._planDayTimes[dateStr];
  const row = document.getElementById('dt-edit-row');
  if (row) row.remove();
  renderPlanDayChips();
}

function removePlanDay(d) {
  window._planDays = window._planDays.filter(x => x !== d);
  if (window._planDayTimes) delete window._planDayTimes[d];
  renderMiniCal();
  renderPlanDayChips();
}

async function showStepQr(stepId) {
  const user = getCurrentUser();
  showLoading();
  try {
    const res = await callApi('getEvalToken', { userId: user.id, stepId: stepId });
    hideLoading();
    if (res.success === false || !res.data || !res.data.token) {
      showToast(res.message || 'ไม่สามารถสร้าง QR ได้', 'error');
      return;
    }
    const evalUrl = window.location.origin + window.location.pathname + '#evaluate?token=' + res.data.token;
    const qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=' + encodeURIComponent(evalUrl);
    document.getElementById('step-qr-body').innerHTML = `
      <img src="${qrSrc}" alt="QR Code" class="mx-auto rounded-lg border border-gray-200" width="240" height="240" />
      <p class="text-sm text-gray-600 mt-4">ให้ผู้สอนสแกน QR Code นี้เพื่อประเมินผลการฝึก<br>ไม่ต้องเข้าสู่ระบบ</p>
      <button onclick="navigator.clipboard.writeText('${evalUrl}').then(() => showToast('คัดลอกลิงก์แล้ว', 'success'))"
        class="mt-3 text-xs text-primary-600 hover:underline">คัดลอกลิงก์ประเมิน</button>
    `;
    document.getElementById('step-qr-modal').classList.remove('hidden');
  } catch (e) {
    hideLoading();
    showToast('เกิดข้อผิดพลาดในการสร้าง QR', 'error');
  }
}

async function saveStepProgress(stepId) {
  const user = getCurrentUser();
  const note = document.getElementById('step-note-input').value.trim();

  showLoading();
  try {
    const result = await callApiPost('updateStepPlan', {
      userId: user.id,
      actorId: user.id,
      stepId: stepId,
      note: note,
      trainerName: document.getElementById('plan-trainer-name').value.trim(),
      trainerPosition: document.getElementById('plan-trainer-position').value.trim(),
      trainerContact: document.getElementById('plan-trainer-contact').value.trim(),
      startDate: document.getElementById('plan-start-date').value,
      endDate: document.getElementById('plan-end-date').value,
      trainingDays: (window._planDays || []).join(','),
      startTime: document.getElementById('plan-start-time').value,
      endTime: document.getElementById('plan-end-time').value,
      dayTimes: JSON.stringify(window._planDayTimes || {})
    });

    if (result.success !== false) {
      showToast('บันทึกแผนการฝึกสำเร็จ', 'success');
      document.getElementById('roadmap-step-modal').classList.add('hidden');
      await loadStudentRoadmaps();
    } else {
      showToast(result.message || 'เกิดข้อผิดพลาด', 'error');
    }
  } catch (error) {
    showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    console.error('Error saving step progress:', error);
  }
  hideLoading();
}

window._draggedStep = null;

function handleStepDragStart(e) {
  window._draggedStep = e.currentTarget;
  e.currentTarget.style.opacity = '0.5';
  e.dataTransfer.effectAllowed = 'move';
}

function handleStepDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const target = e.currentTarget;
  if (target !== window._draggedStep && target.dataset.roadmap === window._draggedStep.dataset.roadmap) {
    target.style.borderTop = '2px solid #3b82f6';
  }
}

function handleStepDrop(e) {
  e.preventDefault();
  const target = e.currentTarget;
  target.style.borderTop = '';

  if (!window._draggedStep || target === window._draggedStep) return;
  if (target.dataset.roadmap !== window._draggedStep.dataset.roadmap) return;

  const rIndex = parseInt(window._draggedStep.dataset.roadmap);
  const fromIndex = parseInt(window._draggedStep.dataset.step);
  const toIndex = parseInt(target.dataset.step);

  // Reorder the steps array
  const roadmap = window._studentRoadmaps[rIndex];
  if (roadmap && roadmap.steps) {
    const [movedStep] = roadmap.steps.splice(fromIndex, 1);
    roadmap.steps.splice(toIndex, 0, movedStep);
    renderRoadmapCards(window._studentRoadmaps.filter(r => r.steps && r.steps.length > 0), window._studentProgressMap);
    showToast('เรียงลำดับใหม่สำเร็จ', 'success');
  }
}

function handleStepDragEnd(e) {
  e.currentTarget.style.opacity = '';
  document.querySelectorAll('[data-step]').forEach(el => { el.style.borderTop = ''; });
  window._draggedStep = null;
}

// ==================== ปฏิทินภาพรวม (Embedded Overview Calendar) ====================

function renderOverviewCalendar() {
  const container = document.getElementById('roadmap-overview-cal');
  if (!container) return;

  const roadmaps = window._studentRoadmaps || [];
  const progressMap = window._studentProgressMap || {};

  // Build step map (stepId → {roadmapIndex, stepIndex, step})
  const stepLookup = {};
  roadmaps.forEach((r, rIndex) => {
    (r.steps || []).forEach((s, sIndex) => {
      stepLookup[s.id] = { rIndex, sIndex, step: s };
    });
  });

  // Build event map for all days
  const calEvents = {};
  Object.keys(progressMap).forEach(sid => {
    const p = progressMap[sid];
    const lookup = stepLookup[sid];
    const title = (lookup && lookup.step.title) || p.stepTitle || 'หัวข้อการฝึก';
    const status = deriveTrainingStatus(p);
    let color = 'bg-gray-200 text-gray-600';
    if (String(p.evalResult || '').toUpperCase() === 'FAIL') color = 'bg-red-100 text-red-700 border-l-2 border-red-400';
    else if (status === 'COMPLETED') color = 'bg-green-100 text-green-700 border-l-2 border-green-400';
    else if (status === 'IN_PROGRESS') color = 'bg-blue-100 text-blue-700 border-l-2 border-blue-400';

    expandPlanDays(p).forEach(day => {
      if (!calEvents[day]) calEvents[day] = [];
      const t = getPlanDayTime(p, day);
      calEvents[day].push({
        stepId: sid,
        rIndex: lookup ? lookup.rIndex : 0,
        sIndex: lookup ? lookup.sIndex : 0,
        title: title,
        color: color,
        timeLabel: formatTimeRange(t)
      });
    });
  });

  window._overviewCalEvents = calEvents;

  // Initialize month
  if (window._overviewCalYear === undefined) {
    const now = new Date();
    window._overviewCalYear = now.getFullYear();
    window._overviewCalMonth = now.getMonth();
  }

  renderOverviewCalGrid();
}

function changeOverviewCalMonth(delta) {
  window._overviewCalMonth += delta;
  if (window._overviewCalMonth < 0) { window._overviewCalMonth = 11; window._overviewCalYear--; }
  if (window._overviewCalMonth > 11) { window._overviewCalMonth = 0; window._overviewCalYear++; }
  renderOverviewCalGrid();
}

function renderOverviewCalGrid() {
  const container = document.getElementById('roadmap-overview-cal');
  if (!container) return;

  const year = window._overviewCalYear;
  const month = window._overviewCalMonth;
  const events = window._overviewCalEvents || {};
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayStr();

  let html = `
    <div class="bg-white rounded-xl shadow-sm p-4">
      <div class="flex items-center justify-between mb-3">
        <button onclick="changeOverviewCalMonth(-1)" class="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h3 class="text-sm font-semibold text-gray-700">${THAI_MONTHS[month]} ${year + 543}</h3>
        <button onclick="changeOverviewCalMonth(1)" class="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
      <div class="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">`;

  THAI_DAYS.forEach(d => {
    html += '<div class="bg-gray-50 py-1.5 text-center text-[10px] font-medium text-gray-500">' + d + '</div>';
  });

  for (let i = 0; i < firstDay; i++) {
    html += '<div class="bg-white min-h-[60px]"></div>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const dayEvents = events[dateStr] || [];
    const isToday = dateStr === today;
    const hasEvents = dayEvents.length > 0;

    html += '<div class="bg-white min-h-[60px] p-1 cursor-pointer hover:bg-gray-50 group ' + (isToday ? 'ring-2 ring-inset ring-primary-400' : '') + '"' +
      ' onclick="onOverviewCalDayClick(\'' + dateStr + '\', event)">' +
      '<div class="text-[10px] ' + (isToday ? 'font-bold text-primary-600' : 'text-gray-400') + ' mb-0.5 flex items-center justify-between">' + day +
      (!hasEvents ? '<span class="hidden group-hover:inline text-gray-300 text-[10px] font-bold leading-none">+</span>' : '') + '</div>' +
      '<div class="space-y-px">';

    dayEvents.slice(0, 2).forEach(ev => {
      html += '<div class="' + ev.color + ' text-[9px] leading-tight px-0.5 py-px rounded truncate" title="' +
        ev.title + (ev.timeLabel ? ' ' + ev.timeLabel : '') + '">' +
        (ev.timeLabel ? '<span class="font-medium">' + ev.timeLabel + '</span> ' : '') +
        ev.title + '</div>';
    });
    if (dayEvents.length > 2) {
      html += '<div class="text-[9px] text-gray-400 px-0.5">+' + (dayEvents.length - 2) + '</div>';
    }

    html += '</div></div>';
  }

  const totalCells = firstDay + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for (let i = 0; i < trailing; i++) {
    html += '<div class="bg-white min-h-[60px]"></div>';
  }

  html += '</div></div>';
  container.innerHTML = html;
}

function onOverviewCalDayClick(dateStr, evt) {
  const events = (window._overviewCalEvents || {})[dateStr];
  if (events && events.length > 0) {
    showDaySummary(dateStr, events, evt);
  } else {
    showDayStepPicker(dateStr, evt);
  }
}

function showDaySummary(dateStr, events, evt) {
  var existing = document.getElementById('day-step-picker');
  if (existing) existing.remove();

  var parts = dateStr.split('-');
  var displayDate = parseInt(parts[2], 10) + ' ' + (typeof THAI_MONTHS !== 'undefined' ? THAI_MONTHS[parseInt(parts[1], 10) - 1] : parts[1]) + ' ' + (parseInt(parts[0], 10) + 543);

  var eventsHtml = '';
  events.forEach(function(ev) {
    eventsHtml += '<button class="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors" ' +
      'onclick="document.getElementById(\'day-step-picker\').remove(); openStepModal(\'' + ev.stepId + '\', ' + ev.rIndex + ', ' + ev.sIndex + ')">' +
      '<span class="w-2 h-2 rounded-full flex-shrink-0 ' + (ev.color.indexOf('green') >= 0 ? 'bg-green-400' : ev.color.indexOf('blue') >= 0 ? 'bg-blue-400' : ev.color.indexOf('red') >= 0 ? 'bg-red-400' : 'bg-gray-400') + '"></span>' +
      '<span class="truncate flex-1">' + ev.title + '</span>' +
      (ev.timeLabel ? '<span class="text-[10px] text-gray-400 flex-shrink-0">' + ev.timeLabel + '</span>' : '') +
      '<svg class="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>' +
      '</button>';
  });

  var roadmaps = window._studentRoadmaps || [];
  var progressMap = window._studentProgressMap || {};
  var pickableSteps = [];
  roadmaps.forEach(function(r, rIndex) {
    (r.steps || []).forEach(function(s, sIndex) {
      var p = progressMap[s.id];
      var status = deriveTrainingStatus(p);
      if (status === 'NOT_PLANNED' || status === 'IN_PROGRESS') {
        pickableSteps.push({ stepId: s.id, rIndex: rIndex, sIndex: sIndex, title: s.title || 'หัวข้อการฝึก', status: status });
      }
    });
  });

  var addHtml = '';
  if (pickableSteps.length > 0) {
    addHtml = '<div class="border-t border-gray-100"><div class="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">เพิ่มวิชาใหม่</div>';
    pickableSteps.forEach(function(ps) {
      var badge = ps.status === 'IN_PROGRESS'
        ? '<span class="inline-block px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-600 rounded-full ml-auto flex-shrink-0">กำลังฝึก</span>'
        : '<span class="inline-block px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded-full ml-auto flex-shrink-0">ยังไม่วางแผน</span>';
      addHtml += '<button class="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors" ' +
        'onclick="document.getElementById(\'day-step-picker\').remove(); openStepModal(\'' + ps.stepId + '\', ' + ps.rIndex + ', ' + ps.sIndex + ')">' +
        '<svg class="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>' +
        '<span class="truncate flex-1">' + ps.title + '</span>' + badge + '</button>';
    });
    addHtml += '</div>';
  }

  var picker = document.createElement('div');
  picker.id = 'day-step-picker';
  picker.className = 'fixed z-[80] bg-white rounded-xl shadow-2xl border border-gray-200 w-80 max-h-96 overflow-hidden';
  picker.style.left = Math.min(evt.clientX, window.innerWidth - 330) + 'px';
  picker.style.top = Math.min(evt.clientY, window.innerHeight - 400) + 'px';

  picker.innerHTML =
    '<div class="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl">' +
      '<span class="text-xs font-semibold text-gray-600">📅 ' + displayDate + ' <span class="font-normal text-gray-400">(' + events.length + ' วิชา)</span></span>' +
      '<button onclick="document.getElementById(\'day-step-picker\').remove()" class="text-gray-400 hover:text-gray-600 p-0.5">' +
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">แผนที่มีอยู่</div>' +
    '<div class="divide-y divide-gray-50">' + eventsHtml + '</div>' +
    addHtml;

  document.body.appendChild(picker);

  function closePicker(e) {
    if (!picker.contains(e.target)) {
      picker.remove();
      document.removeEventListener('mousedown', closePicker);
    }
  }
  setTimeout(function() { document.addEventListener('mousedown', closePicker); }, 0);
}

function showDayStepPicker(dateStr, evt) {
  // Remove any existing picker
  const existing = document.getElementById('day-step-picker');
  if (existing) existing.remove();

  const roadmaps = window._studentRoadmaps || [];
  const progressMap = window._studentProgressMap || {};

  // Collect steps that are NOT_PLANNED or IN_PROGRESS
  const pickableSteps = [];
  roadmaps.forEach((r, rIndex) => {
    (r.steps || []).forEach((s, sIndex) => {
      const p = progressMap[s.id];
      const status = deriveTrainingStatus(p);
      if (status === 'NOT_PLANNED' || status === 'IN_PROGRESS') {
        pickableSteps.push({ stepId: s.id, rIndex, sIndex, title: s.title || 'หัวข้อการฝึก', status });
      }
    });
  });

  if (pickableSteps.length === 0) {
    // Nothing to plan — brief toast-style feedback
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-[100]';
    toast.textContent = 'ไม่มีหัวข้อที่รอวางแผน';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
    return;
  }

  // Format display date
  const parts = dateStr.split('-');
  const displayDate = parseInt(parts[2], 10) + ' ' + (typeof THAI_MONTHS !== 'undefined' ? THAI_MONTHS[parseInt(parts[1], 10) - 1] : parts[1]) + ' ' + (parseInt(parts[0], 10) + 543);

  // Build picker popup
  const picker = document.createElement('div');
  picker.id = 'day-step-picker';
  picker.className = 'fixed z-[80] bg-white rounded-xl shadow-2xl border border-gray-200 w-72 max-h-80 overflow-hidden';
  picker.style.left = Math.min(evt.clientX, window.innerWidth - 300) + 'px';
  picker.style.top = Math.min(evt.clientY, window.innerHeight - 320) + 'px';

  let listHtml = '';
  pickableSteps.forEach(ps => {
    const badge = ps.status === 'IN_PROGRESS'
      ? '<span class="inline-block px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-600 rounded-full ml-auto flex-shrink-0">กำลังฝึก</span>'
      : '<span class="inline-block px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded-full ml-auto flex-shrink-0">ยังไม่วางแผน</span>';
    listHtml += '<button class="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors" ' +
      'onclick="document.getElementById(\'day-step-picker\').remove(); openStepModal(\'' + ps.stepId + '\', ' + ps.rIndex + ', ' + ps.sIndex + ')">' +
      '<span class="truncate flex-1">' + ps.title + '</span>' + badge + '</button>';
  });

  picker.innerHTML =
    '<div class="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl">' +
      '<span class="text-xs font-semibold text-gray-600">เลือกหัวข้อสำหรับวันที่ ' + displayDate + '</span>' +
      '<button onclick="document.getElementById(\'day-step-picker\').remove()" class="text-gray-400 hover:text-gray-600 p-0.5">' +
        '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="overflow-y-auto max-h-64 divide-y divide-gray-50">' + listHtml + '</div>';

  document.body.appendChild(picker);

  // Close when clicking outside
  function closePicker(e) {
    if (!picker.contains(e.target)) {
      picker.remove();
      document.removeEventListener('mousedown', closePicker);
    }
  }
  // Delay listener so the current click doesn't immediately close it
  setTimeout(() => document.addEventListener('mousedown', closePicker), 0);
}
