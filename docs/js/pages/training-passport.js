/** สีตามธีม CP AXTRA */
const PASSPORT_THEME = {
  blue: '#306FC7',
  yellow: '#F6C24A',
  green: '#43938F',
  red: '#DA3832'
};

/**
 * รหัสนักศึกษาที่กำลังเปิด Passport อยู่
 * นักศึกษา = ตัวเอง / พี่เลี้ยงและแอดมิน = คนที่เลือกจากรายชื่อ (ผ่าน ?userId= ใน hash)
 * @returns {string}
 */
function passportTargetId() {
  const user = getCurrentUser();
  if (!user) return '';
  if (user.role === 'STUDENT') return user.id;
  const query = window.location.hash.split('?')[1] || '';
  return new URLSearchParams(query).get('userId') || '';
}

function renderTrainingPassport() {
  const user = getCurrentUser();
  if (!user) return navigateTo('login');

  // พี่เลี้ยง/แอดมินต้องเลือกนักศึกษาก่อน ไม่งั้นจะเป็นการเปิด passport ของตัวเอง
  if (user.role !== 'STUDENT' && !passportTargetId()) {
    return renderPassportPicker(user);
  }

  const isOwnPassport = user.role === 'STUDENT';
  const content = initLayout(user);
  content.innerHTML = `
        <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            ${isOwnPassport ? '' : '<a href="#training-passport" class="text-sm hover:underline" style="color:' + PASSPORT_THEME.blue + '">← กลับไปรายชื่อนักศึกษา</a>'}
            <h1 class="text-2xl font-bold text-gray-800">Training Passport</h1>
            <p class="text-gray-500">โปรแกรมฝึกงาน Makro 16 สัปดาห์${isOwnPassport ? '' : ' — <span id="passport-student-name" class="font-medium text-gray-700">กำลังโหลด...</span>'}</p>
          </div>
          <div id="progress-summary" class="text-right">
            <div class="text-3xl font-bold text-blue-600" id="progress-pct">--%</div>
            <div class="text-sm text-gray-500">ความคืบหน้ารวม</div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="bg-gray-200 rounded-full h-4 mb-8">
          <div id="progress-bar" class="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500" style="width: 0%"></div>
        </div>

        <!-- Timeline -->
        <div id="timeline-container" class="space-y-4">
          <div class="text-center py-12 text-gray-400">กำลังโหลดข้อมูล...</div>
        </div>

    <!-- Sign-off Modal -->
    <div id="signoff-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-lg font-bold" id="modal-week-title"></h3>
          <button onclick="closePassportModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="p-6" id="modal-content"></div>
      </div>
    </div>
  `;

  loadTrainingPassport();
}

