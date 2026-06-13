// ==================== หน้าข้อมูลส่วนตัวนักศึกษา ====================

var _profileStoreList = [];
var _profileDeptList = [];

function buildProfileSkillsHtml(existingSkills) {
  var existing = (existingSkills || '').split(',').map(function(s) { return s.trim(); }).filter(Boolean);
  var knownSkills = typeof SKILLS_CHECKBOXES !== 'undefined' ? SKILLS_CHECKBOXES : ['Excel', 'การเขียนโปรแกรม', 'Graphic Designer', 'Automation', 'ทักษะการขาย', 'การบริการลูกค้า'];
  var html = '<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">';
  for (var i = 0; i < knownSkills.length; i++) {
    var sk = knownSkills[i];
    var checked = existing.indexOf(sk) !== -1 ? ' checked' : '';
    html += '<label class="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" class="profile-skill-cb w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" value="' + sk + '"' + checked + '> ' + sk + '</label>';
  }
  html += '</div>';
  var otherSkills = existing.filter(function(s) { return knownSkills.indexOf(s) === -1; });
  var hasOther = otherSkills.length > 0;
  html += '<div><label class="flex items-center gap-2 text-sm text-gray-700 mb-1"><input type="checkbox" id="profile-skill-other-cb" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"' + (hasOther ? ' checked' : '') + '> อื่นๆ</label>';
  html += '<input type="text" id="profile-skill-other-text" placeholder="ระบุทักษะอื่นๆ" value="' + (hasOther ? otherSkills.join(', ') : '') + '"' + (hasOther ? '' : ' disabled') + ' class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm mt-1"></div>';
  return html;
}

function collectProfileSkillsValue() {
  var skills = [];
  var cbs = document.querySelectorAll('.profile-skill-cb');
  for (var i = 0; i < cbs.length; i++) {
    if (cbs[i].checked) skills.push(cbs[i].value);
  }
  var otherCb = document.getElementById('profile-skill-other-cb');
  var otherText = document.getElementById('profile-skill-other-text');
  if (otherCb && otherCb.checked && otherText && otherText.value.trim()) {
    skills.push(otherText.value.trim());
  }
  return skills.join(', ');
}

function switchProfileTab(tabId) {
  document.querySelectorAll('.profile-tab-btn').forEach(function(btn) {
    btn.classList.remove('border-primary-500', 'text-primary-600');
    btn.classList.add('border-transparent', 'text-gray-500');
  });
  document.querySelectorAll('.profile-tab-panel').forEach(function(p) {
    p.classList.add('hidden');
  });
  var activeBtn = document.querySelector('[data-tab="' + tabId + '"]');
  if (activeBtn) {
    activeBtn.classList.add('border-primary-500', 'text-primary-600');
    activeBtn.classList.remove('border-transparent', 'text-gray-500');
  }
  var panel = document.getElementById('tab-' + tabId);
  if (panel) panel.classList.remove('hidden');
}

function handleAvatarDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  var zone = document.getElementById('profile-avatar-zone');
  if (zone) zone.classList.remove('ring-4', 'ring-primary-300');
  var files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
  if (!files || !files.length) return;
  var file = files[0];
  if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
    showToast('กรุณาเลือกไฟล์ JPG หรือ PNG เท่านั้น', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('ไฟล์รูปภาพมีขนาดใหญ่เกินไป (สูงสุด 5MB)', 'error');
    return;
  }
  window._profileDocFiles = window._profileDocFiles || {};
  window._profileDocFiles['photo'] = file;
  var reader = new FileReader();
  reader.onload = function(ev) {
    var img = document.getElementById('profile-avatar-img');
    if (img) { img.src = ev.target.result; img.classList.remove('hidden'); }
    var initials = document.getElementById('profile-avatar-initials');
    if (initials) initials.classList.add('hidden');
    showToast('เลือกรูปแล้ว กดบันทึกเพื่ออัปโหลด', 'success');
  };
  reader.readAsDataURL(file);
}

