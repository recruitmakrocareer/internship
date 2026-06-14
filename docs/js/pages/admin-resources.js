// ==================== จัดการแหล่งเรียนรู้ — Admin Curriculum Sidebar ====================

var _adminResources = [];
var _adminSelectedId = null;

function renderAdminResources() {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') return navigateTo('login');

  const app = document.getElementById('app');
  app.innerHTML = `
    ${buildSidebar(user.role)}
    <div class="lg:ml-64 mt-16">
      ${buildNavbar(user)}
      <div class="flex h-[calc(100vh-4rem)]">
        <!-- Curriculum Sidebar -->
        <div id="cms-sidebar" class="w-80 border-r border-gray-200 bg-white flex flex-col shrink-0 hidden md:flex">
          <div class="p-4 border-b border-gray-100">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wide">โครงสร้างหลักสูตร</h2>
              <button onclick="cmsAddSection()" class="text-xs bg-primary-600 text-white px-2.5 py-1 rounded-lg hover:bg-primary-700">+ Section</button>
            </div>
            <input type="text" id="cms-search" placeholder="ค้นหาเนื้อหา..." oninput="cmsFilterSidebar()"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          </div>
          <div id="cms-tree" class="flex-1 overflow-y-auto p-2">
            <div class="text-center py-8 text-gray-400 text-sm">กำลังโหลด...</div>
          </div>
        </div>

        <!-- Content Workspace -->
        <div id="cms-workspace" class="flex-1 overflow-y-auto bg-gray-50">
          <div id="cms-workspace-content" class="p-6">
            <div class="max-w-3xl mx-auto text-center py-16">
              <div class="text-5xl mb-4 text-gray-300">📚</div>
              <h2 class="text-lg font-semibold text-gray-600 mb-2">จัดการเนื้อหาหลักสูตร</h2>
              <p class="text-sm text-gray-400 mb-6">เลือกเนื้อหาจากเมนูด้านซ้าย หรือเพิ่มเนื้อหาใหม่</p>
              <div class="flex justify-center gap-3">
                <button onclick="cmsAddSection()" class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">+ เพิ่ม Section ใหม่</button>
                <button onclick="cmsOpenCreate()" class="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">+ เพิ่มเนื้อหา</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile sidebar toggle -->
      <button id="cms-mobile-toggle" onclick="cmsMobileToggle()" class="md:hidden fixed bottom-4 left-4 z-40 bg-primary-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center lg:ml-64">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
      </button>
    </div>

    <!-- Resource edit modal (used as fallback for mobile) -->
    <div id="resource-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-lg font-bold" id="resource-modal-title">เพิ่มแหล่งเรียนรู้</h3>
          <button onclick="document.getElementById('resource-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div class="p-6" id="resource-modal-content"></div>
      </div>
    </div>
  `;
  cmsLoadAll();
}

async function cmsLoadAll() {
  try {
    const res = await callApi('getResources');
    _adminResources = Array.isArray(res.data || res) ? (res.data || res) : [];
    _adminResources.sort(function(a, b) {
      var sa = parseInt(a.sortOrder) || 9999;
      var sb = parseInt(b.sortOrder) || 9999;
      return sa - sb;
    });
    cmsRenderTree();
  } catch (e) {
    document.getElementById('cms-tree').innerHTML = '<div class="text-center py-8 text-red-400 text-sm">โหลดข้อมูลไม่สำเร็จ</div>';
  }
}

// ==================== Sidebar Tree ====================

