// ==================== หน้าข้อมูลส่วนตัวนักศึกษา ====================

var _profileStoreList = [];
var _profileDeptList = [];

async function renderStudentProfile() {
  if (!checkAuth()) return;
  const user = getCurrentUser();
  const content = initLayout(user);

  content.innerHTML = `
    <div class="fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">ข้อมูลส่วนตัว</h2>
      <div id="profile-content" class="max-w-3xl">
        <div class="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
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
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
              ${profile.photoFileUrl
                ? '<img src="' + driveImageUrl(profile.photoFileUrl) + '" alt="Photo" class="w-full h-full object-cover">'
                : '<span class="text-primary-700 font-bold text-2xl">' + (firstName || 'U').charAt(0).toUpperCase() + '</span>'}
            </div>
            <div class="text-white">
              <h3 class="text-xl font-bold">${profile.prefix ? profile.prefix + ' ' : ''}${firstName} ${lastName}</h3>
              <p class="text-primary-100 text-sm">${profile.email || '-'}</p>
            </div>
          </div>
        </div>

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
            ${inputField('profile-email', 'อีเมล', 'email', profile.email || '')}
          </div>

          <hr class="border-gray-200">

          <!-- Section: ที่อยู่ -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">ที่อยู่</h3>
            <p class="text-xs text-gray-500 mb-2 font-medium">ที่อยู่ปัจจุบัน</p>
            ${textareaField('profile-current-address', 'ที่อยู่', profile.currentAddress || profile.address || '', 'บ้านเลขที่ ซอย ถนน ตำบล อำเภอ', 2)}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${inputField('profile-current-province', 'จังหวัด', 'text', profile.currentProvince || '', 'จังหวัด', false)}
              ${inputField('profile-current-postcode', 'รหัสไปรษณีย์', 'text', profile.currentPostcode || '', 'รหัสไปรษณีย์', false)}
            </div>
            <p class="text-xs text-gray-500 mb-2 font-medium mt-2">ที่อยู่ตามบัตรประชาชน</p>
            ${textareaField('profile-idcard-address', 'ที่อยู่', profile.idCardAddress || '', 'บ้านเลขที่ ซอย ถนน ตำบล อำเภอ', 2)}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${inputField('profile-idcard-province', 'จังหวัด', 'text', profile.idCardProvince || '', 'จังหวัด', false)}
              ${inputField('profile-idcard-postcode', 'รหัสไปรษณีย์', 'text', profile.idCardPostcode || '', 'รหัสไปรษณีย์', false)}
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
            ${textareaField('profile-skills', 'ทักษะ/ความสามารถ', profile.skills || '', 'เช่น JavaScript, Python, Design', 2)}
            ${textareaField('profile-interests', 'ความสนใจ', profile.interests || '', 'สิ่งที่สนใจหรืออยากเรียนรู้', 2)}
          </div>

          <hr class="border-gray-200">

          <!-- Section: เอกสาร -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">เอกสารประกอบ</h3>
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">สถานะเอกสาร</h4>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div class="flex items-center gap-2">
                  <span class="${profile.cvFileUrl ? 'text-green-500' : 'text-gray-300'}">${profile.cvFileUrl ? '✓' : '○'}</span>
                  <span class="text-sm ${profile.cvFileUrl ? 'text-green-700' : 'text-gray-500'}">Resume/CV</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="${profile.transcriptFileUrl ? 'text-green-500' : 'text-gray-300'}">${profile.transcriptFileUrl ? '✓' : '○'}</span>
                  <span class="text-sm ${profile.transcriptFileUrl ? 'text-green-700' : 'text-gray-500'}">ใบรับรองผลการเรียน</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="${profile.idCardFileUrl ? 'text-green-500' : 'text-gray-300'}">${profile.idCardFileUrl ? '✓' : '○'}</span>
                  <span class="text-sm ${profile.idCardFileUrl ? 'text-green-700' : 'text-gray-500'}">สำเนาบัตรประชาชน</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="${profile.photoFileUrl ? 'text-green-500' : 'text-gray-300'}">${profile.photoFileUrl ? '✓' : '○'}</span>
                  <span class="text-sm ${profile.photoFileUrl ? 'text-green-700' : 'text-gray-500'}">รูปถ่าย</span>
                </div>
              </div>
            </div>
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
          </div>

          <div class="flex justify-end pt-4 gap-3">
            <button type="submit" id="profile-save-btn"
              class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm">
              บันทึกข้อมูล
            </button>
          </div>
        </form>
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

    window._profileDocFiles = {};

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('profile-save-btn');
      btn.disabled = true;
      btn.textContent = 'กำลังบันทึก...';

      const fName = document.getElementById('profile-first-name').value.trim();
      const lName = document.getElementById('profile-last-name').value.trim();

      const data = {
        userId: user.id,
        prefix: document.getElementById('profile-prefix').value,
        name: fName + ' ' + lName,
        firstName: fName,
        lastName: lName,
        nickname: document.getElementById('profile-nickname').value.trim(),
        studentId: document.getElementById('profile-student-id').value.trim(),
        email: document.getElementById('profile-email').value.trim(),
        phone: document.getElementById('profile-phone').value.trim(),
        idCardNumber: document.getElementById('profile-id-card').value.trim(),
        militaryStatus: document.getElementById('profile-military').value,
        medicalCondition: document.getElementById('profile-medical').value.trim(),
        currentAddress: document.getElementById('profile-current-address').value.trim(),
        currentProvince: document.getElementById('profile-current-province').value.trim(),
        currentPostcode: document.getElementById('profile-current-postcode').value.trim(),
        idCardAddress: document.getElementById('profile-idcard-address').value.trim(),
        idCardProvince: document.getElementById('profile-idcard-province').value.trim(),
        idCardPostcode: document.getElementById('profile-idcard-postcode').value.trim(),
        address: document.getElementById('profile-current-address').value.trim(),
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
        skills: document.getElementById('profile-skills').value.trim(),
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
          const updatedUser = { ...user, name: data.name, firstName: fName, lastName: lName, email: data.email };
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

  window._profileDocFiles[docType] = file;
  const statusEl = document.getElementById('profile-doc-' + docType + '-status');
  statusEl.innerHTML = '<span class="text-blue-600">' + file.name + '</span>';
}