const WEEKS_DATA = [
  { week: 0, subject: 'HO Orientation / Store Orientation', objectives: 'ประวัติบริษัท, วิสัยทัศน์, 7ค่านิยม, Makro Format, โครงสร้างสาขา, ระเบียบปฏิบัติ', place: 'HO/Store', tool: 'ZOOM/OJT' },
  { week: 1, subject: 'Fresh Food Department Study', objectives: 'เรียนรู้งานพื้นฐานของแผนกอาหารสด F&V, Fish&Seafood, Butchery, Dairy Chilled&Frozen, Bakery', place: 'Store', tool: 'OJT' },
  { week: 2, subject: 'Fresh Food OJT', objectives: 'ทำความเข้าใจหน้าที่หัวหน้าแผนก, เข้าไปเรียนรู้งาน 3 วัน/แผนก', place: 'Store', tool: 'OJT' },
  { week: 3, subject: 'OPL Ordering', objectives: 'ศึกษาและวิเคราะห์การสั่งซื้อสินค้าด้วย OPL, E-Ordering, Plan Ordering, Telephone Ordering', place: 'Store', tool: 'OJT/M-learning' },
  { week: 4, subject: 'Food Safety & GMP/HACCP', objectives: 'ศึกษาการปฏิบัติงานบนพื้นฐาน GMP/HACCP, สารเคมีตกค้าง', place: 'Store', tool: 'OJT/M-learning' },
  { week: 5, subject: 'Receiving Management', objectives: 'วิธีตรวจเช็คคุณภาพ, กระบวนการตรวจรับสินค้า, GR Board', place: 'Store', tool: 'OJT/M-learning' },
  { week: 6, subject: 'Storage Management', objectives: 'การจัดเก็บสินค้า, Cold System, FIFO/FEFO, Layout ห้องเย็น', place: 'Store', tool: 'OJT/M-learning' },
  { week: 7, subject: 'Display & Merchandising', objectives: 'จัดเรียงสินค้าหน้าร้าน, Plan-O-Gram, Merchandising Guideline, Product Knowledge', place: 'Store', tool: 'OJT/M-learning' },
  { week: 8, subject: 'Sale Analysis & Price Management', objectives: 'วิเคราะห์ข้อมูลขาย, บริหารราคา, SGM Empowerment, BPM Price Change', place: 'Store', tool: 'OJT/M-learning' },
  { week: 9, subject: 'Stock & Inventory Management', objectives: 'กระบวนการ Inventory adjustment, เอกสารที่ถูกต้อง, บริหาร Stock', place: 'Store', tool: 'OJT' },
  { week: 10, subject: 'Shrinkage Management + Innovation', objectives: 'วิเคราะห์ยอดสูญเสีย, ควบคุมและลด Shrinkage, เขียนโครงการนวัตกรรม', place: 'Store/HO', tool: 'OJT/M-learning' },
  { week: 11, subject: 'Aging / NBS Management', objectives: 'อ่านและวิเคราะห์รายงาน Aging/Never Been Sold, ควบคุมและลด Aging', place: 'Store', tool: 'OJT/M-learning' },
  { week: 12, subject: 'Report Analysis', objectives: 'Trading Report, BI Report, Daily/Weekly/Monthly Report Analysis', place: 'Store', tool: 'OJT/M-learning' },
  { week: 13, subject: 'Customer Development', objectives: 'ประเภทลูกค้า, Customer Relation Development, Food Business, การเป็น Sales ที่ดี', place: 'Store', tool: 'OJT/M-learning' },
  { week: 14, subject: 'Soft Skill Management', objectives: 'ทักษะหัวหน้างาน, การจัดการเวลา, ระเบียบวินัย, การแก้ปัญหาและตัดสินใจ', place: 'Store', tool: 'OJT/M-learning' },
  { week: 15, subject: 'Supervisor Function Job', objectives: 'รับบทบาทหน้าที่ Section/Supervisor, บริหารงานภาพรวมตำแหน่งหัวหน้าแผนก', place: 'Store', tool: 'OJT' },
  { week: 16, subject: 'Supervisor Job + Project Present', objectives: 'ปฏิบัติงานในบทบาท Supervisor, นำเสนอโครงการ', place: 'Store', tool: 'OJT' },
];

async function loadTrainingPassport() {
  try {
    const user = getCurrentUser();
    const targetId = passportTargetId();

    // พี่เลี้ยง/แอดมิน: แสดงชื่อนักศึกษาที่กำลังดู และใช้ชื่อนี้ในช่องลงชื่อนักศึกษา
    if (user.role !== 'STUDENT') {
      callApi('getUserProfile', { userId: targetId }).then(res => {
        const p = (res && res.data) || {};
        window._passportStudentName = displayName(p, targetId);
        const el = document.getElementById('passport-student-name');
        if (el) el.textContent = window._passportStudentName;
      }).catch(() => {});
    } else {
      window._passportStudentName = displayName(user, user.email);
    }

    const [passportRes, progressRes] = await Promise.all([
      callApi('getRoadmaps'),
      callApi('getRoadmapProgress', { userId: targetId })
    ]);

    const roadmaps = passportRes.success !== false ? (passportRes.data || passportRes) : [];
    const progress = progressRes.success !== false ? (progressRes.data || progressRes) : [];

    // Map progress by step
    const progressMap = {};
    if (Array.isArray(progress)) {
      progress.forEach(p => {
        progressMap[p.stepId] = p;
      });
    }

    // Find the training passport roadmap
    let trainingRoadmap = null;
    if (Array.isArray(roadmaps)) {
      trainingRoadmap = roadmaps.find(r =>
        r.title && r.title.includes('Fresh Food')
      ) || roadmaps[0];
    }

    const steps = trainingRoadmap?.steps || [];
    const completedCount = steps.filter(s => {
      const p = progressMap[s.id];
      return p && deriveTrainingStatus(p) === 'COMPLETED';
    }).length;
    const totalSteps = Math.max(steps.length, 1);
    const pct = Math.round((completedCount / totalSteps) * 100);

    document.getElementById('progress-pct').textContent = pct + '%';
    document.getElementById('progress-bar').style.width = pct + '%';

    renderTimeline(steps, progressMap);
  } catch (err) {
    document.getElementById('timeline-container').innerHTML =
      '<div class="text-center py-12 text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>';
  }
}

