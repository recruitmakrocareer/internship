/**
 * UserService.gs - User management functions
 * Called from frontend via google.script.run
 */

/**
 * Gets list of students with optional search and active filter.
 * @param {string} search - Optional search query (matches name, email, studentId)
 * @param {boolean} activeOnly - If true, only return active students
 * @return {Object} Result with success status and students array
 */
function getStudents(search, activeOnly) {
  try {
    var users = getRows(CONFIG.SHEETS.USERS, { role: CONFIG.ROLES.STUDENT });

    // Filter active only
    if (activeOnly) {
      users = users.filter(function(u) {
        return String(u.isActive) !== 'false';
      });
    }

    // Search filter
    if (search && search.trim() !== '') {
      var q = search.toLowerCase();
      users = users.filter(function(u) {
        return (u.firstName + ' ' + u.lastName).toLowerCase().indexOf(q) !== -1 ||
               String(u.email).toLowerCase().indexOf(q) !== -1 ||
               String(u.studentId).toLowerCase().indexOf(q) !== -1;
      });
    }

    // Remove password from results
    var students = users.map(function(u) {
      var copy = {};
      var keys = Object.keys(u);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i] !== 'password') {
          copy[keys[i]] = u[keys[i]];
        }
      }
      return copy;
    });

    return { success: true, data: students };
  } catch (err) {
    Logger.log('Error in getStudents: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลนักศึกษาได้: ' + err.message };
  }
}

/**
 * Gets a single student with mentor info.
 * @param {string} id - Student user ID
 * @return {Object} Result with student data and mentor info
 */
function getStudent(id) {
  try {
    var user = getRowById(CONFIG.SHEETS.USERS, id);
    if (!user) {
      return { success: false, message: 'ไม่พบข้อมูลนักศึกษา' };
    }

    // Remove password
    delete user.password;

    // Get mentor assignment
    var mentorAssignments = getRows(CONFIG.SHEETS.MENTOR_STUDENTS, {
      studentId: id,
      isActive: 'true'
    });

    var mentor = null;
    if (mentorAssignments.length > 0) {
      var mentorUser = getRowById(CONFIG.SHEETS.USERS, mentorAssignments[0].mentorId);
      if (mentorUser) {
        mentor = {
          id: mentorUser.id,
          firstName: mentorUser.firstName,
          lastName: mentorUser.lastName,
          email: mentorUser.email,
          department: mentorUser.department
        };
      }
    }

    user.mentor = mentor;
    return { success: true, data: user };
  } catch (err) {
    Logger.log('Error in getStudent: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลนักศึกษาได้: ' + err.message };
  }
}

/**
 * Creates a new student user account.
 * @param {Object} data - Student data (email, password, firstName, lastName, studentId, department, phone)
 * @return {Object} Result with created student data
 */
