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
          <h3 class="text-lg font-semibold text-gray-800 mb-4">กิจกรรมล่าสุด</h3>
          <div id="recent-activities" class="space-y-3">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">สรุปสถานะงาน</h3>
          <div id="assignment-summary" class="space-y-3">
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
      document.getElementById('admin-stats').innerHTML = `
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-primary-500">
          <p class="text-sm text-gray-500 mb-1">นักศึกษาทั้งหมด</p>
          <p class="text-3xl font-bold text-gray-800">${stats.totalStudents || 0}</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
          <p class="text-sm text-gray-500 mb-1">พี่เลี้ยงทั้งหมด</p>
          <p class="text-3xl font-bold text-gray-800">${stats.totalMentors || 0}</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
          <p class="text-sm text-gray-500 mb-1">งานที่รอตรวจ</p>
          <p class="text-3xl font-bold text-gray-800">${stats.pendingAssignments || 0}</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
          <p class="text-sm text-gray-500 mb-1">แผนฝึกงาน</p>
          <p class="text-3xl font-bold text-gray-800">${stats.totalRoadmaps || 0}</p>
        </div>
      `;

      const activities = document.getElementById('recent-activities');
      if (stats.recentActivities && stats.recentActivities.length > 0) {
        activities.innerHTML = stats.recentActivities.map(a => `
          <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div class="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p class="text-sm text-gray-700">${a.description}</p>
              <p class="text-xs text-gray-400 mt-1">${formatDate(a.date)}</p>
            </div>
          </div>
        `).join('');
      } else {
        activities.innerHTML = '<p class="text-sm text-gray-400">ยังไม่มีกิจกรรม</p>';
      }

      const summary = document.getElementById('assignment-summary');
      if (stats.assignmentSummary) {
        const s = stats.assignmentSummary;
        summary.innerHTML = `
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">ส่งแล้ว</span>
              <span class="text-sm font-semibold text-indigo-600">${s.submitted || 0}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">ตรวจแล้ว</span>
              <span class="text-sm font-semibold text-green-600">${s.reviewed || 0}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">รอดำเนินการ</span>
              <span class="text-sm font-semibold text-yellow-600">${s.pending || 0}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">เลยกำหนด</span>
              <span class="text-sm font-semibold text-red-600">${s.overdue || 0}</span>
            </div>
          </div>
        `;
      } else {
        summary.innerHTML = '<p class="text-sm text-gray-400">ยังไม่มีข้อมูล</p>';
      }
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
          <p class="text-sm text-gray-500 mb-1">งานที่รอส่ง</p>
          <p id="dash-pending-assignments" class="text-3xl font-bold text-gray-800">-</p>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
          <p class="text-sm text-gray-500 mb-1">งานที่ส่งแล้ว</p>
          <p id="dash-submitted-assignments" class="text-3xl font-bold text-gray-800">-</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">งานที่ต้องทำ</h3>
          <div id="dash-todo-list" class="space-y-3">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">การแจ้งเตือน</h3>
          <div id="dash-notifications" class="space-y-3">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    const result = await callApi('getStudentDashboard', { userId: user.id });
    if (result.success) {
      const data = result.data;
      document.getElementById('dash-roadmap-progress').textContent = (data.roadmapProgress || 0) + '%';
      document.getElementById('dash-pending-assignments').textContent = data.pendingAssignments || 0;
      document.getElementById('dash-submitted-assignments').textContent = data.submittedAssignments || 0;

      const todoList = document.getElementById('dash-todo-list');
      if (data.todoItems && data.todoItems.length > 0) {
        todoList.innerHTML = data.todoItems.map(item => `
          <a href="#student-assignments" class="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <p class="text-sm font-medium text-gray-700">${item.title}</p>
            <p class="text-xs text-gray-400 mt-1">กำหนดส่ง: ${formatDate(item.dueDate)}</p>
          </a>
        `).join('');
      } else {
        todoList.innerHTML = '<p class="text-sm text-gray-400">ไม่มีงานที่ต้องทำ</p>';
      }

      const notifs = document.getElementById('dash-notifications');
      if (data.notifications && data.notifications.length > 0) {
        notifs.innerHTML = data.notifications.map(n => `
          <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div class="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p class="text-sm text-gray-700">${n.message}</p>
              <p class="text-xs text-gray-400 mt-1">${formatDate(n.date)}</p>
            </div>
          </div>
        `).join('');
      } else {
        notifs.innerHTML = '<p class="text-sm text-gray-400">ไม่มีการแจ้งเตือน</p>';
      }
    }
  } catch (error) {
    console.error('Error loading student dashboard:', error);
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
          <h3 class="text-lg font-semibold text-gray-800 mb-4">นักศึกษาล่าสุด</h3>
          <div id="dash-mentor-student-list" class="space-y-3">
            <p class="text-sm text-gray-500">กำลังโหลด...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    const result = await callApi('getMentorDashboard', { userId: user.id });
    if (result.success) {
      const data = result.data;
      document.getElementById('dash-mentor-students').textContent = data.totalStudents || 0;
      document.getElementById('dash-mentor-pending').textContent = data.pendingReviews || 0;
      document.getElementById('dash-mentor-reviewed').textContent = data.reviewedCount || 0;

      const submissions = document.getElementById('dash-mentor-submissions');
      if (data.pendingSubmissions && data.pendingSubmissions.length > 0) {
        submissions.innerHTML = data.pendingSubmissions.map(s => `
          <a href="#mentor-assignments" class="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <p class="text-sm font-medium text-gray-700">${s.assignmentTitle}</p>
            <p class="text-xs text-gray-400 mt-1">โดย: ${s.studentName} | ส่งเมื่อ: ${formatDate(s.submittedDate)}</p>
          </a>
        `).join('');
      } else {
        submissions.innerHTML = '<p class="text-sm text-gray-400">ไม่มีงานที่รอตรวจ</p>';
      }

      const studentList = document.getElementById('dash-mentor-student-list');
      if (data.students && data.students.length > 0) {
        studentList.innerHTML = data.students.map(s => `
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span class="text-primary-700 font-semibold text-xs">${(s.name || '?').charAt(0)}</span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700">${s.name}</p>
              <p class="text-xs text-gray-400">${s.university || ''}</p>
            </div>
          </div>
        `).join('');
      } else {
        studentList.innerHTML = '<p class="text-sm text-gray-400">ยังไม่มีนักศึกษาในความดูแล</p>';
      }
    }
  } catch (error) {
    console.error('Error loading mentor dashboard:', error);
  }
}
