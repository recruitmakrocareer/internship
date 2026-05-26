// ==================== หน้าเข้าสู่ระบบ ====================

function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 fade-in">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">ระบบจัดการนักศึกษาฝึกงาน</h1>
          <p class="text-gray-500 mt-2 text-sm">เข้าสู่ระบบเพื่อใช้งาน</p>
        </div>

        <div id="login-error" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"></div>

        <form id="login-form" class="space-y-4">
          <div>
            <label for="login-email" class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input type="email" id="login-email" placeholder="กรอกอีเมลของคุณ" required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
          </div>
          <div>
            <label for="login-password" class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input type="password" id="login-password" placeholder="กรอกรหัสผ่าน" required
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
          </div>
          <button type="submit" id="login-btn"
            class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
            เข้าสู่ระบบ
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500">
            ยังไม่มีบัญชี?
            <a href="#register" class="text-primary-600 hover:text-primary-700 font-medium">สมัครสมาชิก</a>
          </p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

    errorDiv.classList.add('hidden');
    btn.disabled = true;
    btn.textContent = 'กำลังเข้าสู่ระบบ...';

    try {
      const result = await callApiPost('login', { email, password });
      if (result.success) {
        setToken(result.user);
        showToast('เข้าสู่ระบบสำเร็จ', 'success');
        navigateTo('dashboard');
      } else {
        errorDiv.textContent = result.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
        errorDiv.classList.remove('hidden');
      }
    } catch (error) {
      errorDiv.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';
      errorDiv.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = 'เข้าสู่ระบบ';
    }
  });
}
