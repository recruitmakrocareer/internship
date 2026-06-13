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
          <div class="flex-1 relative">
            <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" id="mentor-search" placeholder="ค้นหาชื่อ, อีเมล, รหัสพนักงาน..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
          </div>
          <select id="mentor-dept-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            <option value="">แผนกทั้งหมด</option>
          </select>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ชื่อพี่เลี้ยง</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">รหัสพนักงาน</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">แผนก/สาขา</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ติดต่อ</th>
                <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">โควตานักศึกษา</th>
                <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody id="mentors-table-body" class="divide-y divide-gray-200">
              <tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">กำลังโหลด...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="mentor-modal"></div>
  `;

  // Search ใช้ debounce 300ms และกรองจาก cache เท่านั้น (ไม่เรียก API ซ้ำทุกตัวอักษร)
  document.getElementById('mentor-search').addEventListener('input', _debouncedRenderMentors);
  document.getElementById('mentor-dept-filter').addEventListener('change', renderMentorsTable);

  loadMentors();
}

let _mentorsData = [];

// Debounce helper เพื่อกันการ re-render ถี่เกินไปขณะพิมพ์
function _mentorDebounce(fn, delay) {
  let timer = null;
  return function() {
    const args = arguments;
    const ctx = this;
    clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
  };
}
const _debouncedRenderMentors = _mentorDebounce(renderMentorsTable, 300);

// ค่าโควตา default เมื่อไม่ได้ระบุ
const _MENTOR_DEFAULT_QUOTA = 4;

function _mentorQuota(m) {
  var max = parseInt(m && m.maxStudents, 10);
  if (isNaN(max) || max <= 0) max = _MENTOR_DEFAULT_QUOTA;
  return max;
}

function _muted(v) {
  return (v === undefined || v === null || String(v).trim() === '')
    ? '<span class="text-gray-400">ไม่ระบุ</span>'
    : String(v);
}

// โหลดข้อมูลจาก API ครั้งเดียว แล้วเก็บไว้ใน cache จากนั้นค่อย render
async function loadMentors() {
  const tbody = document.getElementById('mentors-table-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">กำลังโหลด...</td></tr>';

  try {
    const result = await callApi('getMentors');
    _mentorsData = (result.success && result.data) ? result.data : [];

    // Populate dept filter from loaded data (ครั้งเดียว)
    var deptFilterEl = document.getElementById('mentor-dept-filter');
    if (deptFilterEl && !deptFilterEl._populated) {
      var depts = {};
      _mentorsData.forEach(function(m) { if (m.department) depts[m.department] = true; });
      var deptKeys = Object.keys(depts).sort();
      var deptHtml = '<option value="">แผนกทั้งหมด</option>';
      deptKeys.forEach(function(d) { deptHtml += '<option value="' + d + '">' + d + '</option>'; });
      deptFilterEl.innerHTML = deptHtml;
      deptFilterEl._populated = true;
    }

    renderMentorsTable();
  } catch (error) {
    console.error('Error loading mentors:', error);
    tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
  }
}

// กรองจาก cache แล้ว render (ไม่เรียก API)
function renderMentorsTable() {
  const tbody = document.getElementById('mentors-table-body');
  if (!tbody) return;

  const search = (document.getElementById('mentor-search')?.value || '').toLowerCase().trim();
  const deptFilter = document.getElementById('mentor-dept-filter')?.value || '';

  let mentors = [..._mentorsData];

  if (search) {
    mentors = mentors.filter(m =>
      (m.name || '').toLowerCase().includes(search) ||
      (m.firstName || '').toLowerCase().includes(search) ||
      (m.lastName || '').toLowerCase().includes(search) ||
      (m.email || '').toLowerCase().includes(search) ||
      (m.employeeId || '').toLowerCase().includes(search)
    );
  }

  if (deptFilter) {
    mentors = mentors.filter(m => (m.department || '') === deptFilter);
  }

  if (mentors.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-400">ไม่พบข้อมูลพี่เลี้ยง</td></tr>';
    return;
  }

  tbody.innerHTML = mentors.map(m => {
    const fullName = m.name || ((m.firstName || '') + ' ' + (m.lastName || '')).trim() || 'ไม่ระบุ';
    const assigned = parseInt(m.assignedStudents != null ? m.assignedStudents : (m.studentCount || 0), 10) || 0;
    const max = _mentorQuota(m);
    const isFull = assigned >= max;
    const isInactive = String(m.isActive) === 'false';
    const nameSafe = (m.name || '').replace(/'/g, "\\'");

    const quotaBadge = isFull
      ? `<div class="flex flex-col items-center gap-1">
           <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 ring-1 ring-red-200">${assigned}/${max}</span>
           <span class="text-[10px] font-medium text-red-500">เต็มโควตา</span>
         </div>`
      : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 ring-1 ring-green-200">${assigned}/${max}</span>`;

    const statusBadge = isInactive
      ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Inactive</span>'
      : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>';

    return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-green-700 font-semibold text-xs">${(fullName || '?').charAt(0)}</span>
            </div>
            <div>
              <p class="font-medium text-gray-800">${fullName}</p>
              <p class="text-xs text-gray-500">${m.email || 'ไม่ระบุ'}</p>
            </div>
          </div>
        </td>
        <td class="px-4 py-4 text-gray-600">${_muted(m.employeeId)}</td>
        <td class="px-4 py-4 text-gray-600">
          <p>${_muted(m.department)}</p>
          <p class="text-xs text-gray-400">${m.branch || 'ไม่ระบุ'}</p>
        </td>
        <td class="px-4 py-4 text-gray-600">${_muted(m.phone)}</td>
        <td class="px-4 py-4 text-center">${quotaBadge}</td>
        <td class="px-4 py-4 text-center">${statusBadge}</td>
        <td class="px-4 py-4 text-center">
          <div class="flex items-center justify-center gap-2">
            <button onclick="openMentorStudentsModal('${m.id}', '${nameSafe}')" class="text-gray-500 hover:text-gray-800 transition-colors" title="ดูนักศึกษา">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a3 3 0 10-2.83-4"/></svg>
            </button>
            <button onclick="openEditMentorModal('${m.id}')" class="text-primary-600 hover:text-primary-800 transition-colors" title="แก้ไข">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button onclick="openAssignStudentModal('${m.id}', '${nameSafe}')" class="text-green-600 hover:text-green-800 transition-colors" title="มอบหมายนักศึกษา">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            </button>
            <button onclick="toggleMentorActive('${m.id}', ${isInactive ? 'true' : 'false'})" class="${isInactive ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'} transition-colors" title="${isInactive ? 'เปิดใช้งาน' : 'ระงับ'}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${isInactive ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'}"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddMentorModal() {
  const modalContainer = document.getElementById('mentor-modal');
  modalContainer.innerHTML = buildModal('add-mentor-modal', 'เพิ่มพี่เลี้ยง', `
    <form id="add-mentor-form">
      ${inputField('add-mentor-firstName', 'ชื่อ', 'text', '', 'กรอกชื่อ')}
      ${inputField('add-mentor-lastName', 'นามสกุล', 'text', '', 'กรอกนามสกุล')}
      ${inputField('add-mentor-email', 'อีเมล', 'email', '', 'กรอกอีเมล')}
      ${inputField('add-mentor-phone', 'โทรศัพท์', 'tel', '', 'กรอกเบอร์โทรศัพท์', false)}
      ${inputField('add-mentor-employeeId', 'รหัสพนักงาน', 'text', '', 'กรอกรหัสพนักงาน', false)}
      ${inputField('add-mentor-department', 'แผนก', 'text', '', 'กรอกแผนก', false)}
      ${inputField('add-mentor-branch', 'สาขาที่ทำงาน', 'text', '', 'กรอกสาขา', false)}
      ${inputField('add-mentor-position', 'ตำแหน่ง', 'text', '', 'กรอกตำแหน่ง', false)}
      ${inputField('add-mentor-maxStudents', 'รองรับนักศึกษาสูงสุด (คน)', 'number', '4', 'เช่น 4', false)}
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
  const maxStudents = (document.getElementById('add-mentor-maxStudents').value || '').trim() || '4';

  if (!firstName || !lastName || !email || !password) {
    showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบ', 'error');
    return;
  }

  try {
    showLoading();
    const result = await callApiPost('createMentor', {
      firstName, lastName, email, phone, department, password,
      employeeId: document.getElementById('add-mentor-employeeId').value.trim(),
      branch: document.getElementById('add-mentor-branch').value.trim(),
      position: document.getElementById('add-mentor-position').value.trim(),
      maxStudents
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
      ${inputField('edit-mentor-employeeId', 'รหัสพนักงาน', 'text', mentor.employeeId || '', 'กรอกรหัสพนักงาน', false)}
      ${inputField('edit-mentor-department', 'แผนก', 'text', mentor.department || '', 'กรอกแผนก', false)}
      ${inputField('edit-mentor-branch', 'สาขาที่ทำงาน', 'text', mentor.branch || '', 'กรอกสาขา', false)}
      ${inputField('edit-mentor-position', 'ตำแหน่ง', 'text', mentor.position || '', 'กรอกตำแหน่ง', false)}
      ${inputField('edit-mentor-maxStudents', 'รองรับนักศึกษาสูงสุด (คน)', 'number', String(_mentorQuota(mentor)), 'เช่น 4', false)}
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
  const maxStudents = (document.getElementById('edit-mentor-maxStudents').value || '').trim() || '4';

  if (!firstName || !lastName || !email) {
    showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบ', 'error');
    return;
  }

  try {
    showLoading();
    const result = await callApiPost('updateMentor', {
      id, firstName, lastName, email, phone, department,
      employeeId: document.getElementById('edit-mentor-employeeId').value.trim(),
      branch: document.getElementById('edit-mentor-branch').value.trim(),
      position: document.getElementById('edit-mentor-position').value.trim(),
      maxStudents,
      name: firstName + ' ' + lastName
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

// ดูรายชื่อนักศึกษาที่อยู่ในความดูแลของพี่เลี้ยง
async function openMentorStudentsModal(mentorId, mentorName) {
  const modalContainer = document.getElementById('mentor-modal');
  modalContainer.innerHTML = buildModal('mentor-students-modal', `นักศึกษาในความดูแลของ ${mentorName || ''}`.trim(), `
    <div id="mentor-students-list" class="space-y-2">
      <p class="text-sm text-gray-500">กำลังโหลดรายชื่อนักศึกษา...</p>
    </div>
  `, `
    <button onclick="closeModal('mentor-students-modal')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">ปิด</button>
  `);
  openModal('mentor-students-modal');

  try {
    const result = await callApi('getStudentsByMentor', { mentorId });
    const listContainer = document.getElementById('mentor-students-list');
    if (!listContainer) return;
    const students = (result.success && result.data) ? result.data : [];

    if (students.length === 0) {
      listContainer.innerHTML = '<p class="text-sm text-gray-400 text-center py-6">ยังไม่มีนักศึกษาในความดูแล</p>';
      return;
    }

    listContainer.innerHTML = students.map(s => {
      const fullName = s.name || ((s.firstName || '') + ' ' + (s.lastName || '')).trim() || 'ไม่ระบุ';
      const uni = s.university || s.faculty || '';
      return `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-primary-700 font-semibold text-xs">${(fullName || '?').charAt(0)}</span>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-800">${fullName}</p>
            <p class="text-xs text-gray-500">${uni || 'ไม่ระบุมหาวิทยาลัย'}</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    const listContainer = document.getElementById('mentor-students-list');
    if (listContainer) listContainer.innerHTML = '<p class="text-sm text-red-500 text-center py-6">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
  }
}

