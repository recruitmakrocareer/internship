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
          <div class="text-right">
            <a href="javascript:void(0)" id="forgot-password-link" class="text-sm text-primary-600 hover:text-primary-700 font-medium">ลืมรหัสผ่าน?</a>
          </div>
          <button type="submit" id="login-btn"
            class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
            เข้าสู่ระบบ
          </button>
        </form>

        <div id="forgot-password-section" class="hidden space-y-4">
          <p class="text-sm text-gray-600 mb-2">กรอกอีเมลที่ใช้สมัครสมาชิก ระบบจะส่งรหัสผ่านชั่วคราวไปยังอีเมลของคุณ</p>
          <div>
            <label for="forgot-email" class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input type="email" id="forgot-email" placeholder="กรอกอีเมลของคุณ"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm">
          </div>
          <button type="button" id="forgot-submit-btn"
            class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
            ส่งรหัสผ่านชั่วคราว
          </button>
          <div class="text-center">
            <a href="javascript:void(0)" id="back-to-login-link" class="text-sm text-primary-600 hover:text-primary-700 font-medium">กลับไปหน้าเข้าสู่ระบบ</a>
          </div>
        </div>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500">
            ยังไม่มีบัญชี?
            <a href="#register" class="text-primary-600 hover:text-primary-700 font-medium">สมัครสมาชิก</a>
          </p>
        </div>
      </div>
    </div>
  `;

  // Login form submit
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
      if (result.success && !result.token) {
        // Backend เวอร์ชันเก่ายังไม่ออก session token — เข้าใช้งานต่อไม่ได้
        errorDiv.textContent = 'เซิร์ฟเวอร์ยังไม่รองรับเซสชันแบบใหม่ กรุณา Deploy Apps Script เวอร์ชันล่าสุด';
        errorDiv.classList.remove('hidden');
      } else if (result.success) {
        // เก็บ session token ไว้กับข้อมูลผู้ใช้ (api.js จะแนบไปกับทุก request)
        setToken({ ...result.user, token: result.token });
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

  // Forgot password link
  document.getElementById('forgot-password-link').addEventListener('click', function() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('forgot-password-section').classList.remove('hidden');
  });

  // Back to login link
  document.getElementById('back-to-login-link').addEventListener('click', function() {
    document.getElementById('forgot-password-section').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
  });

  // Forgot password submit
  document.getElementById('forgot-submit-btn').addEventListener('click', async function() {
    var email = document.getElementById('forgot-email').value.trim();
    if (!email) {
      showToast('กรุณากรอกอีเมล', 'error');
      return;
    }
    var btn = this;
    btn.disabled = true;
    btn.textContent = 'กำลังส่ง...';
    try {
      var result = await callApiPost('resetPassword', { email: email });
      if (result.success) {
        showToast(result.message || 'ส่งรหัสผ่านชั่วคราวไปยังอีเมลของคุณแล้ว', 'success');
        document.getElementById('forgot-password-section').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
      } else {
        showToast(result.message || 'ไม่พบอีเมลนี้ในระบบ', 'error');
      }
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'ส่งรหัสผ่านชั่วคราว';
    }
  });
}
