function renderAdminResources() {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') return navigateTo('login');

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="lg:ml-64 mt-16">
      ${buildNavbar(user)}
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">จัดการแหล่งเรียนรู้</h1>
          <button onclick="openCreateResource()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">+ เพิ่มแหล่งเรียนรู้</button>
        </div>
        <div id="admin-resources-list" class="space-y-4">
          <div class="text-center py-8 text-gray-400">กำลังโหลด...</div>
        </div>
      </div>
    </div>
    <div id="resource-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-lg font-bold" id="resource-modal-title">เพิ่มแหล่งเรียนรู้</h3>
          <button onclick="document.getElementById('resource-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="p-6" id="resource-modal-content"></div>
      </div>
    </div>
  `;
  loadAdminResources();
}

async function loadAdminResources() {
  const container = document.getElementById('admin-resources-list');
  try {
    const res = await callApi('getResources');
    const resources = res.data || res || [];

    if (!Array.isArray(resources) || resources.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-400">ยังไม่มีแหล่งเรียนรู้</div>';
      return;
    }

    const typeIcons = { link: '🔗', document: '📄', video: '🎬' };
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${resources.map(r => `
          <div class="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
            <div class="flex items-start justify-between mb-2">
              <span class="text-2xl">${typeIcons[r.type] || '📁'}</span>
              <div class="flex gap-1">
                <button onclick="editResource('${r.id}')" class="text-xs text-blue-600 hover:underline">แก้ไข</button>
                <button onclick="deleteResourceById('${r.id}')" class="text-xs text-red-600 hover:underline">ลบ</button>
              </div>
            </div>
            <h3 class="font-bold text-gray-800 mb-1">${r.title || ''}</h3>
            <p class="text-sm text-gray-500 mb-2">${r.description || ''}</p>
            <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">${r.category || ''}</span>
          </div>
        `).join('')}
      </div>`;
  } catch (e) {
    container.innerHTML = '<div class="text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}

function openCreateResource() {
  document.getElementById('resource-modal-title').textContent = 'เพิ่มแหล่งเรียนรู้';
  document.getElementById('resource-modal-content').innerHTML = buildResourceForm({});
  document.getElementById('resource-modal').classList.remove('hidden');
}

function buildResourceForm(r) {
  return `
    <div class="space-y-4">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
        <input type="text" id="res-title" class="w-full border rounded-lg p-2" value="${r.title||''}" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
        <textarea id="res-desc" class="w-full border rounded-lg p-3 text-sm" rows="3">${r.description||''}</textarea></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
          <select id="res-category" class="w-full border rounded-lg p-2">
            <option ${r.category==='คู่มือ'?'selected':''}>คู่มือ</option>
            <option ${r.category==='การเรียนรู้'?'selected':''}>การเรียนรู้</option>
            <option ${r.category==='เอกสาร'?'selected':''}>เอกสาร</option>
            <option ${r.category==='บทเรียน'?'selected':''}>บทเรียน</option>
          </select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
          <select id="res-type" class="w-full border rounded-lg p-2" onchange="onResTypeChange()">
            <option value="link" ${r.type==='link'?'selected':''}>ลิงก์</option>
            <option value="document" ${r.type==='document'?'selected':''}>เอกสาร</option>
            <option value="video" ${r.type==='video'?'selected':''}>วิดีโอ</option>
          </select></div>
      </div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">URL / ลิงก์</label>
        <input type="text" id="res-url" class="w-full border rounded-lg p-2" value="${r.url||''}" placeholder="วาง URL ของวิดีโอ, Google Drive, YouTube หรือลิงก์อื่น" /></div>
      <div id="res-video-hint" class="${r.type === 'video' ? '' : 'hidden'} bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
        <b>สำหรับวิดีโอขนาดใหญ่:</b> อัปโหลดไฟล์ไปยัง Google Drive โดยตรง แล้ววาง URL ที่ช่องด้านบน (รองรับทุกขนาดตาม Space ของ Google Drive) สำหรับวิดีโอขนาดเล็ก (&le; 50 MB) สามารถอัปโหลดผ่านช่องด้านล่างได้
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">อัพโหลดไฟล์ <span id="res-file-limit" class="text-xs text-gray-400 font-normal">(สูงสุด 50 MB)</span></label>
        <input type="file" id="res-file" class="w-full border rounded-lg p-2 text-sm" onchange="onResFileSelect()" />
        <div id="res-file-size-warn" class="hidden mt-1 text-xs text-red-500"></div>
      </div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">แท็ก</label>
        <input type="text" id="res-tags" class="w-full border rounded-lg p-2" value="${r.tags||''}" placeholder="คั่นด้วยจุลภาค" /></div>
      <button onclick="saveResource('${r.id||''}')" class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">บันทึก</button>
    </div>`;
}

function onResTypeChange() {
  const type = document.getElementById('res-type').value;
  const hint = document.getElementById('res-video-hint');
  if (type === 'video') hint.classList.remove('hidden');
  else hint.classList.add('hidden');
}

function onResFileSelect() {
  const fileInput = document.getElementById('res-file');
  const warnEl = document.getElementById('res-file-size-warn');
  if (!fileInput.files[0]) { warnEl.classList.add('hidden'); return; }
  const sizeMB = (fileInput.files[0].size / (1024 * 1024)).toFixed(1);
  if (fileInput.files[0].size > 50 * 1024 * 1024) {
    warnEl.textContent = `ไฟล์ขนาด ${sizeMB} MB เกินขีดจำกัด 50 MB — กรุณาอัปโหลดไปยัง Google Drive โดยตรง แล้ววาง URL ที่ช่อง "URL / ลิงก์" แทน`;
    warnEl.classList.remove('hidden');
    fileInput.value = '';
  } else if (fileInput.files[0].size > 30 * 1024 * 1024) {
    warnEl.textContent = `ไฟล์ขนาด ${sizeMB} MB — การอัปโหลดอาจใช้เวลาสักครู่`;
    warnEl.classList.remove('hidden');
    warnEl.className = 'mt-1 text-xs text-amber-500';
  } else {
    warnEl.classList.add('hidden');
  }
}

async function saveResource(existingId) {
  const user = getCurrentUser();
  showLoading();
  try {
    let fileUrl = '';
    const fileInput = document.getElementById('res-file');
    if (fileInput.files[0]) {
      if (fileInput.files[0].size > 50 * 1024 * 1024) {
        hideLoading();
        showToast('ไฟล์เกิน 50 MB — กรุณาอัปโหลดไปยัง Google Drive แล้ววาง URL แทน', 'error');
        return;
      }
      const resType = document.getElementById('res-type').value;
      const subfolder = resType === 'video' ? 'videos' : 'resources';
      const base64 = await fileToBase64(fileInput.files[0]);
      const upRes = await callApiPost('uploadFile', { fileName: fileInput.files[0].name, fileData: base64, mimeType: fileInput.files[0].type, subfolder: subfolder });
      if (upRes.success && upRes.data) {
        fileUrl = upRes.data.fileUrl;
      } else {
        hideLoading();
        showToast(upRes.message || 'ไม่สามารถอัปโหลดไฟล์ได้', 'error');
        return;
      }
    }

    const data = {
      title: document.getElementById('res-title').value,
      description: document.getElementById('res-desc').value,
      category: document.getElementById('res-category').value,
      type: document.getElementById('res-type').value,
      url: document.getElementById('res-url').value,
      tags: document.getElementById('res-tags').value,
      createdBy: user.id,
      isActive: 'true'
    };
    if (fileUrl) data.fileUrl = fileUrl;

    if (existingId) {
      data.id = existingId;
      await callApiPost('updateResource', data);
    } else {
      await callApiPost('createResource', data);
    }
    showToast('บันทึกสำเร็จ', 'success');
    document.getElementById('resource-modal').classList.add('hidden');
    await loadAdminResources();
  } catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
  hideLoading();
}

async function editResource(id) {
  showLoading();
  try {
    const res = await callApi('getResource', { id });
    const r = res.data || res;
    hideLoading();
    document.getElementById('resource-modal-title').textContent = 'แก้ไขแหล่งเรียนรู้';
    document.getElementById('resource-modal-content').innerHTML = buildResourceForm(r);
    document.getElementById('resource-modal').classList.remove('hidden');
  } catch (e) { hideLoading(); showToast('เกิดข้อผิดพลาด', 'error'); }
}

async function deleteResourceById(id) {
  if (!confirm('ต้องการลบแหล่งเรียนรู้นี้?')) return;
  showLoading();
  try {
    await callApiPost('deleteResource', { id });
    showToast('ลบสำเร็จ', 'success');
    await loadAdminResources();
  } catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
  hideLoading();
}
