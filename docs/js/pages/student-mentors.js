// ==================== หน้าข้อมูลพี่เลี้ยง (นักศึกษา) ====================
// Multi-mentor contact page for students.
// Globals are prefixed with studentMentors_ to avoid collisions (shared scope).

var studentMentors_data = [];      // current student's mentor contacts
var studentMentors_directory = []; // mentor directory (for combobox)

function renderStudentMentors() {
  if (!checkAuth()) return;
  const user = getCurrentUser();
  const content = initLayout(user);

  content.innerHTML = `
    <div class="fade-in">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">ข้อมูลพี่เลี้ยง</h2>
          <p class="text-sm text-gray-500 mt-1">พี่เลี้ยงที่ดูแลการฝึกงานของคุณ</p>
        </div>
        <button onclick="studentMentors_openAddModal()" class="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          เพิ่มพี่เลี้ยง
        </button>
      </div>

      <div id="student-mentors-grid">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${[1, 2].map(() => `
            <div class="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div class="flex-1">
                  <div class="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div id="student-mentors-modal"></div>
  `;

  studentMentors_load();
}

async function studentMentors_load() {
  const user = getCurrentUser();
  const grid = document.getElementById('student-mentors-grid');
  if (!grid) return;

  try {
    const result = await callApi('getMyMentors', { studentId: user.id });
    studentMentors_data = (result.success && result.data) ? result.data : [];
    studentMentors_renderCards();
  } catch (error) {
    console.error('Error loading mentors:', error);
    grid.innerHTML = '<div class="bg-red-50 text-red-600 p-4 rounded-lg text-sm">ไม่สามารถโหลดข้อมูลพี่เลี้ยงได้ กรุณาลองใหม่อีกครั้ง</div>';
  }
}

function studentMentors_escapeHtml(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function studentMentors_renderCards() {
  const grid = document.getElementById('student-mentors-grid');
  if (!grid) return;

  if (!studentMentors_data.length) {
    grid.innerHTML = `
      <div class="text-center py-16 bg-white rounded-xl shadow-sm">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <p class="text-gray-400">ยังไม่มีพี่เลี้ยง</p>
        <p class="text-sm text-gray-400 mt-1">กดปุ่ม "เพิ่มพี่เลี้ยง" เพื่อเพิ่มพี่เลี้ยงของคุณ</p>
      </div>
    `;
    return;
  }

  const cards = studentMentors_data.map(function(m) {
    const fullName = m.name || ((m.firstName || '') + ' ' + (m.lastName || '')).trim() || 'ไม่ระบุ';
    const initial = (fullName || '?').charAt(0).toUpperCase();
    const imgUrl = m.profileImage ? driveImageUrl(m.profileImage) : '';
    const safeInitial = studentMentors_escapeHtml(initial);
    const avatar = imgUrl
      ? `<img src="${studentMentors_escapeHtml(imgUrl)}" alt="${studentMentors_escapeHtml(fullName)}" class="w-16 h-16 rounded-full object-cover flex-shrink-0" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='flex';">
         <div class="w-16 h-16 rounded-full bg-primary-100 items-center justify-center flex-shrink-0" style="display:none;"><span class="text-primary-700 font-bold text-xl">${safeInitial}</span></div>`
      : `<div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0"><span class="text-primary-700 font-bold text-xl">${safeInitial}</span></div>`;

    const position = m.position ? studentMentors_escapeHtml(m.position) : '<span class="text-gray-400">ไม่ระบุตำแหน่ง</span>';
    const deptParts = [m.department, m.branch].filter(Boolean).map(studentMentors_escapeHtml).join(' • ');
    const emailSafe = studentMentors_escapeHtml(m.email || '');
    const emailAttr = (m.email || '').replace(/'/g, "\\'");
    const mentorIdAttr = String(m.id).replace(/'/g, "\\'");
    const nameAttr = fullName.replace(/'/g, "\\'");

    const contactRows = `
      <div class="mt-4 space-y-2 text-sm">
        <div class="flex items-center gap-2 text-gray-600">
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          ${m.email ? `<a href="mailto:${emailSafe}" class="text-primary-600 hover:underline break-all">${emailSafe}</a>` : '<span class="text-gray-400">ไม่ระบุอีเมล</span>'}
        </div>
        <div class="flex items-center gap-2 text-gray-600">
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
          ${m.phone ? `<span>${studentMentors_escapeHtml(m.phone)}</span>` : '<span class="text-gray-400">ไม่ระบุเบอร์โทร</span>'}
        </div>
      </div>
    `;

    const actions = `
      <div class="mt-5 flex flex-wrap items-center gap-2">
        ${m.email ? `
          <button onclick="studentMentors_copyEmail('${emailAttr}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            คัดลอกอีเมล
          </button>
          <a href="mailto:${emailSafe}" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            ส่งอีเมล
          </a>` : ''}
        <button onclick="studentMentors_remove('${mentorIdAttr}', '${nameAttr}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors ml-auto">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          นำออก
        </button>
      </div>
    `;

    return `
      <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start gap-4">
          ${avatar}
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-800 truncate">${studentMentors_escapeHtml(fullName)}</h3>
            <p class="text-sm text-gray-500">${position}</p>
            ${deptParts ? `<p class="text-xs text-gray-400 mt-1">${deptParts}</p>` : ''}
          </div>
        </div>
        ${contactRows}
        ${actions}
      </div>
    `;
  }).join('');

  grid.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">${cards}</div>`;
}

async function studentMentors_copyEmail(email) {
  try {
    await navigator.clipboard.writeText(email);
    showToast('คัดลอกอีเมลแล้ว', 'success');
  } catch (e) {
    showToast('ไม่สามารถคัดลอกอีเมลได้', 'error');
  }
}

async function studentMentors_openAddModal() {
  const container = document.getElementById('student-mentors-modal');
  container.innerHTML = buildModal('student-add-mentor-modal', 'เพิ่มพี่เลี้ยง', `
    <p class="text-sm text-gray-500 mb-4">ค้นหาพี่เลี้ยงจากชื่อหรือแผนก แล้วเลือกเพื่อเพิ่มเป็นพี่เลี้ยงของคุณ</p>
    <div>
      <label for="student-mentor-search" class="block text-sm font-medium text-gray-700 mb-1">ค้นหาพี่เลี้ยง <span class="text-red-500">*</span></label>
      <input type="text" id="student-mentor-search" list="student-mentor-list" autocomplete="off"
        placeholder="พิมพ์ชื่อ หรือแผนก..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
      <datalist id="student-mentor-list"></datalist>
      <p class="text-xs text-gray-400 mt-1">กำลังโหลดรายชื่อพี่เลี้ยง...</p>
    </div>
  `, `
    <button onclick="closeModal('student-add-mentor-modal')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">ยกเลิก</button>
    <button onclick="studentMentors_submitAdd()" class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">เพิ่มพี่เลี้ยง</button>
  `);
  openModal('student-add-mentor-modal');

  // Load mentor directory for the combobox (re-uses existing getMentors action).
  try {
    const result = await callApi('getMentors');
    studentMentors_directory = (result.success && result.data) ? result.data : [];
    studentMentors_populateDatalist();
  } catch (e) {
    const hint = document.querySelector('#student-add-mentor-modal .text-xs');
    if (hint) { hint.textContent = 'ไม่สามารถโหลดรายชื่อพี่เลี้ยงได้'; hint.classList.add('text-red-500'); }
  }
}

function studentMentors_mentorLabel(m) {
  const fullName = m.name || ((m.firstName || '') + ' ' + (m.lastName || '')).trim() || 'ไม่ระบุ';
  const extras = [m.department, m.branch].filter(Boolean).join(' • ');
  return extras ? (fullName + ' — ' + extras) : fullName;
}

function studentMentors_populateDatalist() {
  const list = document.getElementById('student-mentor-list');
  const hint = document.querySelector('#student-add-mentor-modal .text-xs');
  if (!list) return;

  // Exclude inactive mentors and mentors already added.
  const existingIds = {};
  studentMentors_data.forEach(function(m) { existingIds[String(m.id)] = true; });

  const available = studentMentors_directory.filter(function(m) {
    return String(m.isActive) !== 'false' && !existingIds[String(m.id)];
  });

  list.innerHTML = available.map(function(m) {
    return '<option value="' + studentMentors_escapeHtml(studentMentors_mentorLabel(m)) + '"></option>';
  }).join('');

  if (hint) {
    hint.textContent = available.length
      ? 'เลือกจากรายการที่แสดง'
      : 'ไม่มีพี่เลี้ยงให้เพิ่มเพิ่มเติม';
  }
}

function studentMentors_findByLabel(label) {
  const target = (label || '').trim();
  if (!target) return null;
  // Match by full label first, then fall back to name only.
  let found = studentMentors_directory.find(function(m) {
    return studentMentors_mentorLabel(m) === target;
  });
  if (found) return found;
  return studentMentors_directory.find(function(m) {
    const fullName = m.name || ((m.firstName || '') + ' ' + (m.lastName || '')).trim();
    return fullName === target;
  }) || null;
}

async function studentMentors_submitAdd() {
  const user = getCurrentUser();
  const input = document.getElementById('student-mentor-search');
  const mentor = studentMentors_findByLabel(input ? input.value : '');

  if (!mentor) {
    showToast('กรุณาเลือกพี่เลี้ยงจากรายการ', 'error');
    return;
  }

  try {
    showLoading();
    const result = await callApiPost('addMentorContact', { studentId: user.id, mentorId: mentor.id });
    hideLoading();

    if (result.success) {
      showToast(result.note === 'exists' ? 'พี่เลี้ยงคนนี้อยู่ในรายการแล้ว' : 'เพิ่มพี่เลี้ยงสำเร็จ', 'success');
      closeModal('student-add-mentor-modal');
      studentMentors_load();
    } else {
      showToast(result.message || 'ไม่สามารถเพิ่มพี่เลี้ยงได้', 'error');
    }
  } catch (e) {
    hideLoading();
    showToast('เกิดข้อผิดพลาดในการเพิ่มพี่เลี้ยง', 'error');
  }
}

async function studentMentors_remove(mentorId, mentorName) {
  if (!confirm('ต้องการนำพี่เลี้ยง "' + (mentorName || '') + '" ออกจากรายการ?')) return;
  const user = getCurrentUser();

  try {
    showLoading();
    const result = await callApiPost('removeMentorContact', { studentId: user.id, mentorId: mentorId });
    hideLoading();

    if (result.success) {
      showToast('นำพี่เลี้ยงออกสำเร็จ', 'success');
      studentMentors_load();
    } else {
      showToast(result.message || 'ไม่สามารถนำพี่เลี้ยงออกได้', 'error');
    }
  } catch (e) {
    hideLoading();
    showToast('เกิดข้อผิดพลาด', 'error');
  }
}
