// ==================== หน้าแผนการฝึกงาน (นักศึกษา) ====================

async function renderStudentRoadmap() {
  if (!checkAuth()) return;
  const user = getCurrentUser();
  const content = initLayout(user);

  content.innerHTML = `
    <div class="fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">แผนการฝึกงาน</h2>
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
                  ${p.trainerName || p.startDate ? `<p class="text-xs text-gray-400 mt-0.5 truncate">${p.trainerName ? '👤 ' + p.trainerName : ''}${p.startDate ? (p.trainerName ? ' • ' : '') + '📅 ' + formatDate(p.startDate) + (p.endDate ? ' – ' + formatDate(p.endDate) : '') : ''}</p>` : ''}
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

  // วันที่หัวข้ออื่นใช้อยู่ (สำหรับแสดง slot ว่าง/ไม่ว่าง ในปฏิทิน)
  window._busyDays = {};
  Object.keys(window._studentProgressMap).forEach(sid => {
    if (String(sid) === String(stepId)) return;
    const pr = window._studentProgressMap[sid];
    expandPlanDays(pr).forEach(day => {
      if (!window._busyDays[day]) window._busyDays[day] = [];
      window._busyDays[day].push(pr.stepTitle || 'หัวข้ออื่น');
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
        <div class="grid grid-cols-2 gap-3 mb-3">
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
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-2">จิ้มวันในปฏิทินเพื่อเลือกวันฝึกเป็นรายวัน (กรณีฝึกไม่ต่อเนื่อง เช่น วันเว้นวัน) — <span class="text-gray-400">จุดสีเทา = มีหัวข้ออื่นฝึกอยู่</span></label>
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
    const busyTitles = busy[dateStr];
    const isToday = dateStr === today;

    let cls = 'relative text-xs py-1.5 rounded cursor-pointer select-none transition-colors ';
    if (isSelected) cls += 'bg-primary-600 text-white font-semibold ';
    else if (busyTitles) cls += 'bg-gray-100 text-gray-500 hover:bg-primary-100 ';
    else cls += 'text-gray-700 hover:bg-primary-50 ';
    if (isToday && !isSelected) cls += 'ring-1 ring-primary-400 ';

    html += `
      <div class="${cls}" onclick="togglePlanDay('${dateStr}')" ${busyTitles ? `title="ไม่ว่าง: ${busyTitles.join(', ')}"` : 'title="ว่าง"'}>
        ${day}
        ${busyTitles && !isSelected ? '<span class="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-400 rounded-full"></span>' : ''}
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
  } else {
    if (window._busyDays && window._busyDays[dateStr]) {
      showToast('หมายเหตุ: วันนี้มีหัวข้ออื่นฝึกอยู่แล้ว (' + window._busyDays[dateStr].join(', ') + ')', 'error');
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
  c.innerHTML = [...window._planDays].sort().map(d => `
    <span class="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">
      ${formatDate(d)}
      <button onclick="removePlanDay('${d}')" class="hover:text-red-500 font-bold">&times;</button>
    </span>`).join('');
}

function removePlanDay(d) {
  window._planDays = window._planDays.filter(x => x !== d);
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
      trainingDays: (window._planDays || []).join(',')
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
