// ==================== หน้าข้อมูลส่วนตัวนักศึกษา ====================

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
    const result = await callApi('getUserProfile', { userId: user.id });
    hideLoading();

    const profile = result.success ? result.data : user;
    const firstName = profile.firstName || (profile.name ? profile.name.split(' ')[0] : '');
    const lastName = profile.lastName || (profile.name ? profile.name.split(' ').slice(1).join(' ') : '');

    document.getElementById('profile-content').innerHTML = `
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="bg-gradient-to-r from-primary-500 to-primary-700 p-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span class="text-primary-700 font-bold text-2xl">${(firstName || 'U').charAt(0).toUpperCase()}</span>
            </div>
            <div class="text-white">
              <h3 class="text-xl font-bold">${firstName} ${lastName}</h3>
              <p class="text-primary-100 text-sm">${profile.email || '-'}</p>
            </div>
          </div>
        </div>

        <form id="profile-form" class="p-6 space-y-6">

          <!-- Section: ข้อมูลส่วนตัว -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">ข้อมูลส่วนตัว</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label for="profile-employee-id" class="block text-sm font-medium text-gray-700 mb-1">รหัสพนักงาน</label>
                <input type="text" id="profile-employee-id" value="${profile.employeeId || ''}" placeholder="รหัสพนักงาน Makro"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              </div>
            </div>
            ${inputField('profile-email', 'อีเมล', 'email', profile.email || '')}
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

          <!-- Section: ข้อมูลเพิ่มเติม -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">ข้อมูลเพิ่มเติม</h3>
            ${textareaField('profile-address', 'ที่อยู่', profile.address || '', 'ที่อยู่ปัจจุบัน', 3)}
            ${textareaField('profile-skills', 'ทักษะ/ความสามารถ', profile.skills || '', 'เช่น JavaScript, Python, Design', 2)}
            ${textareaField('profile-interests', 'ความสนใจ', profile.interests || '', 'สิ่งที่สนใจหรืออยากเรียนรู้', 2)}
          </div>

          <hr class="border-gray-200">

          <!-- Section: เอกสาร -->
          <div>
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">เอกสารประกอบ</h3>
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
        name: fName + ' ' + lName,
        firstName: fName,
        lastName: lName,
        nickname: document.getElementById('profile-nickname').value.trim(),
        employeeId: document.getElementById('profile-employee-id').value.trim(),
        studentId: document.getElementById('profile-student-id').value.trim(),
        email: document.getElementById('profile-email').value.trim(),
        phone: document.getElementById('profile-phone').value.trim(),
        university: document.getElementById('profile-university').value.trim(),
        faculty: document.getElementById('profile-faculty').value.trim(),
        major: document.getElementById('profile-major').value.trim(),
        year: document.getElementById('profile-year').value,
        gpa: document.getElementById('profile-gpa').value,
        address: document.getElementById('profile-address').value.trim(),
        skills: document.getElementById('profile-skills').value.trim(),
        interests: document.getElementById('profile-interests').value.trim()
      };

      try {
        // Upload documents first if any selected
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
              data[docType + 'FileUrl'] = uploadResult.data.fileUrl;
              data[docType + 'FileName'] = uploadResult.data.fileName;
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
        showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'บันทึกข้อมูล';
      }
    });

  } catch (error) {
    hideLoading();
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
