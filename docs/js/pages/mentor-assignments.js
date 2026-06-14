function renderMentorAssignments() {
  const user = getCurrentUser();
  if (!user) return navigateTo('login');

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="lg:ml-64 mt-16">
      ${buildNavbar(user)}
      <div class="p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">ตรวจงาน</h1>
        <div class="flex gap-2 mb-6">
          <button onclick="filterMentorSubs('all')" class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 mentor-sub-tab" data-tab="all">ทั้งหมด</button>
          <button onclick="filterMentorSubs('submitted')" class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 mentor-sub-tab" data-tab="submitted">รอตรวจ</button>
          <button onclick="filterMentorSubs('reviewed')" class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 mentor-sub-tab" data-tab="reviewed">ตรวจแล้ว</button>
        </div>
        <div id="mentor-assignments-list" class="space-y-4">
          <div class="text-center py-8 text-gray-400">กำลังโหลด...</div>
        </div>
      </div>
    </div>
    <div id="review-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-lg font-bold" id="review-modal-title">ตรวจงาน</h3>
          <button onclick="document.getElementById('review-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="p-6" id="review-modal-content"></div>
      </div>
    </div>
  `;
  loadMentorAssignments();
}

window._mentorAssignments = [];
window._mentorSubmissions = [];
window._mentorStudentMap = {};

async function loadMentorAssignments() {
  const user = getCurrentUser();
  const container = document.getElementById('mentor-assignments-list');
  try {
    const [aRes, sRes, studentsRes] = await Promise.all([
      callApi('getAssignments'),
      callApi('getSubmissions', {}),
      callApi('getStudentsByMentor', { mentorId: user.id })
    ]);
    window._mentorAssignments = aRes.data || aRes || [];
    window._mentorSubmissions = sRes.data || sRes || [];
    const students = Array.isArray(studentsRes.data || studentsRes) ? (studentsRes.data || studentsRes) : [];
    window._mentorStudentMap = {};
    students.forEach(s => { window._mentorStudentMap[s.id] = ((s.firstName || '') + ' ' + (s.lastName || '')).trim() || s.name || s.email || s.id; });
    filterMentorSubs('all');
  } catch (e) {
    container.innerHTML = '<div class="text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}

function filterMentorSubs(tab) {
  document.querySelectorAll('.mentor-sub-tab').forEach(b => {
    b.classList.toggle('bg-blue-600', b.dataset.tab === tab);
    b.classList.toggle('text-white', b.dataset.tab === tab);
  });

  const container = document.getElementById('mentor-assignments-list');
  const assignments = Array.isArray(window._mentorAssignments) ? window._mentorAssignments : [];
  const subs = Array.isArray(window._mentorSubmissions) ? window._mentorSubmissions : [];

  let html = '';
  assignments.forEach(a => {
    let assignmentSubs = subs.filter(s => s.assignmentId === a.id);
    if (tab === 'submitted') assignmentSubs = assignmentSubs.filter(s => s.status === 'submitted' || s.status === 'pending');
    if (tab === 'reviewed') assignmentSubs = assignmentSubs.filter(s => s.status === 'reviewed' || s.status === 'graded');

    if (tab !== 'all' && assignmentSubs.length === 0) return;

    html += `
      <div class="bg-white rounded-xl border">
        <div class="p-4 border-b bg-gray-50">
          <h3 class="font-bold text-gray-800">${escAttr(a.title || '')}</h3>
          <p class="text-sm text-gray-500">${escAttr(a.description || '')} | คะแนนเต็ม: ${escAttr(a.maxScore || '-')}</p>
        </div>
        <div class="divide-y">
          ${assignmentSubs.length === 0 ? '<div class="p-4 text-center text-gray-400 text-sm">ไม่มีงานที่ส่ง</div>' :
            assignmentSubs.map(s => {
              const statusColor = (s.status === 'reviewed' || s.status === 'graded') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
              const statusLabel = (s.status === 'reviewed' || s.status === 'graded') ? 'ตรวจแล้ว' : 'รอตรวจ';
              return `
                <div class="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <span class="font-medium text-gray-700">${escAttr(window._mentorStudentMap[s.userId] || s.userId || 'นักศึกษา')}</span>
                    <span class="text-sm text-gray-500 ml-2">${formatDate(s.submittedAt)}</span>
                    ${s.score ? `<span class="text-sm text-green-600 ml-2">คะแนน: ${escAttr(s.score)}/${escAttr(a.maxScore)}</span>` : ''}
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 text-xs rounded-full ${statusColor}">${statusLabel}</span>
                    <button onclick="openReviewModal('${escJs(s.id)}','${escJs(a.title||'')}','${escJs(a.maxScore || 100)}')" class="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">ตรวจ</button>
                  </div>
                </div>`;
            }).join('')}
        </div>
      </div>`;
  });

  container.innerHTML = html || '<div class="text-center py-12 text-gray-400">ไม่พบข้อมูล</div>';
}

function openReviewModal(submissionId, title, maxScore) {
  const sub = window._mentorSubmissions.find(s => s.id === submissionId);
  if (!sub) return;

  document.getElementById('review-modal-title').textContent = 'ตรวจงาน: ' + title;
  document.getElementById('review-modal-content').innerHTML = `
    <div class="space-y-4">
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">เนื้อหาที่ส่ง:</h4>
        <p class="text-sm text-gray-600">${escAttr(sub.content || 'ไม่มีเนื้อหา')}</p>
        ${sub.fileUrl ? `<a href="${safeUrl(sub.fileUrl)}" target="_blank" class="text-sm text-blue-600 hover:underline mt-2 inline-block">ดูไฟล์: ${escAttr(sub.fileName || 'ไฟล์แนบ')}</a>` : ''}
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">คะแนน (เต็ม ${escAttr(maxScore)})</label>
        <input type="number" id="review-score" min="0" max="${escAttr(maxScore)}" class="w-full border rounded-lg p-2" value="${escAttr(sub.score || '')}" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">ความคิดเห็น</label>
        <textarea id="review-feedback" class="w-full border rounded-lg p-3 text-sm" rows="4" placeholder="ให้ฟีดแบค...">${escAttr(sub.feedback || '')}</textarea>
      </div>
      <button onclick="submitReview('${submissionId}')" class="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700">บันทึกการตรวจ</button>
    </div>
  `;
  document.getElementById('review-modal').classList.remove('hidden');
}

async function submitReview(submissionId) {
  const score = document.getElementById('review-score').value;
  const feedback = document.getElementById('review-feedback').value;
  if (!score) { showToast('กรุณาใส่คะแนน', 'error'); return; }

  showLoading();
  try {
    await callApiPost('reviewSubmission', { submissionId, status: 'reviewed', score, feedback, reviewerId: getCurrentUser().id });
    showToast('บันทึกการตรวจสำเร็จ', 'success');
    document.getElementById('review-modal').classList.add('hidden');
    await loadMentorAssignments();
  } catch (e) {
    showToast('เกิดข้อผิดพลาด', 'error');
  }
  hideLoading();
}