function renderTimeline(steps, progressMap) {
  const container = document.getElementById('timeline-container');

  if (!steps.length) {
    container.innerHTML = `
      <div class="text-center py-12">
        <p class="text-gray-400 mb-4">ยังไม่มีข้อมูล Training Passport</p>
        <p class="text-sm text-gray-400">กรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่าโปรแกรม</p>
      </div>`;
    return;
  }

  let html = '<div class="relative">';
  // Vertical line
  html += '<div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>';

  steps.forEach((step, i) => {
    const weekData = WEEKS_DATA[i] || {};
    const p = progressMap[step.id] || {};
    // Sync displayed status with the training plan (dates + eval result)
    let status = p.status || 'NOT_STARTED';
    const derived = deriveTrainingStatus(p);
    if (derived === 'COMPLETED') status = 'COMPLETED';
    else if (derived === 'IN_PROGRESS' && status === 'NOT_STARTED') status = 'IN_PROGRESS';
    const evalResult = String(p.evalResult || '').toUpperCase();

    let noteData = {};
    try { noteData = p.note ? JSON.parse(p.note) : {}; } catch(e) { noteData = { text: p.note || '' }; }

    const trainerSigned = noteData.trainerSigned === true || noteData.trainerSigned === 'true';
    const studentSigned = noteData.studentSigned === true || noteData.studentSigned === 'true';

    let dotColor, statusText, statusBg;
    if (status === 'COMPLETED') {
      dotColor = 'bg-green-500'; statusText = 'เสร็จสิ้น'; statusBg = 'bg-green-100 text-green-800';
    } else if (status === 'IN_PROGRESS') {
      dotColor = 'bg-blue-500'; statusText = 'กำลังเรียนรู้'; statusBg = 'bg-blue-100 text-blue-800';
    } else {
      dotColor = 'bg-gray-300'; statusText = 'ยังไม่เริ่ม'; statusBg = 'bg-gray-100 text-gray-600';
    }

    const weekLabel = i === 0 ? 'ก่อนลงสาขา' : 'สัปดาห์ที่ ' + i;

    html += `
      <div class="relative flex items-start mb-6 cursor-pointer group" onclick="openWeekDetail(${i}, '${escJs(step.id)}')">
        <!-- Dot -->
        <div class="relative z-10 flex-shrink-0 w-16 flex justify-center">
          <div class="w-6 h-6 rounded-full ${dotColor} border-4 border-white shadow-md flex items-center justify-center">
            ${status === 'COMPLETED' ? '<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>' : ''}
          </div>
        </div>

        <!-- Card -->
        <div class="flex-1 bg-white rounded-xl border border-gray-200 p-5 group-hover:shadow-md group-hover:border-blue-200 transition-all">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">${weekLabel}</span>
                <span class="text-xs ${statusBg} px-2 py-1 rounded-full">${statusText}</span>
                ${trainerSigned ? '<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">✓ Trainer</span>' : ''}
                ${evalResult === 'PASS' ? '<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✓ ผ่านการประเมิน</span>' : ''}
                ${evalResult === 'FAIL' ? '<span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">✗ ไม่ผ่าน (ฝึกซ้ำ)</span>' : ''}
                ${status !== 'COMPLETED' && status !== 'NOT_STARTED' && !p.trainerName ? '<span class="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">! ยังไม่ระบุผู้สอน</span>' : ''}
              </div>
              <h3 class="font-semibold text-gray-800">${escAttr(step.title || weekData.subject)}</h3>
              <p class="text-sm text-gray-500 mt-1">${escAttr(step.description || weekData.objectives || '')}</p>
            </div>
            <div class="text-gray-300 group-hover:text-blue-400 ml-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
          <div class="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
            <span>📍 ${escAttr(weekData.place || step.resources || 'Store')}</span>
            <span>🛠 ${escAttr(weekData.tool || 'OJT')}</span>
            ${step.durationDays ? '<span>📅 ' + escAttr(step.durationDays) + ' วัน</span>' : ''}
            ${p.trainerName ? '<span class="text-gray-500">👤 ผู้สอน: ' + escAttr(p.trainerName) + (p.trainerPosition ? ' (' + escAttr(p.trainerPosition) + ')' : '') + '</span>' : ''}
            ${p.startDate ? '<span>🗓 ' + formatDate(p.startDate) + (p.endDate && p.endDate !== p.startDate ? ' – ' + formatDate(p.endDate) : '') + '</span>' : ''}
          </div>
        </div>
      </div>`;
  });

  html += '</div>';
  container.innerHTML = html;

  window._passportSteps = steps;
  window._passportProgress = progressMap;
}