function cmsRenderTree() {
  var search = (document.getElementById('cms-search') || {}).value || '';
  search = search.trim().toLowerCase();

  var sections = {};
  var noSection = [];

  _adminResources.forEach(function(r) {
    if (r.isActive === 'false' || r.isActive === false) return;
    if (search && !(r.title || '').toLowerCase().includes(search) && !(r.sectionName || '').toLowerCase().includes(search)) return;
    var sec = r.sectionName || '';
    if (sec) {
      if (!sections[sec]) sections[sec] = [];
      sections[sec].push(r);
    } else {
      noSection.push(r);
    }
  });

  var sectionNames = Object.keys(sections).sort();
  var typeIcons = { video: '🎬', document: '📄', link: '🔗' };
  var statusColors = { Published: 'bg-green-500', Draft: 'bg-amber-400' };

  var html = '';

  sectionNames.forEach(function(secName) {
    var items = sections[secName];
    html += `
      <div class="mb-2">
        <div class="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer group" onclick="cmsToggleSection(this)">
          <svg class="w-4 h-4 text-gray-400 transition-transform cms-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          <span class="flex-1 text-sm font-semibold text-gray-700 truncate">${_cmsEsc(secName)}</span>
          <span class="text-[10px] text-gray-400">${items.length}</span>
          <button onclick="event.stopPropagation(); cmsOpenCreate('${_cmsEsc(secName)}')" class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary-600" title="เพิ่มเนื้อหาใน Section">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          </button>
          <button onclick="event.stopPropagation(); cmsRenameSection('${_cmsEsc(secName)}')" class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600" title="เปลี่ยนชื่อ Section">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          </button>
        </div>
        <div class="cms-section-items ml-4 pl-2 border-l border-gray-100">`;

    items.forEach(function(r) {
      var icon = typeIcons[r.type] || '📁';
      var statusDot = statusColors[r.status || 'Published'] || statusColors.Published;
      var isActive = r.id === _adminSelectedId;
      html += `
          <div draggable="true" data-id="${r.id}" ondragstart="cmsDragStart(event)" ondragover="cmsDragOver(event)" ondrop="cmsDrop(event)"
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer group/item transition-colors ${isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}"
            onclick="cmsSelectItem('${r.id}')">
            <span class="w-2 h-2 rounded-full ${statusDot} shrink-0"></span>
            <span class="shrink-0">${icon}</span>
            <span class="flex-1 truncate">${_cmsEsc(r.title || 'ไม่มีชื่อ')}</span>
            <button onclick="event.stopPropagation(); deleteResourceById('${r.id}')" class="opacity-0 group-hover/item:opacity-100 text-red-400 hover:text-red-600 shrink-0" title="ลบ">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>`;
    });

    html += '</div></div>';
  });

  // Items with no section
  noSection.forEach(function(r) {
    var icon = typeIcons[r.type] || '📁';
    var statusDot = statusColors[r.status || 'Published'] || statusColors.Published;
    var isActive = r.id === _adminSelectedId;
    html += `
      <div draggable="true" data-id="${r.id}" ondragstart="cmsDragStart(event)" ondragover="cmsDragOver(event)" ondrop="cmsDrop(event)"
        class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer group transition-colors ${isActive ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}"
        onclick="cmsSelectItem('${r.id}')">
        <span class="w-2 h-2 rounded-full ${statusDot} shrink-0"></span>
        <span class="shrink-0">${icon}</span>
        <span class="flex-1 truncate">${_cmsEsc(r.title || 'ไม่มีชื่อ')}</span>
        <button onclick="event.stopPropagation(); deleteResourceById('${r.id}')" class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 shrink-0" title="ลบ">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>`;
  });

  if (!html) {
    html = '<div class="text-center py-8 text-gray-400 text-sm">' + (search ? 'ไม่พบเนื้อหา' : 'ยังไม่มีเนื้อหา') + '</div>';
  }

  document.getElementById('cms-tree').innerHTML = html;
}

function cmsFilterSidebar() { cmsRenderTree(); }

function cmsToggleSection(el) {
  var arrow = el.querySelector('.cms-arrow');
  var items = el.nextElementSibling;
  if (items.style.display === 'none') {
    items.style.display = '';
    arrow.style.transform = 'rotate(90deg)';
  } else {
    items.style.display = 'none';
    arrow.style.transform = '';
  }
}

// ==================== Drag & Drop ====================

var _cmsDragId = null;

