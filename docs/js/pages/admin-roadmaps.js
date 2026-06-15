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
          <button onclick="openCreateRoadmap()" class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">+ สร้าง Roadmap</button>
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

    container.innerHTML = roadmaps.map(r => {
      const stepCount = (r.steps || []).filter(s => s.isActive !== 'false').length;
      return `
      <div class="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow cursor-pointer" onclick="viewRoadmapDetail('${escJs(r.id)}')">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-gray-800 text-lg">${escAttr(r.title || '')}</h3>
            <p class="text-sm text-gray-500 mt-1">${escAttr(r.description || '')}</p>
            <div class="flex gap-2 mt-2">
              <span class="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">${escAttr(r.department || 'ทั่วไป')}</span>
              <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">${stepCount} ขั้นตอน</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button onclick="event.stopPropagation();editRoadmapInfo('${escJs(r.id)}')" class="text-sm text-blue-600 hover:underline">แก้ไข</button>
            <button onclick="event.stopPropagation();deleteRoadmapById('${escJs(r.id)}')" class="text-sm text-red-600 hover:underline">ลบ</button>
          </div>
        </div>
      </div>`;
    }).join('');
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
      <button onclick="saveNewRoadmap()" class="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">บันทึก</button>
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

var _currentRoadmapId = null;

