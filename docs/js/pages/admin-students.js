// ==================== จัดการนักศึกษา (Admin) ====================

function renderAdminStudents() {
  if (!checkAuth()) return;
  const user = getCurrentUser();
  if (user.role !== 'ADMIN') return navigateTo('dashboard');

  const content = initLayout(user);
  content.innerHTML = `
    <div class="fade-in">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 class="text-2xl font-bold text-gray-800">จัดการนักศึกษา</h2>
        <button onclick="openAddStudentModal()" class="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          เพิ่มนักศึกษา
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <input type="text" id="student-search" placeholder="ค้นหาชื่อ, รหัสนักศึกษา, อีเมล..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
          </div>
          <select id="student-status-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            <option value="">สถานะทั้งหมด</option>
            <option value="ACTIVE">ใช้งาน</option>
            <option value="INACTIVE">ไม่ใช้งาน</option>
          </select>
          <button onclick="loadStudents()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
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
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">รหัสนักศึกษา</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">สาขา</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">อีเมล</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">โทรศัพท์</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th class="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody id="students-table-body" class="divide-y divide-gray-200">
              <tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">กำลังโหลด...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="student-modal"></div>
  `;

  // Bind search events
  document.getElementById('student-search').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') loadStudents();
  });
  document.getElementById('student-status-filter').addEventListener('change', loadStudents);

  loadStudents();
}

