// ==================== หน้าแดชบอร์ด ====================

function renderDashboard() {
  if (!checkAuth()) return;
  const user = getCurrentUser();
  const content = initLayout(user);

  if (user.role === 'ADMIN') {
    renderAdminDashboard(content);
  } else if (user.role === 'MENTOR') {
    renderMentorDashboard(content);
  } else {
    renderStudentDashboard(content);
  }
}

async function renderAdminDashboard(content) {
  content.innerHTML = `
    <div class="fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">แดชบอร์ดผู้ดูแลระบบ</h2>
      <div id="admin-stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        ${[1,2,3,4].map(() => `
          <div class="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div class="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        `).join('')}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">สรุปการส่งงาน</h3>
          <div id="assignment-summary" class="space-y-3">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">ภาพรวมระบบ</h3>
          <div id="system-overview" class="space-y-3">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    const result = await callApi('getAdminStats');
    if (result.success) {
      const stats = result.data;
      const u = stats.users || {};
      const a = stats.assignments || {};
      const r = stats.roadmaps || {};

      document.getElementById('admin-stats').innerHTML = `
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-primary-500">
          <p class="text-sm text-gray-500 mb-1">นักศึกษาทั้งหมด</p>
          <p class="text-3xl font-bold text-gray-800">${u.totalStudents || 0}</p>
          <p class="text-xs text-gray-400 mt-1">ใช้งาน ${u.activeStudents || 0} คน</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
          <p class="text-sm text-gray-500 mb-1">พี่เลี้ยงทั้งหมด</p>
          <p class="text-3xl font-bold text-gray-800">${u.totalMentors || 0}</p>
          <p class="text-xs text-gray-400 mt-1">ใช้งาน ${u.activeMentors || 0} คน</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
          <p class="text-sm text-gray-500 mb-1">งานที่รอตรวจ</p>
          <p class="text-3xl font-bold text-gray-800">${a.pendingSubmissions || 0}</p>
          <p class="text-xs text-gray-400 mt-1">จากทั้งหมด ${a.totalSubmissions || 0} งาน</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
          <p class="text-sm text-gray-500 mb-1">แผนฝึกงาน</p>
          <p class="text-3xl font-bold text-gray-800">${r.totalRoadmaps || 0}</p>
          <p class="text-xs text-gray-400 mt-1">รวม ${r.totalSteps || 0} ขั้นตอน</p>
        </div>
      `;

      const summary = document.getElementById('assignment-summary');
      summary.innerHTML = `
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">ส่งแล้วทั้งหมด</span>
            <span class="text-sm font-semibold text-indigo-600">${a.totalSubmissions || 0}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">ตรวจแล้ว</span>
            <span class="text-sm font-semibold text-green-600">${a.reviewedSubmissions || 0}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">รอตรวจ</span>
            <span class="text-sm font-semibold text-yellow-600">${a.pendingSubmissions || 0}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div class="bg-green-500 h-2 rounded-full" style="width:${a.completionRate || 0}%"></div>
          </div>
          <p class="text-xs text-gray-400">อัตราการตรวจ ${a.completionRate || 0}%</p>
        </div>
      `;

      const overview = document.getElementById('system-overview');
      const recent = stats.recentActivity || {};
      overview.innerHTML = `
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">นักศึกษามีพี่เลี้ยงแล้ว</span>
            <span class="text-sm font-semibold text-green-600">${u.studentsWithMentor || 0}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">นักศึกษายังไม่มีพี่เลี้ยง</span>
            <span class="text-sm font-semibold text-red-500">${u.studentsWithoutMentor || 0}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">การส่งงาน 7 วันล่าสุด</span>
            <span class="text-sm font-semibold text-blue-600">${recent.submissionsLast7Days || 0}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">ความคืบหน้า Roadmap รวม</span>
            <span class="text-sm font-semibold text-purple-600">${(stats.roadmaps || {}).overallCompletion || 0}%</span>
          </div>
        </div>
      `;
    }
  } catch (error) {
    document.getElementById('admin-stats').innerHTML = `
      <div class="col-span-full bg-red-50 text-red-600 p-4 rounded-lg text-sm">ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง</div>
    `;
  }
}

async function renderStudentDashboard(content) {
  const user = getCurrentUser();
  content.innerHTML = `
    <div class="fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">สวัสดี, ${user.name || 'นักศึกษา'}</h2>
      <p class="text-gray-500 mb-6">ยินดีต้อนรับเข้าสู่ระบบจัดการนักศึกษาฝึกงาน</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-primary-500">
          <p class="text-sm text-gray-500 mb-1">ความคืบหน้าแผนฝึกงาน</p>
          <p id="dash-roadmap-progress" class="text-3xl font-bold text-gray-800">-</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
          <p class="text-sm text-gray-500 mb-1">งานที่ส่งแล้ว</p>
          <p id="dash-submitted-assignments" class="text-3xl font-bold text-gray-800">-</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
          <p class="text-sm text-gray-500 mb-1">การแจ้งเตือนที่ยังไม่อ่าน</p>
          <p id="dash-unread-notifs" class="text-3xl font-bold text-gray-800">-</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">ความคืบหน้าแผนฝึกงาน</h3>
          <div id="dash-progress-detail" class="space-y-3">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">การแจ้งเตือนล่าสุด</h3>
          <div id="dash-notifications" class="space-y-3">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    const [progressRes, submissionRes, notifRes] = await Promise.all([
      callApi('getRoadmapProgress', { userId: user.id }),
      callApi('getSubmissions', { userId: user.id }),
      callApi('getNotifications', { userId: user.id })
    ]);

    const progressList = Array.isArray(progressRes.data || progressRes) ? (progressRes.data || progressRes) : [];
    const submissions = Array.isArray(submissionRes.data || submissionRes) ? (submissionRes.data || submissionRes) : [];
    const notifications = Array.isArray(notifRes.data || notifRes) ? (notifRes.data || notifRes) : [];

    const completedCount = progressList.filter(p => p.status === 'COMPLETED').length;
    const totalCount = progressList.length;
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    document.getElementById('dash-roadmap-progress').textContent = progressPct + '%';
    document.getElementById('dash-submitted-assignments').textContent = submissions.length;
    const unread = notifications.filter(n => !n.isRead && n.isRead !== 'true').length;
    document.getElementById('dash-unread-notifs').textContent = unread;

    const progressDetail = document.getElementById('dash-progress-detail');
    progressDetail.innerHTML = `
      <div class="flex justify-between text-sm mb-1">
        <span class="text-gray-600">เสร็จแล้ว ${completedCount} / ${totalCount} ขั้นตอน</span>
        <span class="font-semibold text-primary-600">${progressPct}%</span>
      </div>
      <div class="bg-gray-200 rounded-full h-3 mb-4">
        <div class="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all" style="width:${progressPct}%"></div>
      </div>
      ${progressList.filter(p => p.status === 'IN_PROGRESS').length > 0 ? `
        <p class="text-sm font-medium text-gray-700 mb-2">กำลังดำเนินการ:</p>
        ${progressList.filter(p => p.status === 'IN_PROGRESS').slice(0, 3).map(p => `
          <div class="flex items-center gap-2 p-2 bg-blue-50 rounded-lg mb-1">
            <div class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span class="text-sm text-blue-700">${p.stepTitle || p.stepId || 'ขั้นตอน'}</span>
          </div>
        `).join('')}
      ` : '<p class="text-sm text-gray-400">ไม่มีขั้นตอนที่กำลังดำเนินการ</p>'}
    `;

    const notifContainer = document.getElementById('dash-notifications');
    if (notifications.length > 0) {
      notifContainer.innerHTML = notifications.slice(0, 5).map(n => `
        <div class="flex items-start gap-3 p-3 ${!n.isRead && n.isRead !== 'true' ? 'bg-blue-50' : 'bg-gray-50'} rounded-lg">
          <div class="w-2 h-2 ${!n.isRead && n.isRead !== 'true' ? 'bg-blue-500' : 'bg-gray-300'} rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p class="text-sm font-medium text-gray-700">${n.title || n.message || ''}</p>
            <p class="text-xs text-gray-400 mt-1">${formatDate(n.createdAt || n.date)}</p>
          </div>
        </div>
      `).join('');
    } else {
      notifContainer.innerHTML = '<p class="text-sm text-gray-400">ไม่มีการแจ้งเตือน</p>';
    }
  } catch (error) {
    console.error('Error loading student dashboard:', error);
    document.getElementById('dash-progress-detail').innerHTML = '<p class="text-sm text-red-500">ไม่สามารถโหลดข้อมูลได้</p>';
    document.getElementById('dash-notifications').innerHTML = '<p class="text-sm text-red-500">ไม่สามารถโหลดข้อมูลได้</p>';
  }
}