function cmsDragStart(e) {
  _cmsDragId = e.currentTarget.getAttribute('data-id');
  e.dataTransfer.effectAllowed = 'move';
  e.currentTarget.classList.add('opacity-50');
  setTimeout(function() { e.target.classList && e.target.classList.remove('opacity-50'); }, 200);
}

function cmsDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('border-t-2', 'border-primary-400');
}

function cmsDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('border-t-2', 'border-primary-400');
  var targetId = e.currentTarget.getAttribute('data-id');
  if (!_cmsDragId || _cmsDragId === targetId) return;

  var dragItem = _adminResources.find(function(r) { return r.id === _cmsDragId; });
  var targetItem = _adminResources.find(function(r) { return r.id === targetId; });
  if (!dragItem || !targetItem) return;

  // Move dragged item to target's section and position
  dragItem.sectionName = targetItem.sectionName || '';
  var targetOrder = parseInt(targetItem.sortOrder) || 0;
  dragItem.sortOrder = String(targetOrder);

  // Re-sort
  _adminResources.sort(function(a, b) { return (parseInt(a.sortOrder) || 9999) - (parseInt(b.sortOrder) || 9999); });
  cmsRenderTree();

  // Save to backend
  callApiPost('updateResource', { id: dragItem.id, sectionName: dragItem.sectionName, sortOrder: dragItem.sortOrder }).catch(function(){ showToast('บันทึกลำดับล้มเหลว','error'); });
}

// ==================== Select & Edit Item ====================

function cmsSelectItem(id) {
  _adminSelectedId = id;
  var r = _adminResources.find(function(item) { return item.id === id; });
  if (!r) return;
  cmsRenderTree();
  cmsRenderWorkspace(r);
}

