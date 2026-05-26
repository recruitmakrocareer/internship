function renderMentorStudents() {
  const user = getCurrentUser();
  if (!user) return navigateTo('login');

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="lg:ml-64 mt-16">
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

    container.innerHTML = students.map(s => {
      const displayName = ((s.firstName || '') + ' ' + (s.lastName || '')).trim() || s.name || '-';
      const docCount = [s.cvFileUrl, s.transcriptFileUrl, s.idCardFileUrl, s.photoFileUrl].filter(Boolean).length;
      return `
      <div class="bg-white rounded-xl border p-5 hover:shadow-lg transition-shadow cursor-pointer" onclick="showStudentDetail('${s.id}')">
        <div class="flex items-center gap-4 mb-3">
          <div class="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${s.photoFileUrl ? '' : 'bg-blue-100'}">
            ${s.photoFileUrl
              ? '<img src="' + driveImageUrl(s.photoFileUrl) + '" class="w-full h-full object-cover">'
              : '<span class="text-blue-700 font-bold text-lg">' + (displayName).charAt(0).toUpperCase() + '</span>'}
          </div>
          <div>
            <h3 class="font-bold text-gray-800">${displayName}</h3>
            <p class="text-sm text-gray-500">${s.studentId || ''} | ${s.department || ''}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs mb-3">
          <div><span class="text-gray-400">มหาวิทยาลัย:</span> <span class="text-gray-700">${s.university || '-'}</span></div>
          <div><span class="text-gray-400">สาขา:</span> <span class="text-gray-700">${s.major || '-'}</span></div>
          <div><span class="text-gray-400">ประเภท:</span> <span class="text-gray-700">${s.internshipType || '-'}</span></div>
          <div><span class="text-gray-400">เอกสาร:</span> <span class="text-gray-700">${docCount}/4</span></div>
        </div>
        <div class="flex gap-2 text-xs flex-wrap">
          <span class="px-2 py-1 rounded-full bg-blue-50 text-blue-700">${s.email || ''}</span>
          ${s.phone ? '<span class="px-2 py-1 rounded-full bg-gray-50 text-gray-600">' + s.phone + '</span>' : ''}
        </div>
      </div>`;
    }).join('');
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
    const [profileRes, passportRes, kmRes, progressRes] = await Promise.all([
      callApi('getUserProfile', { userId: studentId }),
      callApi('getTrainingPassportSummary', { userId: studentId }),
      callApi('getKnowledgeSummary', { userId: studentId }),
      callApi('getRoadmapProgress', { userId: studentId })
    ]);

    const p = profileRes.data || profileRes || {};
    const passport = passportRes.data || {};
    const km = kmRes.data || {};
    const progress = Array.isArray(progressRes.data || progressRes) ? (progressRes.data || progressRes) : [];

    const displayName = ((p.firstName || '') + ' ' + (p.lastName || '')).trim() || p.name || '-';
    const completedSteps = progress.filter(pr => pr.status === 'COMPLETED').length;
    const totalSteps = progress.length;
    const roadmapPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    document.getElementById('detail-modal-title').textContent = displayName;

    content.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden ${p.photoFileUrl ? '' : 'bg-blue-100'}">
            ${p.photoFileUrl
              ? '<img src="' + driveImageUrl(p.photoFileUrl) + '" class="w-full h-full object-cover">'
              : '<span class="text-blue-700 font-bold text-2xl">' + (displayName).charAt(0).toUpperCase() + '</span>'}
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">${displayName}</h3>
            <p class="text-sm text-gray-500">${p.email || '-'} | ${p.phone || '-'}</p>
            ${p.nickname ? '<p class="text-xs text-gray-400">ชื่อเล่น: ' + p.nickname + '</p>' : ''}
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500">รหัสนักศึกษา</div>
            <div class="font-medium text-sm">${p.studentId || '-'}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500">มหาวิทยาลัย</div>
            <div class="font-medium text-sm">${p.university || '-'}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500">คณะ</div>
            <div class="font-medium text-sm">${p.faculty || '-'}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500">สาขา</div>
            <div class="font-medium text-sm">${p.major || '-'}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500">ชั้นปี / GPA</div>
            <div class="font-medium text-sm">${p.year ? 'ปี ' + p.year : '-'} ${p.gpa ? '/ ' + p.gpa : ''}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500">ประเภทฝึกงาน</div>
            <div class="font-medium text-sm">${p.internshipType || '-'}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500">แผนก / สาขาที่ฝึก</div>
            <div class="font-medium text-sm">${p.department || '-'} ${p.branch ? '/ ' + p.branch : ''}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500">วันฝึกงาน</div>
            <div class="font-medium text-sm">${p.startDate || '-'} ~ ${p.endDate || '-'}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500">อาจารย์ที่ปรึกษา</div>
            <div class="font-medium text-sm">${p.advisorName || '-'}</div>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-3">
          <div class="text-xs text-gray-500 mb-1">เอกสาร</div>
          <div class="flex gap-3 flex-wrap">
            <span class="${p.cvFileUrl ? 'text-green-600' : 'text-gray-400'}">${p.cvFileUrl ? '✓' : '○'} CV</span>
            <span class="${p.transcriptFileUrl ? 'text-green-600' : 'text-gray-400'}">${p.transcriptFileUrl ? '✓' : '○'} ใบรับรอง</span>
            <span class="${p.idCardFileUrl ? 'text-green-600' : 'text-gray-400'}">${p.idCardFileUrl ? '✓' : '○'} บัตร ปชช.</span>
            <span class="${p.photoFileUrl ? 'text-green-600' : 'text-gray-400'}">${p.photoFileUrl ? '✓' : '○'} รูปถ่าย</span>
          </div>
        </div>

        ${p.skills || p.interests ? `
        <div class="bg-gray-50 rounded-lg p-3">
          ${p.skills ? '<div class="text-xs text-gray-500 mb-1">ทักษะ</div><div class="text-sm text-gray-700 mb-2">' + p.skills + '</div>' : ''}
          ${p.interests ? '<div class="text-xs text-gray-500 mb-1">ความสนใจ</div><div class="text-sm text-gray-700">' + p.interests + '</div>' : ''}
        </div>` : ''}

        <div class="bg-green-50 rounded-xl p-4">
          <h4 class="font-bold text-green-800 mb-2">ความคืบหน้า Roadmap</h4>
          <div class="flex items-center gap-4">
            <div class="text-2xl font-bold text-green-700">${completedSteps}/${totalSteps}</div>
            <div class="flex-1">
              <div class="bg-green-200 rounded-full h-2">
                <div class="bg-green-600 h-2 rounded-full" style="width:${roadmapPct}%"></div>
              </div>
              <div class="text-xs text-green-600 mt-1">${roadmapPct}% สำเร็จ</div>
            </div>
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
