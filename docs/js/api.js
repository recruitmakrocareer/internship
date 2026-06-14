// ==================== API Helper Functions ====================

/**
 * เรียก API ผ่าน GET request ไปยัง Google Apps Script
 * @param {string} action - ชื่อฟังก์ชันที่ต้องการเรียก
 * @param {object} params - พารามิเตอร์เพิ่มเติม
 * @returns {Promise<object>} - ผลลัพธ์จาก API
 */
async function callApi(action, params = {}) {
  const queryParams = new URLSearchParams({ action, ...params });
  const url = `${API_URL}?${queryParams.toString()}`;
  try {
    console.log('[API GET]', action);
    const response = await fetch(url, { redirect: 'follow' });
    const text = await response.text();
    try {
      return JSON.parse(text);
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
  try {
    console.log('[API POST]', action, Object.keys(params));
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...params }),
      redirect: 'follow'
    });
    const text = await response.text();
    console.log('[API POST Response]', action, text.substring(0, 200));
    try {
      return JSON.parse(text);
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
 * @returns {boolean}
 */
function isLoggedIn() {
  return getToken() !== null;
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
