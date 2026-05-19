function renderAdminNotifications() {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') return navigateTo('login');

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="ml-64">
      ${buildNavbar(user)}
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">การแจ้งเตือน</h1>
          <div class="flex gap-2">
            <button onclick="markAllNotifRead()" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">อ่านทั้งหมด</button>
            <button onclick="openBroadcastForm()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">+ ส่งการแจ้งเตือน</button>
          </div>
        </div>
        <div id="notif-list" class="space-y-3">
          <div class="text-center py-8 text-gray-400">กำลังโหลด...</div>
        </div>
      </div>
    </div>
    <div id="broadcast-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-lg font-bold">ส่งการแจ้งเตือน</h3>
          <button onclick="document.getElementById('broadcast-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="p-6" id="broadcast-form"></div>
      </div>
    </div>
  `;
  loadAdminNotifications();
}

async function loadAdminNotifications() {
  const user = getCurrentUser();
  const container = document.getElementById('notif-list');
  try {
    const res = await callApi('getNotifications', { userId: user.id });
    const notifs = res.data || res || [];

    if (!Array.isArray(notifs) || notifs.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-400">ไม่มีการแจ้งเตือน</div>';
      return;
    }

    container.innerHTML = notifs.map(n => `
      <div class="bg-white rounded-lg border p-4 ${n.isRead === 'true' || n.isRead === true ? 'opacity-60' : 'border-l-4 border-l-blue-500'}">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-medium text-gray-800">${n.title || ''}</h4>
            <p class="text-sm text-gray-600 mt-1">${n.message || ''}</p>
          </div>
          <span class="text-xs text-gray-400 whitespace-nowrap ml-4">${formatDate(n.createdAt)}</span>
        </div>
        ${n.isRead !== 'true' && n.isRead !== true ? `<button onclick="markNotifRead('${n.id}')" class="text-xs text-blue-600 hover:underline mt-2">ทำเครื่องหมายว่าอ่านแล้ว</button>` : ''}
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<div class="text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}

async function markNotifRead(id) {
  try {
    await callApi('markAsRead', { notificationId: id });
    await loadAdminNotifications();
  } catch (e) {}
}

async function markAllNotifRead() {
  const user = getCurrentUser();
  showLoading();
  try {
    await callApi('markAllAsRead', { userId: user.id });
    await loadAdminNotifications();
    showToast('อ่านทั้งหมดแล้ว', 'success');
  } catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
  hideLoading();
}

async function openBroadcastForm() {
  let studentsHtml = '', mentorsHtml = '';
  try {
    const [sRes, mRes] = await Promise.all([callApi('getStudents'), callApi('getMentors')]);
    const students = sRes.data || sRes || [];
    const mentors = mRes.data || mRes || [];
    if (Array.isArray(students)) studentsHtml = students.map(s => `<label class="flex items-center gap-2 text-sm"><input type="checkbox" class="broadcast-user" value="${s.id}" />${s.firstName||''} ${s.lastName||''} (${s.studentId||s.email||''})</label>`).join('');
    if (Array.isArray(mentors)) mentorsHtml = mentors.map(m => `<label class="flex items-center gap-2 text-sm"><input type="checkbox" class="broadcast-user" value="${m.id}" />${m.firstName||''} ${m.lastName||''}</label>`).join('');
  } catch (e) {}

  document.getElementById('broadcast-form').innerHTML = `
    <div class="space-y-4">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">หัวข้อ</label>
        <input type="text" id="bc-title" class="w-full border rounded-lg p-2" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">ข้อความ</label>
        <textarea id="bc-message" class="w-full border rounded-lg p-3 text-sm" rows="4"></textarea></div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">ผู้รับ</label>
        <div class="flex gap-3 mb-2">
          <button onclick="selectAllBroadcast(true)" class="text-xs text-blue-600 hover:underline">เลือกทั้งหมด</button>
          <button onclick="selectAllBroadcast(false)" class="text-xs text-gray-600 hover:underline">ไม่เลือกทั้งหมด</button>
        </div>
        <div class="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
          ${studentsHtml ? '<div class="text-xs font-medium text-gray-500 mb-1">นักศึกษา</div>' + studentsHtml : ''}
          ${mentorsHtml ? '<div class="text-xs font-medium text-gray-500 mt-2 mb-1">พี่เลี้ยง</div>' + mentorsHtml : ''}
        </div>
      </div>
      <button onclick="sendBroadcastNotif()" class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">ส่งการแจ้งเตือน</button>
    </div>`;
  document.getElementById('broadcast-modal').classList.remove('hidden');
}

function selectAllBroadcast(checked) {
  document.querySelectorAll('.broadcast-user').forEach(cb => cb.checked = checked);
}

async function sendBroadcastNotif() {
  const ids = [...document.querySelectorAll('.broadcast-user:checked')].map(cb => cb.value);
  if (ids.length === 0) { showToast('กรุณาเลือกผู้รับ', 'error'); return; }

  showLoading();
  try {
    await callApi('sendBroadcast', {
      title: document.getElementById('bc-title').value,
      message: document.getElementById('bc-message').value,
      recipientIds: JSON.stringify(ids),
      sendLine: 'false'
    });
    showToast('ส่งการแจ้งเตือนสำเร็จ', 'success');
    document.getElementById('broadcast-modal').classList.add('hidden');
  } catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
  hideLoading();
}