function createStudent(data) {
  try {
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      return { success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' };
    }

    // Check duplicate email
    var existing = getRows(CONFIG.SHEETS.USERS, { email: data.email.trim().toLowerCase() });
    if (existing.length > 0) {
      return { success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' };
    }

    // Check duplicate studentId
    if (data.studentId) {
      var existingStudent = getRows(CONFIG.SHEETS.USERS, { studentId: data.studentId });
      if (existingStudent.length > 0) {
        return { success: false, message: 'รหัสนักศึกษานี้ถูกใช้งานแล้ว' };
      }
    }

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
      branch: data.branch || '',
      position: data.position || '',
      employeeId: data.employeeId || '',
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
    delete newUser.password;

    return { success: true, data: newUser, message: 'สร้างบัญชีนักศึกษาสำเร็จ' };
  } catch (err) {
    Logger.log('Error in createStudent: ' + err.message);
    return { success: false, message: 'ไม่สามารถสร้างบัญชีนักศึกษาได้: ' + err.message };
  }
}

/**
 * Updates student information.
 * @param {string} id - Student user ID
 * @param {Object} data - Fields to update
 * @return {Object} Result with updated student data
 */
function updateStudent(id, data) {
  try {
    var user = getRowById(CONFIG.SHEETS.USERS, id);
    if (!user) {
      return { success: false, message: 'ไม่พบข้อมูลนักศึกษา' };
    }

    // Don't allow role change through this function
    delete data.role;
    delete data.id;

    // Hash password if being updated
    if (data.password) {
      data.password = hashPassword(data.password);
    }

    var updated = updateRow(CONFIG.SHEETS.USERS, id, data);
    delete updated.password;

    return { success: true, data: updated, message: 'อัปเดตข้อมูลนักศึกษาสำเร็จ' };
  } catch (err) {
    Logger.log('Error in updateStudent: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดตข้อมูลนักศึกษาได้: ' + err.message };
  }
}

/**
 * Deactivates a student account.
 * @param {string} id - Student user ID
 * @return {Object} Result with success status
 */
function deactivateStudent(id) {
  try {
    var user = getRowById(CONFIG.SHEETS.USERS, id);
    if (!user) {
      return { success: false, message: 'ไม่พบข้อมูลนักศึกษา' };
    }

    updateRow(CONFIG.SHEETS.USERS, id, { isActive: 'false' });

    return { success: true, message: 'ระงับบัญชีนักศึกษาสำเร็จ' };
  } catch (err) {
    Logger.log('Error in deactivateStudent: ' + err.message);
    return { success: false, message: 'ไม่สามารถระงับบัญชีนักศึกษาได้: ' + err.message };
  }
}

/**
 * Gets list of mentors.
 * @return {Object} Result with mentors array
 */
function getMentors() {
  try {
    var users = getRows(CONFIG.SHEETS.USERS, { role: CONFIG.ROLES.MENTOR });

    var mentorStudents = getRows(CONFIG.SHEETS.MENTOR_STUDENTS, { isActive: 'true' });

    var mentors = users.map(function(u) {
      var copy = {};
      var keys = Object.keys(u);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i] !== 'password') {
          copy[keys[i]] = u[keys[i]];
        }
      }
      copy.name = copy.name || ((copy.firstName || '') + ' ' + (copy.lastName || '')).trim();
      copy.assignedStudents = mentorStudents.filter(function(ms) { return ms.mentorId === u.id; }).length;
      return copy;
    });

    return { success: true, data: mentors };
  } catch (err) {
    Logger.log('Error in getMentors: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลพี่เลี้ยงได้: ' + err.message };
  }
}

/**
 * Creates a new mentor user account.
 * @param {Object} data - Mentor data (email, password, firstName, lastName, department, phone)
 * @return {Object} Result with created mentor data
 */