async function renderStudentProfile() {
  if (!checkAuth()) return;
  const user = getCurrentUser();
  const content = initLayout(user);

  content.innerHTML = `
    <div class="fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">ข้อมูลส่วนตัว</h2>
      <div id="profile-content" class="max-w-3xl">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="bg-gradient-to-r from-primary-500 to-primary-700 p-6">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
              <div class="space-y-2 flex-1">
                <div class="h-5 bg-white/20 rounded w-1/3 animate-pulse"></div>
                <div class="h-3 bg-white/20 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div class="border-b border-gray-200 px-6">
            <div class="flex gap-6 py-3">
              <div class="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div class="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
              <div class="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
              <div class="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
              <div class="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
              <div class="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    showLoading();
    var results = await Promise.all([
      callApi('getUserProfile', { userId: user.id }),
      callApi('getStoreList'),
      callApi('getDepartmentList')
    ]);
    hideLoading();

    var profileResult = results[0];
    if (results[1] && results[1].success && results[1].data) _profileStoreList = results[1].data;
    if (results[2] && results[2].success && results[2].data) _profileDeptList = results[2].data;

    const profile = profileResult.success ? profileResult.data : user;
    const firstName = profile.firstName || (profile.name ? profile.name.split(' ')[0] : '');
    const lastName = profile.lastName || (profile.name ? profile.name.split(' ').slice(1).join(' ') : '');

    var storeOpts = '<option value="">-- เลือกสาขา --</option>';
    for (var si = 0; si < _profileStoreList.length; si++) {
      var sv = _profileStoreList[si].storeNo + ' - ' + _profileStoreList[si].storeName;
      storeOpts += '<option value="' + sv + '">' + sv + '</option>';
    }

    var deptOpts = '<option value="">-- เลือกแผนก --</option>';
    var lastDiv = '';
    for (var di = 0; di < _profileDeptList.length; di++) {
      var dd = _profileDeptList[di];
      if (dd.division !== lastDiv) {
        if (lastDiv !== '') deptOpts += '</optgroup>';
        deptOpts += '<optgroup label="' + dd.division + '">';
        lastDiv = dd.division;
      }
      deptOpts += '<option value="' + dd.department + '">' + dd.department + '</option>';
    }
    if (lastDiv !== '') deptOpts += '</optgroup>';

    document.getElementById('profile-content').innerHTML = `
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="bg-gradient-to-r from-primary-500 to-primary-700 p-6">
          <div class="flex items-center gap-4">
            <div id="profile-avatar-zone" class="w-20 h-20 bg-white rounded-full flex items-center justify-center overflow-hidden relative cursor-pointer group flex-shrink-0 transition-all"
              ondragover="event.preventDefault(); event.stopPropagation(); this.classList.add('ring-4','ring-primary-300');"
              ondragleave="this.classList.remove('ring-4','ring-primary-300');"
              ondrop="handleAvatarDrop(event)"
              onclick="document.getElementById('profile-avatar-input').click()">
              <img id="profile-avatar-img" src="${profile.photoFileUrl ? driveImageUrl(profile.photoFileUrl) : ''}" alt="Photo"
                class="w-full h-full object-cover ${profile.photoFileUrl ? '' : 'hidden'}">
              <span id="profile-avatar-initials" class="text-primary-700 font-bold text-2xl ${profile.photoFileUrl ? 'hidden' : ''}">${(firstName || 'U').charAt(0).toUpperCase()}</span>
              <div class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <input type="file" id="profile-avatar-input" accept=".jpg,.jpeg,.png" class="hidden" onchange="handleAvatarDrop(event)">
            </div>
            <div class="text-white">
              <h3 class="text-xl font-bold">${profile.prefix ? profile.prefix + ' ' : ''}${firstName} ${lastName}</h3>
              <p class="text-primary-100 text-sm">${profile.email || '-'}</p>
              <p class="text-primary-200 text-xs mt-0.5">ลากรูปมาวาง หรือคลิกที่รูปเพื่อเปลี่ยน</p>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="flex px-6 -mb-px">
            <button type="button" data-tab="personal" onclick="switchProfileTab('personal')"
              class="profile-tab-btn px-4 py-3 text-sm font-medium border-b-2 border-primary-500 text-primary-600 transition-colors">
              ข้อมูลส่วนตัว
            </button>
            <button type="button" data-tab="documents" onclick="switchProfileTab('documents')"
              class="profile-tab-btn px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors">
              เอกสาร
            </button>
            <button type="button" data-tab="security" onclick="switchProfileTab('security')"
              class="profile-tab-btn px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors">
              ความปลอดภัย
            </button>
          </nav>
        </div>

        <!-- Tab: ข้อมูลส่วนตัว -->
        <div id="tab-personal" class="profile-tab-panel">
        <form id="profile-form" class="p-6 space-y-6">

          <!-- Section: ข้อมูลส่วนตัว -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">ข้อมูลส่วนตัว</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="mb-4">
                <label for="profile-prefix" class="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า</label>
                <select id="profile-prefix" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                  <option value="">-- เลือก --</option>
                  <option value="นาย" ${profile.prefix === 'นาย' ? 'selected' : ''}>นาย</option>
                  <option value="นาง" ${profile.prefix === 'นาง' ? 'selected' : ''}>นาง</option>
                  <option value="นางสาว" ${profile.prefix === 'นางสาว' ? 'selected' : ''}>นางสาว</option>
                </select>
              </div>
              <div>
                <label for="profile-first-name" class="block text-sm font-medium text-gray-700 mb-1">ชื่อจริง <span class="text-red-500">*</span></label>
                <input type="text" id="profile-first-name" value="${firstName}" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              </div>
              <div>
                <label for="profile-last-name" class="block text-sm font-medium text-gray-700 mb-1">นามสกุล <span class="text-red-500">*</span></label>
                <input type="text" id="profile-last-name" value="${lastName}" required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label for="profile-nickname" class="block text-sm font-medium text-gray-700 mb-1">ชื่อเล่น</label>
                <input type="text" id="profile-nickname" value="${profile.nickname || ''}"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              </div>
              <div>
                <label for="profile-phone" class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                <input type="tel" id="profile-phone" value="${profile.phone || ''}" placeholder="0xx-xxx-xxxx"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">รหัสพนักงาน <span class="text-xs text-gray-400">(แอดมินกำหนด)</span></label>
                <input type="text" value="${profile.employeeId || '-'}" disabled
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed">
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label for="profile-id-card" class="block text-sm font-medium text-gray-700 mb-1">เลขบัตรประชาชน</label>
                <input type="text" id="profile-id-card" value="${profile.idCardNumber || ''}" maxlength="13"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              </div>
              <div>
                <label for="profile-military" class="block text-sm font-medium text-gray-700 mb-1">สถานะทางทหาร</label>
                <select id="profile-military" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                  <option value="">-- เลือก --</option>
                  <option value="ผ่านการเกณฑ์ทหารแล้ว" ${profile.militaryStatus === 'ผ่านการเกณฑ์ทหารแล้ว' ? 'selected' : ''}>ผ่านการเกณฑ์ทหารแล้ว</option>
                  <option value="ได้รับการยกเว้น" ${profile.militaryStatus === 'ได้รับการยกเว้น' ? 'selected' : ''}>ได้รับการยกเว้น</option>
                  <option value="ผ่านการศึกษาวิชาทหาร (รด.)" ${profile.militaryStatus === 'ผ่านการศึกษาวิชาทหาร (รด.)' ? 'selected' : ''}>ผ่านการศึกษาวิชาทหาร (รด.)</option>
                </select>
              </div>
            </div>
            <div class="mt-4">
              <label for="profile-medical" class="block text-sm font-medium text-gray-700 mb-1">โรคประจำตัว</label>
              <input type="text" id="profile-medical" value="${profile.medicalCondition || ''}" placeholder="ระบุโรคประจำตัว (ถ้ามี)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">แผนกที่ฝึก <span class="text-xs text-gray-400">(แอดมินกำหนด)</span></label>
                <input type="text" value="${profile.department || '-'}" disabled
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">สาขาที่ฝึก <span class="text-xs text-gray-400">(แอดมินกำหนด)</span></label>
                <input type="text" value="${profile.branch || '-'}" disabled
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed">
              </div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">อีเมล <span class="text-xs text-gray-400">(ติดต่อแอดมินเพื่อเปลี่ยน)</span></label>
              <input type="email" value="${profile.email || ''}" disabled
                class="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed">
            </div>
          </div>

          <hr class="border-gray-200">

          <!-- Section: ที่อยู่ -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">ที่อยู่</h3>
            <p class="text-xs text-gray-500 mb-2 font-medium">ที่อยู่ปัจจุบัน</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="mb-4">
                <label for="profile-current-house-no" class="block text-sm font-medium text-gray-700 mb-1">บ้านเลขที่</label>
                <input type="text" id="profile-current-house-no" value="${profile.currentHouseNo || ''}" placeholder="เช่น 123/4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              </div>
              <div class="mb-4">
                <label for="profile-current-village" class="block text-sm font-medium text-gray-700 mb-1">หมู่บ้าน/อาคาร</label>
                <input type="text" id="profile-current-village" value="${profile.currentVillage || ''}" placeholder="หมู่บ้าน/อาคาร"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="mb-4">
                <label for="profile-current-soi" class="block text-sm font-medium text-gray-700 mb-1">ซอย</label>
                <input type="text" id="profile-current-soi" value="${profile.currentSoi || ''}" placeholder="ซอย"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              </div>
              <div class="mb-4">
                <label for="profile-current-road" class="block text-sm font-medium text-gray-700 mb-1">ถนน</label>
                <input type="text" id="profile-current-road" value="${profile.currentRoad || ''}" placeholder="ถนน"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="mb-4">
                <label for="profile-current-province" class="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
                <select id="profile-current-province"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                  ${buildProvinceOptions(profile.currentProvince || '')}
                </select>
              </div>
              <div class="mb-4">
                <label for="profile-current-district" class="block text-sm font-medium text-gray-700 mb-1">เขต/อำเภอ</label>
                <select id="profile-current-district"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                  <option value="">-- เลือกเขต/อำเภอ --</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="mb-4">
                <label for="profile-current-subdistrict" class="block text-sm font-medium text-gray-700 mb-1">แขวง/ตำบล</label>
                <select id="profile-current-subdistrict"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                  <option value="">-- เลือกแขวง/ตำบล --</option>
                </select>
              </div>
              <div class="mb-4">
                <label for="profile-current-postcode" class="block text-sm font-medium text-gray-700 mb-1">รหัสไปรษณีย์</label>
                <input type="text" id="profile-current-postcode" value="${profile.currentPostcode || ''}" placeholder="รหัสไปรษณีย์" maxlength="5" readonly
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm">
              </div>
            </div>

            <div class="flex items-center gap-2 mt-2 mb-3">
              <input type="checkbox" id="profile-same-address" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500">
              <label for="profile-same-address" class="text-sm text-gray-700">ที่อยู่ตามบัตรประชาชนเหมือนที่อยู่ปัจจุบัน</label>
            </div>

            <div id="profile-idcard-address-section">
              <p class="text-xs text-gray-500 mb-2 font-medium">ที่อยู่ตามบัตรประชาชน</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="mb-4">
                  <label for="profile-idcard-house-no" class="block text-sm font-medium text-gray-700 mb-1">บ้านเลขที่</label>
                  <input type="text" id="profile-idcard-house-no" value="${profile.idCardHouseNo || ''}" placeholder="เช่น 123/4"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm profile-idcard-field">
                </div>
                <div class="mb-4">
                  <label for="profile-idcard-village" class="block text-sm font-medium text-gray-700 mb-1">หมู่บ้าน/อาคาร</label>
                  <input type="text" id="profile-idcard-village" value="${profile.idCardVillage || ''}" placeholder="หมู่บ้าน/อาคาร"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm profile-idcard-field">
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="mb-4">
                  <label for="profile-idcard-soi" class="block text-sm font-medium text-gray-700 mb-1">ซอย</label>
                  <input type="text" id="profile-idcard-soi" value="${profile.idCardSoi || ''}" placeholder="ซอย"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm profile-idcard-field">
                </div>
                <div class="mb-4">
                  <label for="profile-idcard-road" class="block text-sm font-medium text-gray-700 mb-1">ถนน</label>
                  <input type="text" id="profile-idcard-road" value="${profile.idCardRoad || ''}" placeholder="ถนน"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm profile-idcard-field">
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="mb-4">
                  <label for="profile-idcard-province" class="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
                  <select id="profile-idcard-province"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm profile-idcard-field">
                    ${buildProvinceOptions(profile.idCardProvince || '')}
                  </select>
                </div>
                <div class="mb-4">
                  <label for="profile-idcard-district" class="block text-sm font-medium text-gray-700 mb-1">เขต/อำเภอ</label>
                  <select id="profile-idcard-district"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm profile-idcard-field">
                    <option value="">-- เลือกเขต/อำเภอ --</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="mb-4">
                  <label for="profile-idcard-subdistrict" class="block text-sm font-medium text-gray-700 mb-1">แขวง/ตำบล</label>
                  <select id="profile-idcard-subdistrict"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm profile-idcard-field">
                    <option value="">-- เลือกแขวง/ตำบล --</option>
                  </select>
                </div>
                <div class="mb-4">
                  <label for="profile-idcard-postcode" class="block text-sm font-medium text-gray-700 mb-1">รหัสไปรษณีย์</label>
                  <input type="text" id="profile-idcard-postcode" value="${profile.idCardPostcode || ''}" placeholder="รหัสไปรษณีย์" maxlength="5" readonly
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm profile-idcard-field">
                </div>
              </div>
            </div>
          </div>

          <hr class="border-gray-200">

          <!-- Section: ข้อมูลการศึกษา -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">ข้อมูลการศึกษา</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${inputField('profile-student-id', 'รหัสนักศึกษา', 'text', profile.studentId || '')}
              ${inputField('profile-university', 'มหาวิทยาลัย', 'text', profile.university || '')}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${inputField('profile-faculty', 'คณะ', 'text', profile.faculty || '')}
              ${inputField('profile-major', 'สาขา', 'text', profile.major || '')}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${selectField('profile-year', 'ชั้นปี', [
                {value: '', text: '-- เลือก --'},
                {value: '1', text: 'ปี 1'}, {value: '2', text: 'ปี 2'},
                {value: '3', text: 'ปี 3'}, {value: '4', text: 'ปี 4'}, {value: '5', text: 'ปี 5'}
              ], profile.year || '')}
              <div class="mb-4">
                <label for="profile-gpa" class="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                <input type="number" id="profile-gpa" value="${profile.gpa || ''}" placeholder="0.00 - 4.00" min="0" max="4" step="0.01"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              </div>
            </div>
          </div>

          <hr class="border-gray-200">

          <!-- Section: สาขา/แผนกที่ต้องการ -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">สาขาและแผนกที่ต้องการฝึกงาน</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="mb-4">
                <label for="profile-branch1" class="block text-sm font-medium text-gray-700 mb-1">สาขาที่ต้องการ ลำดับ 1</label>
                <select id="profile-branch1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                  ${storeOpts}
                </select>
              </div>
              <div class="mb-4">
                <label for="profile-dept1" class="block text-sm font-medium text-gray-700 mb-1">แผนกที่ต้องการ ลำดับ 1</label>
                <select id="profile-dept1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                  ${deptOpts}
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="mb-4">
                <label for="profile-branch2" class="block text-sm font-medium text-gray-700 mb-1">สาขาที่ต้องการ ลำดับ 2</label>
                <select id="profile-branch2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                  ${storeOpts}
                </select>
              </div>
              <div class="mb-4">
                <label for="profile-dept2" class="block text-sm font-medium text-gray-700 mb-1">แผนกที่ต้องการ ลำดับ 2</label>
                <select id="profile-dept2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                  ${deptOpts}
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="mb-4">
                <label for="profile-branch3" class="block text-sm font-medium text-gray-700 mb-1">สาขาที่ต้องการ ลำดับ 3</label>
                <select id="profile-branch3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                  ${storeOpts}
                </select>
              </div>
              <div class="mb-4">
                <label for="profile-dept3" class="block text-sm font-medium text-gray-700 mb-1">แผนกที่ต้องการ ลำดับ 3</label>
                <select id="profile-dept3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                  ${deptOpts}
                </select>
              </div>
            </div>
          </div>

          <hr class="border-gray-200">

          <!-- Section: ข้อมูลเพิ่มเติม -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">ข้อมูลเพิ่มเติม</h3>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">ทักษะ/ความสามารถ</label>
              ${buildProfileSkillsHtml(profile.skills || '')}
            </div>
            ${textareaField('profile-interests', 'ความสนใจ', profile.interests || '', 'สิ่งที่สนใจหรืออยากเรียนรู้', 2)}
          </div>

          <div class="flex justify-end pt-4 gap-3">
            <button type="submit" id="profile-save-btn"
              class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm">
              บันทึกข้อมูล
            </button>
          </div>
        </form>
        </div>

        <!-- Tab: เอกสาร -->
        <div id="tab-documents" class="profile-tab-panel hidden">
        <div class="p-6 space-y-6">
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">สถานะเอกสาร</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <span class="text-lg ${profile.cvFileUrl ? 'text-green-500' : 'text-gray-300'}">${profile.cvFileUrl ? '✓' : '○'}</span>
                <span class="text-sm ${profile.cvFileUrl ? 'text-green-700 font-medium' : 'text-gray-500'}">Resume/CV</span>
              </div>
              <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <span class="text-lg ${profile.transcriptFileUrl ? 'text-green-500' : 'text-gray-300'}">${profile.transcriptFileUrl ? '✓' : '○'}</span>
                <span class="text-sm ${profile.transcriptFileUrl ? 'text-green-700 font-medium' : 'text-gray-500'}">ผลการเรียน</span>
              </div>
              <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <span class="text-lg ${profile.idCardFileUrl ? 'text-green-500' : 'text-gray-300'}">${profile.idCardFileUrl ? '✓' : '○'}</span>
                <span class="text-sm ${profile.idCardFileUrl ? 'text-green-700 font-medium' : 'text-gray-500'}">บัตรประชาชน</span>
              </div>
              <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <span class="text-lg ${profile.photoFileUrl ? 'text-green-500' : 'text-gray-300'}">${profile.photoFileUrl ? '✓' : '○'}</span>
                <span class="text-sm ${profile.photoFileUrl ? 'text-green-700 font-medium' : 'text-gray-500'}">รูปถ่าย</span>
              </div>
            </div>
          </div>

          <form id="profile-doc-form" onsubmit="return false;">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
              <label for="profile-doc-cv" class="cursor-pointer block">
                <svg class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <p class="text-sm font-medium text-gray-700">Resume / CV</p>
                <p class="text-xs text-gray-400 mt-1">PDF, DOC (สูงสุด 10MB)</p>
                <input type="file" id="profile-doc-cv" accept=".pdf,.doc,.docx" class="hidden" onchange="handleProfileDocSelect(this, 'cv')">
              </label>
              <div id="profile-doc-cv-status" class="mt-2 text-xs">
                ${profile.cvFileUrl ? '<a href="' + profile.cvFileUrl + '" target="_blank" class="text-blue-600 hover:underline">ดูไฟล์ปัจจุบัน</a>' : '<span class="text-gray-400">ยังไม่ได้อัปโหลด</span>'}
              </div>
            </div>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
              <label for="profile-doc-transcript" class="cursor-pointer block">
                <svg class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                <p class="text-sm font-medium text-gray-700">ใบรับรองผลการเรียน</p>
                <p class="text-xs text-gray-400 mt-1">PDF (สูงสุด 10MB)</p>
                <input type="file" id="profile-doc-transcript" accept=".pdf" class="hidden" onchange="handleProfileDocSelect(this, 'transcript')">
              </label>
              <div id="profile-doc-transcript-status" class="mt-2 text-xs">
                ${profile.transcriptFileUrl ? '<a href="' + profile.transcriptFileUrl + '" target="_blank" class="text-blue-600 hover:underline">ดูไฟล์ปัจจุบัน</a>' : '<span class="text-gray-400">ยังไม่ได้อัปโหลด</span>'}
              </div>
            </div>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
              <label for="profile-doc-idcard" class="cursor-pointer block">
                <svg class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"/></svg>
                <p class="text-sm font-medium text-gray-700">สำเนาบัตรประชาชน</p>
                <p class="text-xs text-gray-400 mt-1">PDF, รูปภาพ (สูงสุด 10MB)</p>
                <input type="file" id="profile-doc-idcard" accept=".pdf,.jpg,.jpeg,.png" class="hidden" onchange="handleProfileDocSelect(this, 'idcard')">
              </label>
              <div id="profile-doc-idcard-status" class="mt-2 text-xs">
                ${profile.idCardFileUrl ? '<a href="' + profile.idCardFileUrl + '" target="_blank" class="text-blue-600 hover:underline">ดูไฟล์ปัจจุบัน</a>' : '<span class="text-gray-400">ยังไม่ได้อัปโหลด</span>'}
              </div>
            </div>
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
              <label for="profile-doc-photo" class="cursor-pointer block">
                <svg class="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <p class="text-sm font-medium text-gray-700">รูปถ่ายนักศึกษา</p>
                <p class="text-xs text-gray-400 mt-1">JPG, PNG (สูงสุด 5MB)</p>
                <input type="file" id="profile-doc-photo" accept=".jpg,.jpeg,.png" class="hidden" onchange="handleProfileDocSelect(this, 'photo')">
              </label>
              <div id="profile-doc-photo-status" class="mt-2 text-xs">
                ${profile.photoFileUrl ? '<a href="' + profile.photoFileUrl + '" target="_blank" class="text-blue-600 hover:underline">ดูไฟล์ปัจจุบัน</a>' : '<span class="text-gray-400">ยังไม่ได้อัปโหลด</span>'}
              </div>
            </div>
          </div>
          <div class="flex justify-end pt-4">
            <button type="button" onclick="saveProfileDocuments()"
              id="profile-doc-save-btn"
              class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm">
              อัปโหลดเอกสาร
            </button>
          </div>
          </form>
        </div>
        </div>

        <!-- Tab: ความปลอดภัย -->
        <div id="tab-security" class="profile-tab-panel hidden">
        <div class="p-6 space-y-6">
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">เปลี่ยนรหัสผ่าน</h3>
            <div class="max-w-md space-y-4">
              <div>
                <label for="profile-current-password" class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านปัจจุบัน</label>
                <input type="password" id="profile-current-password" placeholder="กรอกรหัสผ่านปัจจุบัน"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              </div>
              <div>
                <label for="profile-new-password" class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
                <input type="password" id="profile-new-password" placeholder="อย่างน้อย 6 ตัวอักษร"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              </div>
              <div>
                <label for="profile-confirm-password" class="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                <input type="password" id="profile-confirm-password" placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              </div>
              <div class="flex justify-end pt-2">
                <button type="button" onclick="changeProfilePassword()" id="profile-pw-btn"
                  class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm">
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>
            </div>
          </div>
          <hr class="border-gray-200">
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">ข้อมูลบัญชี</h3>
            <div class="bg-gray-50 rounded-lg p-4 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">อีเมล</span>
                <span class="text-gray-700 font-medium">${profile.email || '-'}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">บทบาท</span>
                <span class="text-gray-700 font-medium">${profile.role === 'student' ? 'นักศึกษา' : profile.role || '-'}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">สถานะ</span>
                <span class="inline-flex items-center gap-1 text-green-700"><span class="w-2 h-2 bg-green-500 rounded-full"></span> ใช้งานอยู่</span>
              </div>
            </div>
          </div>
        </div>
        </div>

      </div>
    `;

    // Set preferred branch/dept select values after DOM render
    var prefFields = [
      ['profile-branch1', profile.preferredBranch1],
      ['profile-branch2', profile.preferredBranch2],
      ['profile-branch3', profile.preferredBranch3],
      ['profile-dept1', profile.preferredDept1],
      ['profile-dept2', profile.preferredDept2],
      ['profile-dept3', profile.preferredDept3]
    ];
    for (var pf = 0; pf < prefFields.length; pf++) {
      var el = document.getElementById(prefFields[pf][0]);
      if (el && prefFields[pf][1]) el.value = prefFields[pf][1];
    }

    // Pre-populate cascading dropdowns with existing profile data
    if (profile.currentProvince) {
      cascadeDistrict('profile-current-district', profile.currentProvince, profile.currentDistrict || '');
      if (profile.currentDistrict) {
        cascadeSubdistrict('profile-current-subdistrict', profile.currentProvince, profile.currentDistrict, profile.currentSubdistrict || '');
      }
    }
    if (profile.idCardProvince) {
      cascadeDistrict('profile-idcard-district', profile.idCardProvince, profile.idCardDistrict || '');
      if (profile.idCardDistrict) {
        cascadeSubdistrict('profile-idcard-subdistrict', profile.idCardProvince, profile.idCardDistrict, profile.idCardSubdistrict || '');
      }
    }

    // Same address checkbox handler
    document.getElementById('profile-same-address').addEventListener('change', function() {
      var idcardFields = document.querySelectorAll('.profile-idcard-field');
      if (this.checked) {
        document.getElementById('profile-idcard-house-no').value = document.getElementById('profile-current-house-no').value;
        document.getElementById('profile-idcard-village').value = document.getElementById('profile-current-village').value;
        document.getElementById('profile-idcard-soi').value = document.getElementById('profile-current-soi').value;
        document.getElementById('profile-idcard-road').value = document.getElementById('profile-current-road').value;
        var cProv = document.getElementById('profile-current-province').value;
        document.getElementById('profile-idcard-province').value = cProv;
        cascadeDistrict('profile-idcard-district', cProv, document.getElementById('profile-current-district').value);
        cascadeSubdistrict('profile-idcard-subdistrict', cProv, document.getElementById('profile-current-district').value, document.getElementById('profile-current-subdistrict').value);
        document.getElementById('profile-idcard-postcode').value = document.getElementById('profile-current-postcode').value;
        for (var i = 0; i < idcardFields.length; i++) {
          idcardFields[i].disabled = true;
          idcardFields[i].classList.add('bg-gray-50', 'text-gray-500');
        }
      } else {
        for (var j = 0; j < idcardFields.length; j++) {
          idcardFields[j].disabled = false;
          idcardFields[j].classList.remove('bg-gray-50', 'text-gray-500');
        }
      }
    });

    // Cascading: current address
    document.getElementById('profile-current-province').addEventListener('change', function() {
      cascadeDistrict('profile-current-district', this.value);
      document.getElementById('profile-current-subdistrict').innerHTML = '<option value="">-- เลือกแขวง/ตำบล --</option>';
      document.getElementById('profile-current-postcode').value = '';
      if (document.getElementById('profile-same-address').checked) {
        document.getElementById('profile-idcard-province').value = this.value;
        cascadeDistrict('profile-idcard-district', this.value);
        document.getElementById('profile-idcard-subdistrict').innerHTML = '<option value="">-- เลือกแขวง/ตำบล --</option>';
        document.getElementById('profile-idcard-postcode').value = '';
      }
    });
    document.getElementById('profile-current-district').addEventListener('change', function() {
      var prov = document.getElementById('profile-current-province').value;
      cascadeSubdistrict('profile-current-subdistrict', prov, this.value);
      document.getElementById('profile-current-postcode').value = '';
      if (document.getElementById('profile-same-address').checked) {
        document.getElementById('profile-idcard-district').value = this.value;
        cascadeSubdistrict('profile-idcard-subdistrict', prov, this.value);
        document.getElementById('profile-idcard-postcode').value = '';
      }
    });
    document.getElementById('profile-current-subdistrict').addEventListener('change', function() {
      var prov = document.getElementById('profile-current-province').value;
      var dist = document.getElementById('profile-current-district').value;
      var postcode = getThaiPostcode(prov, dist, this.value);
      document.getElementById('profile-current-postcode').value = postcode;
      if (document.getElementById('profile-same-address').checked) {
        document.getElementById('profile-idcard-subdistrict').value = this.value;
        document.getElementById('profile-idcard-postcode').value = postcode;
      }
    });

    // Cascading: idCard address
    document.getElementById('profile-idcard-province').addEventListener('change', function() {
      cascadeDistrict('profile-idcard-district', this.value);
      document.getElementById('profile-idcard-subdistrict').innerHTML = '<option value="">-- เลือกแขวง/ตำบล --</option>';
      document.getElementById('profile-idcard-postcode').value = '';
    });
    document.getElementById('profile-idcard-district').addEventListener('change', function() {
      cascadeSubdistrict('profile-idcard-subdistrict', document.getElementById('profile-idcard-province').value, this.value);
      document.getElementById('profile-idcard-postcode').value = '';
    });
    document.getElementById('profile-idcard-subdistrict').addEventListener('change', function() {
      document.getElementById('profile-idcard-postcode').value = getThaiPostcode(
        document.getElementById('profile-idcard-province').value,
        document.getElementById('profile-idcard-district').value,
        this.value
      );
    });

    // Skills "อื่นๆ" checkbox toggle
    var profileSkillOtherCb = document.getElementById('profile-skill-other-cb');
    if (profileSkillOtherCb) {
      profileSkillOtherCb.addEventListener('change', function() {
        var otherInput = document.getElementById('profile-skill-other-text');
        otherInput.disabled = !this.checked;
        if (!this.checked) otherInput.value = '';
      });
    }

    window._profileDocFiles = {};

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('profile-save-btn');
      btn.disabled = true;
      btn.textContent = 'กำลังบันทึก...';

      const fName = document.getElementById('profile-first-name').value.trim();
      const lName = document.getElementById('profile-last-name').value.trim();

      var sameAddr = document.getElementById('profile-same-address').checked;
      var cHouseNo = document.getElementById('profile-current-house-no').value.trim();
      var cVillage = document.getElementById('profile-current-village').value.trim();
      var cSoi = document.getElementById('profile-current-soi').value.trim();
      var cRoad = document.getElementById('profile-current-road').value.trim();
      var cSubdistrict = document.getElementById('profile-current-subdistrict').value.trim();
      var cDistrict = document.getElementById('profile-current-district').value.trim();
      var cProvince = document.getElementById('profile-current-province').value;
      var cPostcode = document.getElementById('profile-current-postcode').value.trim();
      var iHouseNo, iVillage, iSoi, iRoad, iSubdistrict, iDistrict, iProvince, iPostcode;
      if (sameAddr) {
        iHouseNo = cHouseNo; iVillage = cVillage; iSoi = cSoi; iRoad = cRoad;
        iSubdistrict = cSubdistrict; iDistrict = cDistrict; iProvince = cProvince; iPostcode = cPostcode;
      } else {
        iHouseNo = document.getElementById('profile-idcard-house-no').value.trim();
        iVillage = document.getElementById('profile-idcard-village').value.trim();
        iSoi = document.getElementById('profile-idcard-soi').value.trim();
        iRoad = document.getElementById('profile-idcard-road').value.trim();
        iSubdistrict = document.getElementById('profile-idcard-subdistrict').value.trim();
        iDistrict = document.getElementById('profile-idcard-district').value.trim();
        iProvince = document.getElementById('profile-idcard-province').value;
        iPostcode = document.getElementById('profile-idcard-postcode').value.trim();
      }
      var currentAddressStr = composeAddressString(cHouseNo, cVillage, cSoi, cRoad, cSubdistrict, cDistrict, cProvince, cPostcode);
      var idCardAddressStr = composeAddressString(iHouseNo, iVillage, iSoi, iRoad, iSubdistrict, iDistrict, iProvince, iPostcode);

      const data = {
        userId: user.id,
        prefix: document.getElementById('profile-prefix').value,
        name: fName + ' ' + lName,
        firstName: fName,
        lastName: lName,
        nickname: document.getElementById('profile-nickname').value.trim(),
        studentId: document.getElementById('profile-student-id').value.trim(),
        phone: document.getElementById('profile-phone').value.trim(),
        idCardNumber: document.getElementById('profile-id-card').value.trim(),
        militaryStatus: document.getElementById('profile-military').value,
        medicalCondition: document.getElementById('profile-medical').value.trim(),
        currentHouseNo: cHouseNo,
        currentVillage: cVillage,
        currentSoi: cSoi,
        currentRoad: cRoad,
        currentSubdistrict: cSubdistrict,
        currentDistrict: cDistrict,
        currentProvince: cProvince,
        currentPostcode: cPostcode,
        idCardHouseNo: iHouseNo,
        idCardVillage: iVillage,
        idCardSoi: iSoi,
        idCardRoad: iRoad,
        idCardSubdistrict: iSubdistrict,
        idCardDistrict: iDistrict,
        idCardProvince: iProvince,
        idCardPostcode: iPostcode,
        currentAddress: currentAddressStr,
        idCardAddress: idCardAddressStr,
        address: currentAddressStr,
        university: document.getElementById('profile-university').value.trim(),
        faculty: document.getElementById('profile-faculty').value.trim(),
        major: document.getElementById('profile-major').value.trim(),
        year: document.getElementById('profile-year').value,
        gpa: document.getElementById('profile-gpa').value,
        preferredBranch1: document.getElementById('profile-branch1').value,
        preferredBranch2: document.getElementById('profile-branch2').value,
        preferredBranch3: document.getElementById('profile-branch3').value,
        preferredDept1: document.getElementById('profile-dept1').value,
        preferredDept2: document.getElementById('profile-dept2').value,
        preferredDept3: document.getElementById('profile-dept3').value,
        skills: collectProfileSkillsValue(),
        interests: document.getElementById('profile-interests').value.trim()
      };

      try {
        const docFieldMap = { cv: 'cv', transcript: 'transcript', idcard: 'idCard', photo: 'photo' };
        for (const [docType, file] of Object.entries(window._profileDocFiles)) {
          const statusEl = document.getElementById('profile-doc-' + docType + '-status');
          statusEl.innerHTML = '<span class="text-blue-500">กำลังอัปโหลด...</span>';
          try {
            const base64 = await fileToBase64(file);
            const uploadResult = await callApiPost('uploadFile', {
              fileName: file.name,
              fileData: base64,
              mimeType: file.type,
              subfolder: 'profiles'
            });
            if (uploadResult.success !== false && uploadResult.data) {
              const fieldPrefix = docFieldMap[docType] || docType;
              data[fieldPrefix + 'FileUrl'] = uploadResult.data.fileUrl;
              data[fieldPrefix + 'FileName'] = uploadResult.data.fileName;
              statusEl.innerHTML = '<span class="text-green-600">อัปโหลดสำเร็จ</span>';
            }
          } catch (err) {
            statusEl.innerHTML = '<span class="text-red-500">อัปโหลดล้มเหลว</span>';
          }
        }

        const result = await callApiPost('updateProfile', data);
        if (result.success) {
          const updatedUser = { ...user, name: data.name, firstName: fName, lastName: lName };
          setToken(updatedUser);
          showToast('บันทึกข้อมูลสำเร็จ', 'success');
          window._profileDocFiles = {};
        } else {
          showToast(result.message || 'เกิดข้อผิดพลาด', 'error');
        }
      } catch (error) {
        console.error('Profile save error:', error);
        showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'บันทึกข้อมูล';
      }
    });

  } catch (error) {
    hideLoading();
    console.error('Profile load error:', error);
    document.getElementById('profile-content').innerHTML = `
      <div class="bg-red-50 text-red-600 p-4 rounded-lg text-sm">ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่</div>
    `;
  }
}

function handleProfileDocSelect(input, docType) {
  const file = input.files[0];
  if (!file) return;

  const maxSize = docType === 'photo' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    showToast('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ' + (maxSize / 1024 / 1024) + 'MB)', 'error');
    input.value = '';
    return;
  }

  window._profileDocFiles = window._profileDocFiles || {};
  window._profileDocFiles[docType] = file;
  const statusEl = document.getElementById('profile-doc-' + docType + '-status');
  statusEl.innerHTML = '<span class="text-blue-600">' + file.name + '</span>';
}

async function saveProfileDocuments() {
  var user = getCurrentUser();
  var btn = document.getElementById('profile-doc-save-btn');
  if (!window._profileDocFiles || Object.keys(window._profileDocFiles).length === 0) {
    showToast('กรุณาเลือกไฟล์ก่อน', 'error');
    return;
  }
  btn.disabled = true;
  btn.textContent = 'กำลังอัปโหลด...';
  var data = { userId: user.id };
  var docFieldMap = { cv: 'cv', transcript: 'transcript', idcard: 'idCard', photo: 'photo' };
  try {
    for (var docType in window._profileDocFiles) {
      var file = window._profileDocFiles[docType];
      var statusEl = document.getElementById('profile-doc-' + docType + '-status');
      if (statusEl) statusEl.innerHTML = '<span class="text-blue-500">กำลังอัปโหลด...</span>';
      try {
        var base64 = await fileToBase64(file);
        var uploadResult = await callApiPost('uploadFile', {
          fileName: file.name, fileData: base64, mimeType: file.type, subfolder: 'profiles'
        });
        if (uploadResult.success !== false && uploadResult.data) {
          var fieldPrefix = docFieldMap[docType] || docType;
          data[fieldPrefix + 'FileUrl'] = uploadResult.data.fileUrl;
          data[fieldPrefix + 'FileName'] = uploadResult.data.fileName;
          if (statusEl) statusEl.innerHTML = '<span class="text-green-600">อัปโหลดสำเร็จ</span>';
        }
      } catch (err) {
        if (statusEl) statusEl.innerHTML = '<span class="text-red-500">อัปโหลดล้มเหลว</span>';
      }
    }
    if (Object.keys(data).length > 1) {
      await callApiPost('updateProfile', data);
      showToast('อัปโหลดเอกสารสำเร็จ', 'success');
      window._profileDocFiles = {};
    }
  } catch (error) {
    showToast('เกิดข้อผิดพลาดในการอัปโหลด', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'อัปโหลดเอกสาร';
  }
}

async function changeProfilePassword() {
  var user = getCurrentUser();
  var currentPw = document.getElementById('profile-current-password').value;
  var newPw = document.getElementById('profile-new-password').value;
  var confirmPw = document.getElementById('profile-confirm-password').value;
  if (!currentPw) { showToast('กรุณากรอกรหัสผ่านปัจจุบัน', 'error'); return; }
  if (!newPw || newPw.length < 6) { showToast('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร', 'error'); return; }
  if (newPw !== confirmPw) { showToast('รหัสผ่านใหม่ไม่ตรงกัน', 'error'); return; }
  var btn = document.getElementById('profile-pw-btn');
  btn.disabled = true;
  btn.textContent = 'กำลังเปลี่ยน...';
  try {
    var result = await callApiPost('changePassword', {
      userId: user.id, currentPassword: currentPw, newPassword: newPw
    });
    if (result.success) {
      showToast('เปลี่ยนรหัสผ่านสำเร็จ', 'success');
      document.getElementById('profile-current-password').value = '';
      document.getElementById('profile-new-password').value = '';
      document.getElementById('profile-confirm-password').value = '';
    } else {
      showToast(result.message || 'เกิดข้อผิดพลาด', 'error');
    }
  } catch (error) {
    showToast('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'เปลี่ยนรหัสผ่าน';
  }
}
