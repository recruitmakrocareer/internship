function renderMentorStudents() {
  const user = getCurrentUser();
  if (!user) return navigateTo('login');

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="ml-64">
      ${buildNavbar(user)}
      <div class="p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">นักศึกษาในความดูแล</h1>
        <div id="mentor-students-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="col-span-full text-center py-8 text-gray-400">กำลังโหลด...</div>
        </div>
      </div>
    </div>
    <div id="student-detail-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-lg font-bold" id="detail-modal-title">ข้อมูลนักศึกษา</h3>
          <button onclick="document.getElementById('student-detail-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="p-6" id="detail-modal-content"></div>
      </div>
    </div>
  `;
  loadMentorStudents();
}

async function loadMentorStudents() {
  const user = getCurrentUser();
  const container = document.getElementById('mentor-students-list');
  try {
    const res = await callApi('getStudentsByMentor', { mentorId: user.id });
    const students = res.data || res || [];

    if (!Array.isArray(students) || students.length === 0) {
      container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">ยังไม่มีนักศึกษาในความดูแล</div>';
      return;
    }

    container.innerHTML = students.map(s => `
      <div class="bg-white rounded-xl border p-5 hover:shadow-lg transition-shadow cursor-pointer" onclick="showStudentDetail('${s.id}')">
        <div class="flex items-center gap-4 mb-3">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-blue-700 font-bold text-lg">${((s.firstName || s.name || 'N')[0]).toUpperCase()}</span>
          </div>
          <div>
            <h3 class="font-bold text-gray-800">${s.firstName || ''} ${s.lastName || ''}</h3>
            <p class="text-sm text-gray-500">${s.studentId || ''} | ${s.department || ''}</p>
          </div>
        </div>
        <div class="flex gap-2 text-xs">
          <span class="px-2 py-1 rounded-full bg-blue-50 text-blue-700">${s.email || ''}</span>
          ${s.phone ? `<span class="px-2 py-1 rounded-full bg-gray-50 text-gray-600">${s.phone}</span>` : ''}
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}

async function showStudentDetail(studentId) {
  const modal = document.getElementById('student-detail-modal');
  const content = document.getElementById('detail-modal-content');
  content.innerHTML = '<div class="text-center py-8 text-gray-400">กำลังโหลด...</div>';
  modal.classList.remove('hidden');

  try {
    const [profileRes, passportRes, kmRes] = await Promise.all([
      callApi('getUserProfile', { userId: studentId }),
      callApi('getTrainingPassportSummary', { userId: studentId }),
      callApi('getKnowledgeSummary', { userId: studentId })
    ]);

    const profile = profileRes.data || profileRes || {};
    const passport = passportRes.data || {};
    const km = kmRes.data || {};

    document.getElementById('detail-modal-title').textContent = (profile.firstName || '') + ' ' + (profile.lastName || '');

    content.innerHTML = `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500">รหัสนักศึกษา</div>
            <div class="font-medium">${profile.studentId || '-'}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500">สาขา</div>
            <div class="font-medium">${profile.department || '-'}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500">อีเมล</div>
            <div class="font-medium">${profile.email || '-'}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500">โทรศัพท์</div>
            <div class="font-medium">${profile.phone || '-'}</div>
          </div>
        </div>

        <div class="bg-blue-50 rounded-xl p-4">
          <h4 class="font-bold text-blue-800 mb-2">Training Passport</h4>
          <div class="flex items-center gap-4">
            <div class="text-2xl font-bold text-blue-700">${passport.completedWeeks || 0}/${passport.totalWeeks || 16}</div>
            <div class="flex-1">
              <div class="bg-blue-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" style="width:${passport.progressPercent || 0}%"></div>
              </div>
              <div class="text-xs text-blue-600 mt-1">${passport.progressPercent || 0}% สำเร็จ</div>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 rounded-xl p-4">
          <h4 class="font-bold text-purple-800 mb-2">Knowledge Management</h4>
          <div class="flex items-center gap-4">
            <div class="text-2xl font-bold text-purple-700">${km.completedTopics || 0}/6</div>
            <div class="flex-1">
              <div class="bg-purple-200 rounded-full h-2">
                <div class="bg-purple-600 h-2 rounded-full" style="width:${km.progressPercent || 0}%"></div>
              </div>
              <div class="text-xs text-purple-600 mt-1">
                ${km.selectedTopic ? 'หัวข้อนำเสนอ: ' + km.selectedTopic.topicName : 'ยังไม่ได้เลือกหัวข้อนำเสนอ'}
                ${km.presentationScore ? ' | คะแนน: ' + km.presentationScore + '/100' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (e) {
    content.innerHTML = '<div class="text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}