function openWeekDetail(weekIndex, stepId) {
  const step = (window._passportSteps || [])[weekIndex];
  if (!step) return;
  const p = (window._passportProgress || {})[stepId] || {};
  const weekData = WEEKS_DATA[weekIndex] || {};
  const user = getCurrentUser();
  const status = p.status || 'NOT_STARTED';

  let noteData = {};
  try { noteData = p.note ? JSON.parse(p.note) : {}; } catch(e) { noteData = { text: p.note || '' }; }

  const weekLabel = weekIndex === 0 ? 'ก่อนลงสาขา' : 'สัปดาห์ที่ ' + weekIndex;
  document.getElementById('modal-week-title').textContent = weekLabel + ' - ' + (step.title || weekData.subject);

  const trainerSigned = noteData.trainerSigned === true || noteData.trainerSigned === 'true';
  const studentSigned = noteData.studentSigned === true || noteData.studentSigned === 'true';

  document.getElementById('modal-content').innerHTML = `
    <div class="space-y-6">
      <!-- Details -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-medium text-gray-700 mb-2">วัตถุประสงค์การฝึกอบรม</h4>
        <p class="text-sm text-gray-600">${escAttr(step.description || weekData.objectives)}</p>
        <div class="flex gap-4 mt-3 text-sm text-gray-500">
          <span>📍 สถานที่: ${escAttr(weekData.place || 'Store')}</span>
          <span>🛠 เครื่องมือ: ${escAttr(weekData.tool || 'OJT')}</span>
        </div>
      </div>

      <!-- ข้อมูลจากแผนการฝึก -->
      <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-medium text-gray-700">ข้อมูลจากแผนการฝึก</h4>
          <a href="#student-roadmap" onclick="closePassportModal()" class="text-xs text-blue-600 hover:underline">แก้ไขแผน →</a>
        </div>
        ${p.trainerName || p.startDate ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
            <div><span class="text-gray-400">ผู้สอน:</span> ${p.trainerName ? escAttr(p.trainerName) : '<span class="text-amber-600">ยังไม่ระบุ</span>'}${p.trainerPosition ? ' (' + escAttr(p.trainerPosition) + ')' : ''}</div>
            ${p.trainerContact ? '<div><span class="text-gray-400">ติดต่อ:</span> ' + escAttr(p.trainerContact) + '</div>' : ''}
            ${p.startDate ? '<div><span class="text-gray-400">ช่วงฝึก:</span> ' + formatDate(p.startDate) + (p.endDate && p.endDate !== p.startDate ? ' – ' + formatDate(p.endDate) : '') + '</div>' : ''}
            ${formatTimeRange(getPlanDayTime(p, p.startDate || '')) ? '<div><span class="text-gray-400">เวลา:</span> ' + formatTimeRange(getPlanDayTime(p, p.startDate || '')) + '</div>' : ''}
            ${String(p.evalResult || '').toUpperCase() === 'PASS' ? '<div class="text-green-700">ผลประเมิน: ✓ ผ่าน' + (p.evalBy ? ' โดย ' + escAttr(p.evalBy) : '') + (p.evalAt ? ' (' + formatDate(p.evalAt) + ')' : '') + '</div>' : ''}
            ${String(p.evalResult || '').toUpperCase() === 'FAIL' ? '<div class="text-red-600">ผลประเมิน: ✗ ไม่ผ่าน (ฝึกซ้ำ)' + (p.evalBy ? ' โดย ' + escAttr(p.evalBy) : '') + '</div>' : ''}
          </div>`
        : '<p class="text-sm text-amber-600">ยังไม่ได้วางแผนการฝึกสำหรับหัวข้อนี้ — ไปที่หน้า Roadmap เพื่อกำหนดผู้สอนและวันฝึก</p>'}
      </div>

      <!-- Status -->
      <div>
        <h4 class="font-medium text-gray-700 mb-3">สถานะการเรียนรู้</h4>
        <div class="flex gap-3">
          <button onclick="updateWeekStatus('${escJs(stepId)}', 'NOT_STARTED', ${weekIndex})" class="px-4 py-2 rounded-lg text-sm ${status==='NOT_STARTED' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">ยังไม่เริ่ม</button>
          <button onclick="updateWeekStatus('${escJs(stepId)}', 'IN_PROGRESS', ${weekIndex})" class="px-4 py-2 rounded-lg text-sm ${status==='IN_PROGRESS' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}">กำลังเรียนรู้</button>
          <button onclick="updateWeekStatus('${escJs(stepId)}', 'COMPLETED', ${weekIndex})" class="px-4 py-2 rounded-lg text-sm ${status==='COMPLETED' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'}">เสร็จสิ้น</button>
        </div>
      </div>

      <!-- Sign-offs -->
      <div class="grid grid-cols-2 gap-4">
        <div class="border rounded-lg p-4 ${trainerSigned ? 'border-green-300 bg-green-50' : 'border-gray-200'}">
          <h4 class="font-medium text-gray-700 mb-2">ผู้ฝึกสอนลงชื่อ</h4>
          ${trainerSigned
            ? '<p class="text-green-600 font-medium">✓ ลงชื่อแล้ว</p><p class="text-xs text-gray-500 mt-1">' + escAttr(noteData.trainerDate || '') + '</p>'
            : (user.role === 'MENTOR' || user.role === 'ADMIN'
              ? '<button onclick="signOff(\'' + escJs(stepId) + '\', \'trainer\', ' + weekIndex + ')" class="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600">ลงชื่อผู้ฝึกสอน</button>'
              : '<p class="text-gray-400 text-sm">รอผู้ฝึกสอนลงชื่อ</p>')
          }
        </div>
        <div class="border rounded-lg p-4 border-green-300 bg-green-50">
          <h4 class="font-medium text-gray-700 mb-2">นักศึกษา</h4>
          <p class="text-green-600 font-medium">✓ ${escAttr(window._passportStudentName || 'นักศึกษา')}</p>
          <p class="text-xs text-gray-400 mt-1">ลงชื่ออัตโนมัติ (Sync กับผู้ใช้)</p>
        </div>
      </div>

      <!-- Notes -->
      <div>
        <h4 class="font-medium text-gray-700 mb-2">บันทึก / หมายเหตุ</h4>
        <textarea id="week-notes" class="w-full border rounded-lg p-3 text-sm" rows="3" placeholder="เพิ่มบันทึก...">${escAttr(noteData.text || noteData.trainerNotes || noteData.studentNotes || '')}</textarea>
        <button onclick="saveWeekNotes('${escJs(stepId)}', ${weekIndex})" class="mt-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition-colors">บันทึก</button>
      </div>
    </div>
  `;

  document.getElementById('signoff-modal').classList.remove('hidden');
}

function closePassportModal() {
  document.getElementById('signoff-modal').classList.add('hidden');
}

async function updateWeekStatus(stepId, status, weekIndex) {
  const user = getCurrentUser();
  showLoading();
  try {
    await callApiPost('updateRoadmapProgress', { userId: passportTargetId(), stepId, status });
    showToast('อัพเดทสถานะสำเร็จ', 'success');
    closePassportModal();
    await loadTrainingPassport();
  } catch (e) {
    showToast('เกิดข้อผิดพลาด', 'error');
  }
  hideLoading();
}

async function signOff(stepId, role, weekIndex) {
  const user = getCurrentUser();
  showLoading();
  try {
    // Sign-off state is read per stepId (progressMap keyed by step.id, see renderTimeline/openWeekDetail),
    // so the write must identify the row by stepId too — weekIndex alone can desync from the actual step.
    await callApiPost('signOffWeek', { userId: passportTargetId(), stepId: stepId, weekNumber: String(weekIndex), role, notes: '' });
    showToast('ลงชื่อสำเร็จ', 'success');
    closePassportModal();
    await loadTrainingPassport();
  } catch (e) {
    showToast('เกิดข้อผิดพลาด', 'error');
  }
  hideLoading();
}

async function saveWeekNotes(stepId, weekIndex) {
  const notes = document.getElementById('week-notes').value;
  const user = getCurrentUser();
  showLoading();
  try {
    await callApiPost('updateRoadmapProgress', { userId: passportTargetId(), stepId, status: 'IN_PROGRESS', note: notes });
    showToast('บันทึกสำเร็จ', 'success');
  } catch (e) {
    showToast('เกิดข้อผิดพลาด', 'error');
  }
  hideLoading();
}

// ==================== มุมมองพี่เลี้ยง / แอดมิน: เลือกนักศึกษาก่อนเปิด Passport ====================

/**
 * รายชื่อนักศึกษาพร้อมความคืบหน้า Training Passport
 * พี่เลี้ยงเห็นเฉพาะนักศึกษาในความดูแล แอดมินเห็นทั้งหมด (บังคับฝั่ง server อีกชั้น)
 */
function renderPassportPicker(user) {
  const content = initLayout(user);
  content.innerHTML = `
    <div class="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Training Passport</h1>
        <p class="text-gray-500">${user.role === 'MENTOR' ? 'เลือกนักศึกษาในความดูแลเพื่อดูและลงชื่อรับรองรายสัปดาห์' : 'ภาพรวมความคืบหน้าของนักศึกษาทั้งหมด'}</p>
      </div>
      <button onclick="loadPassportPicker()" class="text-sm border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50">รีเฟรช</button>
    </div>

    <div id="passport-picker-stats" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"></div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-500">
            <tr>
              <th class="text-left font-medium px-4 py-3">นักศึกษา</th>
              <th class="text-left font-medium px-4 py-3">ความคืบหน้า</th>
              <th class="text-center font-medium px-4 py-3">สัปดาห์ปัจจุบัน</th>
              <th class="text-center font-medium px-4 py-3">รอผู้ฝึกสอนลงชื่อ</th>
              <th class="text-right font-medium px-4 py-3">จัดการ</th>
            </tr>
          </thead>
          <tbody id="passport-picker-rows" class="divide-y divide-gray-100">
            <tr><td colspan="5" class="px-4 py-10 text-center text-gray-400">กำลังโหลด...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  loadPassportPicker();
}

