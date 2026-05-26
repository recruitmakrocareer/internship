function renderAdminRoadmaps() {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') return navigateTo('login');

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="lg:ml-64 mt-16">
      ${buildNavbar(user)}
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">จัดการแผนฝึกงาน</h1>
          <button onclick="openCreateRoadmap()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">+ สร้าง Roadmap</button>
        </div>
        <div id="admin-roadmaps-list" class="space-y-4">
          <div class="text-center py-8 text-gray-400">กำลังโหลด...</div>
        </div>
      </div>
    </div>
    <div id="roadmap-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-lg font-bold" id="roadmap-modal-title">Roadmap</h3>
          <button onclick="document.getElementById('roadmap-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="p-6" id="roadmap-modal-content"></div>
      </div>
    </div>
  `;
  loadAdminRoadmaps();
}

async function loadAdminRoadmaps() {
  const container = document.getElementById('admin-roadmaps-list');
  try {
    const res = await callApi('getRoadmaps');
    const roadmaps = res.data || res || [];

    if (!Array.isArray(roadmaps) || roadmaps.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-400">ยังไม่มี Roadmap</div>';
      return;
    }

    container.innerHTML = roadmaps.map(r => `
      <div class="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow cursor-pointer" onclick="viewRoadmapDetail('${r.id}')">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-gray-800 text-lg">${r.title || ''}</h3>
            <p class="text-sm text-gray-500 mt-1">${r.description || ''}</p>
            <span class="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 mt-2 inline-block">${r.department || 'ทั่วไป'}</span>
          </div>
          <div class="flex gap-2">
            <button onclick="event.stopPropagation();editRoadmapInfo('${r.id}')" class="text-sm text-blue-600 hover:underline">แก้ไข</button>
            <button onclick="event.stopPropagation();deleteRoadmapById('${r.id}')" class="text-sm text-red-600 hover:underline">ลบ</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<div class="text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}

function openCreateRoadmap() {
  document.getElementById('roadmap-modal-title').textContent = 'สร้าง Roadmap ใหม่';
  document.getElementById('roadmap-modal-content').innerHTML = `
    <div class="space-y-4">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ Roadmap</label>
        <input type="text" id="rm-title" class="w-full border rounded-lg p-2" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
        <textarea id="rm-desc" class="w-full border rounded-lg p-3 text-sm" rows="3"></textarea></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">แผนก</label>
        <input type="text" id="rm-dept" class="w-full border rounded-lg p-2" /></div>
      <button onclick="saveNewRoadmap()" class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">บันทึก</button>
    </div>`;
  document.getElementById('roadmap-modal').classList.remove('hidden');
}

async function saveNewRoadmap() {
  const user = getCurrentUser();
  showLoading();
  try {
    await callApiPost('createRoadmap', {
      title: document.getElementById('rm-title').value,
      description: document.getElementById('rm-desc').value,
      department: document.getElementById('rm-dept').value,
      isActive: 'true', createdBy: user.id
    });
    showToast('สร้าง Roadmap สำเร็จ', 'success');
    document.getElementById('roadmap-modal').classList.add('hidden');
    await loadAdminRoadmaps();
  } catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
  hideLoading();
}

async function viewRoadmapDetail(id) {
  document.getElementById('roadmap-modal-title').textContent = 'รายละเอียด Roadmap';
  document.getElementById('roadmap-modal-content').innerHTML = '<div class="text-center py-4 text-gray-400">กำลังโหลด...</div>';
  document.getElementById('roadmap-modal').classList.remove('hidden');

  try {
    const res = await callApi('getRoadmap', { id });
    const roadmap = res.data || res;
    const steps = roadmap.steps || [];

    document.getElementById('roadmap-modal-title').textContent = roadmap.title || 'Roadmap';
    document.getElementById('roadmap-modal-content').innerHTML = `
      <p class="text-sm text-gray-500 mb-4">${roadmap.description || ''}</p>
      <div class="flex justify-between items-center mb-3">
        <h4 class="font-bold text-gray-700">ขั้นตอน (${steps.length})</h4>
        <button onclick="addStepForm('${id}')" class="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">+ เพิ่มขั้นตอน</button>
      </div>
      <div id="steps-container" class="space-y-2">
        ${steps.length === 0 ? '<div class="text-center py-4 text-gray-400">ยังไม่มีขั้นตอน</div>' :
          steps.sort((a,b) => (Number(a.stepNumber)||0) - (Number(b.stepNumber)||0)).map(s => `
            <div class="border rounded-lg p-3 flex justify-between items-start">
              <div>
                <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mr-2">ขั้นตอน ${s.stepNumber || s.order || '?'}</span>
                <span class="font-medium text-gray-800">${s.title || ''}</span>
                <p class="text-xs text-gray-500 mt-1">${s.description || ''}</p>
              </div>
              <button onclick="deleteStepById('${s.id}')" class="text-xs text-red-500 hover:underline">ลบ</button>
            </div>
          `).join('')}
      </div>
      <div id="new-step-form" class="hidden mt-4 border rounded-lg p-4 bg-gray-50">
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div><label class="block text-xs text-gray-600 mb-1">ลำดับ</label>
            <input type="number" id="step-num" class="w-full border rounded p-2 text-sm" value="${steps.length + 1}" /></div>
          <div><label class="block text-xs text-gray-600 mb-1">กำหนดเสร็จ</label>
            <input type="date" id="step-due" class="w-full border rounded p-2 text-sm" /></div>
        </div>
        <div class="mb-3"><label class="block text-xs text-gray-600 mb-1">ชื่อ</label>
          <input type="text" id="step-title" class="w-full border rounded p-2 text-sm" /></div>
        <div class="mb-3"><label class="block text-xs text-gray-600 mb-1">รายละเอียด</label>
          <textarea id="step-desc" class="w-full border rounded p-2 text-sm" rows="2"></textarea></div>
        <button onclick="saveNewStep('${id}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">บันทึกขั้นตอน</button>
      </div>`;
  } catch (e) {
    document.getElementById('roadmap-modal-content').innerHTML = '<div class="text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}

function addStepForm(roadmapId) {
  document.getElementById('new-step-form').classList.remove('hidden');
}

async function saveNewStep(roadmapId) {
  showLoading();
  try {
    await callApiPost('createRoadmapStep', {
      roadmapId,
      stepNumber: document.getElementById('step-num').value,
      title: document.getElementById('step-title').value,
      description: document.getElementById('step-desc').value,
      dueDate: document.getElementById('step-due').value,
      isActive: 'true'
    });
    showToast('เพิ่มขั้นตอนสำเร็จ', 'success');
    await viewRoadmapDetail(roadmapId);
  } catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
  hideLoading();
}

async function editRoadmapInfo(id) {
  try {
    const res = await callApi('getRoadmap', { id });
    const r = res.data || res;
    document.getElementById('roadmap-modal-title').textContent = 'แก้ไข Roadmap';
    document.getElementById('roadmap-modal-content').innerHTML = `
      <div class="space-y-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
          <input type="text" id="rm-title" class="w-full border rounded-lg p-2" value="${r.title||''}" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
          <textarea id="rm-desc" class="w-full border rounded-lg p-3 text-sm" rows="3">${r.description||''}</textarea></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">แผนก</label>
          <input type="text" id="rm-dept" class="w-full border rounded-lg p-2" value="${r.department||''}" /></div>
        <button onclick="updateRoadmapById('${id}')" class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">อัปเดต</button>
      </div>`;
    document.getElementById('roadmap-modal').classList.remove('hidden');
  } catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
}

async function updateRoadmapById(id) {
  showLoading();
  try {
    await callApiPost('updateRoadmap', { id, title: document.getElementById('rm-title').value, description: document.getElementById('rm-desc').value, department: document.getElementById('rm-dept').value });
    showToast('อัปเดตสำเร็จ', 'success');
    document.getElementById('roadmap-modal').classList.add('hidden');
    await loadAdminRoadmaps();
  } catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
  hideLoading();
}

async function deleteRoadmapById(id) {
  if (!confirm('ต้องการลบ Roadmap นี้?')) return;
  showLoading();
  try { await callApiPost('deleteRoadmap', { id }); showToast('ลบสำเร็จ', 'success'); await loadAdminRoadmaps(); }
  catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
  hideLoading();
}

async function deleteStepById(id) {
  if (!confirm('ต้องการลบขั้นตอนนี้?')) return;
  showLoading();
  try { await callApiPost('deleteRoadmapStep', { id }); showToast('ลบขั้นตอนสำเร็จ', 'success'); }
  catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
  hideLoading();
}