function cmsRenderWorkspace(r) {
  var ws = document.getElementById('cms-workspace-content');
  var statusOptions = ['Published', 'Draft'];

  ws.innerHTML = `
    <div class="max-w-3xl mx-auto">
      <!-- Action bar -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-bold text-gray-800 truncate max-w-md">${_cmsEsc(r.title || 'ไม่มีชื่อ')}</h2>
          <select id="cms-status" onchange="cmsSaveField('${r.id}','status',this.value)" class="text-xs border border-gray-200 rounded-lg px-2 py-1 ${(r.status || 'Published') === 'Published' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}">
            ${statusOptions.map(function(s) { return '<option value="' + s + '"' + ((r.status || 'Published') === s ? ' selected' : '') + '>' + (s === 'Published' ? '✓ เผยแพร่แล้ว' : '◑ แบบร่าง') + '</option>'; }).join('')}
          </select>
        </div>
        <div class="flex gap-2">
          <button onclick="navigateTo('resource-view?id=${r.id}')" class="text-sm bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50">
            <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            ดูตัวอย่าง
          </button>
          <button onclick="deleteResourceById('${r.id}')" class="text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">ลบ</button>
        </div>
      </div>

      <!-- Edit form -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อเนื้อหา</label>
            <input type="text" id="cms-title" value="${_cmsEsc(r.title || '')}" onblur="cmsSaveField('${r.id}','title',this.value)"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
            <textarea id="cms-desc" rows="3" onblur="cmsSaveField('${r.id}','description',this.value)"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">${_cmsEsc(r.description || '')}</textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <input type="text" id="cms-section" value="${_cmsEsc(r.sectionName || '')}" onblur="cmsSaveField('${r.id}','sectionName',this.value)"
                list="cms-section-list" placeholder="กำหนด Section"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <datalist id="cms-section-list">
                ${cmsGetSectionNames().map(function(s) { return '<option value="' + _cmsEsc(s) + '">'; }).join('')}
              </datalist>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
              <select id="cms-category" onchange="cmsSaveField('${r.id}','category',this.value)"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="คู่มือ" ${r.category === 'คู่มือ' ? 'selected' : ''}>คู่มือ</option>
                <option value="การเรียนรู้" ${r.category === 'การเรียนรู้' ? 'selected' : ''}>การเรียนรู้</option>
                <option value="เอกสาร" ${r.category === 'เอกสาร' ? 'selected' : ''}>เอกสาร</option>
                <option value="บทเรียน" ${r.category === 'บทเรียน' ? 'selected' : ''}>บทเรียน</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
              <select id="cms-type" onchange="cmsSaveField('${r.id}','type',this.value); cmsUpdateVideoHint()"
                class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="link" ${r.type === 'link' ? 'selected' : ''}>ลิงก์</option>
                <option value="document" ${r.type === 'document' ? 'selected' : ''}>เอกสาร</option>
                <option value="video" ${r.type === 'video' ? 'selected' : ''}>วิดีโอ</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL / ลิงก์</label>
            <input type="text" id="cms-url" value="${_cmsEsc(r.url || '')}" onblur="cmsSaveField('${r.id}','url',this.value)"
              placeholder="วาง URL ของวิดีโอ, Google Drive, YouTube หรือลิงก์อื่น"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          </div>
          <div id="cms-video-hint" class="${r.type === 'video' ? '' : 'hidden'} bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
            <b>สำหรับวิดีโอขนาดใหญ่:</b> อัปโหลดไปยัง Google Drive โดยตรง แล้ววาง URL ที่ช่องด้านบน (รองรับทุกขนาดตาม Space ของ Google Drive)<br>
            สำหรับวิดีโอขนาดเล็ก (&le; 50 MB) สามารถอัปโหลดผ่านช่องด้านล่างได้
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">อัปโหลดไฟล์ <span class="text-xs text-gray-400 font-normal">(สูงสุด 50 MB)</span></label>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
              <input type="file" id="cms-file" class="hidden" onchange="cmsOnFileSelect('${r.id}')">
              <label for="cms-file" class="cursor-pointer">
                <svg class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                <p class="text-sm text-gray-600 font-medium">คลิกเพื่อเลือกไฟล์ หรือลากวาง</p>
                <p class="text-xs text-gray-400 mt-1">รองรับ วิดีโอ, เอกสาร, รูปภาพ</p>
              </label>
            </div>
            <div id="cms-upload-progress" class="hidden mt-2">
              <div class="flex items-center gap-2 text-xs text-blue-600">
                <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                <span id="cms-upload-text">กำลังอัปโหลด...</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div id="cms-upload-bar" class="bg-blue-600 h-1.5 rounded-full transition-all" style="width:0%"></div>
              </div>
            </div>
            ${r.fileUrl ? '<div class="mt-2 text-xs text-green-600">ไฟล์ปัจจุบัน: <a href="' + _cmsEsc(r.fileUrl) + '" target="_blank" class="underline">ดูไฟล์</a></div>' : ''}
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">แท็ก</label>
            <input type="text" id="cms-tags" value="${_cmsEsc(r.tags || '')}" onblur="cmsSaveField('${r.id}','tags',this.value)"
              placeholder="คั่นด้วยจุลภาค"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ลำดับ (Sort Order)</label>
            <input type="number" id="cms-sort" value="${r.sortOrder || ''}" onblur="cmsSaveField('${r.id}','sortOrder',this.value)"
              placeholder="เช่น 1, 2, 3..." min="0"
              class="w-24 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
          </div>
        </div>
      </div>
    </div>`;
}

function cmsUpdateVideoHint() {
  var type = (document.getElementById('cms-type') || {}).value;
  var hint = document.getElementById('cms-video-hint');
  if (hint) {
    if (type === 'video') hint.classList.remove('hidden');
    else hint.classList.add('hidden');
  }
}

function cmsGetSectionNames() {
  var seen = {};
  var result = [];
  _adminResources.forEach(function(r) {
    if (r.sectionName && !seen[r.sectionName]) {
      seen[r.sectionName] = true;
      result.push(r.sectionName);
    }
  });
  return result.sort();
}

// ==================== Auto-save field ====================

var _cmsSaveTimers = {};