async function loadPassportPicker() {
  const user = getCurrentUser();
  const rows = document.getElementById('passport-picker-rows');
  const statsEl = document.getElementById('passport-picker-stats');
  if (!rows) return;

  try {
    const res = user.role === 'MENTOR'
      ? await callApi('getTrainingPassportByMentor', { mentorId: user.id })
      : await callApi('getTrainingPassportOverview');

    if (res.success === false) {
      rows.innerHTML = '<tr><td colspan="5" class="px-4 py-10 text-center text-gray-400">' + escAttr(res.message || 'ไม่สามารถโหลดข้อมูลได้') + '</td></tr>';
      return;
    }

    // คนที่มีสัปดาห์รอลงชื่อมากที่สุดขึ้นก่อน เพราะเป็นงานที่ต้องทำ
    const list = (res.data || []).slice().sort((a, b) => {
      const pa = (a.passport && a.passport.pendingTrainerSignOffs) || 0;
      const pb = (b.passport && b.passport.pendingTrainerSignOffs) || 0;
      return pb - pa || String(a.name || '').localeCompare(String(b.name || ''), 'th');
    });

    const avg = list.length
      ? Math.round(list.reduce((sum, s) => sum + ((s.passport && s.passport.progressPercent) || 0), 0) / list.length)
      : 0;
    const pendingTotal = list.reduce((sum, s) => sum + ((s.passport && s.passport.pendingTrainerSignOffs) || 0), 0);
    const finished = list.filter(s => s.passport && s.passport.totalWeeks > 0 && s.passport.completedWeeks >= s.passport.totalWeeks).length;

    statsEl.innerHTML = [
      { label: 'นักศึกษา', value: list.length, color: PASSPORT_THEME.blue },
      { label: 'ความคืบหน้าเฉลี่ย', value: avg + '%', color: PASSPORT_THEME.blue },
      { label: 'สัปดาห์ที่รอลงชื่อ', value: pendingTotal, color: PASSPORT_THEME.yellow },
      { label: 'ฝึกครบแล้ว', value: finished, color: PASSPORT_THEME.green }
    ].map(c => `
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div class="text-2xl font-bold" style="color:${c.color}">${c.value}</div>
        <div class="text-xs text-gray-500 mt-1">${c.label}</div>
      </div>
    `).join('');

    if (list.length === 0) {
      rows.innerHTML = '<tr><td colspan="5" class="px-4 py-10 text-center text-gray-400">'
        + (user.role === 'MENTOR' ? 'ยังไม่มีนักศึกษาในความดูแล' : 'ยังไม่มีนักศึกษาในระบบ')
        + '</td></tr>';
      return;
    }

    rows.innerHTML = list.map(s => {
      const p = s.passport || {};
      const pct = p.progressPercent || 0;
      const pending = p.pendingTrainerSignOffs || 0;

      return `
        <tr class="hover:bg-gray-50">
          <td class="px-4 py-3">
            <div class="font-medium text-gray-800">${escAttr(s.name || '-')}</div>
            <div class="text-xs text-gray-400">${escAttr(s.studentId || '-')}${s.department ? ' · ' + escAttr(s.department) : ''}</div>
          </td>
          <td class="px-4 py-3 w-56">
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-gray-200 rounded-full h-2">
                <div class="h-2 rounded-full" style="width:${pct}%;background:${PASSPORT_THEME.blue}"></div>
              </div>
              <span class="text-xs text-gray-500 whitespace-nowrap">${p.completedWeeks || 0}/${p.totalWeeks || 0} สัปดาห์</span>
            </div>
          </td>
          <td class="px-4 py-3 text-center text-gray-700">${p.currentWeek ? 'สัปดาห์ที่ ' + p.currentWeek : '–'}</td>
          <td class="px-4 py-3 text-center">
            ${pending > 0
              ? '<span class="text-xs px-2 py-1 rounded-full font-medium" style="background:#FEF3C7;color:#92400E">' + pending + ' สัปดาห์</span>'
              : '<span class="text-gray-300">–</span>'}
          </td>
          <td class="px-4 py-3 text-right whitespace-nowrap">
            <a href="#training-passport?userId=${encodeURIComponent(s.userId)}"
              class="inline-block text-sm text-white px-3 py-1.5 rounded-lg" style="background:${PASSPORT_THEME.blue}">เปิด Passport</a>
          </td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    rows.innerHTML = '<tr><td colspan="5" class="px-4 py-10 text-center text-gray-400">เกิดข้อผิดพลาดในการเชื่อมต่อ</td></tr>';
  }
}
