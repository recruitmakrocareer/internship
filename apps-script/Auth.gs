/**
 * Auth.gs - Authentication service using PropertiesService and Session
 * Handles login, registration, session management, and role checking.
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

    // Store in session
    setCurrentUser(safeUser);

    return { success: true, user: safeUser, message: 'เข้าสู่ระบบสำเร็จ' };
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
      preferredDept3: data.preferredDept3 || ''
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
 * Gets the current logged-in user from UserProperties.
 * @return {Object|null} The current user object or null if not logged in
 */
function getCurrentUser() {
  try {
    var props = PropertiesService.getUserProperties();
    var userJson = props.getProperty('currentUser');

    if (!userJson) return null;

    return JSON.parse(userJson);
  } catch (err) {
    Logger.log('Error in getCurrentUser: ' + err.message);
    return null;
  }
}

/**
 * Stores the current user in UserProperties.
 * @param {Object} user - The user object to store
 */
function setCurrentUser(user) {
  try {
    var props = PropertiesService.getUserProperties();
    props.setProperty('currentUser', JSON.stringify(user));
  } catch (err) {
    Logger.log('Error in setCurrentUser: ' + err.message);
    throw new Error('ไม่สามารถบันทึกข้อมูลเซสชันได้');
  }
}

/**
 * Logs out the current user by clearing UserProperties.
 * @return {Object} Result object
 */
function logout() {
  try {
    var props = PropertiesService.getUserProperties();
    props.deleteProperty('currentUser');
    return { success: true, message: 'ออกจากระบบสำเร็จ' };
  } catch (err) {
    Logger.log('Error in logout: ' + err.message);
    return { success: false, message: 'เกิดข้อผิดพลาดในการออกจากระบบ' };
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
 * Checks if the current user has the required role.
 * @param {string} requiredRole - The role required (from CONFIG.ROLES)
 * @return {boolean} True if user has the required role
 */
function checkRole(requiredRole) {
  try {
    var user = getCurrentUser();
    if (!user) return false;

    // Admin has access to everything
    if (user.role === CONFIG.ROLES.ADMIN) return true;

    return user.role === requiredRole;
  } catch (err) {
    Logger.log('Error in checkRole: ' + err.message);
    return false;
  }
}

/**
 * Checks if a user is currently logged in.
 * @return {boolean} True if user is logged in
 */
function isLoggedIn() {
  return getCurrentUser() !== null;
}
