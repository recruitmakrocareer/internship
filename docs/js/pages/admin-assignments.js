function renderAdminAssignments() {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') return navigateTo('login');

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="lg:ml-64 mt-16">
      ${buildNavbar(user)}
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">จัดการงานมอบหมาย</h1>
          <button onclick="openCreateAssignment()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">+ สร้างงาน</button>
        </div>
        <div id="admin-assign-list" class="space-y-4">
          <div class="text-center py-8 text-gray-400">กำลังโหลด...</div>
        </div>
      </div>
    </div>
    <div id="assign-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-lg font-bold" id="assign-modal-title">สร้างงาน</h3>
          <button onclick="document.getElementById('assign-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="p-6" id="assign-modal-content"></div>
      </div>
    </div>
  `;
  loadAdminAssignments();
}

async function loadAdminAssignments() {
  const container = document.getElementById('admin-assign-list');
  try {
    const res = await callApi('getAssignments');
    const assignments = res.data || res || [];

    if (!Array.isArray(assignments) || assignments.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-400">ยังไม่มีงาน</div>';
      return;
    }

    container.innerHTML = `
      <div class="bg-white rounded-xl border overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-3 font-medium text-gray-600">ชื่องาน</th>
              <th class="text-left p-3 font-medium text-gray-600">ที่มา</th>
              <th class="text-left p-3 font-medium text-gray-600">กำหนดส่ง</th>
              <th class="text-left p-3 font-medium text-gray-600">คะแนนเต็ม</th>
              <th class="text-left p-3 font-medium text-gray-600">สถานะ</th>
              <th class="text-center p-3 font-medium text-gray-600">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            ${assignments.map(a => `
              <tr class="hover:bg-gray-50">
                <td class="p-3">
                  <div class="font-medium text-gray-800">${a.title || ''}</div>
                  <div class="text-xs text-gray-500">${(a.description || '').substring(0, 60)}...</div>
                </td>
                <td class="p-3">${a.source === 'มหาวิทยาลัย' ? '<span class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">มหาวิทยาลัย</span>' : '<span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Makro</span>'}</td>
                <td class="p-3 text-gray-600">${a.dueDate ? formatDate(a.dueDate) : '-'}</td>
                <td class="p-3 text-gray-600">${a.maxScore || '-'}</td>
                <td class="p-3"><span class="px-2 py-1 text-xs rounded-full ${a.isActive === 'true' || a.isActive === true ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}">${a.isActive === 'true' || a.isActive === true ? 'เปิดใช้งาน' : 'ปิด'}</span></td>
                <td class="p-3 text-center">
                  <button onclick="editAssignment('${a.id}')" class="text-blue-600 hover:underline text-sm mr-2">แก้ไข</button>
                  <button onclick="viewSubmissions('${a.id}','${(a.title||'').replace(/'/g,"\\'")}')" class="text-green-600 hover:underline text-sm">ดูงานที่ส่ง</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (e) {
    container.innerHTML = '<div class="text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}

function openCreateAssignment() {
  document.getElementById('assign-modal-title').textContent = 'สร้างงานใหม่';
  document.getElementById('assign-modal-content').innerHTML = `
    <div class="space-y-4">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">ชื่องาน</label>
        <input type="text" id="aa-title" class="w-full border rounded-lg p-2" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
        <textarea id="aa-desc" class="w-full border rounded-lg p-3 text-sm" rows="4"></textarea></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">ที่มา</label>
          <select id="aa-source" class="w-full border rounded-lg p-2">
            <option value="Makro" selected>Makro</option>
            <option value="มหาวิทยาลัย">มหาวิทยาลัย</option>
          </select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">อาจารย์ที่ปรึกษา</label>
          <input type="text" id="aa-professor" class="w-full border rounded-lg p-2" placeholder="ชื่ออาจารย์ที่ปรึกษา" /></div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">กำหนดส่ง</label>
          <input type="date" id="aa-due" class="w-full border rounded-lg p-2" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">คะแนนเต็ม</label>
          <input type="number" id="aa-score" class="w-full border rounded-lg p-2" value="100" /></div>
      </div>
      <button onclick="saveNewAssignment()" class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">บันทึก</button>
    </div>`;
  document.getElementById('assign-modal').classList.remove('hidden');
}

async function saveNewAssignment() {
  const user = getCurrentUser();
  showLoading();
  try {
    await callApiPost('createAssignment', {
      title: document.getElementById('aa-title').value,
      description: document.getElementById('aa-desc').value,
      source: document.getElementById('aa-source').value,
      professorName: document.getElementById('aa-professor').value,
      dueDate: document.getElementById('aa-due').value,
      maxScore: document.getElementById('aa-score').value,
      assignedTo: 'all',
      createdBy: user.id,
      isActive: 'true'
    });
    showToast('สร้างงานสำเร็จ', 'success');
    document.getElementById('assign-modal').classList.add('hidden');
    await loadAdminAssignments();
  } catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
  hideLoading();
}

async function editAssignment(id) {
  showLoading();
  try {
    const res = await callApi('getAssignment', { id });
    const a = res.data || res;
    hideLoading();
    document.getElementById('assign-modal-title').textContent = 'แก้ไขงาน';
    document.getElementById('assign-modal-content').innerHTML = `
      <div class="space-y-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">ชื่องาน</label>
          <input type="text" id="aa-title" class="w-full border rounded-lg p-2" value="${a.title||''}" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
          <textarea id="aa-desc" class="w-full border rounded-lg p-3 text-sm" rows="4">${a.description||''}</textarea></div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium text-gray-700 mb-1">ที่มา</label>
            <select id="aa-source" class="w-full border rounded-lg p-2">
              <option value="Makro" ${(a.source||'Makro')==='Makro'?'selected':''}>Makro</option>
              <option value="มหาวิทยาลัย" ${a.source==='มหาวิทยาลัย'?'selected':''}>มหาวิทยาลัย</option>
            </select></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">อาจารย์ที่ปรึกษา</label>
            <input type="text" id="aa-professor" class="w-full border rounded-lg p-2" placeholder="ชื่ออาจารย์ที่ปรึกษา" value="${a.professorName||''}" /></div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium text-gray-700 mb-1">กำหนดส่ง</label>
            <input type="date" id="aa-due" class="w-full border rounded-lg p-2" value="${a.dueDate||''}" /></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">คะแนนเต็ม</label>
            <input type="number" id="aa-score" class="w-full border rounded-lg p-2" value="${a.maxScore||100}" /></div>
        </div>
        <button onclick="updateAssignmentById('${id}')" class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">อัปเดต</button>
      </div>`;
    document.getElementById('assign-modal').classList.remove('hidden');
  } catch (e) { hideLoading(); showToast('เกิดข้อผิดพลาด', 'error'); }
}

async function updateAssignmentById(id) {
  showLoading();
  try {
    await callApiPost('updateAssignment', { id, title: document.getElementById('aa-title').value, description: document.getElementById('aa-desc').value, source: document.getElementById('aa-source').value, professorName: document.getElementById('aa-professor').value, dueDate: document.getElementById('aa-due').value, maxScore: document.getElementById('aa-score').value });
    showToast('อัปเดตสำเร็จ', 'success');
    document.getElementById('assign-modal').classList.add('hidden');
    await loadAdminAssignments();
  } catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
  hideLoading();
}

async function viewSubmissions(assignmentId, title) {
  document.getElementById('assign-modal-title').textContent = 'งานที่ส่ง: ' + title;
  document.getElementById('assign-modal-content').innerHTML = '<div class="text-center py-4 text-gray-400">กำลังโหลด...</div>';
  document.getElementById('assign-modal').classList.remove('hidden');
  try {
    const res = await callApi('getSubmissions', { assignmentId });
    const subs = res.data || res || [];
    if (!Array.isArray(subs) || subs.length === 0) {
      document.getElementById('assign-modal-content').innerHTML = '<div class="text-center py-8 text-gray-400">ยังไม่มีงานที่ส่ง</div>';
      return;
    }
    document.getElementById('assign-modal-content').innerHTML = `
      <div class="space-y-3">
        ${subs.map(s => `
          <div class="border rounded-lg p-3">
            <div class="flex justify-between items-center mb-1">
              <span class="font-medium text-gray-700">${s.userId}</span>
              <span class="px-2 py-1 text-xs rounded-full ${s.status === 'reviewed' || s.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${s.status === 'reviewed' || s.status === 'graded' ? 'ตรวจแล้ว' : 'รอตรวจ'}</span>
            </div>
            <p class="text-sm text-gray-600">${s.content || ''}</p>
            ${s.fileUrl ? `<a href="${s.fileUrl}" target="_blank" class="text-sm text-blue-600 hover:underline">ไฟล์แนบ</a>` : ''}
            ${s.score ? `<div class="text-sm text-green-600 mt-1">คะแนน: ${s.score} | ${s.feedback || ''}</div>` : ''}
          </div>
        `).join('')}
      </div>`;
  } catch (e) {
    document.getElementById('assign-modal-content').innerHTML = '<div class="text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}
