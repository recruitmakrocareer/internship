// ==================== หน้าสมัครสมาชิก ====================

function renderRegister() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 fade-in my-8">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold text-gray-800">สมัครสมาชิก</h1>
          <p class="text-gray-500 mt-1 text-sm">ระบบจัดการฝึกงาน Makro Fresh Food - กรอกข้อมูลเพื่อลงทะเบียนเข้าใช้งาน</p>
        </div>

        <div id="register-error" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"></div>
        <div id="register-success" class="hidden bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm"></div>

        <form id="register-form" class="space-y-6">

          <!-- ==================== Section 1: ข้อมูลบัญชี ==================== -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">1</span>
              <h2 class="text-lg font-semibold text-gray-800">ข้อมูลบัญชี</h2>
            </div>
            <div class="space-y-4 pl-9">
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
            </div>
          </div>

          <hr class="border-gray-200">

          <!-- ==================== Section 2: ข้อมูลส่วนตัว ==================== -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">2</span>
              <h2 class="text-lg font-semibold text-gray-800">ข้อมูลส่วนตัว</h2>
            </div>
            <div class="space-y-4 pl-9">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="reg-first-name" class="block text-sm font-medium text-gray-700 mb-1">ชื่อจริง <span class="text-red-500">*</span></label>
                  <input type="text" id="reg-first-name" placeholder="ชื่อจริง" required
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                </div>
                <div>
                  <label for="reg-last-name" class="block text-sm font-medium text-gray-700 mb-1">นามสกุล <span class="text-red-500">*</span></label>
                  <input type="text" id="reg-last-name" placeholder="นามสกุล" required
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label for="reg-nickname" class="block text-sm font-medium text-gray-700 mb-1">ชื่อเล่น</label>
                  <input type="text" id="reg-nickname" placeholder="ชื่อเล่น"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                </div>
                <div>
                  <label for="reg-birth-date" class="block text-sm font-medium text-gray-700 mb-1">วันเกิด</label>
                  <input type="date" id="reg-birth-date"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                </div>
                <div>
                  <label for="reg-phone" class="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                  <input type="tel" id="reg-phone" placeholder="0xx-xxx-xxxx"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                </div>
              </div>
              <div>
                <label for="reg-id-card" class="block text-sm font-medium text-gray-700 mb-1">เลขบัตรประชาชน</label>
                <input type="text" id="reg-id-card" placeholder="เลข 13 หลัก" maxlength="13" pattern="\\d{13}"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
              </div>
            </div>
          </div>

          <hr class="border-gray-200">

          <!-- ==================== Section 3: ข้อมูลการศึกษา ==================== -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">3</span>
              <h2 class="text-lg font-semibold text-gray-800">ข้อมูลการศึกษา</h2>
            </div>
            <div class="space-y-4 pl-9">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="reg-student-id" class="block text-sm font-medium text-gray-700 mb-1">รหัสนักศึกษา <span class="text-red-500">*</span></label>
                  <input type="text" id="reg-student-id" placeholder="เช่น 6401234567" required
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                </div>
                <div>
                  <label for="reg-university" class="block text-sm font-medium text-gray-700 mb-1">มหาวิทยาลัย <span class="text-red-500">*</span></label>
                  <input type="text" id="reg-university" placeholder="ชื่อมหาวิทยาลัย" required
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                </div>
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
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div>
                  <label for="reg-gpa" class="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                  <input type="number" id="reg-gpa" placeholder="เช่น 3.25" step="0.01" min="0" max="4"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                </div>
              </div>
            </div>
          </div>

          <hr class="border-gray-200">

          <!-- ==================== Section 4: ข้อมูลการฝึกงาน ==================== -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">4</span>
              <h2 class="text-lg font-semibold text-gray-800">ข้อมูลการฝึกงาน</h2>
            </div>
            <div class="space-y-4 pl-9">
              <div>
                <label for="reg-internship-type" class="block text-sm font-medium text-gray-700 mb-1">ประเภทการฝึกงาน</label>
                <select id="reg-internship-type"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                  <option value="">-- เลือกประเภท --</option>
                  <option value="สหกิจศึกษา">สหกิจศึกษา</option>
                  <option value="ฝึกงานทั่วไป">ฝึกงานทั่วไป</option>
                </select>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label for="reg-start-date" class="block text-sm font-medium text-gray-700 mb-1">วันเริ่มฝึกงาน</label>
                  <input type="date" id="reg-start-date"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                </div>
                <div>
                  <label for="reg-end-date" class="block text-sm font-medium text-gray-700 mb-1">วันสิ้นสุดฝึกงาน</label>
                  <input type="date" id="reg-end-date"
                    class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
                </div>
              </div>
            </div>
          </div>

          <hr class="border-gray-200">

          <!-- ==================== Section 5: ข้อมูลเพิ่มเติม ==================== -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <span class="flex items-center justify-center w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">5</span>
              <h2 class="text-lg font-semibold text-gray-800">ข้อมูลเพิ่มเติม</h2>
            </div>
            <div class="space-y-4 pl-9">
              <div>
                <label for="reg-address" class="block text-sm font-medium text-gray-700 mb-1">ที่อยู่ปัจจุบัน</label>
                <textarea id="reg-address" rows="2" placeholder="ที่อยู่ปัจจุบัน"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"></textarea>
              </div>
              <div>
                <label for="reg-skills" class="block text-sm font-medium text-gray-700 mb-1">ทักษะ/ความสามารถ</label>
                <textarea id="reg-skills" rows="2" placeholder="เช่น JavaScript, Excel, การทำอาหาร"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"></textarea>
              </div>
              <div>
                <label for="reg-interests" class="block text-sm font-medium text-gray-700 mb-1">ความสนใจ</label>
                <textarea id="reg-interests" rows="2" placeholder="สิ่งที่สนใจหรืออยากเรียนรู้"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"></textarea>
              </div>
            </div>
          </div>

          <button type="submit" id="register-btn"
            class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2">
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const firstName = document.getElementById('reg-first-name').value.trim();
    const lastName = document.getElementById('reg-last-name').value.trim();

    const data = {
      // backwards compatibility: combine first + last name
      name: firstName + ' ' + lastName,
      firstName: firstName,
      lastName: lastName,
      nickname: document.getElementById('reg-nickname').value.trim(),
      birthDate: document.getElementById('reg-birth-date').value,
      phone: document.getElementById('reg-phone').value.trim(),
      idCardNumber: document.getElementById('reg-id-card').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      password: password,
      studentId: document.getElementById('reg-student-id').value.trim(),
      university: document.getElementById('reg-university').value.trim(),
      faculty: document.getElementById('reg-faculty').value.trim(),
      major: document.getElementById('reg-major').value.trim(),
      year: document.getElementById('reg-year').value,
      gpa: document.getElementById('reg-gpa').value ? parseFloat(document.getElementById('reg-gpa').value) : null,
      internshipType: document.getElementById('reg-internship-type').value,
      startDate: document.getElementById('reg-start-date').value,
      endDate: document.getElementById('reg-end-date').value,
      address: document.getElementById('reg-address').value.trim(),
      skills: document.getElementById('reg-skills').value.trim(),
      interests: document.getElementById('reg-interests').value.trim()
    };

    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');
    btn.disabled = true;
    btn.textContent = 'กำลังสมัครสมาชิก...';

    try {
      const result = await callApiPost('register', data);
      if (result.success) {
        successDiv.textContent = 'สมัครสมาชิกสำเร็จ! กำลังนำไปหน้าเข้าสู่ระบบ...';
        successDiv.classList.remove('hidden');
        showToast('สมัครสมาชิกสำเร็จ', 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => navigateTo('login'), 2000);
      } else {
        errorDiv.textContent = result.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
        errorDiv.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      errorDiv.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
      errorDiv.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      btn.disabled = false;
      btn.textContent = 'สมัครสมาชิก';
    }
  });
}
