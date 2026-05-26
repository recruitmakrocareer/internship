// ==================== Shared App Logic ====================

/**
 * นำทางไปยังหน้าที่ต้องการ
 * @param {string} page - ชื่อหน้า
 */
function navigateTo(page) {
  window.location.hash = '#' + page;
}

/**
 * แสดง Toast notification
 * @param {string} message - ข้อความ
 * @param {string} type - ประเภท (success, error, warning, info)
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  const icons = {
    success: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
    error: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
    warning: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
    info: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
  };

  const toast = document.createElement('div');
  toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 mb-2 transform transition-all duration-300 translate-x-0 opacity-100`;
  toast.innerHTML = `${icons[type] || ''}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * แสดง Loading overlay
 */
function showLoading() {
  document.getElementById('loading-overlay').classList.remove('hidden');
}

/**
 * ซ่อน Loading overlay
 */
function hideLoading() {
  document.getElementById('loading-overlay').classList.add('hidden');
}

/**
 * จัดรูปแบบวันที่เป็นภาษาไทย
 * @param {string} dateStr - วันที่ในรูปแบบ string
 * @returns {string}
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * แปลงบทบาทเป็นภาษาไทย
 * @param {string} role
 * @returns {string}
 */
function getRoleLabel(role) {
  const labels = {
    'STUDENT': 'นักศึกษา',
    'MENTOR': 'พี่เลี้ยง',
    'ADMIN': 'ผู้ดูแลระบบ'
  };
  return labels[role] || role;
}

/**
 * แปลงสถานะเป็นภาษาไทย
 * @param {string} status
 * @returns {string}
 */
function getStatusLabel(status) {
  const labels = {
    'PENDING': 'รอดำเนินการ',
    'IN_PROGRESS': 'กำลังดำเนินการ',
    'COMPLETED': 'เสร็จสิ้น',
    'APPROVED': 'อนุมัติแล้ว',
    'REJECTED': 'ถูกปฏิเสธ',
    'SUBMITTED': 'ส่งแล้ว',
    'REVIEWED': 'ตรวจแล้ว',
    'NOT_STARTED': 'ยังไม่เริ่ม',
    'ACTIVE': 'ใช้งาน',
    'INACTIVE': 'ไม่ใช้งาน',
    'DRAFT': 'ร่าง',
    'PUBLISHED': 'เผยแพร่แล้ว',
    'OVERDUE': 'เลยกำหนด',
    'GRADED': 'ให้คะแนนแล้ว'
  };
  return labels[status] || status;
}

/**
 * คืนค่า Tailwind CSS classes สำหรับ badge สถานะ
 * @param {string} status
 * @returns {string}
 */
function getStatusColor(status) {
  const colors = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'IN_PROGRESS': 'bg-blue-100 text-blue-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'APPROVED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800',
    'SUBMITTED': 'bg-indigo-100 text-indigo-800',
    'REVIEWED': 'bg-purple-100 text-purple-800',
    'NOT_STARTED': 'bg-gray-100 text-gray-800',
    'ACTIVE': 'bg-green-100 text-green-800',
    'INACTIVE': 'bg-gray-100 text-gray-800',
    'DRAFT': 'bg-gray-100 text-gray-800',
    'PUBLISHED': 'bg-green-100 text-green-800',
    'OVERDUE': 'bg-red-100 text-red-800',
    'GRADED': 'bg-teal-100 text-teal-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * สร้าง Status Badge HTML
 * @param {string} status
 * @returns {string}
 */
function statusBadge(status) {
  return `<span class="px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}">${getStatusLabel(status)}</span>`;
}

/**
 * สร้าง Sidebar HTML ตามบทบาท
 * @param {string} role
 * @returns {string}
 */
function buildSidebar(role) {
  const menus = {
    STUDENT: [
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/></svg>', label: 'แดชบอร์ด', page: 'dashboard' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>', label: 'ข้อมูลส่วนตัว', page: 'student-profile' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>', label: 'แผนการฝึกงาน', page: 'student-roadmap' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>', label: 'งานที่ได้รับมอบหมาย', page: 'student-assignments' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>', label: 'ประเมินผล', page: 'student-evaluations' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>', label: 'แหล่งเรียนรู้', page: 'student-resources' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>', label: 'Training Passport', page: 'training-passport' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>', label: 'Knowledge Management', page: 'knowledge-management' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>', label: 'แบบประเมินหลังฝึกงาน', page: 'survey' }
    ],
    MENTOR: [
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/></svg>', label: 'แดชบอร์ด', page: 'dashboard' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>', label: 'นักศึกษาในความดูแล', page: 'mentor-students' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>', label: 'ตรวจงาน', page: 'mentor-assignments' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>', label: 'ประเมินผล', page: 'mentor-evaluations' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>', label: 'Training Passport', page: 'training-passport' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>', label: 'Knowledge Management', page: 'knowledge-management' }
    ],
    ADMIN: [
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/></svg>', label: 'แดชบอร์ด', page: 'dashboard' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>', label: 'จัดการนักศึกษา', page: 'admin-students' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>', label: 'จัดการพี่เลี้ยง', page: 'admin-mentors' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>', label: 'จัดการแผนฝึกงาน', page: 'admin-roadmaps' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>', label: 'จัดการงานมอบหมาย', page: 'admin-assignments' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>', label: 'ประเมินผล', page: 'admin-evaluations' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>', label: 'แหล่งเรียนรู้', page: 'admin-resources' },
      { icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>', label: 'การแจ้งเตือน', page: 'admin-notifications' }
    ]
  };

  const currentHash = window.location.hash.slice(1) || 'dashboard';
  const items = menus[role] || menus.STUDENT;

  return `
    <aside id="sidebar" class="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 lg:translate-x-0 -translate-x-full">
      <div class="p-6 border-b border-gray-200">
        <h1 class="text-lg font-bold text-primary-700">ระบบฝึกงาน</h1>
        <p class="text-xs text-gray-500 mt-1">Internship Management</p>
      </div>
      <nav class="p-4 space-y-1 overflow-y-auto" style="max-height: calc(100vh - 100px);">
        ${items.map(item => `
          <a href="#${item.page}" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentHash === item.page ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}">
            ${item.icon}
            <span>${item.label}</span>
          </a>
        `).join('')}
      </nav>
    </aside>
  `;
}

