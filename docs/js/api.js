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
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
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
  return data ? JSON.parse(data) : null;
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
