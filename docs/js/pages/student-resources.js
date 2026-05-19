function renderStudentResources() {
  const user = getCurrentUser();
  if (!user) return navigateTo('login');

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="ml-64">
      ${buildNavbar(user)}
      <div class="p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">แหล่งเรียนรู้</h1>
        <div class="flex gap-3 mb-6">
          <input id="res-search" type="text" placeholder="ค้นหา..." class="border rounded-lg px-4 py-2 text-sm flex-1" oninput="filterResources()" />
          <select id="res-cat-filter" class="border rounded-lg px-3 py-2 text-sm" onchange="filterResources()">
            <option value="">ทุกหมวดหมู่</option>
          </select>
        </div>
        <div id="resources-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="col-span-full text-center py-8 text-gray-400">กำลังโหลด...</div>
        </div>
      </div>
    </div>
  `;
  loadStudentResources();
}

window._allResources = [];
async function loadStudentResources() {
  const container = document.getElementById('resources-grid');
  try {
    const res = await callApi('getResources');
    const resources = res.data || res || [];
    window._allResources = Array.isArray(resources) ? resources : [];

    const cats = [...new Set(window._allResources.map(r => r.category).filter(Boolean))];
    const catSelect = document.getElementById('res-cat-filter');
    cats.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; catSelect.appendChild(o); });

    renderResourceCards(window._allResources);
  } catch (e) {
    container.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">เกิดข้อผิดพลาด</div>';
  }
}

function filterResources() {
  const search = (document.getElementById('res-search').value || '').toLowerCase();
  const cat = document.getElementById('res-cat-filter').value;
  let filtered = window._allResources;
  if (cat) filtered = filtered.filter(r => r.category === cat);
  if (search) filtered = filtered.filter(r => (r.title||'').toLowerCase().includes(search) || (r.description||'').toLowerCase().includes(search));
  renderResourceCards(filtered);
}

function renderResourceCards(resources) {
  const container = document.getElementById('resources-grid');
  if (resources.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">ไม่พบแหล่งเรียนรู้</div>';
    return;
  }
  const typeIcons = { link: '🔗', document: '📄', video: '🎬' };
  container.innerHTML = resources.map(r => `
    <div class="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between mb-2">
        <span class="text-2xl">${typeIcons[r.type] || '📁'}</span>
        <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">${r.category || ''}</span>
      </div>
      <h3 class="font-bold text-gray-800 mb-1">${r.title || ''}</h3>
      <p class="text-sm text-gray-500 mb-3">${r.description || ''}</p>
      ${r.url ? `<a href="${r.url}" target="_blank" class="text-sm text-blue-600 hover:underline">เปิดลิงก์</a>` : ''}
      ${r.fileUrl ? `<a href="${r.fileUrl}" target="_blank" class="text-sm text-blue-600 hover:underline">ดาวน์โหลดไฟล์</a>` : ''}
      ${r.content && !r.url && !r.fileUrl ? `<p class="text-sm text-gray-600 bg-gray-50 rounded p-2 mt-2">${r.content}</p>` : ''}
    </div>
  `).join('');
}