async function viewRoadmapDetail(id) {
  _currentRoadmapId = id;
  document.getElementById('roadmap-modal-title').textContent = 'รายละเอียด Roadmap';
  document.getElementById('roadmap-modal-content').innerHTML = '<div class="text-center py-4 text-gray-400">กำลังโหลด...</div>';
  document.getElementById('roadmap-modal').classList.remove('hidden');

  try {
    const res = await callApi('getRoadmap', { id });
    const roadmap = res.data || res;
    const steps = (roadmap.steps || []).filter(s => s.isActive !== 'false');

    document.getElementById('roadmap-modal-title').textContent = roadmap.title || 'Roadmap';
    document.getElementById('roadmap-modal-content').innerHTML = `
      <p class="text-sm text-gray-500 mb-4">${escAttr(roadmap.description || '')}</p>
      <div class="flex justify-between items-center mb-3">
        <h4 class="font-bold text-gray-700">ขั้นตอน (${steps.length})</h4>
        <button id="btn-add-step" onclick="toggleStepForm()" class="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">+ เพิ่มขั้นตอน</button>
      </div>

      <div id="new-step-form" class="hidden mb-4 border-2 border-green-200 rounded-lg p-4 bg-green-50">
        <h5 class="font-medium text-gray-700 mb-3">เพิ่มขั้นตอนใหม่</h5>
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div><label class="block text-xs text-gray-600 mb-1">ลำดับ</label>
            <input type="number" id="step-num" class="w-full border rounded p-2 text-sm" value="${steps.length + 1}" min="1" /></div>
          <div><label class="block text-xs text-gray-600 mb-1">ระยะเวลา (วัน)</label>
            <input type="number" id="step-duration" class="w-full border rounded p-2 text-sm" min="1" /></div>
        </div>
        <div class="mb-3"><label class="block text-xs text-gray-600 mb-1">ชื่อขั้นตอน *</label>
          <input type="text" id="step-title" class="w-full border rounded p-2 text-sm" placeholder="ระบุชื่อขั้นตอน" /></div>
        <div class="mb-3"><label class="block text-xs text-gray-600 mb-1">รายละเอียด</label>
          <textarea id="step-desc" class="w-full border rounded p-2 text-sm" rows="2" placeholder="อธิบายรายละเอียดขั้นตอน"></textarea></div>
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div><label class="block text-xs text-gray-600 mb-1">กำหนดเสร็จ</label>
            <input type="date" id="step-due" class="w-full border rounded p-2 text-sm" /></div>
          <div><label class="block text-xs text-gray-600 mb-1">แหล่งเรียนรู้ (URL)</label>
            <input type="text" id="step-resources" class="w-full border rounded p-2 text-sm" placeholder="https://..." /></div>
        </div>
        <div class="mb-3"><label class="block text-xs text-gray-600 mb-1">ไฟล์แนบ</label>
          <div id="step-file-box" class="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-blue-400 transition-colors" onclick="document.getElementById('step-file-input').click()">
            <input type="file" id="step-file-input" class="hidden" onchange="handleStepFileSelect(this)" />
            <p class="text-sm text-gray-500">คลิกเพื่อเลือกไฟล์</p>
            <p class="text-xs text-gray-400 mt-1">PDF, Word, Excel, รูปภาพ (สูงสุด 10MB)</p>
          </div>
          <div id="step-file-preview" class="hidden mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
            <span id="step-file-name"></span>
            <button onclick="clearStepFile()" class="text-red-500 hover:text-red-700 ml-auto text-xs">ลบ</button>
          </div>
        </div>
        <div class="flex gap-2">
          <button onclick="saveNewStep()" class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition-colors flex-1">บันทึกขั้นตอน</button>
          <button onclick="toggleStepForm()" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400">ยกเลิก</button>
        </div>
      </div>

      <div id="steps-container" class="space-y-2">
        ${steps.length === 0 ? '<div class="text-center py-4 text-gray-400">ยังไม่มีขั้นตอน</div>' :
          steps.sort((a,b) => (Number(a.stepNumber)||0) - (Number(b.stepNumber)||0)).map(s => renderStepCard(s)).join('')}
      </div>`;
  } catch (e) {
    document.getElementById('roadmap-modal-content').innerHTML = '<div class="text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}

function renderStepCard(s) {
  const hasFile = s.fileUrl && s.fileUrl.trim();
  const hasResources = s.resources && s.resources.trim();
  const duration = s.durationDays ? `${s.durationDays} วัน` : '';
  const dueDate = s.dueDate || '';

  return `
    <div class="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">ขั้นตอน ${s.stepNumber || '?'}</span>
            ${duration ? `<span class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">${duration}</span>` : ''}
            ${dueDate ? `<span class="text-xs text-gray-400">กำหนด: ${dueDate}</span>` : ''}
          </div>
          <h5 class="font-medium text-gray-800">${escAttr(s.title || '')}</h5>
          ${s.description ? `<p class="text-xs text-gray-500 mt-1">${escAttr(s.description)}</p>` : ''}
          <div class="flex gap-3 mt-2">
            ${hasFile ? `<a href="${safeUrl(s.fileUrl)}" target="_blank" class="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
              ${escAttr(s.fileName || 'ไฟล์แนบ')}</a>` : ''}
            ${hasResources ? `<a href="${safeUrl(s.resources)}" target="_blank" class="text-xs text-green-600 hover:underline flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
              แหล่งเรียนรู้</a>` : ''}
          </div>
        </div>
        <div class="flex gap-2 ml-3">
          <button onclick="event.stopPropagation();openEditStep('${s.id}')" class="text-xs text-blue-500 hover:underline">แก้ไข</button>
          <button onclick="event.stopPropagation();deleteStepById('${s.id}')" class="text-xs text-red-500 hover:underline">ลบ</button>
        </div>
      </div>
    </div>`;
}

var _stepFileData = null;
var _stepFileName = null;
var _stepFileMime = null;

function handleStepFileSelect(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    showToast('ไฟล์มีขนาดเกิน 10MB', 'error');
    input.value = '';
    return;
  }
  _stepFileName = file.name;
  _stepFileMime = file.type;
  document.getElementById('step-file-name').textContent = file.name;
  document.getElementById('step-file-preview').classList.remove('hidden');
  document.getElementById('step-file-box').classList.add('hidden');

  fileToBase64(file).then(base64 => { _stepFileData = base64; }).catch(err => showToast('ไม่สามารถอ่านไฟล์ได้', 'error'));
}

function clearStepFile() {
  _stepFileData = null;
  _stepFileName = null;
  _stepFileMime = null;
  const input = document.getElementById('step-file-input');
  if (input) input.value = '';
  document.getElementById('step-file-preview').classList.add('hidden');
  document.getElementById('step-file-box').classList.remove('hidden');
}

function toggleStepForm() {
  const form = document.getElementById('new-step-form');
  if (form) {
    form.classList.toggle('hidden');
    if (!form.classList.contains('hidden')) {
      clearStepFile();
      const titleInput = document.getElementById('step-title');
      if (titleInput) titleInput.focus();
    }
  }
}

async function saveNewStep() {
  const title = document.getElementById('step-title').value.trim();
  if (!title) {
    showToast('กรุณาระบุชื่อขั้นตอน', 'error');
    return;
  }
  if (!_currentRoadmapId) {
    showToast('ไม่พบ Roadmap ID', 'error');
    return;
  }

  showLoading();
  try {
    let fileUrl = '';
    let fileName = '';

    if (_stepFileData && _stepFileName) {
      const uploadRes = await callApiPost('uploadFile', {
        fileName: _stepFileName,
        fileData: _stepFileData,
        mimeType: _stepFileMime || 'application/octet-stream',
        subfolder: 'resources'
      });
      if (uploadRes.success && uploadRes.data) {
        fileUrl = uploadRes.data.fileUrl || uploadRes.data.url || '';
        fileName = _stepFileName;
      }
    }

    await callApiPost('createRoadmapStep', {
      roadmapId: _currentRoadmapId,
      stepNumber: document.getElementById('step-num').value,
      title: title,
      description: document.getElementById('step-desc').value,
      dueDate: document.getElementById('step-due').value,
      durationDays: document.getElementById('step-duration').value,
      resources: document.getElementById('step-resources').value,
      fileUrl: fileUrl,
      fileName: fileName,
      isActive: 'true'
    });

    clearStepFile();
    showToast('เพิ่มขั้นตอนสำเร็จ', 'success');
    await viewRoadmapDetail(_currentRoadmapId);
  } catch (e) { showToast('เกิดข้อผิดพลาด: ' + e.message, 'error'); }
  hideLoading();
}

var _editStepData = null;

async function openEditStep(stepId) {
  if (!_currentRoadmapId) return;

  try {
    const res = await callApi('getRoadmap', { id: _currentRoadmapId });
    const roadmap = res.data || res;
    const step = (roadmap.steps || []).find(s => s.id === stepId);
    if (!step) { showToast('ไม่พบข้อมูลขั้นตอน', 'error'); return; }

    _editStepData = step;

    document.getElementById('roadmap-modal-title').textContent = 'แก้ไขขั้นตอน';
    document.getElementById('roadmap-modal-content').innerHTML = `
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div><label class="block text-xs text-gray-600 mb-1">ลำดับ</label>
            <input type="number" id="edit-step-num" class="w-full border rounded p-2 text-sm" value="${step.stepNumber || ''}" min="1" /></div>
          <div><label class="block text-xs text-gray-600 mb-1">ระยะเวลา (วัน)</label>
            <input type="number" id="edit-step-duration" class="w-full border rounded p-2 text-sm" value="${step.durationDays || ''}" min="1" /></div>
        </div>
        <div><label class="block text-xs text-gray-600 mb-1">ชื่อขั้นตอน *</label>
          <input type="text" id="edit-step-title" class="w-full border rounded p-2 text-sm" value="${step.title || ''}" /></div>
        <div><label class="block text-xs text-gray-600 mb-1">รายละเอียด</label>
          <textarea id="edit-step-desc" class="w-full border rounded p-2 text-sm" rows="2">${step.description || ''}</textarea></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="block text-xs text-gray-600 mb-1">กำหนดเสร็จ</label>
            <input type="date" id="edit-step-due" class="w-full border rounded p-2 text-sm" value="${step.dueDate || ''}" /></div>
          <div><label class="block text-xs text-gray-600 mb-1">แหล่งเรียนรู้ (URL)</label>
            <input type="text" id="edit-step-resources" class="w-full border rounded p-2 text-sm" value="${step.resources || ''}" /></div>
        </div>
        <div><label class="block text-xs text-gray-600 mb-1">ไฟล์แนบ</label>
          ${step.fileUrl ? `
            <div id="edit-existing-file" class="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-2 rounded mb-2">
              <a href="${safeUrl(step.fileUrl)}" target="_blank" class="hover:underline flex-1">${escAttr(step.fileName || 'ไฟล์แนบ')}</a>
              <button onclick="document.getElementById('edit-existing-file').remove();document.getElementById('edit-step-remove-file').value='true';document.getElementById('edit-file-upload-box').classList.remove('hidden')" class="text-red-500 text-xs hover:text-red-700">เปลี่ยนไฟล์</button>
            </div>` : ''}
          <input type="hidden" id="edit-step-remove-file" value="false" />
          <div id="edit-file-upload-box" class="${step.fileUrl ? 'hidden' : ''} border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-blue-400 transition-colors" onclick="document.getElementById('edit-step-file-input').click()">
            <input type="file" id="edit-step-file-input" class="hidden" onchange="handleEditStepFile(this)" />
            <p class="text-sm text-gray-500">คลิกเพื่อเลือกไฟล์</p>
          </div>
          <div id="edit-step-file-preview" class="hidden mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
            <span id="edit-step-file-name"></span>
            <button onclick="clearEditStepFile()" class="text-red-500 text-xs hover:text-red-700 ml-auto">ลบ</button>
          </div>
        </div>
        <div class="flex gap-2 pt-2">
          <button onclick="submitEditStep('${stepId}')" class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition-colors flex-1">บันทึก</button>
          <button onclick="viewRoadmapDetail('${_currentRoadmapId}')" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-400">ยกเลิก</button>
        </div>
      </div>`;
  } catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
}

var _editStepFileData = null;
var _editStepFileName = null;
var _editStepFileMime = null;

function handleEditStepFile(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    showToast('ไฟล์มีขนาดเกิน 10MB', 'error');
    input.value = '';
    return;
  }
  _editStepFileName = file.name;
  _editStepFileMime = file.type;
  document.getElementById('edit-step-file-name').textContent = file.name;
  document.getElementById('edit-step-file-preview').classList.remove('hidden');
  document.getElementById('edit-file-upload-box').classList.add('hidden');

  fileToBase64(file).then(base64 => { _editStepFileData = base64; }).catch(err => showToast('ไม่สามารถอ่านไฟล์ได้', 'error'));
}

function clearEditStepFile() {
  _editStepFileData = null;
  _editStepFileName = null;
  _editStepFileMime = null;
  const input = document.getElementById('edit-step-file-input');
  if (input) input.value = '';
  document.getElementById('edit-step-file-preview').classList.add('hidden');
  document.getElementById('edit-file-upload-box').classList.remove('hidden');
}

async function submitEditStep(stepId) {
  const title = document.getElementById('edit-step-title').value.trim();
  if (!title) {
    showToast('กรุณาระบุชื่อขั้นตอน', 'error');
    return;
  }

  showLoading();
  try {
    let fileUrl = _editStepData ? (_editStepData.fileUrl || '') : '';
    let fileName = _editStepData ? (_editStepData.fileName || '') : '';
    const removeFile = document.getElementById('edit-step-remove-file').value === 'true';

    if (_editStepFileData && _editStepFileName) {
      const uploadRes = await callApiPost('uploadFile', {
        fileName: _editStepFileName,
        fileData: _editStepFileData,
        mimeType: _editStepFileMime || 'application/octet-stream',
        subfolder: 'resources'
      });
      if (uploadRes.success && uploadRes.data) {
        fileUrl = uploadRes.data.fileUrl || uploadRes.data.url || '';
        fileName = _editStepFileName;
      }
    } else if (removeFile) {
      fileUrl = '';
      fileName = '';
    }

    await callApiPost('updateRoadmapStep', {
      id: stepId,
      stepNumber: document.getElementById('edit-step-num').value,
      title: title,
      description: document.getElementById('edit-step-desc').value,
      dueDate: document.getElementById('edit-step-due').value,
      durationDays: document.getElementById('edit-step-duration').value,
      resources: document.getElementById('edit-step-resources').value,
      fileUrl: fileUrl,
      fileName: fileName
    });

    _editStepFileData = null;
    _editStepFileName = null;
    _editStepFileMime = null;
    _editStepData = null;

    showToast('อัปเดตขั้นตอนสำเร็จ', 'success');
    await viewRoadmapDetail(_currentRoadmapId);
  } catch (e) { showToast('เกิดข้อผิดพลาด: ' + e.message, 'error'); }
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
        <button onclick="updateRoadmapById('${id}')" class="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">อัปเดต</button>
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
  try {
    await callApiPost('deleteRoadmapStep', { id });
    showToast('ลบขั้นตอนสำเร็จ', 'success');
    if (_currentRoadmapId) await viewRoadmapDetail(_currentRoadmapId);
  } catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
  hideLoading();
}
