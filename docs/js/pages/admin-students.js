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
          <div class="flex-1 relative">
            <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" id="student-search" placeholder="ค้นหาชื่อ, รหัสนักศึกษา, อีเมล..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
          </div>
          <select id="student-dept-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            <option value="">แผนกทั้งหมด</option>
            <optgroup label="Support"></optgroup>
            <optgroup label="Floor"></optgroup>
            <optgroup label="O2O"></optgroup>
            <optgroup label="B2B Sales"></optgroup>
          </select>
          <select id="student-status-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            <option value="">สถานะทั้งหมด</option>
            <option value="ACTIVE">ใช้งาน</option>
            <option value="INACTIVE">ไม่ใช้งาน</option>
          </select>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">รหัส</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">มหาวิทยาลัย/สาขา</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">แผนก/สาขาที่ฝึก</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ประเภท</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ระยะเวลา</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">พี่เลี้ยง</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">เอกสาร</th>
                <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th class="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody id="students-table-body" class="divide-y divide-gray-200">
              <tr><td colspan="10" class="px-6 py-8 text-center text-gray-500">กำลังโหลด...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="student-modal"></div>
  `;

  // Search ใช้ debounce 300ms และกรองจาก cache เท่านั้น (ไม่เรียก API ซ้ำทุกตัวอักษร)
  document.getElementById('student-search').addEventListener('input', debouncedRenderStudents);
  document.getElementById('student-status-filter').addEventListener('change', renderStudentsTable);
  document.getElementById('student-dept-filter').addEventListener('change', renderStudentsTable);

  loadStudents();
}

let _studentsCache = [];
let _mentorsCache = [];
let _roadmapsCache = [];

// Debounce helper เพื่อกันการ re-render ถี่เกินไปขณะพิมพ์
function _debounce(fn, delay) {
  let timer = null;
  return function() {
    const args = arguments;
    const ctx = this;
    clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
  };
}
const debouncedRenderStudents = _debounce(renderStudentsTable, 300);

// โหลดข้อมูลจาก API ครั้งเดียว แล้วเก็บไว้ใน cache จากนั้นค่อย render
async function loadStudents() {
  const tbody = document.getElementById('students-table-body');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="10" class="px-6 py-8 text-center text-gray-500">กำลังโหลด...</td></tr>';

  try {
    const [studResult, mentorResult, roadmapResult] = await Promise.all([
      callApi('getStudents'),
      callApi('getMentors'),
      callApi('getRoadmaps')
    ]);

    _studentsCache = (studResult.success && studResult.data) ? studResult.data : [];
    _mentorsCache = (mentorResult.success && mentorResult.data) ? mentorResult.data : [];
    _roadmapsCache = (roadmapResult.success && roadmapResult.data) ? roadmapResult.data : [];

    // Populate dept filter from loaded data
    var deptFilterEl = document.getElementById('student-dept-filter');
    if (deptFilterEl && !deptFilterEl._populated) {
      var depts = {};
      _studentsCache.forEach(function(s) { if (s.department) depts[s.department] = true; });
      var deptKeys = Object.keys(depts).sort();
      if (deptKeys.length > 0) {
        var deptHtml = '<option value="">แผนกทั้งหมด</option>';
        deptKeys.forEach(function(d) { deptHtml += '<option value="' + d + '">' + d + '</option>'; });
        deptFilterEl.innerHTML = deptHtml;
        deptFilterEl._populated = true;
      }
    }

    renderStudentsTable();
  } catch (error) {
    console.error('Error loading students:', error);
    tbody.innerHTML = '<tr><td colspan="10" class="px-6 py-8 text-center text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
  }
}

// กรองจาก cache + render (ไม่เรียก API) — รองรับ partial match และค่า null/undefined
function renderStudentsTable() {
  const tbody = document.getElementById('students-table-body');
  if (!tbody) return;

  try {
    let students = Array.isArray(_studentsCache) ? _studentsCache.slice() : [];

    const search = String(document.getElementById('student-search')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('student-status-filter')?.value || '';
    const deptFilter = document.getElementById('student-dept-filter')?.value || '';

    if (search) {
      students = students.filter(function(s) {
        if (!s) return false;
        var haystack = [
          s.name, s.firstName, s.lastName, s.studentId,
          s.email, s.university, s.major, s.department, s.branch
        ].map(function(v) { return v == null ? '' : String(v).toLowerCase(); }).join(' ');
        return haystack.indexOf(search) !== -1;
      });
    }
    if (statusFilter === 'ACTIVE') {
      students = students.filter(s => String(s.isActive) !== 'false');
    } else if (statusFilter === 'INACTIVE') {
      students = students.filter(s => String(s.isActive) === 'false');
    }
    if (deptFilter) {
      students = students.filter(s => s.department === deptFilter);
    }

    if (students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="px-6 py-8 text-center text-gray-400">ไม่พบข้อมูลนักศึกษา</td></tr>';
      return;
    }

    tbody.innerHTML = students.map(s => {
      const docCount = [s.cvFileUrl, s.transcriptFileUrl, s.idCardFileUrl, s.photoFileUrl].filter(Boolean).length;
      const mentorName = s.mentor ? (s.mentor.firstName + ' ' + s.mentor.lastName) : '-';
      const displayName = s.name || ((s.firstName || '') + ' ' + (s.lastName || '')) || s.email;

      return `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-4 py-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${s.photoFileUrl ? '' : 'bg-primary-100'}">
                ${s.photoFileUrl
                  ? '<img src="' + driveImageUrl(s.photoFileUrl) + '" class="w-full h-full object-cover">'
                  : '<span class="text-primary-700 font-semibold text-xs">' + (displayName).charAt(0) + '</span>'}
              </div>
              <div>
                <span class="font-medium text-gray-800 text-sm">${displayName}</span>
                <p class="text-xs text-gray-400">${s.email || ''}</p>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 text-xs">${s.studentId || '<span class="text-gray-300">ไม่ระบุ</span>'}</td>
          <td class="px-4 py-3 text-xs">
            <div class="text-gray-800">${s.university || '<span class="text-gray-300">ไม่ระบุ</span>'}</div>
            <div class="text-gray-400">${s.major || s.faculty || ''}</div>
          </td>
          <td class="px-4 py-3 text-xs">
            <div class="text-gray-800">${s.department || '<span class="text-gray-300">ไม่ระบุ</span>'}</div>
            <div class="text-gray-400">${s.branch || ''}</div>
          </td>
          <td class="px-4 py-3">
            ${s.internshipType ? '<span class="text-xs px-2 py-0.5 rounded-full ' + (s.internshipType === 'สหกิจศึกษา' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700') + '">' + s.internshipType + '</span>' : '<span class="text-xs text-gray-400">-</span>'}
          </td>
          <td class="px-4 py-3 text-xs text-gray-600">
            ${s.startDate ? formatDate(s.startDate) : '-'}
            ${s.endDate ? '<br>ถึง ' + formatDate(s.endDate) : ''}
          </td>
          <td class="px-4 py-3">
            <select class="text-xs border-0 bg-transparent text-gray-600 cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 -ml-1 focus:ring-1 focus:ring-primary-300"
              onchange="inlineAssignMentor('${s.id}', this.value)" title="เลือกพี่เลี้ยง">
              <option value="">ไม่ระบุ</option>
              ${_mentorsCache.map(m => '<option value="' + m.id + '"' + (s.mentor && s.mentor.id === m.id ? ' selected' : '') + '>' + m.firstName + ' ' + m.lastName + '</option>').join('')}
            </select>
          </td>
          <td class="px-4 py-3">
            ${docCount === 4
              ? '<span class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">✓ ครบถ้วน</span>'
              : '<span class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ' + (docCount === 0 ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700') + ' font-medium">' + docCount + '/4</span>'}
          </td>
          <td class="px-4 py-3">${studentStatusBadge(s)}</td>
          <td class="px-4 py-3 text-center">
            <div class="flex items-center justify-center gap-1">
              <button onclick="viewStudentDetail('${s.id}')" class="text-blue-600 hover:text-blue-800 p-1" title="ดูรายละเอียด">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
              <button onclick="openEditStudentModal('${s.id}')" class="text-primary-600 hover:text-primary-800 p-1" title="แก้ไข">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button onclick="toggleStudentStatus('${s.id}', '${(displayName).replace(/'/g, "\\'")}')" class="${String(s.isActive) === 'false' ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'} p-1" title="${String(s.isActive) === 'false' ? 'เปิดใช้งาน' : 'ปิดการใช้งาน'}">
                ${String(s.isActive) === 'false'
                  ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
                  : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>'}
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');
  } catch (error) {
    console.error('Error rendering students table:', error);
    tbody.innerHTML = '<tr><td colspan="10" class="px-6 py-8 text-center text-red-500">เกิดข้อผิดพลาดในการแสดงผลข้อมูล</td></tr>';
  }
}

async function viewStudentDetail(studentId) {
  const student = _studentsCache.find(s => s.id === studentId);
  if (!student) { showToast('ไม่พบข้อมูล', 'error'); return; }

  const displayName = student.name || ((student.firstName || '') + ' ' + (student.lastName || ''));
  const mc = document.getElementById('student-modal');

  // Show loading state first
  mc.innerHTML = `
    <div id="detail-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8 text-center">
        <div class="text-gray-400">กำลังโหลดข้อมูล...</div>
      </div>
    </div>`;

  // Fetch progress data
  let progressList = [];
  try {
    const progressRes = await callApi('getRoadmapProgress', { userId: studentId });
    progressList = Array.isArray(progressRes.data || progressRes) ? (progressRes.data || progressRes) : [];
  } catch (e) {}

  const completedSteps = progressList.filter(p => p.status === 'COMPLETED').length;
  const inProgressSteps = progressList.filter(p => p.status === 'IN_PROGRESS').length;
  const totalSteps = progressList.length;
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  mc.innerHTML = `
    <div id="detail-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b">
          <h3 class="text-lg font-semibold text-gray-800">ข้อมูลนักศึกษา: ${displayName}</h3>
          <button onclick="document.getElementById('detail-modal').remove()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="p-6 space-y-6">
          <!-- Personal Info -->
          <div>
            <h4 class="text-sm font-semibold text-gray-500 uppercase mb-3">ข้อมูลส่วนตัว</h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div><span class="text-gray-500">คำนำหน้า:</span> <span class="font-medium">${student.prefix || '-'}</span></div>
              <div><span class="text-gray-500">ชื่อเล่น:</span> <span class="font-medium">${student.nickname || '-'}</span></div>
              <div><span class="text-gray-500">โทรศัพท์:</span> <span class="font-medium">${student.phone || '-'}</span></div>
              <div><span class="text-gray-500">อีเมล:</span> <span class="font-medium">${student.email || '-'}</span></div>
              <div><span class="text-gray-500">วันเกิด:</span> <span class="font-medium">${student.birthDate ? formatDate(student.birthDate) : '-'}</span></div>
              <div><span class="text-gray-500">บัตร ปชช:</span> <span class="font-medium">${student.idCardNumber || '-'}</span></div>
              <div><span class="text-gray-500">สถานะทางทหาร:</span> <span class="font-medium">${student.militaryStatus || '-'}</span></div>
              <div><span class="text-gray-500">โรคประจำตัว:</span> <span class="font-medium">${student.medicalCondition || '-'}</span></div>
            </div>
          </div>
          <hr>
          <!-- Addresses -->
          <div>
            <h4 class="text-sm font-semibold text-gray-500 uppercase mb-3">ที่อยู่</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs font-semibold text-gray-500 mb-1">ที่อยู่ปัจจุบัน</p>
                <p class="font-medium">${student.currentAddress || student.address || '-'}</p>
                <p class="text-gray-500 text-xs mt-1">${[student.currentProvince, student.currentPostcode].filter(Boolean).join(' ') || ''}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs font-semibold text-gray-500 mb-1">ที่อยู่ตามบัตรประชาชน</p>
                <p class="font-medium">${student.idCardAddress || '-'}</p>
                <p class="text-gray-500 text-xs mt-1">${[student.idCardProvince, student.idCardPostcode].filter(Boolean).join(' ') || ''}</p>
              </div>
            </div>
          </div>
          <hr>
          <!-- Education -->
          <div>
            <h4 class="text-sm font-semibold text-gray-500 uppercase mb-3">การศึกษา</h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div><span class="text-gray-500">รหัส:</span> <span class="font-medium">${student.studentId || '-'}</span></div>
              <div><span class="text-gray-500">มหาวิทยาลัย:</span> <span class="font-medium">${student.university || '-'}</span></div>
              <div><span class="text-gray-500">คณะ:</span> <span class="font-medium">${student.faculty || '-'}</span></div>
              <div><span class="text-gray-500">สาขา:</span> <span class="font-medium">${student.major || '-'}</span></div>
              <div><span class="text-gray-500">ชั้นปี:</span> <span class="font-medium">${student.year || '-'}</span></div>
              <div><span class="text-gray-500">GPA:</span> <span class="font-medium">${student.gpa || '-'}</span></div>
              <div><span class="text-gray-500">อาจารย์ที่ปรึกษา:</span> <span class="font-medium">${student.advisorName || '-'}</span></div>
            </div>
          </div>
          <hr>
          <!-- Internship -->
          <div>
            <h4 class="text-sm font-semibold text-gray-500 uppercase mb-3">การฝึกงาน</h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div><span class="text-gray-500">ประเภท:</span> <span class="font-medium">${student.internshipType || '-'}</span></div>
              <div><span class="text-gray-500">เริ่ม:</span> <span class="font-medium">${student.startDate ? formatDate(student.startDate) : '-'}</span></div>
              <div><span class="text-gray-500">สิ้นสุด:</span> <span class="font-medium">${student.endDate ? formatDate(student.endDate) : '-'}</span></div>
              <div><span class="text-gray-500">แผนกที่ฝึก:</span> <span class="font-medium">${student.department || '-'}</span></div>
              <div><span class="text-gray-500">สาขาที่ฝึก:</span> <span class="font-medium">${student.branch || '-'}</span></div>
              <div><span class="text-gray-500">รหัสพนักงาน:</span> <span class="font-medium">${student.employeeId || '-'}</span></div>
              <div><span class="text-gray-500">พี่เลี้ยง:</span> <span class="font-medium">${student.mentor ? (student.mentor.firstName + ' ' + student.mentor.lastName) : '-'}</span></div>
            </div>
          </div>
          <hr>
          <!-- Preferred Branches/Departments -->
          <div>
            <h4 class="text-sm font-semibold text-gray-500 uppercase mb-3">สาขา/แผนกที่ต้องการ</h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs font-semibold text-gray-500 mb-1">ลำดับ 1</p>
                <p class="font-medium">${student.preferredBranch1 || '-'}</p>
                <p class="text-xs text-gray-500">${student.preferredDept1 || '-'}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs font-semibold text-gray-500 mb-1">ลำดับ 2</p>
                <p class="font-medium">${student.preferredBranch2 || '-'}</p>
                <p class="text-xs text-gray-500">${student.preferredDept2 || '-'}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs font-semibold text-gray-500 mb-1">ลำดับ 3</p>
                <p class="font-medium">${student.preferredBranch3 || '-'}</p>
                <p class="text-xs text-gray-500">${student.preferredDept3 || '-'}</p>
              </div>
            </div>
          </div>
          <hr>
          <!-- Documents -->
          <div>
            <h4 class="text-sm font-semibold text-gray-500 uppercase mb-3">เอกสาร</h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="flex items-center gap-2 text-sm">
                <span class="${student.cvFileUrl ? 'text-green-500' : 'text-gray-300'}">${student.cvFileUrl ? '✓' : '○'}</span>
                ${student.cvFileUrl ? '<a href="' + student.cvFileUrl + '" target="_blank" class="text-blue-600 hover:underline">CV/Resume</a>' : '<span class="text-gray-500">CV/Resume</span>'}
              </div>
              <div class="flex items-center gap-2 text-sm">
                <span class="${student.transcriptFileUrl ? 'text-green-500' : 'text-gray-300'}">${student.transcriptFileUrl ? '✓' : '○'}</span>
                ${student.transcriptFileUrl ? '<a href="' + student.transcriptFileUrl + '" target="_blank" class="text-blue-600 hover:underline">ใบรับรองผลการเรียน</a>' : '<span class="text-gray-500">ใบรับรองผลการเรียน</span>'}
              </div>
              <div class="flex items-center gap-2 text-sm">
                <span class="${student.idCardFileUrl ? 'text-green-500' : 'text-gray-300'}">${student.idCardFileUrl ? '✓' : '○'}</span>
                ${student.idCardFileUrl ? '<a href="' + student.idCardFileUrl + '" target="_blank" class="text-blue-600 hover:underline">สำเนาบัตร</a>' : '<span class="text-gray-500">สำเนาบัตร</span>'}
              </div>
              <div class="flex items-center gap-2 text-sm">
                <span class="${student.photoFileUrl ? 'text-green-500' : 'text-gray-300'}">${student.photoFileUrl ? '✓' : '○'}</span>
                ${student.photoFileUrl ? '<a href="' + student.photoFileUrl + '" target="_blank" class="text-blue-600 hover:underline">รูปถ่าย</a>' : '<span class="text-gray-500">รูปถ่าย</span>'}
              </div>
            </div>
          </div>
          <hr>
          <!-- Skills -->
          <div>
            <h4 class="text-sm font-semibold text-gray-500 uppercase mb-3">ทักษะ/ความสนใจ</h4>
            <div class="text-sm space-y-1">
              <div><span class="text-gray-500">ทักษะ:</span> <span class="font-medium">${student.skills || '-'}</span></div>
              <div><span class="text-gray-500">ความสนใจ:</span> <span class="font-medium">${student.interests || '-'}</span></div>
            </div>
          </div>
          <!-- Training Progress -->
          <div>
            <h4 class="text-sm font-semibold text-gray-500 uppercase mb-3">ความคืบหน้าการฝึกงาน</h4>
            ${totalSteps > 0 ? `
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-gray-600">เสร็จแล้ว ${completedSteps} / ${totalSteps} ขั้นตอน</span>
                  <span class="font-bold ${progressPct >= 75 ? 'text-green-600' : progressPct >= 50 ? 'text-blue-600' : 'text-yellow-600'}">${progressPct}%</span>
                </div>
                <div class="bg-gray-200 rounded-full h-3 mb-2">
                  <div class="h-3 rounded-full transition-all ${progressPct >= 75 ? 'bg-green-500' : progressPct >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}" style="width:${progressPct}%"></div>
                </div>
                <div class="flex gap-4 text-xs text-gray-500">
                  <span class="text-green-600">สำเร็จ: ${completedSteps}</span>
                  <span class="text-blue-600">กำลังทำ: ${inProgressSteps}</span>
                  <span class="text-gray-400">ยังไม่เริ่ม: ${totalSteps - completedSteps - inProgressSteps}</span>
                </div>
              </div>
            ` : '<div class="text-sm text-gray-400">ยังไม่ได้ Assign แผนฝึกงาน</div>'}
          </div>
          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button onclick="document.getElementById('detail-modal').remove(); openEditStudentModal('${studentId}')" class="flex-1 bg-primary-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-700">แก้ไขข้อมูล</button>
            <button onclick="document.getElementById('detail-modal').remove(); openAssignRoadmapModal('${studentId}')" class="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700">Assign แผนฝึกงาน</button>
          </div>
        </div>
      </div>
    </div>`;
}

function openAddStudentModal() {
  const mentorOptions = _mentorsCache.map(m =>
    `<option value="${m.id}">${m.firstName} ${m.lastName}</option>`
  ).join('');

  const mc = document.getElementById('student-modal');
  mc.innerHTML = buildModal('add-student-modal', 'เพิ่มนักศึกษา', `
    <form id="add-student-form" class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        ${inputField('add-student-firstName', 'ชื่อ', 'text', '', 'ชื่อจริง')}
        ${inputField('add-student-lastName', 'นามสกุล', 'text', '', 'นามสกุล')}
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${inputField('add-student-studentId', 'รหัสนักศึกษา', 'text', '', 'เช่น 6401234567')}
        ${inputField('add-student-email', 'อีเมล', 'email', '', 'อีเมล')}
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${inputField('add-student-phone', 'โทรศัพท์', 'tel', '', 'เบอร์โทร', false)}
        ${inputField('add-student-university', 'มหาวิทยาลัย', 'text', '', 'ชื่อมหาวิทยาลัย', false)}
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${inputField('add-student-major', 'สาขาวิชา', 'text', '', 'สาขาวิชา', false)}
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">ประเภทการฝึก</label>
          <select id="add-student-internshipType" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">-- เลือก --</option>
            <option value="สหกิจศึกษา">สหกิจศึกษา</option>
            <option value="ฝึกงานทั่วไป">ฝึกงานทั่วไป</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${inputField('add-student-department', 'แผนกที่ฝึก', 'text', '', 'แผนกที่ฝึก', false)}
        ${inputField('add-student-branch', 'สาขาที่ฝึก', 'text', '', 'สาขาที่ฝึก', false)}
      </div>
      <div class="grid grid-cols-2 gap-3">
        ${inputField('add-student-employeeId', 'รหัสพนักงาน', 'text', '', 'รหัสพนักงาน Makro', false)}
        ${inputField('add-student-position', 'ตำแหน่ง', 'text', '', 'ตำแหน่ง', false)}
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">วันเริ่มฝึก</label>
          <input type="date" id="add-student-startDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">วันสิ้นสุด</label>
          <input type="date" id="add-student-endDate" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">พี่เลี้ยง</label>
        <select id="add-student-mentor" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">-- ไม่ระบุ --</option>
          ${mentorOptions}
        </select>
      </div>
      ${inputField('add-student-password', 'รหัสผ่าน', 'password', '', 'อย่างน้อย 6 ตัวอักษร')}
    </form>
  `, `
    <button onclick="closeModal('add-student-modal')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">ยกเลิก</button>
    <button onclick="submitAddStudent()" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg">บันทึก</button>
  `);
  openModal('add-student-modal');
}

async function submitAddStudent() {
  const firstName = document.getElementById('add-student-firstName').value.trim();
  const lastName = document.getElementById('add-student-lastName').value.trim();
  const password = document.getElementById('add-student-password').value;

  if (!firstName || !lastName || !password) {
    showToast('กรุณากรอกชื่อ นามสกุล และรหัสผ่าน', 'error');
    return;
  }

  try {
    showLoading();
    const result = await callApiPost('createStudent', {
      firstName, lastName,
      name: firstName + ' ' + lastName,
      studentId: document.getElementById('add-student-studentId').value.trim(),
      email: document.getElementById('add-student-email').value.trim(),
      phone: document.getElementById('add-student-phone').value.trim(),
      university: document.getElementById('add-student-university').value.trim(),
      major: document.getElementById('add-student-major').value.trim(),
      department: document.getElementById('add-student-department').value.trim(),
      branch: document.getElementById('add-student-branch').value.trim(),
      employeeId: document.getElementById('add-student-employeeId').value.trim(),
      position: document.getElementById('add-student-position').value.trim(),
      internshipType: document.getElementById('add-student-internshipType').value,
      startDate: document.getElementById('add-student-startDate').value,
      endDate: document.getElementById('add-student-endDate').value,
      password
    });
    hideLoading();

    if (result.success) {
      const mentorId = document.getElementById('add-student-mentor').value;
      if (mentorId && result.data && result.data.id) {
        await callApiPost('assignMentor', { mentorId, studentId: result.data.id });
      }
      showToast('เพิ่มนักศึกษาสำเร็จ', 'success');
      closeModal('add-student-modal');
      loadStudents();
    } else {
      showToast(result.message || 'ไม่สามารถเพิ่มนักศึกษาได้', 'error');
    }
  } catch (error) {
    hideLoading();
    showToast('เกิดข้อผิดพลาด', 'error');
  }
}

async function openEditStudentModal(studentId) {
  try {
    showLoading();
    const res = await callApi('getStudent', { id: studentId });
    hideLoading();
    const student = res.success ? res.data : _studentsCache.find(s => s.id === studentId);
    if (!student) { showToast('ไม่พบข้อมูล', 'error'); return; }

    const mentorOptions = _mentorsCache.map(m =>
      `<option value="${m.id}" ${student.mentor && student.mentor.id === m.id ? 'selected' : ''}>${m.firstName} ${m.lastName}</option>`
    ).join('');

    const mc = document.getElementById('student-modal');
    mc.innerHTML = buildModal('edit-student-modal', 'แก้ไขข้อมูลนักศึกษา', `
      <form id="edit-student-form" class="space-y-4">
        <input type="hidden" id="edit-student-id" value="${student.id}">
        <div class="grid grid-cols-2 gap-3">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า</label>
            <select id="edit-student-prefix" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">-- เลือก --</option>
              <option value="นาย" ${student.prefix === 'นาย' ? 'selected' : ''}>นาย</option>
              <option value="นาง" ${student.prefix === 'นาง' ? 'selected' : ''}>นาง</option>
              <option value="นางสาว" ${student.prefix === 'นางสาว' ? 'selected' : ''}>นางสาว</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">สถานะทางทหาร</label>
            <select id="edit-student-military" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">-- เลือก --</option>
              <option value="ผ่านการเกณฑ์ทหารแล้ว" ${student.militaryStatus === 'ผ่านการเกณฑ์ทหารแล้ว' ? 'selected' : ''}>ผ่านการเกณฑ์ทหารแล้ว</option>
              <option value="ได้รับการยกเว้น" ${student.militaryStatus === 'ได้รับการยกเว้น' ? 'selected' : ''}>ได้รับการยกเว้น</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          ${inputField('edit-student-firstName', 'ชื่อ', 'text', student.firstName || '')}
          ${inputField('edit-student-lastName', 'นามสกุล', 'text', student.lastName || '')}
        </div>
        ${inputField('edit-student-medical', 'โรคประจำตัว', 'text', student.medicalCondition || '', 'ระบุโรคประจำตัว (ถ้ามี)', false)}
        <div class="grid grid-cols-2 gap-3">
          ${inputField('edit-student-studentId', 'รหัสนักศึกษา', 'text', student.studentId || '')}
          ${inputField('edit-student-email', 'อีเมล', 'email', student.email || '')}
        </div>
        <div class="grid grid-cols-2 gap-3">
          ${inputField('edit-student-phone', 'โทรศัพท์', 'tel', student.phone || '', '', false)}
          ${inputField('edit-student-university', 'มหาวิทยาลัย', 'text', student.university || '', '', false)}
        </div>
        <div class="grid grid-cols-2 gap-3">
          ${inputField('edit-student-faculty', 'คณะ', 'text', student.faculty || '', '', false)}
          ${inputField('edit-student-major', 'สาขาวิชา', 'text', student.major || '', '', false)}
        </div>
        <div class="grid grid-cols-2 gap-3">
          ${inputField('edit-student-department', 'แผนกที่ฝึก', 'text', student.department || '', '', false)}
          ${inputField('edit-student-branch', 'สาขาที่ฝึก', 'text', student.branch || '', '', false)}
        </div>
        <div class="grid grid-cols-2 gap-3">
          ${inputField('edit-student-employeeId', 'รหัสพนักงาน', 'text', student.employeeId || '', '', false)}
          ${inputField('edit-student-position', 'ตำแหน่ง', 'text', student.position || '', '', false)}
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">ประเภทการฝึก</label>
            <select id="edit-student-internshipType" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">-- เลือก --</option>
              <option value="สหกิจศึกษา" ${student.internshipType === 'สหกิจศึกษา' ? 'selected' : ''}>สหกิจศึกษา</option>
              <option value="ฝึกงานทั่วไป" ${student.internshipType === 'ฝึกงานทั่วไป' ? 'selected' : ''}>ฝึกงานทั่วไป</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">พี่เลี้ยง</label>
            <select id="edit-student-mentor" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">-- ไม่ระบุ --</option>
              ${mentorOptions}
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">วันเริ่มฝึก</label>
            <input type="date" id="edit-student-startDate" value="${dateInputValue(student.startDate)}" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">วันสิ้นสุด</label>
            <input type="date" id="edit-student-endDate" value="${dateInputValue(student.endDate)}" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          </div>
        </div>
      </form>
    `, `
      <button onclick="closeModal('edit-student-modal')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">ยกเลิก</button>
      <button onclick="submitEditStudent()" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg">บันทึก</button>
    `);
    openModal('edit-student-modal');
  } catch (error) {
    hideLoading();
    showToast('เกิดข้อผิดพลาด', 'error');
  }
}

async function submitEditStudent() {
  const id = document.getElementById('edit-student-id').value;
  const firstName = document.getElementById('edit-student-firstName').value.trim();
  const lastName = document.getElementById('edit-student-lastName').value.trim();

  if (!firstName || !lastName) {
    showToast('กรุณากรอกชื่อและนามสกุล', 'error');
    return;
  }

  try {
    showLoading();
    const result = await callApiPost('updateStudent', {
      id, firstName, lastName,
      name: firstName + ' ' + lastName,
      prefix: document.getElementById('edit-student-prefix').value,
      militaryStatus: document.getElementById('edit-student-military').value,
      medicalCondition: document.getElementById('edit-student-medical').value.trim(),
      studentId: document.getElementById('edit-student-studentId').value.trim(),
      email: document.getElementById('edit-student-email').value.trim(),
      phone: document.getElementById('edit-student-phone').value.trim(),
      university: document.getElementById('edit-student-university').value.trim(),
      faculty: document.getElementById('edit-student-faculty').value.trim(),
      major: document.getElementById('edit-student-major').value.trim(),
      department: document.getElementById('edit-student-department').value.trim(),
      branch: document.getElementById('edit-student-branch').value.trim(),
      employeeId: document.getElementById('edit-student-employeeId').value.trim(),
      position: document.getElementById('edit-student-position').value.trim(),
      internshipType: document.getElementById('edit-student-internshipType').value,
      startDate: document.getElementById('edit-student-startDate').value,
      endDate: document.getElementById('edit-student-endDate').value
    });

    const mentorId = document.getElementById('edit-student-mentor').value;
    if (mentorId) {
      await callApiPost('assignMentor', { mentorId, studentId: id });
    }

    hideLoading();

    if (result.success) {
      showToast('แก้ไขข้อมูลสำเร็จ', 'success');
      closeModal('edit-student-modal');
      loadStudents();
    } else {
      showToast(result.message || 'ไม่สามารถแก้ไขข้อมูลได้', 'error');
    }
  } catch (error) {
    hideLoading();
    showToast('เกิดข้อผิดพลาด', 'error');
  }
}

function openAssignRoadmapModal(studentId) {
  const student = _studentsCache.find(s => s.id === studentId);
  const displayName = student ? (student.name || student.firstName + ' ' + student.lastName) : '';

  const roadmapOptions = _roadmapsCache.map(r =>
    `<label class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50">
      <input type="checkbox" name="assign-roadmap" value="${r.id}" class="w-4 h-4 text-primary-600 rounded">
      <div>
        <span class="font-medium text-gray-800">${r.title || 'Roadmap'}</span>
        <span class="text-xs text-gray-400 ml-2">${(r.steps || []).length} ขั้นตอน</span>
      </div>
    </label>`
  ).join('');

  const mc = document.getElementById('student-modal');
  mc.innerHTML = buildModal('assign-roadmap-modal', 'Assign แผนฝึกงาน - ' + displayName, `
    <p class="text-sm text-gray-500 mb-4">เลือก Roadmap ที่ต้องการ Assign ให้นักศึกษา (ระบบจะสร้าง progress เริ่มต้นให้)</p>
    <div class="space-y-2" id="roadmap-checkboxes">
      ${roadmapOptions || '<p class="text-gray-400 text-sm">ยังไม่มี Roadmap</p>'}
    </div>
  `, `
    <button onclick="closeModal('assign-roadmap-modal')" class="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">ยกเลิก</button>
    <button onclick="submitAssignRoadmap('${studentId}')" class="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg">Assign</button>
  `);
  openModal('assign-roadmap-modal');
}

async function submitAssignRoadmap(studentId) {
  const checked = document.querySelectorAll('input[name="assign-roadmap"]:checked');
  if (checked.length === 0) { showToast('กรุณาเลือก Roadmap', 'error'); return; }

  showLoading();
  try {
    for (const cb of checked) {
      const roadmapId = cb.value;
      const roadmap = _roadmapsCache.find(r => r.id === roadmapId);
      if (roadmap && roadmap.steps) {
        for (const step of roadmap.steps) {
          await callApiPost('updateRoadmapProgress', {
            userId: studentId, stepId: step.id, status: 'NOT_STARTED', note: ''
          });
        }
      }
    }
    showToast('Assign แผนฝึกงานสำเร็จ', 'success');
    closeModal('assign-roadmap-modal');
  } catch (e) {
    showToast('เกิดข้อผิดพลาด', 'error');
  }
  hideLoading();
}

function studentStatusBadge(s) {
  if (String(s.isActive) === 'false') {
    return '<span class="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium">ยกเลิก</span>';
  }
  var docCount = [s.cvFileUrl, s.transcriptFileUrl, s.idCardFileUrl, s.photoFileUrl].filter(Boolean).length;
  if (docCount < 4) {
    return '<span class="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">รอเอกสาร</span>';
  }
  if (s.startDate) {
    var today = new Date();
    var start = new Date(s.startDate);
    var end = s.endDate ? new Date(s.endDate) : null;
    if (end && today > end) {
      return '<span class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">ผ่านการประเมิน</span>';
    }
    if (today >= start) {
      return '<span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">กำลังฝึก</span>';
    }
  }
  return '<span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">รอดำเนินการ</span>';
}

async function inlineAssignMentor(studentId, mentorId) {
  if (!mentorId) return;
  try {
    var result = await callApiPost('assignMentor', { mentorId: mentorId, studentId: studentId });
    if (result.success) {
      showToast('กำหนดพี่เลี้ยงสำเร็จ', 'success');
    } else {
      showToast(result.message || 'ไม่สามารถกำหนดพี่เลี้ยงได้', 'error');
    }
  } catch (error) {
    showToast('เกิดข้อผิดพลาด', 'error');
  }
}

async function toggleStudentStatus(id, name) {
  var student = _studentsCache.find(function(s) { return s.id === id; });
  var currentlyActive = !student || String(student.isActive) !== 'false';
  var actionLabel = currentlyActive ? 'ปิดการใช้งาน' : 'เปิดใช้งาน';

  if (!confirm('ต้องการ' + actionLabel + 'นักศึกษา "' + name + '" หรือไม่?')) return;

  try {
    showLoading();
    var result;
    if (currentlyActive) {
      result = await callApiPost('deactivateStudent', { id: id });
    } else {
      result = await callApiPost('updateStudent', { id: id, isActive: 'true' });
    }
    hideLoading();

    if (result.success) {
      showToast(actionLabel + 'นักศึกษาสำเร็จ', 'success');
      loadStudents();
    } else {
      showToast(result.message || 'ไม่สามารถ' + actionLabel + 'ได้', 'error');
    }
  } catch (error) {
    hideLoading();
    showToast('เกิดข้อผิดพลาด', 'error');
  }
}