/**
 * สร้าง Navbar HTML
 * @param {object} user - ข้อมูลผู้ใช้
 * @returns {string}
 */
function buildNavbar(user) {
  return `
    <header class="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white shadow-sm z-30 flex items-center justify-between px-6">
      <button id="sidebar-toggle" class="lg:hidden text-gray-600 hover:text-gray-900">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
      <div class="flex-1"></div>
      <div class="flex items-center gap-4">
        <div class="text-right">
          <p class="text-sm font-medium text-gray-700">${user.name || user.email || 'ผู้ใช้'}</p>
          <p class="text-xs text-gray-500">${getRoleLabel(user.role)}</p>
        </div>
        <div class="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
          <span class="text-primary-700 font-semibold text-sm">${(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
        </div>
        <button onclick="clearToken(); navigateTo('login');" class="text-gray-400 hover:text-red-500 transition-colors" title="ออกจากระบบ">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        </button>
      </div>
    </header>
  `;
}

/**
 * สร้างเลย์เอาต์แดชบอร์ด (sidebar + navbar + content area)
 * @param {object} user - ข้อมูลผู้ใช้
 * @returns {string} - HTML content area id
 */
function initLayout(user) {
  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    ${buildNavbar(user)}
    <main id="content" class="lg:ml-64 mt-16 p-6 min-h-screen">
    </main>
  `;

  // Sidebar toggle for mobile
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });
  }

  return document.getElementById('content');
}

/**
 * สร้าง Modal HTML
 * @param {string} id - Modal ID
 * @param {string} title - หัวข้อ
 * @param {string} bodyHtml - เนื้อหา HTML
 * @param {string} footerHtml - ปุ่มด้านล่าง HTML
 * @returns {string}
 */
function buildModal(id, title, bodyHtml, footerHtml = '') {
  return `
    <div id="${id}" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">${title}</h3>
          <button onclick="document.getElementById('${id}').classList.add('hidden')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="p-6">${bodyHtml}</div>
        ${footerHtml ? `<div class="p-6 border-t border-gray-200 flex justify-end gap-3">${footerHtml}</div>` : ''}
      </div>
    </div>
  `;
}

/**
 * เปิด Modal
 * @param {string} id
 */
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

/**
 * ปิด Modal
 * @param {string} id
 */
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

/**
 * สร้าง input field HTML
 * @param {string} id
 * @param {string} label
 * @param {string} type
 * @param {string} value
 * @param {string} placeholder
 * @param {boolean} required
 * @returns {string}
 */
function inputField(id, label, type = 'text', value = '', placeholder = '', required = true) {
  return `
    <div class="mb-4">
      <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">${label}${required ? ' <span class="text-red-500">*</span>' : ''}</label>
      <input type="${type}" id="${id}" value="${value}" placeholder="${placeholder}" ${required ? 'required' : ''}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
    </div>
  `;
}

/**
 * สร้าง select field HTML
 * @param {string} id
 * @param {string} label
 * @param {Array} options - [{value, text}]
 * @param {string} selected
 * @returns {string}
 */
function selectField(id, label, options, selected = '') {
  return `
    <div class="mb-4">
      <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
      <select id="${id}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
        ${options.map(o => `<option value="${o.value}" ${o.value === selected ? 'selected' : ''}>${o.text}</option>`).join('')}
      </select>
    </div>
  `;
}

/**
 * สร้าง textarea field HTML
 */
function textareaField(id, label, value = '', placeholder = '', rows = 3) {
  return `
    <div class="mb-4">
      <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">${label}</label>
      <textarea id="${id}" rows="${rows}" placeholder="${placeholder}"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">${value}</textarea>
    </div>
  `;
}
