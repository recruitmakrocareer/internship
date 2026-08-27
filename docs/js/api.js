// ==================== API Helper Functions ====================

/**
 * ดึง session token ที่ได้จากการล็อกอิน (เก็บรวมไว้กับข้อมูลผู้ใช้ใน localStorage)
 * @returns {string}
 */
function getAuthToken() {
  const user = getToken();
  return (user && user.token) ? user.token : '';
}

/**
 * จัดการกรณี server ปฏิเสธเพราะสิทธิ์ไม่พอหรือเซสชันหมดอายุ
 * UNAUTHORIZED = ทิ้งเซสชันแล้วกลับไปหน้าล็อกอิน
 * FORBIDDEN    = ล็อกอินอยู่แต่ role ไม่มีสิทธิ์ แค่แจ้งเตือน
 * @param {object} result - ผลลัพธ์จาก API
 * @returns {boolean} true ถ้าเป็นข้อผิดพลาดด้านสิทธิ์และจัดการแล้ว
 */
function handleApiAuthError(result) {
  if (!result || result.success !== false) return false;

  if (result.code === 'UNAUTHORIZED') {
    clearToken();
    if (typeof showToast === 'function') {
      showToast(result.message || 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่', 'error');
    }
    if (window.location.hash !== '#login') {
      window.location.hash = '#login';
    } else if (typeof router === 'function') {
      router();
    }
    return true;
  }

  if (result.code === 'FORBIDDEN') {
    if (typeof showToast === 'function') {
      showToast(result.message || 'คุณไม่มีสิทธิ์ใช้งานส่วนนี้', 'error');
    }
    return true;
  }

  return false;
}

/**
 * เรียก API ผ่าน GET request ไปยัง Google Apps Script
 * @param {string} action - ชื่อฟังก์ชันที่ต้องการเรียก
 * @param {object} params - พารามิเตอร์เพิ่มเติม
 * @returns {Promise<object>} - ผลลัพธ์จาก API
 */
async function callApi(action, params = {}) {
  const authToken = getAuthToken();
  const payload = { action, ...params };
  if (authToken) payload.authToken = authToken;

  const queryParams = new URLSearchParams(payload);
  const url = `${API_URL}?${queryParams.toString()}`;
  try {
    console.log('[API GET]', action);
    const response = await fetch(url, { redirect: 'follow' });
    const text = await response.text();
    try {
      const result = JSON.parse(text);
      handleApiAuthError(result);
      return result;
    } catch (e) {
      console.error('[API GET] Response is not JSON:', text.substring(0, 500));
      return { success: false, message: 'เซิร์ฟเวอร์ตอบกลับผิดรูปแบบ' };
    }
  } catch (error) {
    console.error('[API GET Error]', action, error);
    throw error;
  }
}

async function callApiPost(action, params = {}) {
  const authToken = getAuthToken();
  const payload = { action, ...params };
  if (authToken) payload.authToken = authToken;

  try {
    console.log('[API POST]', action, Object.keys(params));
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });
    const text = await response.text();
    console.log('[API POST Response]', action, text.substring(0, 200));
    try {
      const result = JSON.parse(text);
      handleApiAuthError(result);
      return result;
    } catch (e) {
      console.error('[API POST] Response is not JSON:', text.substring(0, 500));
      return { success: false, message: 'เซิร์ฟเวอร์ตอบกลับผิดรูปแบบ กรุณา Deploy ใหม่ใน Apps Script' };
    }
  } catch (error) {
    console.error('[API POST Error]', action, error);
    throw error;
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * บันทึกข้อมูลผู้ใช้ลง localStorage
 * @param {object} userData - ข้อมูลผู้ใช้
 */
function setToken(userData) {
  localStorage.setItem('internship_user', JSON.stringify(userData));
}

/**
 * ดึงข้อมูลผู้ใช้จาก localStorage
 * @returns {object|null}
 */
function getToken() {
  const data = localStorage.getItem('internship_user');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    // Corrupt localStorage would otherwise throw and break all routing.
    localStorage.removeItem('internship_user');
    return null;
  }
}

/**
 * ล้างข้อมูลผู้ใช้ (ออกจากระบบ)
 */
function clearToken() {
  localStorage.removeItem('internship_user');
}

/**
 * ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
 * ต้องมี session token ด้วย — ข้อมูลผู้ใช้ที่ค้างจากเวอร์ชันก่อนมี token
 * จะถือว่ายังไม่ได้ล็อกอิน เพื่อให้ผู้ใช้ล็อกอินใหม่แล้วรับ token
 * @returns {boolean}
 */
function isLoggedIn() {
  const user = getToken();
  return !!(user && user.token);
}

/**
 * ดึงข้อมูลผู้ใช้ปัจจุบัน
 * @returns {object|null}
 */
function getCurrentUser() {
  return getToken();
}

/**
 * ตรวจสอบสิทธิ์ - ถ้าไม่ได้ล็อกอินจะ redirect ไปหน้า login
 */
function checkAuth() {
  if (!isLoggedIn()) {
    window.location.hash = '#login';
    return false;
  }
  return true;
}

/**
 * ตรวจสอบบทบาทผู้ใช้
 * @param {string} role - บทบาทที่ต้องการตรวจสอบ (ADMIN, STUDENT, MENTOR)
 * @returns {boolean}
 */
function checkRole(role) {
  const user = getCurrentUser();
  if (!user) return false;
  return user.role === role;
}