function cmsSaveField(id, field, value) {
  clearTimeout(_cmsSaveTimers[id + field]);
  _cmsSaveTimers[id + field] = setTimeout(async function() {
    try {
      var data = { id: id };
      data[field] = value;
      await callApiPost('updateResource', data);

      var item = _adminResources.find(function(r) { return r.id === id; });
      if (item) item[field] = value;

      if (field === 'sectionName' || field === 'sortOrder' || field === 'title' || field === 'status') {
        cmsRenderTree();
      }
    } catch (e) {
      showToast('บันทึกไม่สำเร็จ', 'error');
    }
  }, 500);
}

// ==================== File Upload ====================

async function cmsOnFileSelect(resourceId) {
  var fileInput = document.getElementById('cms-file');
  if (!fileInput || !fileInput.files[0]) return;
  var file = fileInput.files[0];
  var sizeMB = file.size / (1024 * 1024);

  if (file.size > 50 * 1024 * 1024) {
    showToast('ไฟล์เกิน 50 MB — กรุณาอัปโหลดไปยัง Google Drive แล้ววาง URL แทน', 'error');
    fileInput.value = '';
    return;
  }

  var progressEl = document.getElementById('cms-upload-progress');
  var barEl = document.getElementById('cms-upload-bar');
  var textEl = document.getElementById('cms-upload-text');
  progressEl.classList.remove('hidden');
  textEl.textContent = 'กำลังอัปโหลด ' + file.name + ' (' + sizeMB.toFixed(1) + ' MB)...';
  barEl.style.width = '20%';

  try {
    var resType = (document.getElementById('cms-type') || {}).value || 'resources';
    var subfolder = resType === 'video' ? 'videos' : 'resources';
    barEl.style.width = '40%';
    var base64 = await fileToBase64(file);
    barEl.style.width = '60%';
    textEl.textContent = 'กำลังส่งไฟล์...';
    var upRes = await callApiPost('uploadFile', { fileName: file.name, fileData: base64, mimeType: file.type, subfolder: subfolder });
    barEl.style.width = '90%';

    if (upRes.success && upRes.data) {
      var fileUrl = upRes.data.fileUrl;
      await callApiPost('updateResource', { id: resourceId, fileUrl: fileUrl });
      var item = _adminResources.find(function(r) { return r.id === resourceId; });
      if (item) item.fileUrl = fileUrl;
      barEl.style.width = '100%';
      textEl.textContent = 'อัปโหลดสำเร็จ!';
      showToast('อัปโหลดสำเร็จ', 'success');
      setTimeout(function() { cmsSelectItem(resourceId); }, 1000);
    } else {
      showToast(upRes.message || 'อัปโหลดไม่สำเร็จ', 'error');
      progressEl.classList.add('hidden');
    }
  } catch (e) {
    showToast('เกิดข้อผิดพลาดในการอัปโหลด', 'error');
    progressEl.classList.add('hidden');
  }
  fileInput.value = '';
}

// ==================== Section Management ====================

function cmsAddSection() {
  var name = prompt('ชื่อ Section ใหม่:');
  if (!name || !name.trim()) return;
  cmsOpenCreate(name.trim());
}

function cmsRenameSection(oldName) {
  var newName = prompt('เปลี่ยนชื่อ Section:', oldName);
  if (!newName || !newName.trim() || newName.trim() === oldName) return;
  var toUpdate = _adminResources.filter(function(r) { return r.sectionName === oldName; });
  var promises = [];
  toUpdate.forEach(function(r) {
    r.sectionName = newName.trim();
    promises.push(callApiPost('updateResource', { id: r.id, sectionName: newName.trim() }).catch(function(){ return { failed: true }; }));
  });
  cmsRenderTree();
  Promise.all(promises).then(function(results) {
    var anyFailed = results.some(function(r) { return r && r.failed; });
    if (anyFailed) {
      showToast('บันทึกบางรายการล้มเหลว', 'error');
    } else {
      showToast('เปลี่ยนชื่อ Section สำเร็จ', 'success');
    }
  });
}

// ==================== Create New Resource ====================

function cmsOpenCreate(sectionName) {
  var r = { sectionName: sectionName || '' };
  document.getElementById('resource-modal-title').textContent = 'เพิ่มเนื้อหาใหม่';
  document.getElementById('resource-modal-content').innerHTML = buildResourceForm(r);
  document.getElementById('resource-modal').classList.remove('hidden');
}