async function loadStudents() {
  const tbody = document.getElementById('students-table-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">กำลังโหลด...</td></tr>';

  try {
    const result = await callApi('getStudents');
    if (result.success && result.data) {
      let students = result.data;

      // Client-side filtering
      const search = (document.getElementById('student-search')?.value || '').toLowerCase();
      const statusFilter = document.getElementById('student-status-filter')?.value || '';

      if (search) {
        students = students.filter(s =>
          (s.name || '').toLowerCase().includes(search) ||
          (s.firstName || '').toLowerCase().includes(search) ||
          (s.lastName || '').toLowerCase().includes(search) ||
          (s.studentId || '').toLowerCase().includes(search) ||
          (s.email || '').toLowerCase().includes(search)
        );
      }
      if (statusFilter) {
        students = students.filter(s => s.status === statusFilter);
      }

      if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-400">ไม่พบข้อมูลนักศึกษา</td></tr>';
        return;
      }

      tbody.innerHTML = students.map(s => `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-primary-700 font-semibold text-xs">${(s.name || s.firstName || '?').charAt(0)}</span>
              </div>
              <span class="font-medium text-gray-800">${s.name || (s.firstName + ' ' + s.lastName) || '-'}</span>
            </div>
          </td>
          <td class="px-6 py-4 text-gray-600">${s.studentId || '-'}</td>
          <td class="px-6 py-4 text-gray-600">${s.department || '-'}</td>
          <td class="px-6 py-4 text-gray-600">${s.email || '-'}</td>
          <td class="px-6 py-4 text-gray-600">${s.phone || '-'}</td>
          <td class="px-6 py-4">${statusBadge(s.status || 'ACTIVE')}</td>
          <td class="px-6 py-4 text-center">
            <div class="flex items-center justify-center gap-2">
              <button onclick="openEditStudentModal('${s.id}')" class="text-primary-600 hover:text-primary-800 transition-colors" title="แก้ไข">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button onclick="deactivateStudent('${s.id}', '${(s.name || '').replace(/'/g, "\\'")}')" class="text-red-500 hover:text-red-700 transition-colors" title="ปิดการใช้งาน">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-400">ไม่พบข้อมูลนักศึกษา</td></tr>';
    }
  } catch (error) {
    console.error('Error loading students:', error);
    tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
  }
}

let _studentsCache = [];

async function _getStudentsCache() {
  try {
    const result = await callApi('getStudents');
    if (result.success && result.data) {
      _studentsCache = result.data;
    }
  } catch (e) {
    console.error(e);
  }
  return _studentsCache;
}

function openAddStudentModal() {
  const modalContainer = document.getElementById('student-modal');
  modalContainer.innerHTML = buildModal('add-student-modal', 'เพิ่มนักศึกษา', `
    <form id="add-student-form">
      ${inputField('add-student-firstName', 'ชื่อ', 'text', '', 'กรอกชื่อ')}
      ${inputField('add-student-lastName', 'นามสกุล', 'text', '', 'กรอกนามสกุล')}
      ${inputField('add-student-studentId', 'รหัสนักศึกษา', 'text', '', 'กรอกรหัสนักศึกษา')}
      ${inputField('add-student-email', 'อีเมล', 'email', '', 'กรอกอีเมล')}
      ${inputField('add-student-phone', 'โทรศัพท์', 'tel', '', 'กรอกเบอร์โทรศัพท์', false)}
      ${inputField('add-student-department', 'สาขาวิชา', 'text', '', 'กรอกสาขาวิชา', false)}
      ${inputField('add-student-password', 'รหัสผ่าน', 'password', '', 'กรอกรหัสผ่าน')}
    </form>
  `, `
    <button onclick="closeModal('add-student-modal')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">ยกเลิก</button>
    <button onclick="submitAddStudent()" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">บันทึก</button>
  `);
  openModal('add-student-modal');
}

async function submitAddStudent() {
  const firstName = document.getElementById('add-student-firstName').value.trim();
  const lastName = document.getElementById('add-student-lastName').value.trim();
  const studentId = document.getElementById('add-student-studentId').value.trim();
  const email = document.getElementById('add-student-email').value.trim();
  const phone = document.getElementById('add-student-phone').value.trim();
  const department = document.getElementById('add-student-department').value.trim();
  const password = document.getElementById('add-student-password').value;

  if (!firstName || !lastName || !studentId || !email || !password) {
    showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบ', 'error');
    return;
  }

  try {
    showLoading();
    const result = await callApiPost('createStudent', {
      firstName, lastName, studentId, email, phone, department, password
    });
    hideLoading();

    if (result.success) {
      showToast('เพิ่มนักศึกษาสำเร็จ', 'success');
      closeModal('add-student-modal');
      loadStudents();
    } else {
      showToast(result.message || 'ไม่สามารถเพิ่มนักศึกษาได้', 'error');
    }
  } catch (error) {
    hideLoading();
    showToast('เกิดข้อผิดพลาดในการเพิ่มนักศึกษา', 'error');
  }
}

async function openEditStudentModal(studentId) {
  try {
    showLoading();
    const students = await _getStudentsCache();
    hideLoading();
    const student = students.find(s => s.id === studentId);
    if (!student) {
      showToast('ไม่พบข้อมูลนักศึกษา', 'error');
      return;
    }

    const modalContainer = document.getElementById('student-modal');
    modalContainer.innerHTML = buildModal('edit-student-modal', 'แก้ไขข้อมูลนักศึกษา', `
      <form id="edit-student-form">
        <input type="hidden" id="edit-student-id" value="${student.id}">
        ${inputField('edit-student-firstName', 'ชื่อ', 'text', student.firstName || '', 'กรอกชื่อ')}
        ${inputField('edit-student-lastName', 'นามสกุล', 'text', student.lastName || '', 'กรอกนามสกุล')}
        ${inputField('edit-student-studentId', 'รหัสนักศึกษา', 'text', student.studentId || '', 'กรอกรหัสนักศึกษา')}
        ${inputField('edit-student-email', 'อีเมล', 'email', student.email || '', 'กรอกอีเมล')}
        ${inputField('edit-student-phone', 'โทรศัพท์', 'tel', student.phone || '', 'กรอกเบอร์โทรศัพท์', false)}
        ${inputField('edit-student-department', 'สาขาวิชา', 'text', student.department || '', 'กรอกสาขาวิชา', false)}
      </form>
    `, `
      <button onclick="closeModal('edit-student-modal')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">ยกเลิก</button>
      <button onclick="submitEditStudent()" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">บันทึก</button>
    `);
    openModal('edit-student-modal');
  } catch (error) {
    hideLoading();
    showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
  }
}

async function submitEditStudent() {
  const id = document.getElementById('edit-student-id').value;
  const firstName = document.getElementById('edit-student-firstName').value.trim();
  const lastName = document.getElementById('edit-student-lastName').value.trim();
  const studentId = document.getElementById('edit-student-studentId').value.trim();
  const email = document.getElementById('edit-student-email').value.trim();
  const phone = document.getElementById('edit-student-phone').value.trim();
  const department = document.getElementById('edit-student-department').value.trim();

  if (!firstName || !lastName || !studentId || !email) {
    showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบ', 'error');
    return;
  }

  try {
    showLoading();
    const result = await callApiPost('updateStudent', {
      id, firstName, lastName, studentId, email, phone, department
    });
    hideLoading();

    if (result.success) {
      showToast('แก้ไขข้อมูลนักศึกษาสำเร็จ', 'success');
      closeModal('edit-student-modal');
      loadStudents();
    } else {
      showToast(result.message || 'ไม่สามารถแก้ไขข้อมูลได้', 'error');
    }
  } catch (error) {
    hideLoading();
    showToast('เกิดข้อผิดพลาดในการแก้ไขข้อมูล', 'error');
  }
}

async function deactivateStudent(id, name) {
  if (!confirm(`ต้องการปิดการใช้งานนักศึกษา "${name}" หรือไม่?`)) return;

  try {
    showLoading();
    const result = await callApi('deactivateStudent', { id });
    hideLoading();

    if (result.success) {
      showToast('ปิดการใช้งานนักศึกษาสำเร็จ', 'success');
      loadStudents();
    } else {
      showToast(result.message || 'ไม่สามารถปิดการใช้งานได้', 'error');
    }
  } catch (error) {
    hideLoading();
    showToast('เกิดข้อผิดพลาด', 'error');
  }
}
