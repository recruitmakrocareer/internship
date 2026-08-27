/**
 * Auth.gs - Authentication service
 * Handles login, registration, password management and session lookup.
 *
 * ตัวตนของผู้เรียก API มาจาก session token ที่ออกให้ตอนล็อกอิน (ดู Session.gs)
 * ไม่ใช่ PropertiesService เพราะ Web App ที่ deploy เป็น "Execute as: Me"
 * มี UserProperties ร่วมกันทุกผู้เรียก (ผู้ใช้คนหนึ่งล็อกอินแล้วคนอื่นได้เซสชันนั้นไปด้วย)
 */

/**
 * Authenticates a user with email and password.
 * @param {string} email - User email
 * @param {string} password - User password (plain text, will be hashed for comparison)
 * @return {Object} Result object with success status and user data or error message
 */
function login(email, password) {
  try {
    if (!email || !password) {
      return { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
    }

    var users = getRows(CONFIG.SHEETS.USERS, { email: email.trim().toLowerCase() });

    if (users.length === 0) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้นี้' };
    }

    var user = users[0];

    // Check if account is active
    if (String(user.isActive) === 'false') {
      return { success: false, message: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' };
    }

    // Verify password
    var hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return { success: false, message: 'รหัสผ่านไม่ถูกต้อง' };
    }

    // Create safe user object (without password)
    var safeUser = {};
    var userKeys = Object.keys(user);
    for (var i = 0; i < userKeys.length; i++) {
      if (userKeys[i] !== 'password') {
        safeUser[userKeys[i]] = user[userKeys[i]];
      }
    }

    // ออก session token ให้ frontend เก็บไว้แนบกับทุก request
    var token = createSessionToken_(safeUser);

    return {
      success: true,
      user: safeUser,
      token: token,
      expiresInHours: (CONFIG.AUTH && CONFIG.AUTH.SESSION_TTL_HOURS) || 12,
      message: 'เข้าสู่ระบบสำเร็จ'
    };
  } catch (err) {
    Logger.log('Error in login: ' + err.message);
    return { success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ' + err.message };
  }
}

/**
 * Registers a new student account.
 * @param {Object} data - Registration data (email, password, firstName, lastName, studentId, department, phone)
 * @return {Object} Result object with success status
 */
function register(data) {
  try {
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      return { success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' };
    }

    // Validate email format
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, message: 'รูปแบบอีเมลไม่ถูกต้อง' };
    }

    // Check password length
    if (data.password.length < 6) {
      return { success: false, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' };
    }

    // Check if email already exists
    var existing = getRows(CONFIG.SHEETS.USERS, { email: data.email.trim().toLowerCase() });
    if (existing.length > 0) {
      return { success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' };
    }

    // Check if student ID already exists (if provided)
    if (data.studentId) {
      var existingStudent = getRows(CONFIG.SHEETS.USERS, { studentId: data.studentId });
      if (existingStudent.length > 0) {
        return { success: false, message: 'รหัสนักศึกษานี้ถูกใช้งานแล้ว' };
      }
    }

    // Create user record
    var userData = {
      email: data.email.trim().toLowerCase(),
      password: hashPassword(data.password),
      role: CONFIG.ROLES.STUDENT,
      prefix: data.prefix || '',
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      name: data.name || (data.firstName.trim() + ' ' + data.lastName.trim()),
      studentId: data.studentId || '',
      department: data.department || '',
      phone: data.phone || '',
      lineUserId: data.lineUserId || '',
      profileImage: '',
      isActive: 'true',
      nickname: data.nickname || '',
      birthDate: data.birthDate || '',
      idCardNumber: data.idCardNumber || '',
      university: data.university || '',
      faculty: data.faculty || '',
      major: data.major || '',
      year: data.year || '',
      gpa: data.gpa || '',
      internshipType: data.internshipType || '',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      address: data.address || '',
      universityAddress: data.universityAddress || '',
      skills: data.skills || '',
      interests: data.interests || '',
      advisorName: data.advisorName || '',
      advisorContact: data.advisorContact || '',
      cvFileUrl: data.cvFileUrl || '',
      cvFileName: data.cvFileName || '',
      photoFileUrl: data.photoFileUrl || '',
      photoFileName: data.photoFileName || '',
      currentAddress: data.currentAddress || '',
      currentProvince: data.currentProvince || '',
      currentPostcode: data.currentPostcode || '',
      idCardAddress: data.idCardAddress || '',
      idCardProvince: data.idCardProvince || '',
      idCardPostcode: data.idCardPostcode || '',
      militaryStatus: data.militaryStatus || '',
      medicalCondition: data.medicalCondition || '',
      preferredBranch1: data.preferredBranch1 || '',
      preferredBranch2: data.preferredBranch2 || '',
      preferredBranch3: data.preferredBranch3 || '',
      preferredDept1: data.preferredDept1 || '',
      preferredDept2: data.preferredDept2 || '',
      preferredDept3: data.preferredDept3 || '',
      currentHouseNo: data.currentHouseNo || '',
      currentVillage: data.currentVillage || '',
      currentSoi: data.currentSoi || '',
      currentRoad: data.currentRoad || '',
      currentSubdistrict: data.currentSubdistrict || '',
      currentDistrict: data.currentDistrict || '',
      idCardHouseNo: data.idCardHouseNo || '',
      idCardVillage: data.idCardVillage || '',
      idCardSoi: data.idCardSoi || '',
      idCardRoad: data.idCardRoad || '',
      idCardSubdistrict: data.idCardSubdistrict || '',
      idCardDistrict: data.idCardDistrict || ''
    };

    var newUser = appendRow(CONFIG.SHEETS.USERS, userData);

    // Create welcome notification
    try {
      createNotification(
        newUser.id,
        'ยินดีต้อนรับ!',
        'ยินดีต้อนรับสู่ระบบจัดการนักศึกษาฝึกงาน',
        'info'
      );
    } catch (notifErr) {
      Logger.log('Warning: Could not create welcome notification: ' + notifErr.message);
    }

    return { success: true, message: 'สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ' };
  } catch (err) {
    Logger.log('Error in register: ' + err.message);
    return { success: false, message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก: ' + err.message };
  }
}

/**
 * Resolves the acting user for the current request.
 * เซสชันจากโทเคนมาก่อนเสมอ ค่า userId ที่ client ส่งมาใช้เป็นทางเลือกสำรอง
 * เฉพาะกรณีที่ปิดการตรวจสิทธิ์ไว้ (CONFIG.AUTH.ENFORCE = false)
 * @param {string} explicitUserId - User ID passed from the frontend
 * @return {Object|null} The user object (without password) or null
 */
function resolveActingUser(explicitUserId) {
  var session = getSessionContext_();
  var userId = session ? session.userId : explicitUserId;
  if (!userId) return null;

  var u = getRowById(CONFIG.SHEETS.USERS, userId);
  if (!u) return null;

  var copy = {};
  var keys = Object.keys(u);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] !== 'password') copy[keys[i]] = u[keys[i]];
  }
  return copy;
}

