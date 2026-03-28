// ==================== หน้าสมัครสมาชิก ====================

function renderRegister() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 fade-in">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">สมัครสมาชิก</h1>
          <p class="text-gray-500 mt-1 text-sm">กรอกข้อมูลเพื่อลงทะเบียนเข้าใช้งานระบบ</p>
        </div>

        <div id="register-error" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"></div>
        <div id="register-success" class="hidden bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm"></div>

        <form id="register-form" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-name" class="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล <span class="text-red-500">*</span></label>
              <input type="text" id="reg-name" placeholder="ชื่อ นามสกุล" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div>
              <label for="reg-student-id" class="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา <span class="text-red-500">*</span></label>
              <input type="text" id="reg-student-id" placeholder="เช่น 6401234567" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
          </div>

          <div>
            <label for="reg-email" class="block text-sm font-medium text-gray-700 mb-1">อีเมล <span class="text-red-500">*</span></label>
            <input type="email" id="reg-email" placeholder="example@email.com" required
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-password" class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน <span class="text-red-500">*</span></label>
              <input type="password" id="reg-password" placeholder="อย่างน้อย 6 ตัวอักษร" required minlength="6"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div>
              <label for="reg-confirm-password" class="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน <span class="text-red-500">*</span></label>
              <input type="password" id="reg-confirm-password" placeholder="กรอกรหัสผ่านอีกครั้ง" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
          </div>

          <div>
            <label for="reg-university" class="block text-sm font-medium text-gray-700 mb-1">มหาวิทยาลัย <span class="text-red-500">*</span></label>
            <input type="text" id="reg-university" placeholder="ชื่อมหาวิทยาลัย" required
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="reg-faculty" class="block text-sm font-medium text-gray-700 mb-1">คณะ <span class="text-red-500">*</span></label>
              <input type="text" id="reg-faculty" placeholder="ชื่อคณะ" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
            <div>
              <label for="reg-major" class="block text-sm font-medium text-gray-700 mb-1">สาขา <span class="text-red-500">*</span></label>
              <input type="text" id="reg-major" placeholder="ชื่อสาขาวิชา" required
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
            </div>
          </div>

          <div>
            <label for="reg-year" class="block text-sm font-medium text-gray-700 mb-1">ชั้นปี <span class="text-red-500">*</span></label>
            <select id="reg-year" required
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              <option value="">-- เลือกชั้นปี --</option>
              <option value="1">ปี 1</option>
              <option value="2">ปี 2</option>
              <option value="3">ปี 3</option>
              <option value="4">ปี 4</option>
              <option value="5">ปี 5</option>
            </select>
          </div>

          <button type="submit" id="register-btn"
            class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
            สมัครสมาชิก
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500">
            มีบัญชีอยู่แล้ว?
            <a href="#login" class="text-primary-600 hover:text-primary-700 font-medium">เข้าสู่ระบบ</a>
          </p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    const btn = document.getElementById('register-btn');

    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    if (password !== confirmPassword) {
      errorDiv.textContent = 'รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่';
      errorDiv.classList.remove('hidden');
      successDiv.classList.add('hidden');
      return;
    }

    const data = {
      name: document.getElementById('reg-name').value.trim(),
      studentId: document.getElementById('reg-student-id').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      password: password,
      university: document.getElementById('reg-university').value.trim(),
      faculty: document.getElementById('reg-faculty').value.trim(),
      major: document.getElementById('reg-major').value.trim(),
      year: document.getElementById('reg-year').value
    };

    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');
    btn.disabled = true;
    btn.textContent = 'กำลังสมัครสมาชิก...';

    try {
      const result = await callApi('register', data);
      if (result.success) {
        successDiv.textContent = 'สมัครสมาชิกสำเร็จ! กำลังนำไปหน้าเข้าสู่ระบบ...';
        successDiv.classList.remove('hidden');
        showToast('สมัครสมาชิกสำเร็จ', 'success');
        setTimeout(() => navigateTo('login'), 2000);
      } else {
        errorDiv.textContent = result.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
        errorDiv.classList.remove('hidden');
      }
    } catch (error) {
      errorDiv.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
      errorDiv.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = 'สมัครสมาชิก';
    }
  });
}
