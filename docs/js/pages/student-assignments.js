function renderStudentAssignments() {
  const user = getCurrentUser();
  if (!user) return navigateTo('login');

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="lg:ml-64 mt-16">
      ${buildNavbar(user)}
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-gray-800">งานที่ได้รับมอบหมาย</h1>
          <button onclick="openAddStudentAssignment()" class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            เพิ่มงาน/โปรเจค
          </button>
        </div>
        <div id="assignments-list" class="space-y-4">
          <div class="text-center py-8 text-gray-400">กำลังโหลด...</div>
        </div>
      </div>
    </div>
    <div id="submit-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-lg font-bold" id="submit-modal-title">ส่งงาน</h3>
          <button onclick="document.getElementById('submit-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">เนื้อหา / คำตอบ</label>
            <textarea id="submit-content" class="w-full border rounded-lg p-3 text-sm" rows="6" placeholder="เขียนคำตอบหรือรายละเอียดงาน..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">แนบไฟล์ (ไม่เกิน 10MB)</label>
            <input type="file" id="submit-file" class="w-full border rounded-lg p-2 text-sm" />
          </div>
          <button id="submit-btn" onclick="submitWork()" class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">ส่งงาน</button>
        </div>
      </div>
    </div>
    <div id="add-assignment-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-lg font-bold">เพิ่มงาน/โปรเจคจากมหาวิทยาลัย</h3>
          <button onclick="document.getElementById('add-assignment-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่องาน/โปรเจค <span class="text-red-500">*</span></label>
            <input type="text" id="add-assign-title" class="w-full border rounded-lg p-3 text-sm" placeholder="ชื่อหัวข้องาน หรือ Project">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
            <textarea id="add-assign-desc" class="w-full border rounded-lg p-3 text-sm" rows="3" placeholder="รายละเอียดงาน..."></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">อาจารย์ที่สั่ง</label>
              <input type="text" id="add-assign-professor" class="w-full border rounded-lg p-3 text-sm" placeholder="ชื่ออาจารย์">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">กำหนดส่ง</label>
              <input type="date" id="add-assign-due" class="w-full border rounded-lg p-3 text-sm">
            </div>
          </div>
          <button onclick="saveStudentAssignment()" class="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700">บันทึก</button>
        </div>
      </div>
    </div>
  `;
  loadStudentAssignments();
}

async function loadStudentAssignments() {
  const user = getCurrentUser();
  const container = document.getElementById('assignments-list');
  try {
    const [assignRes, subRes] = await Promise.all([
      callApi('getAssignments'),
      callApi('getSubmissions', { userId: user.id })
    ]);
    const assignments = assignRes.data || assignRes || [];
    const submissions = subRes.data || subRes || [];
    const subMap = {};
    if (Array.isArray(submissions)) submissions.forEach(s => { subMap[s.assignmentId] = s; });

    if (!Array.isArray(assignments) || assignments.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-400">ยังไม่มีงานที่ได้รับมอบหมาย</div>';
      return;
    }

    container.innerHTML = assignments.map(a => {
      const sub = subMap[a.id];
      const status = sub ? (sub.status === 'reviewed' || sub.status === 'graded' ? 'reviewed' : 'submitted') : 'pending';
      const statusLabel = { pending: 'ยังไม่ส่ง', submitted: 'ส่งแล้ว', reviewed: 'ตรวจแล้ว' }[status];
      const statusColor = { pending: 'bg-yellow-100 text-yellow-700', submitted: 'bg-blue-100 text-blue-700', reviewed: 'bg-green-100 text-green-700' }[status];

      return `
        <div class="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="font-bold text-gray-800">${a.title || ''}</h3>
              ${a.source === 'มหาวิทยาลัย' && a.professorName ? `<p class="text-sm text-purple-600 mt-1">อาจารย์ที่ปรึกษา: ${a.professorName}</p>` : ''}
              <p class="text-sm text-gray-500 mt-1">${a.description || ''}</p>
            </div>
            <div class="flex items-center gap-2">
              ${a.source === 'มหาวิทยาลัย' ? '<span class="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">มหาวิทยาลัย</span>' : '<span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Makro</span>'}
              <span class="px-3 py-1 text-xs font-medium rounded-full ${statusColor}">${statusLabel}</span>
            </div>
          </div>
          <div class="flex items-center gap-4 text-sm text-gray-500 mb-3">
            ${a.dueDate ? `<span>กำหนดส่ง: ${formatDate(a.dueDate)}</span>` : ''}
            <span>คะแนนเต็ม: ${a.maxScore || '-'}</span>
          </div>
          ${sub && status === 'reviewed' ? `
            <div class="bg-green-50 rounded-lg p-3 mb-3">
              <div class="flex items-center gap-4 mb-1">
                <span class="text-sm font-medium text-green-800">คะแนน: ${sub.score || '-'}/${a.maxScore || '-'}</span>
              </div>
              ${sub.feedback ? `<p class="text-sm text-green-700">${sub.feedback}</p>` : ''}
            </div>
          ` : ''}
          ${sub && sub.content ? `<div class="bg-gray-50 rounded-lg p-3 mb-3 text-sm text-gray-600">${sub.content}</div>` : ''}
          ${sub && sub.fileUrl ? `<a href="${sub.fileUrl}" target="_blank" class="text-sm text-blue-600 hover:underline mb-3 inline-block">ดูไฟล์ที่ส่ง: ${sub.fileName || 'ไฟล์แนบ'}</a>` : ''}
          ${status === 'pending' ? `<button onclick="openSubmitModal('${a.id}','${(a.title||'').replace(/'/g,"\\'")}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">ส่งงาน</button>` : ''}
        </div>`;
    }).join('');
  } catch (e) {
    container.innerHTML = '<div class="text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}

window._currentAssignmentId = null;
function openSubmitModal(assignmentId, title) {
  window._currentAssignmentId = assignmentId;
  document.getElementById('submit-modal-title').textContent = 'ส่งงาน: ' + title;
  document.getElementById('submit-content').value = '';
  document.getElementById('submit-file').value = '';
  document.getElementById('submit-modal').classList.remove('hidden');
}

async function submitWork() {
  const user = getCurrentUser();
  const content = document.getElementById('submit-content').value;
  const fileInput = document.getElementById('submit-file');
  const file = fileInput.files[0];
  const btn = document.getElementById('submit-btn');

  if (!content && !file) { showToast('กรุณากรอกเนื้อหาหรือแนบไฟล์', 'error'); return; }
  if (file && file.size > 10 * 1024 * 1024) { showToast('ไฟล์มีขนาดเกิน 10MB', 'error'); return; }

  btn.disabled = true;
  btn.textContent = 'กำลังส่ง...';
  showLoading();
  try {
    let fileUrl = '', fileName = '';
    if (file) {
      const base64 = await fileToBase64(file);
      const uploadRes = await callApiPost('uploadFile', {
        fileName: file.name, fileData: base64, mimeType: file.type, subfolder: 'submissions'
      });
      if (uploadRes.success && uploadRes.data) {
        fileUrl = uploadRes.data.fileUrl;
        fileName = uploadRes.data.fileName;
      }
    }
    await callApiPost('submitAssignment', {
      assignmentId: window._currentAssignmentId, userId: user.id, content, fileUrl, fileName
    });
    showToast('ส่งงานสำเร็จ', 'success');
    document.getElementById('submit-modal').classList.add('hidden');
    await loadStudentAssignments();
  } catch (e) {
    showToast('เกิดข้อผิดพลาด', 'error');
  }
  btn.disabled = false;
  btn.textContent = 'ส่งงาน';
  hideLoading();
}

function openAddStudentAssignment() {
  document.getElementById('add-assign-title').value = '';
  document.getElementById('add-assign-desc').value = '';
  document.getElementById('add-assign-professor').value = '';
  document.getElementById('add-assign-due').value = '';
  document.getElementById('add-assignment-modal').classList.remove('hidden');
}

async function saveStudentAssignment() {
  const title = document.getElementById('add-assign-title').value.trim();
  if (!title) { showToast('กรุณากรอกชื่องาน', 'error'); return; }

  const user = getCurrentUser();
  showLoading();
  try {
    await callApiPost('createAssignment', {
      title: title,
      description: document.getElementById('add-assign-desc').value.trim(),
      professorName: document.getElementById('add-assign-professor').value.trim(),
      source: 'มหาวิทยาลัย',
      dueDate: document.getElementById('add-assign-due').value,
      assignedTo: user.id,
      createdBy: user.id
    });
    showToast('เพิ่มงานสำเร็จ', 'success');
    document.getElementById('add-assignment-modal').classList.add('hidden');
    await loadStudentAssignments();
  } catch (e) {
    showToast('เกิดข้อผิดพลาด', 'error');
  }
  hideLoading();
}