async function renderMentorDashboard(content) {
  const user = getCurrentUser();
  content.innerHTML = `
    <div class="fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">สวัสดี, ${user.name || 'พี่เลี้ยง'}</h2>
      <p class="text-gray-500 mb-6">ภาพรวมการดูแลนักศึกษาฝึกงาน</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-primary-500">
          <p class="text-sm text-gray-500 mb-1">นักศึกษาในความดูแล</p>
          <p id="dash-mentor-students" class="text-3xl font-bold text-gray-800">-</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
          <p class="text-sm text-gray-500 mb-1">งานที่รอตรวจ</p>
          <p id="dash-mentor-pending" class="text-3xl font-bold text-gray-800">-</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
          <p class="text-sm text-gray-500 mb-1">ตรวจแล้ว</p>
          <p id="dash-mentor-reviewed" class="text-3xl font-bold text-gray-800">-</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">งานที่รอตรวจ</h3>
          <div id="dash-mentor-submissions" class="space-y-3">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">นักศึกษาในความดูแล</h3>
          <div id="dash-mentor-student-list" class="space-y-3">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    const [studentsRes, submissionsRes] = await Promise.all([
      callApi('getStudentsByMentor', { mentorId: user.id }),
      callApi('getSubmissions', { status: 'SUBMITTED' })
    ]);

    const students = Array.isArray(studentsRes.data || studentsRes) ? (studentsRes.data || studentsRes) : [];
    const allSubmissions = Array.isArray(submissionsRes.data || submissionsRes) ? (submissionsRes.data || submissionsRes) : [];
    const pendingSubmissions = allSubmissions.filter(s => s.status === 'SUBMITTED');
    const reviewedSubmissions = allSubmissions.filter(s => s.status === 'REVIEWED' || s.status === 'GRADED');

    document.getElementById('dash-mentor-students').textContent = students.length;
    document.getElementById('dash-mentor-pending').textContent = pendingSubmissions.length;
    document.getElementById('dash-mentor-reviewed').textContent = reviewedSubmissions.length;

    const submissions = document.getElementById('dash-mentor-submissions');
    if (pendingSubmissions.length > 0) {
      submissions.innerHTML = pendingSubmissions.slice(0, 5).map(s => `
        <a href="#mentor-assignments" class="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <p class="text-sm font-medium text-gray-700">${s.assignmentTitle || s.assignmentId || 'งาน'}</p>
          <p class="text-xs text-gray-400 mt-1">ส่งเมื่อ: ${formatDate(s.submittedAt || s.createdAt)}</p>
        </a>
      `).join('');
    } else {
      submissions.innerHTML = '<p class="text-sm text-gray-400">ไม่มีงานที่รอตรวจ</p>';
    }

    const studentList = document.getElementById('dash-mentor-student-list');
    if (students.length > 0) {
      studentList.innerHTML = students.slice(0, 5).map(s => `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span class="text-primary-700 font-semibold text-xs">${(s.name || s.firstName || '?').charAt(0)}</span>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">${s.name || (s.firstName + ' ' + s.lastName) || s.email || '-'}</p>
            <p class="text-xs text-gray-400">${s.university || ''}</p>
          </div>
        </div>
      `).join('');
    } else {
      studentList.innerHTML = '<p class="text-sm text-gray-400">ยังไม่มีนักศึกษาในความดูแล</p>';
    }
  } catch (error) {
    console.error('Error loading mentor dashboard:', error);
    document.getElementById('dash-mentor-submissions').innerHTML = '<p class="text-sm text-red-500">ไม่สามารถโหลดข้อมูลได้</p>';
    document.getElementById('dash-mentor-student-list').innerHTML = '<p class="text-sm text-red-500">ไม่สามารถโหลดข้อมูลได้</p>';
  }
}
