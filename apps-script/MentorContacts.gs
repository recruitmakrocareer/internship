/**
 * MentorContacts.gs - Multi-mentor contact functions for the student portal.
 *
 * These functions are ADDITIVE and intentionally separate from assignMentor()
 * in UserService.gs. Unlike assignMentor (single-mentor admin model that
 * deactivates other assignments), these support MULTIPLE active mentors per
 * student and never deactivate sibling assignments.
 */

/**
 * Builds a clean mentor contact object from a Users row.
 * @param {Object} u - User row
 * @return {Object} Mentor contact object (no password)
 */
function mentorContacts_buildMentor_(u) {
  return {
    id: u.id,
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    name: u.name || ((u.firstName || '') + ' ' + (u.lastName || '')).trim(),
    email: u.email || '',
    phone: u.phone || '',
    department: u.department || '',
    branch: u.branch || '',
    position: u.position || '',
    profileImage: u.profileImage || u.photoFileUrl || ''
  };
}

/**
 * Gets all active mentors assigned to a student (multi-mentor).
 * @param {string} studentId - Student user ID
 * @return {Object} Result with success status and array of mentor contacts
 */
function getMyMentors(studentId) {
  try {
    if (!studentId) {
      return { success: false, message: 'ไม่พบรหัสนักศึกษา' };
    }

    // Fetch assignments for this student, then keep only active rows.
    // Compare with String(x) === 'true' because Sheets coerces booleans.
    var assignments = getRows(CONFIG.SHEETS.MENTOR_STUDENTS, { studentId: studentId });
    var activeAssignments = assignments.filter(function(a) {
      return String(a.isActive) === 'true';
    });

    // Build a user lookup once to avoid N+1 reads.
    var allUsers = getAllRows(CONFIG.SHEETS.USERS);
    var userById = {};
    for (var i = 0; i < allUsers.length; i++) {
      userById[String(allUsers[i].id)] = allUsers[i];
    }

    var mentors = [];
    var seen = {};
    for (var j = 0; j < activeAssignments.length; j++) {
      var mid = String(activeAssignments[j].mentorId);
      if (seen[mid]) continue; // de-dupe in case of duplicate active rows
      var mu = userById[mid];
      if (mu) {
        var mentor = mentorContacts_buildMentor_(mu);
        mentor.assignedAt = activeAssignments[j].assignedAt || '';
        mentor.assignmentId = activeAssignments[j].id;
        mentors.push(mentor);
        seen[mid] = true;
      }
    }

    return { success: true, data: mentors };
  } catch (err) {
    Logger.log('Error in getMyMentors: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลพี่เลี้ยงได้: ' + err.message };
  }
}

/**
 * Adds a mentor contact for a student (multi-mentor; additive).
 * Does NOT deactivate other mentors. If an active assignment already exists
 * for this (studentId, mentorId) pair, it is treated as success (no-op).
 * @param {string} studentId - Student user ID
 * @param {string} mentorId - Mentor user ID
 * @return {Object} Result with success status
 */
function addMentorContact(studentId, mentorId) {
  try {
    if (!studentId || !mentorId) {
      return { success: false, message: 'ข้อมูลไม่ครบถ้วน' };
    }

    // Validate mentor exists and is actually a mentor.
    var mentor = getRowById(CONFIG.SHEETS.USERS, mentorId);
    if (!mentor || mentor.role !== CONFIG.ROLES.MENTOR) {
      return { success: false, message: 'ไม่พบข้อมูลพี่เลี้ยง' };
    }

    // If an active assignment already exists, do nothing.
    var existing = getRows(CONFIG.SHEETS.MENTOR_STUDENTS, {
      studentId: studentId,
      mentorId: mentorId
    });
    var alreadyActive = existing.filter(function(a) {
      return String(a.isActive) === 'true';
    });
    if (alreadyActive.length > 0) {
      return { success: true, message: 'พี่เลี้ยงคนนี้อยู่ในรายการแล้ว', note: 'exists' };
    }

    // Create a new active assignment (additive — do NOT deactivate others).
    appendRow(CONFIG.SHEETS.MENTOR_STUDENTS, {
      mentorId: mentorId,
      studentId: studentId,
      isActive: 'true'
    });

    // Best-effort notification to the student.
    try {
      if (typeof createNotification === 'function') {
        createNotification(
          studentId,
          'เพิ่มพี่เลี้ยงใหม่',
          'คุณได้เพิ่มพี่เลี้ยง: ' + (mentor.firstName || '') + ' ' + (mentor.lastName || ''),
          'info'
        );
      }
    } catch (notifErr) {
      Logger.log('Warning: addMentorContact notification failed: ' + notifErr.message);
    }

    return { success: true, message: 'เพิ่มพี่เลี้ยงสำเร็จ' };
  } catch (err) {
    Logger.log('Error in addMentorContact: ' + err.message);
    return { success: false, message: 'ไม่สามารถเพิ่มพี่เลี้ยงได้: ' + err.message };
  }
}

/**
 * Removes a mentor contact for a student by deactivating matching active rows.
 * @param {string} studentId - Student user ID
 * @param {string} mentorId - Mentor user ID
 * @return {Object} Result with success status
 */
function removeMentorContact(studentId, mentorId) {
  try {
    if (!studentId || !mentorId) {
      return { success: false, message: 'ข้อมูลไม่ครบถ้วน' };
    }

    var rows = getRows(CONFIG.SHEETS.MENTOR_STUDENTS, {
      studentId: studentId,
      mentorId: mentorId
    });
    var activeRows = rows.filter(function(a) {
      return String(a.isActive) === 'true';
    });

    if (activeRows.length === 0) {
      return { success: true, message: 'ไม่พบรายการพี่เลี้ยงที่จะนำออก', note: 'not-found' };
    }

    for (var i = 0; i < activeRows.length; i++) {
      updateRow(CONFIG.SHEETS.MENTOR_STUDENTS, activeRows[i].id, { isActive: 'false' });
    }

    return { success: true, message: 'นำพี่เลี้ยงออกสำเร็จ' };
  } catch (err) {
    Logger.log('Error in removeMentorContact: ' + err.message);
    return { success: false, message: 'ไม่สามารถนำพี่เลี้ยงออกได้: ' + err.message };
  }
}