/**
 * Gets the user behind the current request's session token.
 * @return {Object|null} The current user object (without password) or null
 */
function getCurrentUser() {
  var session = getSessionContext_();
  if (!session) return null;
  return resolveActingUser(session.userId);
}

/**
 * Logs out the current user.
 * โทเคนเป็น stateless — ฝั่ง server ไม่มีอะไรต้องลบ client ต้องทิ้งโทเคนเอง
 * (ถ้าต้องการตัดทุกเซสชันทันที ให้ลบ SESSION_SECRET ใน Project Settings)
 * @return {Object} Result object
 */
function logout() {
  return { success: true, message: 'ออกจากระบบสำเร็จ' };
}

/**
 * Resets a user's password and emails a temporary password to the
 * registered address. ใช้ MailApp ส่งอีเมลจากบัญชี Google ของสคริปต์
 * @param {string} email - Registered email address
 * @return {Object} Result object
 */
function resetPassword(email) {
  try {
    if (!email || !String(email).trim()) {
      return { success: false, message: 'กรุณากรอกอีเมลที่ใช้สมัครสมาชิก' };
    }

    var normalized = String(email).trim().toLowerCase();
    var users = getRows(CONFIG.SHEETS.USERS, { email: normalized });
    if (users.length === 0) {
      // ไม่เปิดเผยว่าอีเมลมีในระบบหรือไม่ เพื่อความปลอดภัย
      return { success: true, message: 'หากอีเมลนี้มีอยู่ในระบบ รหัสผ่านชั่วคราวจะถูกส่งไปที่อีเมลดังกล่าว' };
    }

    var user = users[0];
    if (String(user.isActive) === 'false') {
      return { success: false, message: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' };
    }

    // สร้างรหัสผ่านชั่วคราว 10 ตัวอักษร
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    var tempPassword = '';
    for (var i = 0; i < 10; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    updateRow(CONFIG.SHEETS.USERS, user.id, { password: hashPassword(tempPassword) });

    var displayName = ((user.firstName || '') + ' ' + (user.lastName || '')).trim() || normalized;
    MailApp.sendEmail({
      to: normalized,
      subject: '[ระบบจัดการฝึกงาน Makro] รหัสผ่านชั่วคราวของคุณ',
      htmlBody: '<p>สวัสดีคุณ ' + displayName + '</p>' +
        '<p>ระบบได้รับคำขอรีเซ็ตรหัสผ่านของคุณ รหัสผ่านชั่วคราวคือ:</p>' +
        '<p style="font-size:20px;font-weight:bold;letter-spacing:2px;">' + tempPassword + '</p>' +
        '<p>กรุณาเข้าสู่ระบบด้วยรหัสผ่านนี้ แล้วเปลี่ยนรหัสผ่านใหม่ในหน้าข้อมูลส่วนตัว</p>' +
        '<p style="color:#888;font-size:12px;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบทันที</p>'
    });

    return { success: true, message: 'หากอีเมลนี้มีอยู่ในระบบ รหัสผ่านชั่วคราวจะถูกส่งไปที่อีเมลดังกล่าว' };
  } catch (err) {
    Logger.log('Error in resetPassword: ' + err.message);
    return { success: false, message: 'ไม่สามารถรีเซ็ตรหัสผ่านได้: ' + err.message };
  }
}

/**
 * Changes a user's password after verifying the current one.
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password (plain text)
 * @param {string} newPassword - New password (plain text)
 * @return {Object} Result with success status
 */
function changePassword(userId, currentPassword, newPassword) {
  try {
    if (!userId || !currentPassword || !newPassword) {
      return { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
    }
    if (String(newPassword).length < 6) {
      return { success: false, message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' };
    }

    var user = getRowById(CONFIG.SHEETS.USERS, userId);
    if (!user) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้' };
    }

    if (user.password !== hashPassword(currentPassword)) {
      return { success: false, message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' };
    }

    updateRow(CONFIG.SHEETS.USERS, userId, { password: hashPassword(newPassword) });

    return { success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
  } catch (err) {
    Logger.log('Error in changePassword: ' + err.message);
    return { success: false, message: 'ไม่สามารถเปลี่ยนรหัสผ่านได้: ' + err.message };
  }
}

/**
 * Hashes a password using SHA-256.
 * @param {string} password - The plain text password
 * @return {string} The hex-encoded SHA-256 hash
 */
function hashPassword(password) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password);
  var hash = '';
  for (var i = 0; i < rawHash.length; i++) {
    var byte = rawHash[i];
    if (byte < 0) byte += 256;
    var hex = byte.toString(16);
    if (hex.length === 1) hex = '0' + hex;
    hash += hex;
  }
  return hash;
}

/**
 * Checks whether the current request's session has the required role.
 * การตรวจสิทธิ์หลักทำที่ authorizeRequest_() (Session.gs) ก่อนเข้า handler
 * ฟังก์ชันนี้ไว้ใช้ตรวจเพิ่มเติมภายใน handler
 * @param {string} requiredRole - The role required (from CONFIG.ROLES)
 * @return {boolean} True if the session has the required role
 */
function checkRole(requiredRole) {
  var session = getSessionContext_();
  if (!session) return false;

  // Admin has access to everything
  if (session.role === CONFIG.ROLES.ADMIN) return true;

  return session.role === requiredRole;
}

/**
 * Checks if the current request carries a valid session.
 * @return {boolean} True if a user is logged in
 */
function isLoggedIn() {
  return getSessionContext_() !== null;
}