async function openAssignStudentModal(mentorId, mentorName) {
  const mentor = _mentorsData.find(m => m.id === mentorId);
  const assigned = mentor ? (parseInt(mentor.assignedStudents != null ? mentor.assignedStudents : (mentor.studentCount || 0), 10) || 0) : 0;
  const max = _mentorQuota(mentor);
  const isFull = assigned >= max;

  const warningBanner = isFull
    ? `<div class="mb-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
         <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
         <p class="text-sm text-red-700">พี่เลี้ยงคนนี้รับนักศึกษาเต็มโควตาแล้ว (${assigned}/${max}) การมอบหมายเพิ่มจะไม่สำเร็จ</p>
       </div>`
    : '';

  const modalContainer = document.getElementById('mentor-modal');
  modalContainer.innerHTML = buildModal('assign-student-modal', `มอบหมายนักศึกษาให้ ${mentorName}`, `
    ${warningBanner}
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
      const students = result.data.filter(s => s.status !== 'INACTIVE' && String(s.isActive) !== 'false');
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
    const result = await callApiPost('assignMentor', { mentorId, studentId });
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

async function toggleMentorActive(mentorId, activate) {
  const action = activate ? 'เปิดใช้งาน' : 'ระงับ';
  if (!confirm('ต้องการ' + action + 'พี่เลี้ยงคนนี้?')) return;
  try {
    showLoading();
    const result = await callApiPost('updateMentor', { id: mentorId, isActive: String(activate) });
    hideLoading();
    if (result.success) {
      showToast(action + 'สำเร็จ', 'success');
      loadMentors();
    } else {
      showToast(result.message || 'เกิดข้อผิดพลาด', 'error');
    }
  } catch (error) {
    hideLoading();
    showToast('เกิดข้อผิดพลาด', 'error');
  }
}
