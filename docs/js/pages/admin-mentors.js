// ==================== จัดการพี่เลี้ยง (Admin) ====================

function renderAdminMentors() {
  if (!checkAuth()) return;
  const user = getCurrentUser();
  if (user.role !== 'ADMIN') return navigateTo('dashboard');

  const content = initLayout(user);
  content.innerHTML = `
    <div class="fade-in">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 class="text-2xl font-bold text-gray-800">จัดการพี่เลี้ยง</h2>
        <button onclick="openAddMentorModal()" class="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          เพิ่มพี่เลี้ยง
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <input type="text" id="mentor-search" placeholder="ค้นหาชื่อ, อีเมล..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
          </div>
          <button onclick="loadMentors()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            ค้นหา
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">แผนก</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">อีเมล</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">โทรศัพท์</th>
                <th class="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">นักศึกษาที่ดูแล</th>
                <th class="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody id="mentors-table-body" class="divide-y divide-gray-200">
              <tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">กำลังโหลด...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="mentor-modal"></div>
  `;

  document.getElementById('mentor-search').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') loadMentors();
  });

  loadMentors();
}

let _mentorsData = [];

async function loadMentors() {
  const tbody = document.getElementById('mentors-table-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">กำลังโหลด...</td></tr>';

  try {
    const result = await callApi('getMentors');
    if (result.success && result.data) {
      _mentorsData = result.data;
      let mentors = [..._mentorsData];

      const search = (document.getElementById('mentor-search')?.value || '').toLowerCase();
      if (search) {
        mentors = mentors.filter(m =>
          (m.name || '').toLowerCase().includes(search) ||
          (m.firstName || '').toLowerCase().includes(search) ||
          (m.lastName || '').toLowerCase().includes(search) ||
          (m.email || '').toLowerCase().includes(search)
        );
      }

      if (mentors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-400">ไม่พบข้อมูลพี่เลี้ยง</td></tr>';
        return;
      }

      tbody.innerHTML = mentors.map(m => `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-green-700 font-semibold text-xs">${(m.name || m.firstName || '?').charAt(0)}</span>
              </div>
              <span class="font-medium text-gray-800">${m.name || ((m.firstName || '') + ' ' + (m.lastName || '')).trim() || '-'}</span>
            </div>
          </td>
          <td class="px-6 py-4 text-gray-600">${m.department || '-'}</td>
          <td class="px-6 py-4 text-gray-600">${m.email || '-'}</td>
          <td class="px-6 py-4 text-gray-600">${m.phone || '-'}</td>
          <td class="px-6 py-4 text-center">
            <span class="inline-flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full font-semibold text-sm">
              ${m.assignedStudents || m.studentCount || 0}
            </span>
          </td>
          <td class="px-6 py-4 text-center">
            <div class="flex items-center justify-center gap-2">
              <button onclick="openEditMentorModal('${m.id}')" class="text-primary-600 hover:text-primary-800 transition-colors" title="แก้ไข">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button onclick="openAssignStudentModal('${m.id}', '${(m.name || '').replace(/'/g, "\\'")}')" class="text-green-600 hover:text-green-800 transition-colors" title="มอบหมายนักศึกษา">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-400">ไม่พบข้อมูลพี่เลี้ยง</td></tr>';
    }
  } catch (error) {
    console.error('Error loading mentors:', error);
    tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
  }
}

function openAddMentorModal() {
  const modalContainer = document.getElementById('mentor-modal');
  modalContainer.innerHTML = buildModal('add-mentor-modal', 'เพิ่มพี่เลี้ยง', `
    <form id="add-mentor-form">
      ${inputField('add-mentor-firstName', 'ชื่อ', 'text', '', 'กรอกชื่อ')}
      ${inputField('add-mentor-lastName', 'นามสกุล', 'text', '', 'กรอกนามสกุล')}
      ${inputField('add-mentor-email', 'อีเมล', 'email', '', 'กรอกอีเมล')}
      ${inputField('add-mentor-phone', 'โทรศัพท์', 'tel', '', 'กรอกเบอร์โทรศัพท์', false)}
      ${inputField('add-mentor-department', 'แผนก', 'text', '', 'กรอกแผนก', false)}
      ${inputField('add-mentor-password', 'รหัสผ่าน', 'password', '', 'กรอกรหัสผ่าน')}
    </form>
  `, `
    <button onclick="closeModal('add-mentor-modal')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">ยกเลิก</button>
    <button onclick="submitAddMentor()" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">บันทึก</button>
  `);
  openModal('add-mentor-modal');
}

async function submitAddMentor() {
  const firstName = document.getElementById('add-mentor-firstName').value.trim();
  const lastName = document.getElementById('add-mentor-lastName').value.trim();
  const email = document.getElementById('add-mentor-email').value.trim();
  const phone = document.getElementById('add-mentor-phone').value.trim();
  const department = document.getElementById('add-mentor-department').value.trim();
  const password = document.getElementById('add-mentor-password').value;

  if (!firstName || !lastName || !email || !password) {
    showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบ', 'error');
    return;
  }

  try {
    showLoading();
    const result = await callApi('createMentor', {
      firstName, lastName, email, phone, department, password
    });
    hideLoading();

    if (result.success) {
      showToast('เพิ่มพี่เลี้ยงสำเร็จ', 'success');
      closeModal('add-mentor-modal');
      loadMentors();
    } else {
      showToast(result.message || 'ไม่สามารถเพิ่มพี่เลี้ยงได้', 'error');
    }
  } catch (error) {
    hideLoading();
    showToast('เกิดข้อผิดพลาดในการเพิ่มพี่เลี้ยง', 'error');
  }
}

async function openEditMentorModal(mentorId) {
  const mentor = _mentorsData.find(m => m.id === mentorId);
  if (!mentor) {
    showToast('ไม่พบข้อมูลพี่เลี้ยง', 'error');
    return;
  }

  const modalContainer = document.getElementById('mentor-modal');
  modalContainer.innerHTML = buildModal('edit-mentor-modal', 'แก้ไขข้อมูลพี่เลี้ยง', `
    <form id="edit-mentor-form">
      <input type="hidden" id="edit-mentor-id" value="${mentor.id}">
      ${inputField('edit-mentor-firstName', 'ชื่อ', 'text', mentor.firstName || '', 'กรอกชื่อ')}
      ${inputField('edit-mentor-lastName', 'นามสกุล', 'text', mentor.lastName || '', 'กรอกนามสกุล')}
      ${inputField('edit-mentor-email', 'อีเมล', 'email', mentor.email || '', 'กรอกอีเมล')}
      ${inputField('edit-mentor-phone', 'โทรศัพท์', 'tel', mentor.phone || '', 'กรอกเบอร์โทรศัพท์', false)}
      ${inputField('edit-mentor-department', 'แผนก', 'text', mentor.department || '', 'กรอกแผนก', false)}
    </form>
  `, `
    <button onclick="closeModal('edit-mentor-modal')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">ยกเลิก</button>
    <button onclick="submitEditMentor()" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">บันทึก</button>
  `);
  openModal('edit-mentor-modal');
}

async function submitEditMentor() {
  const id = document.getElementById('edit-mentor-id').value;
  const firstName = document.getElementById('edit-mentor-firstName').value.trim();
  const lastName = document.getElementById('edit-mentor-lastName').value.trim();
  const email = document.getElementById('edit-mentor-email').value.trim();
  const phone = document.getElementById('edit-mentor-phone').value.trim();
  const department = document.getElementById('edit-mentor-department').value.trim();

  if (!firstName || !lastName || !email) {
    showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบ', 'error');
    return;
  }

  try {
    showLoading();
    const result = await callApi('updateMentor', {
      id, firstName, lastName, email, phone, department
    });
    hideLoading();

    if (result.success) {
      showToast('แก้ไขข้อมูลพี่เลี้ยงสำเร็จ', 'success');
      closeModal('edit-mentor-modal');
      loadMentors();
    } else {
      showToast(result.message || 'ไม่สามารถแก้ไขข้อมูลได้', 'error');
    }
  } catch (error) {
    hideLoading();
    showToast('เกิดข้อผิดพลาดในการแก้ไขข้อมูล', 'error');
  }
}

async function openAssignStudentModal(mentorId, mentorName) {
  const modalContainer = document.getElementById('mentor-modal');
  modalContainer.innerHTML = buildModal('assign-student-modal', `มอบหมายนักศึกษาให้ ${mentorName}`, `
    <div id="assign-student-list" class="space-y-2">
      <p class="text-sm text-gray-500">กำลังโหลดรายชื่อนักศึกษา...</p>
    </div>
  `, `
    <button onclick="closeModal('assign-student-modal')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">ปิด</button>
  `);
  openModal('assign-student-modal');

  try {
    const result = await callApi('getStudents');
    const listContainer = document.getElementById('assign-student-list');
    if (result.success && result.data && result.data.length > 0) {
      const students = result.data.filter(s => s.status !== 'INACTIVE');
      if (students.length === 0) {
        listContainer.innerHTML = '<p class="text-sm text-gray-400">ไม่มีนักศึกษาที่สามารถมอบหมายได้</p>';
        return;
      }
      listContainer.innerHTML = students.map(s => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span class="text-primary-700 font-semibold text-xs">${(s.name || s.firstName || '?').charAt(0)}</span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-800">${s.name || ((s.firstName || '') + ' ' + (s.lastName || '')).trim()}</p>
              <p class="text-xs text-gray-500">${s.studentId || ''} ${s.department ? '| ' + s.department : ''}</p>
            </div>
          </div>
          <button onclick="assignStudentToMentor('${mentorId}', '${s.id}')" class="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
            มอบหมาย
          </button>
        </div>
      `).join('');
    } else {
      listContainer.innerHTML = '<p class="text-sm text-gray-400">ไม่มีนักศึกษาในระบบ</p>';
    }
  } catch (error) {
    document.getElementById('assign-student-list').innerHTML = '<p class="text-sm text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
  }
}

async function assignStudentToMentor(mentorId, studentId) {
  try {
    showLoading();
    const result = await callApi('assignMentor', { mentorId, studentId });
    hideLoading();

    if (result.success) {
      showToast('มอบหมายนักศึกษาสำเร็จ', 'success');
      closeModal('assign-student-modal');
      loadMentors();
    } else {
      showToast(result.message || 'ไม่สามารถมอบหมายนักศึกษาได้', 'error');
    }
  } catch (error) {
    hideLoading();
    showToast('เกิดข้อผิดพลาด', 'error');
  }
}