function buildResourceForm(r) {
  return `
    <div class="space-y-4">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
        <input type="text" id="res-title" class="w-full border rounded-lg p-2" value="${_cmsEsc(r.title||'')}" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
        <textarea id="res-desc" class="w-full border rounded-lg p-3 text-sm" rows="3">${_cmsEsc(r.description||'')}</textarea></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
          <select id="res-category" class="w-full border rounded-lg p-2">
            <option ${r.category==='คู่มือ'?'selected':''}>คู่มือ</option>
            <option ${r.category==='การเรียนรู้'?'selected':''}>การเรียนรู้</option>
            <option ${r.category==='เอกสาร'?'selected':''}>เอกสาร</option>
            <option ${r.category==='บทเรียน'?'selected':''}>บทเรียน</option>
          </select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
          <select id="res-type" class="w-full border rounded-lg p-2" onchange="onResTypeChange()">
            <option value="link" ${r.type==='link'?'selected':''}>ลิงก์</option>
            <option value="document" ${r.type==='document'?'selected':''}>เอกสาร</option>
            <option value="video" ${r.type==='video'?'selected':''}>วิดีโอ</option>
          </select></div>
      </div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Section</label>
        <input type="text" id="res-section" class="w-full border rounded-lg p-2" value="${_cmsEsc(r.sectionName||'')}" list="res-section-list" placeholder="กำหนด Section (ไม่บังคับ)" />
        <datalist id="res-section-list">
          ${cmsGetSectionNames().map(function(s) { return '<option value="' + _cmsEsc(s) + '">'; }).join('')}
        </datalist></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">URL / ลิงก์</label>
        <input type="text" id="res-url" class="w-full border rounded-lg p-2" value="${_cmsEsc(r.url||'')}" placeholder="วาง URL ของวิดีโอ, Google Drive, YouTube หรือลิงก์อื่น" /></div>
      <div id="res-video-hint" class="${r.type === 'video' ? '' : 'hidden'} bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
        <b>สำหรับวิดีโอขนาดใหญ่:</b> อัปโหลดไปยัง Google Drive โดยตรง แล้ววาง URL ที่ช่องด้านบน
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">อัพโหลดไฟล์ <span id="res-file-limit" class="text-xs text-gray-400 font-normal">(สูงสุด 50 MB)</span></label>
        <input type="file" id="res-file" class="w-full border rounded-lg p-2 text-sm" onchange="onResFileSelect()" />
        <div id="res-file-size-warn" class="hidden mt-1 text-xs text-red-500"></div>
      </div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">แท็ก</label>
        <input type="text" id="res-tags" class="w-full border rounded-lg p-2" value="${_cmsEsc(r.tags||'')}" placeholder="คั่นด้วยจุลภาค" /></div>
      <button onclick="saveResource('${escJs(r.id||'')}')" class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">บันทึก</button>
    </div>`;
}

function onResTypeChange() {
  var type = document.getElementById('res-type').value;
  var hint = document.getElementById('res-video-hint');
  if (type === 'video') hint.classList.remove('hidden');
  else hint.classList.add('hidden');
}

function onResFileSelect() {
  var fileInput = document.getElementById('res-file');
  var warnEl = document.getElementById('res-file-size-warn');
  if (!fileInput.files[0]) { warnEl.classList.add('hidden'); return; }
  var sizeMB = (fileInput.files[0].size / (1024 * 1024)).toFixed(1);
  if (fileInput.files[0].size > 50 * 1024 * 1024) {
    warnEl.textContent = 'ไฟล์ขนาด ' + sizeMB + ' MB เกินขีดจำกัด 50 MB — กรุณาอัปโหลดไปยัง Google Drive โดยตรง';
    warnEl.classList.remove('hidden');
    fileInput.value = '';
  } else if (fileInput.files[0].size > 30 * 1024 * 1024) {
    warnEl.textContent = 'ไฟล์ขนาด ' + sizeMB + ' MB — การอัปโหลดอาจใช้เวลาสักครู่';
    warnEl.classList.remove('hidden');
    warnEl.className = 'mt-1 text-xs text-amber-500';
  } else {
    warnEl.classList.add('hidden');
  }
}

