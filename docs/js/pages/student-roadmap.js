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

    // คำนวณจำนวน step ที่เสร็จแล้ว
    let completedSteps = 0;
    let inProgressSteps = 0;
    steps.forEach(step => {
      const p = progressMap[step.id];
      if (p) {
        if (p.status === 'COMPLETED') completedSteps++;
        else if (p.status === 'IN_PROGRESS') inProgressSteps++;
      }
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
          <div class="flex gap-4 text-xs text-gray-500">
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
              ยังไม่เริ่ม ${totalSteps - completedSteps - inProgressSteps}
            </span>
            <span class="ml-auto">ทั้งหมด ${totalSteps} ขั้นตอน</span>
          </div>
        </div>

        <!-- Steps -->
        <div class="divide-y divide-gray-50">
          ${steps.map((step, sIndex) => {
            const p = progressMap[step.id] || {};
            const status = p.status || 'NOT_STARTED';

            let statusIcon, statusClass, statusLabel;
            if (status === 'COMPLETED') {
              statusIcon = '<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
              statusClass = 'bg-green-50';
              statusLabel = 'เสร็จสิ้น';
            } else if (status === 'IN_PROGRESS') {
              statusIcon = '<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
              statusClass = 'bg-blue-50';
              statusLabel = 'กำลังดำเนินการ';
            } else {
              statusIcon = '<svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
              statusClass = '';
              statusLabel = 'ยังไม่เริ่ม';
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
                </div>
                <div class="flex-shrink-0 flex items-center gap-2">
                  <span class="text-xs px-2 py-1 rounded-full ${status === 'COMPLETED' ? 'bg-green-100 text-green-700' : status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}">${statusLabel}</span>
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
  const currentStatus = p.status || 'NOT_STARTED';

  document.getElementById('step-modal-title').textContent = step.title || 'ขั้นตอนที่ ' + (stepIndex + 1);

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
          ระยะเวลา: ${step.durationDays} วัน
        </div>
      ` : ''}

      ${step.resources ? `
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          แหล่งข้อมูล: ${step.resources}
        </div>
      ` : ''}

      <!-- เลือกสถานะ -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 mb-3">อัปเดตสถานะ</h4>
        <div class="grid grid-cols-3 gap-2">
          <button onclick="selectStepStatus('NOT_STARTED')" id="status-btn-NOT_STARTED"
            class="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentStatus === 'NOT_STARTED' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">
            ยังไม่เริ่ม
          </button>
          <button onclick="selectStepStatus('IN_PROGRESS')" id="status-btn-IN_PROGRESS"
            class="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentStatus === 'IN_PROGRESS' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}">
            กำลังดำเนินการ
          </button>
          <button onclick="selectStepStatus('COMPLETED')" id="status-btn-COMPLETED"
            class="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentStatus === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'}">
            เสร็จสิ้น
          </button>
        </div>
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

  window._selectedStepStatus = currentStatus;
  document.getElementById('roadmap-step-modal').classList.remove('hidden');
}

function selectStepStatus(status) {
  window._selectedStepStatus = status;

  // รีเซ็ตปุ่มทั้งหมด
  const statuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
  const activeClasses = {
    'NOT_STARTED': 'bg-gray-600 text-white',
    'IN_PROGRESS': 'bg-blue-600 text-white',
    'COMPLETED': 'bg-green-600 text-white'
  };
  const inactiveClasses = {
    'NOT_STARTED': 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    'IN_PROGRESS': 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    'COMPLETED': 'bg-green-50 text-green-600 hover:bg-green-100'
  };

  statuses.forEach(s => {
    const btn = document.getElementById('status-btn-' + s);
    if (btn) {
      // ลบ class เก่า
      btn.className = 'px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' +
        (s === status ? activeClasses[s] : inactiveClasses[s]);
    }
  });
}

async function saveStepProgress(stepId) {
  const user = getCurrentUser();
  const status = window._selectedStepStatus || 'NOT_STARTED';
  const note = document.getElementById('step-note-input').value.trim();

  showLoading();
  try {
    const result = await callApiPost('updateRoadmapProgress', {
      userId: user.id,
      stepId: stepId,
      status: status,
      note: note
    });

    if (result.success !== false) {
      showToast('อัปเดตสถานะสำเร็จ', 'success');
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