function createMentor(data) {
  try {
    if (!data.email || !data.password || !data.firstName || !data.lastName) {
      return { success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' };
    }

    // Check duplicate email
    var existing = getRows(CONFIG.SHEETS.USERS, { email: data.email.trim().toLowerCase() });
    if (existing.length > 0) {
      return { success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' };
    }

    var userData = {
      email: data.email.trim().toLowerCase(),
      password: hashPassword(data.password),
      role: CONFIG.ROLES.MENTOR,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      name: data.name || (data.firstName.trim() + ' ' + data.lastName.trim()),
      studentId: '',
      department: data.department || '',
      phone: data.phone || '',
      lineUserId: data.lineUserId || '',
      profileImage: '',
      isActive: 'true',
      employeeId: data.employeeId || '',
      branch: data.branch || '',
      position: data.position || ''
    };

    var newUser = appendRow(CONFIG.SHEETS.USERS, userData);
    delete newUser.password;

    return { success: true, data: newUser, message: 'สร้างบัญชีพี่เลี้ยงสำเร็จ' };
  } catch (err) {
    Logger.log('Error in createMentor: ' + err.message);
    return { success: false, message: 'ไม่สามารถสร้างบัญชีพี่เลี้ยงได้: ' + err.message };
  }
}

/**
 * Updates mentor information.
 * @param {string} id - Mentor user ID
 * @param {Object} data - Fields to update
 * @return {Object} Result with updated mentor data
 */
function updateMentor(id, data) {
  try {
    var user = getRowById(CONFIG.SHEETS.USERS, id);
    if (!user) {
      return { success: false, message: 'ไม่พบข้อมูลพี่เลี้ยง' };
    }

    delete data.id;
    delete data.role;
    delete data.createdAt;

    if (data.password) {
      data.password = hashPassword(data.password);
    }

    if (data.firstName && data.lastName) {
      data.name = data.name || (data.firstName.trim() + ' ' + data.lastName.trim());
    }

    var updated = updateRow(CONFIG.SHEETS.USERS, id, data);
    delete updated.password;

    return { success: true, data: updated, message: 'อัปเดตข้อมูลพี่เลี้ยงสำเร็จ' };
  } catch (err) {
    Logger.log('Error in updateMentor: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดตข้อมูลพี่เลี้ยงได้: ' + err.message };
  }
}

/**
 * Assigns a mentor to a student.
 * @param {string} mentorId - Mentor user ID
 * @param {string} studentId - Student user ID
 * @return {Object} Result with success status
 */
function assignMentor(mentorId, studentId) {
  try {
    // Verify mentor exists and is a mentor
    var mentor = getRowById(CONFIG.SHEETS.USERS, mentorId);
    if (!mentor || mentor.role !== CONFIG.ROLES.MENTOR) {
      return { success: false, message: 'ไม่พบข้อมูลพี่เลี้ยง' };
    }

    // Verify student exists and is a student
    var student = getRowById(CONFIG.SHEETS.USERS, studentId);
    if (!student || student.role !== CONFIG.ROLES.STUDENT) {
      return { success: false, message: 'ไม่พบข้อมูลนักศึกษา' };
    }

    // Deactivate existing mentor assignments for this student
    var existingAssignments = getRows(CONFIG.SHEETS.MENTOR_STUDENTS, {
      studentId: studentId,
      isActive: 'true'
    });

    for (var i = 0; i < existingAssignments.length; i++) {
      updateRow(CONFIG.SHEETS.MENTOR_STUDENTS, existingAssignments[i].id, { isActive: 'false' });
    }

    // Create new assignment
    var assignment = {
      mentorId: mentorId,
      studentId: studentId,
      isActive: 'true'
    };

    appendRow(CONFIG.SHEETS.MENTOR_STUDENTS, assignment);

    // Notify student
    try {
      createNotification(
        studentId,
        'ได้รับพี่เลี้ยงใหม่',
        'คุณได้รับมอบหมายพี่เลี้ยง: ' + mentor.firstName + ' ' + mentor.lastName,
        'info'
      );
    } catch (notifErr) {
      Logger.log('Warning: Could not send notification: ' + notifErr.message);
    }

    return { success: true, message: 'มอบหมายพี่เลี้ยงสำเร็จ' };
  } catch (err) {
    Logger.log('Error in assignMentor: ' + err.message);
    return { success: false, message: 'ไม่สามารถมอบหมายพี่เลี้ยงได้: ' + err.message };
  }
}

/**
 * Gets students assigned to a specific mentor.
 * @param {string} mentorId - Mentor user ID
 * @return {Object} Result with students array
 */
function getStudentsByMentor(mentorId) {
  try {
    var assignments = getRows(CONFIG.SHEETS.MENTOR_STUDENTS, {
      mentorId: mentorId,
      isActive: 'true'
    });

    var students = [];
    for (var i = 0; i < assignments.length; i++) {
      var student = getRowById(CONFIG.SHEETS.USERS, assignments[i].studentId);
      if (student) {
        delete student.password;
        student.assignedAt = assignments[i].assignedAt;
        students.push(student);
      }
    }

    return { success: true, data: students };
  } catch (err) {
    Logger.log('Error in getStudentsByMentor: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลนักศึกษาได้: ' + err.message };
  }
}

/**
 * Gets full user profile by ID.
 * @param {string} userId - User ID
 * @return {Object} Result with user profile data
 */
function getUserProfile(userId) {
  try {
    var user = getRowById(CONFIG.SHEETS.USERS, userId);
    if (!user) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้' };
    }

    delete user.password;

    // If student, get mentor info
    if (user.role === CONFIG.ROLES.STUDENT) {
      var mentorAssignments = getRows(CONFIG.SHEETS.MENTOR_STUDENTS, {
        studentId: userId,
        isActive: 'true'
      });

      if (mentorAssignments.length > 0) {
        var mentorUser = getRowById(CONFIG.SHEETS.USERS, mentorAssignments[0].mentorId);
        if (mentorUser) {
          user.mentor = {
            id: mentorUser.id,
            firstName: mentorUser.firstName,
            lastName: mentorUser.lastName,
            email: mentorUser.email,
            department: mentorUser.department
          };
        }
      }
    }

    // If mentor, get student count
    if (user.role === CONFIG.ROLES.MENTOR) {
      var studentAssignments = getRows(CONFIG.SHEETS.MENTOR_STUDENTS, {
        mentorId: userId,
        isActive: 'true'
      });
      user.studentCount = studentAssignments.length;
    }

    return { success: true, data: user };
  } catch (err) {
    Logger.log('Error in getUserProfile: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้: ' + err.message };
  }
}

function getStoreList() {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.STORE_LIST);
    if (!sheet) return { success: true, data: [] };
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return { success: true, data: [] };
    var stores = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] !== '' && data[i][1] !== '') {
        stores.push({ storeNo: String(data[i][0]), storeName: String(data[i][1]) });
      }
    }
    return { success: true, data: stores };
  } catch (err) {
    Logger.log('Error in getStoreList: ' + err.message);
    return { success: false, message: err.message };
  }
}