async function saveResource(existingId) {
  var user = getCurrentUser();
  showLoading();
  try {
    var fileUrl = '';
    var fileInput = document.getElementById('res-file');
    if (fileInput && fileInput.files[0]) {
      if (fileInput.files[0].size > 50 * 1024 * 1024) {
        hideLoading();
        showToast('ไฟล์เกิน 50 MB — กรุณาอัปโหลดไปยัง Google Drive แล้ววาง URL แทน', 'error');
        return;
      }
      var resType = document.getElementById('res-type').value;
      var subfolder = resType === 'video' ? 'videos' : 'resources';
      var base64 = await fileToBase64(fileInput.files[0]);
      var upRes = await callApiPost('uploadFile', { fileName: fileInput.files[0].name, fileData: base64, mimeType: fileInput.files[0].type, subfolder: subfolder });
      if (upRes.success && upRes.data) {
        fileUrl = upRes.data.fileUrl;
      } else {
        hideLoading();
        showToast(upRes.message || 'ไม่สามารถอัปโหลดไฟล์ได้', 'error');
        return;
      }
    }

    var data = {
      title: document.getElementById('res-title').value,
      description: document.getElementById('res-desc').value,
      category: document.getElementById('res-category').value,
      type: document.getElementById('res-type').value,
      url: document.getElementById('res-url').value,
      tags: document.getElementById('res-tags').value,
      sectionName: (document.getElementById('res-section') || {}).value || '',
      status: 'Published',
      createdBy: user.id,
      isActive: 'true'
    };
    if (fileUrl) data.fileUrl = fileUrl;

    if (existingId) {
      data.id = existingId;
      await callApiPost('updateResource', data);
    } else {
      await callApiPost('createResource', data);
    }
    showToast('บันทึกสำเร็จ', 'success');
    document.getElementById('resource-modal').classList.add('hidden');
    await cmsLoadAll();
  } catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
  hideLoading();
}

async function editResource(id) {
  showLoading();
  try {
    var res = await callApi('getResource', { id: id });
    var r = res.data || res;
    hideLoading();
    document.getElementById('resource-modal-title').textContent = 'แก้ไขแหล่งเรียนรู้';
    document.getElementById('resource-modal-content').innerHTML = buildResourceForm(r);
    document.getElementById('resource-modal').classList.remove('hidden');
  } catch (e) { hideLoading(); showToast('เกิดข้อผิดพลาด', 'error'); }
}

async function deleteResourceById(id) {
  if (!confirm('ต้องการลบแหล่งเรียนรู้นี้?')) return;
  showLoading();
  try {
    await callApiPost('deleteResource', { id: id });
    _adminResources = _adminResources.filter(function(r) { return r.id !== id; });
    if (_adminSelectedId === id) {
      _adminSelectedId = null;
      document.getElementById('cms-workspace-content').innerHTML = `
        <div class="max-w-3xl mx-auto text-center py-16">
          <div class="text-5xl mb-4 text-gray-300">📚</div>
          <p class="text-gray-400">เลือกเนื้อหาจากเมนูด้านซ้าย</p>
        </div>`;
    }
    cmsRenderTree();
    showToast('ลบสำเร็จ', 'success');
  } catch (e) { showToast('เกิดข้อผิดพลาด', 'error'); }
  hideLoading();
}

// ==================== Mobile Toggle ====================

function cmsMobileToggle() {
  var sidebar = document.getElementById('cms-sidebar');
  sidebar.classList.toggle('hidden');
  sidebar.classList.toggle('fixed');
  sidebar.classList.toggle('inset-0');
  sidebar.classList.toggle('z-40');
  sidebar.classList.toggle('mt-16');
}

// ==================== Helpers ====================

function _cmsEsc(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
