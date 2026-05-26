// ==================== หน้าข้อมูลส่วนตัวนักศึกษา ====================

async function renderStudentProfile() {
  if (!checkAuth()) return;
  const user = getCurrentUser();
  const content = initLayout(user);

  content.innerHTML = `
    <div class="fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">ข้อมูลส่วนตัว</h2>
      <div id="profile-content" class="max-w-2xl">
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

    document.getElementById('profile-content').innerHTML = `
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="bg-gradient-to-r from-primary-500 to-primary-700 p-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span class="text-primary-700 font-bold text-2xl">${(profile.name || 'U').charAt(0).toUpperCase()}</span>
            </div>
            <div class="text-white">
              <h3 class="text-xl font-bold">${profile.name || '-'}</h3>
              <p class="text-primary-100 text-sm">${profile.email || '-'}</p>
            </div>
          </div>
        </div>

        <form id="profile-form" class="p-6 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${inputField('profile-name', 'ชื่อ-นามสกุล', 'text', profile.name || '')}
            ${inputField('profile-student-id', 'รหัสนักศึกษา', 'text', profile.studentId || '')}
          </div>
          ${inputField('profile-email', 'อีเมล', 'email', profile.email || '')}
          ${inputField('profile-phone', 'เบอร์โทรศัพท์', 'tel', profile.phone || '', '0xx-xxx-xxxx', false)}
          ${inputField('profile-university', 'มหาวิทยาลัย', 'text', profile.university || '')}
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
          ${textareaField('profile-address', 'ที่อยู่', profile.address || '', 'ที่อยู่ปัจจุบัน', 3)}
          ${textareaField('profile-skills', 'ทักษะ/ความสามารถ', profile.skills || '', 'เช่น JavaScript, Python, Design', 2)}

          <div class="flex justify-end pt-4">
            <button type="submit" id="profile-save-btn"
              class="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm">
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('profile-save-btn');
      btn.disabled = true;
      btn.textContent = 'กำลังบันทึก...';

      const data = {
        userId: user.id,
        name: document.getElementById('profile-name').value.trim(),
        studentId: document.getElementById('profile-student-id').value.trim(),
        email: document.getElementById('profile-email').value.trim(),
        phone: document.getElementById('profile-phone').value.trim(),
        university: document.getElementById('profile-university').value.trim(),
        faculty: document.getElementById('profile-faculty').value.trim(),
        major: document.getElementById('profile-major').value.trim(),
        year: document.getElementById('profile-year').value,
        gpa: document.getElementById('profile-gpa').value,
        address: document.getElementById('profile-address').value.trim(),
        skills: document.getElementById('profile-skills').value.trim()
      };

      try {
        const result = await callApiPost('updateProfile', data);
        if (result.success) {
          // อัปเดต localStorage
          const updatedUser = { ...user, name: data.name, email: data.email };
          setToken(updatedUser);
          showToast('บันทึกข้อมูลสำเร็จ', 'success');
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
