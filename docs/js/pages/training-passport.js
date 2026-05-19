function renderTrainingPassport() {
  const user = getCurrentUser();
  if (!user) return navigateTo('login');

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="ml-64">
      ${buildNavbar(user)}
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Training Passport</h1>
            <p class="text-gray-500">โปรแกรมฝึกงาน Fresh Food 16 สัปดาห์</p>
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
      </div>
    </div>

    <!-- Sign-off Modal -->
    <div id="signoff-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-lg font-bold" id="modal-week-title"></h3>
          <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
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
    const [passportRes, progressRes] = await Promise.all([
      callApi('getRoadmaps'),
      callApi('getRoadmapProgress', { userId: user.id })
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
      return p && p.status === 'COMPLETED';
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
    const status = p.status || 'NOT_STARTED';

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
      <div class="relative flex items-start mb-6 cursor-pointer group" onclick="openWeekDetail(${i}, '${step.id}')">
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
                ${studentSigned ? '<span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">✓ Student</span>' : ''}
              </div>
              <h3 class="font-semibold text-gray-800">${step.title || weekData.subject}</h3>
              <p class="text-sm text-gray-500 mt-1">${step.description || weekData.objectives || ''}</p>
            </div>
            <div class="text-gray-300 group-hover:text-blue-400 ml-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
          <div class="flex gap-4 mt-3 text-xs text-gray-400">
            <span>📍 ${weekData.place || step.resources || 'Store'}</span>
            <span>🛠 ${weekData.tool || 'OJT'}</span>
            ${step.durationDays ? '<span>📅 ' + step.durationDays + ' วัน</span>' : ''}
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
  const step = window._passportSteps[weekIndex];
  const p = window._passportProgress[stepId] || {};
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
        <p class="text-sm text-gray-600">${step.description || weekData.objectives}</p>
        <div class="flex gap-4 mt-3 text-sm text-gray-500">
          <span>📍 สถานที่: ${weekData.place || 'Store'}</span>
          <span>🛠 เครื่องมือ: ${weekData.tool || 'OJT'}</span>
        </div>
      </div>

      <!-- Status -->
      <div>
        <h4 class="font-medium text-gray-700 mb-3">สถานะการเรียนรู้</h4>
        <div class="flex gap-3">
          <button onclick="updateWeekStatus('${stepId}', 'NOT_STARTED', ${weekIndex})" class="px-4 py-2 rounded-lg text-sm ${status==='NOT_STARTED' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">ยังไม่เริ่ม</button>
          <button onclick="updateWeekStatus('${stepId}', 'IN_PROGRESS', ${weekIndex})" class="px-4 py-2 rounded-lg text-sm ${status==='IN_PROGRESS' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}">กำลังเรียนรู้</button>
          <button onclick="updateWeekStatus('${stepId}', 'COMPLETED', ${weekIndex})" class="px-4 py-2 rounded-lg text-sm ${status==='COMPLETED' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100'}">เสร็จสิ้น</button>
        </div>
      </div>

      <!-- Sign-offs -->
      <div class="grid grid-cols-2 gap-4">
        <div class="border rounded-lg p-4 ${trainerSigned ? 'border-green-300 bg-green-50' : 'border-gray-200'}">
          <h4 class="font-medium text-gray-700 mb-2">ผู้ฝึกสอนลงชื่อ</h4>
          ${trainerSigned
            ? '<p class="text-green-600 font-medium">✓ ลงชื่อแล้ว</p><p class="text-xs text-gray-500 mt-1">' + (noteData.trainerDate || '') + '</p>'
            : (user.role === 'MENTOR' || user.role === 'ADMIN'
              ? '<button onclick="signOff(\'' + stepId + '\', \'trainer\', ' + weekIndex + ')" class="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600">ลงชื่อผู้ฝึกสอน</button>'
              : '<p class="text-gray-400 text-sm">รอผู้ฝึกสอนลงชื่อ</p>')
          }
        </div>
        <div class="border rounded-lg p-4 ${studentSigned ? 'border-green-300 bg-green-50' : 'border-gray-200'}">
          <h4 class="font-medium text-gray-700 mb-2">นักศึกษาลงชื่อ</h4>
          ${studentSigned
            ? '<p class="text-green-600 font-medium">✓ ลงชื่อแล้ว</p><p class="text-xs text-gray-500 mt-1">' + (noteData.studentDate || '') + '</p>'
            : (user.role === 'STUDENT'
              ? '<button onclick="signOff(\'' + stepId + '\', \'student\', ' + weekIndex + ')" class="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600">ลงชื่อนักศึกษา</button>'
              : '<p class="text-gray-400 text-sm">รอนักศึกษาลงชื่อ</p>')
          }
        </div>
      </div>

      <!-- Notes -->
      <div>
        <h4 class="font-medium text-gray-700 mb-2">บันทึก / หมายเหตุ</h4>
        <textarea id="week-notes" class="w-full border rounded-lg p-3 text-sm" rows="3" placeholder="เพิ่มบันทึก...">${noteData.text || noteData.trainerNotes || noteData.studentNotes || ''}</textarea>
        <button onclick="saveWeekNotes('${stepId}', ${weekIndex})" class="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">บันทึก</button>
      </div>
    </div>
  `;

  document.getElementById('signoff-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('signoff-modal').classList.add('hidden');
}

async function updateWeekStatus(stepId, status, weekIndex) {
  const user = getCurrentUser();
  showLoading();
  try {
    await callApi('updateRoadmapProgress', { userId: user.id, stepId, status });
    showToast('อัพเดทสถานะสำเร็จ', 'success');
    closeModal();
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
    await callApi('signOffWeek', { userId: user.id, weekNumber: String(weekIndex), role, notes: '' });
    showToast('ลงชื่อสำเร็จ', 'success');
    closeModal();
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
    await callApi('updateRoadmapProgress', { userId: user.id, stepId, status: 'IN_PROGRESS', note: notes });
    showToast('บันทึกสำเร็จ', 'success');
  } catch (e) {
    showToast('เกิดข้อผิดพลาด', 'error');
  }
  hideLoading();
}