function getDepartmentList() {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.DEPARTMENT_LIST);
    if (!sheet) return { success: true, data: [] };
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return { success: true, data: [] };
    var departments = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] !== '' && data[i][1] !== '') {
        departments.push({ division: String(data[i][0]), department: String(data[i][1]) });
      }
    }
    return { success: true, data: departments };
  } catch (err) {
    Logger.log('Error in getDepartmentList: ' + err.message);
    return { success: false, message: err.message };
  }
}

/**
 * Updates own profile.
 * @param {string} userId - User ID
 * @param {Object} data - Fields to update (firstName, lastName, phone, lineUserId, profileImage)
 * @return {Object} Result with updated profile data
 */
function updateProfile(userId, data) {
  try {
    var user = getRowById(CONFIG.SHEETS.USERS, userId);
    if (!user) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้' };
    }

    // Allow updating profile fields (exclude sensitive fields)
    var blockedFields = ['id', 'email', 'password', 'role', 'isActive', 'createdAt'];
    var updateData = {};
    var keys = Object.keys(data);
    for (var i = 0; i < keys.length; i++) {
      if (blockedFields.indexOf(keys[i]) === -1 && data[keys[i]] !== undefined) {
        updateData[keys[i]] = data[keys[i]];
      }
    }

    // Handle password change
    if (data.newPassword) {
      if (!data.currentPassword) {
        return { success: false, message: 'กรุณากรอกรหัสผ่านปัจจุบัน' };
      }
      if (hashPassword(data.currentPassword) !== user.password) {
        return { success: false, message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' };
      }
      if (data.newPassword.length < 6) {
        return { success: false, message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' };
      }
      updateData.password = hashPassword(data.newPassword);
    }

    var updated = updateRow(CONFIG.SHEETS.USERS, userId, updateData);
    delete updated.password;

    // Update session data with all relevant fields
    var sessionData = {};
    var updatedKeys = Object.keys(updated);
    for (var j = 0; j < updatedKeys.length; j++) {
      if (updatedKeys[j] !== 'password') {
        sessionData[updatedKeys[j]] = updated[updatedKeys[j]];
      }
    }
    setCurrentUser(sessionData);

    return { success: true, data: updated, message: 'อัปเดตโปรไฟล์สำเร็จ' };
  } catch (err) {
    Logger.log('Error in updateProfile: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดตโปรไฟล์ได้: ' + err.message };
  }
}
