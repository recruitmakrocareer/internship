/**
 * AssignmentService.gs - Assignment management functions
 * Handles assignments, submissions, and reviews.
 */

/**
 * Gets all active assignments with submission counts.
 * @return {Object} Result with assignments array
 */
function getAssignments() {
  try {
    var assignments = getRows(CONFIG.SHEETS.ASSIGNMENTS, { isActive: 'true' });
    var allSubmissions = getAllRows(CONFIG.SHEETS.SUBMISSIONS);

    // Attach submission counts to each assignment
    for (var i = 0; i < assignments.length; i++) {
      var assignmentId = String(assignments[i].id);
      var submissions = allSubmissions.filter(function(s) {
        return String(s.assignmentId) === assignmentId;
      });

      assignments[i].submissionCount = submissions.length;
      assignments[i].reviewedCount = submissions.filter(function(s) {
        return s.status === 'reviewed' || s.status === 'graded';
      }).length;
      assignments[i].pendingCount = submissions.filter(function(s) {
        return s.status === 'submitted' || s.status === 'pending';
      }).length;
    }

    // Sort by due date descending
    assignments.sort(function(a, b) {
      return new Date(b.dueDate || 0) - new Date(a.dueDate || 0);
    });

    return { success: true, data: assignments };
  } catch (err) {
    Logger.log('Error in getAssignments: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลงานที่มอบหมายได้: ' + err.message };
  }
}

/**
 * Gets a single assignment with its submissions.
 * @param {string} id - Assignment ID
 * @return {Object} Result with assignment data and submissions
 */
function getAssignment(id) {
  try {
    var assignment = getRowById(CONFIG.SHEETS.ASSIGNMENTS, id);
    if (!assignment) {
      return { success: false, message: 'ไม่พบข้อมูลงานที่มอบหมาย' };
    }

    // Get submissions for this assignment
    var submissions = getRows(CONFIG.SHEETS.SUBMISSIONS, { assignmentId: id });

    // Enrich submissions with user info
    for (var i = 0; i < submissions.length; i++) {
      var student = getRowById(CONFIG.SHEETS.USERS, submissions[i].userId);
      if (student) {
        submissions[i].studentName = student.firstName + ' ' + student.lastName;
        submissions[i].studentEmail = student.email;
        submissions[i].studentIdNumber = student.studentId;
      }
    }

    assignment.submissions = submissions;

    // Get creator info
    if (assignment.createdBy) {
      var creator = getRowById(CONFIG.SHEETS.USERS, assignment.createdBy);
      if (creator) {
        assignment.creatorName = creator.firstName + ' ' + creator.lastName;
      }
    }

    return { success: true, data: assignment };
  } catch (err) {
    Logger.log('Error in getAssignment: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลงานที่มอบหมายได้: ' + err.message };
  }
}

/**
 * Creates a new assignment (admin/mentor).
 * @param {Object} data - Assignment data (title, description, dueDate, maxScore, assignedTo)
 * @return {Object} Result with created assignment data
 */
function createAssignment(data) {
  try {
    var user = getCurrentUser();
    if (!user) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบ' };
    }
    if (user.role === CONFIG.ROLES.STUDENT && data.source !== 'มหาวิทยาลัย') {
      return { success: false, message: 'นักศึกษาสามารถเพิ่มได้เฉพาะงานจากมหาวิทยาลัย' };
    }

    if (!data.title) {
      return { success: false, message: 'กรุณากรอกชื่องาน' };
    }

    var assignmentData = {
      title: data.title.trim(),
      description: data.description || '',
      dueDate: data.dueDate || '',
      maxScore: data.maxScore || '100',
      assignedTo: data.assignedTo || 'all',
      createdBy: data.createdBy || user.id,
      isActive: 'true',
      source: data.source || '',
      professorName: data.professorName || ''
    };

    var newAssignment = appendRow(CONFIG.SHEETS.ASSIGNMENTS, assignmentData);

    // Notify students
    try {
      var targetStudents = [];
      if (data.assignedTo && data.assignedTo !== 'all') {
        // Specific student assignment
        targetStudents = [data.assignedTo];
      } else {
        // All active students
        var students = getRows(CONFIG.SHEETS.USERS, { role: CONFIG.ROLES.STUDENT, isActive: 'true' });
        targetStudents = students.map(function(s) { return s.id; });
      }

      for (var i = 0; i < targetStudents.length; i++) {
        createNotification(
          targetStudents[i],
          'งานใหม่: ' + data.title,
          'คุณได้รับมอบหมายงานใหม่ กำหนดส่ง: ' + (data.dueDate || 'ไม่ระบุ'),
          'assignment'
        );
      }
    } catch (notifErr) {
      Logger.log('Warning: Could not send notifications: ' + notifErr.message);
    }

    return { success: true, data: newAssignment, message: 'สร้างงานที่มอบหมายสำเร็จ' };
  } catch (err) {
    Logger.log('Error in createAssignment: ' + err.message);
    return { success: false, message: 'ไม่สามารถสร้างงานที่มอบหมายได้: ' + err.message };
  }
}

/**
 * Updates an existing assignment.
 * @param {string} id - Assignment ID
 * @param {Object} data - Fields to update
 * @return {Object} Result with updated assignment data
 */
function updateAssignment(id, data) {
  try {
    var assignment = getRowById(CONFIG.SHEETS.ASSIGNMENTS, id);
    if (!assignment) {
      return { success: false, message: 'ไม่พบข้อมูลงานที่มอบหมาย' };
    }

    delete data.id;
    delete data.createdBy;
    delete data.createdAt;

    var updated = updateRow(CONFIG.SHEETS.ASSIGNMENTS, id, data);

    return { success: true, data: updated, message: 'อัปเดตงานที่มอบหมายสำเร็จ' };
  } catch (err) {
    Logger.log('Error in updateAssignment: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดตงานที่มอบหมายได้: ' + err.message };
  }
}

/**
 * Deletes an assignment (soft delete).
 * @param {string} id - Assignment ID
 * @return {Object} Result with success status
 */
function deleteAssignment(id) {
  try {
    var assignment = getRowById(CONFIG.SHEETS.ASSIGNMENTS, id);
    if (!assignment) {
      return { success: false, message: 'ไม่พบข้อมูลงานที่มอบหมาย' };
    }

    updateRow(CONFIG.SHEETS.ASSIGNMENTS, id, { isActive: 'false' });

    return { success: true, message: 'ลบงานที่มอบหมายสำเร็จ' };
  } catch (err) {
    Logger.log('Error in deleteAssignment: ' + err.message);
    return { success: false, message: 'ไม่สามารถลบงานที่มอบหมายได้: ' + err.message };
  }
}

/**
 * Submits or updates a submission for an assignment.
 * @param {string} assignmentId - Assignment ID
 * @param {string} userId - User ID of submitter
 * @param {string} content - Submission content/text
 * @param {string} fileUrl - Optional file URL
 * @param {string} fileName - Optional file name
 * @return {Object} Result with submission data
 */
function submitAssignment(assignmentId, userId, content, fileUrl, fileName) {
  try {
    // Verify assignment exists and is active
    var assignment = getRowById(CONFIG.SHEETS.ASSIGNMENTS, assignmentId);
    if (!assignment || String(assignment.isActive) === 'false') {
      return { success: false, message: 'ไม่พบงานที่มอบหมายหรืองานถูกปิดแล้ว' };
    }

    // Check for existing submission
    var existingSubmissions = getRows(CONFIG.SHEETS.SUBMISSIONS, {
      assignmentId: assignmentId,
      userId: userId
    });

    var result;
    var now = new Date().toISOString();

    if (existingSubmissions.length > 0) {
      // Update existing submission
      var updateData = {
        content: content || existingSubmissions[0].content,
        fileUrl: fileUrl || existingSubmissions[0].fileUrl,
        fileName: fileName || existingSubmissions[0].fileName,
        status: 'submitted',
        submittedAt: now
      };

      result = updateRow(CONFIG.SHEETS.SUBMISSIONS, existingSubmissions[0].id, updateData);
    } else {
      // Create new submission
      var submissionData = {
        assignmentId: assignmentId,
        userId: userId,
        content: content || '',
        fileUrl: fileUrl || '',
        fileName: fileName || '',
        status: 'submitted',
        score: '',
        feedback: '',
        submittedAt: now,
        reviewedAt: '',
        reviewedBy: ''
      };

      result = appendRow(CONFIG.SHEETS.SUBMISSIONS, submissionData);
    }

    // Notify assignment creator
    try {
      if (assignment.createdBy) {
        var student = getRowById(CONFIG.SHEETS.USERS, userId);
        var studentName = student ? (student.firstName + ' ' + student.lastName) : 'นักศึกษา';
        createNotification(
          assignment.createdBy,
          'ส่งงานใหม่',
          studentName + ' ส่งงาน: ' + assignment.title,
          'submission'
        );
      }
    } catch (notifErr) {
      Logger.log('Warning: Could not send notification: ' + notifErr.message);
    }

    return { success: true, data: result, message: 'ส่งงานสำเร็จ' };
  } catch (err) {
    Logger.log('Error in submitAssignment: ' + err.message);
    return { success: false, message: 'ไม่สามารถส่งงานได้: ' + err.message };
  }
}

/**
 * Gets submissions with optional filters.
 * @param {Object} filter - Optional filter (assignmentId, userId, status)
 * @return {Object} Result with submissions array
 */
function getSubmissions(filter) {
  try {
    var submissions;

    if (filter && Object.keys(filter).length > 0) {
      submissions = getRows(CONFIG.SHEETS.SUBMISSIONS, filter);
    } else {
      submissions = getAllRows(CONFIG.SHEETS.SUBMISSIONS);
    }

    // Enrich with user and assignment info
    for (var i = 0; i < submissions.length; i++) {
      var student = getRowById(CONFIG.SHEETS.USERS, submissions[i].userId);
      if (student) {
        submissions[i].studentName = student.firstName + ' ' + student.lastName;
        submissions[i].studentEmail = student.email;
      }

      var assignment = getRowById(CONFIG.SHEETS.ASSIGNMENTS, submissions[i].assignmentId);
      if (assignment) {
        submissions[i].assignmentTitle = assignment.title;
        submissions[i].maxScore = assignment.maxScore;
      }
    }

    // Sort by submitted date descending
    submissions.sort(function(a, b) {
      return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
    });

    return { success: true, data: submissions };
  } catch (err) {
    Logger.log('Error in getSubmissions: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลงานที่ส่งได้: ' + err.message };
  }
}

/**
 * Reviews a submission (grade and provide feedback).
 * @param {string} submissionId - Submission ID
 * @param {string} status - New status (reviewed, graded, revision_needed)
 * @param {number} score - Score
 * @param {string} feedback - Feedback text
 * @return {Object} Result with updated submission data
 */
function reviewSubmission(submissionId, status, score, feedback) {
  try {
    var user = getCurrentUser();
    if (!user || (user.role !== CONFIG.ROLES.ADMIN && user.role !== CONFIG.ROLES.MENTOR)) {
      return { success: false, message: 'คุณไม่มีสิทธิ์ตรวจงาน' };
    }

    var submission = getRowById(CONFIG.SHEETS.SUBMISSIONS, submissionId);
    if (!submission) {
      return { success: false, message: 'ไม่พบข้อมูลงานที่ส่ง' };
    }

    var now = new Date().toISOString();
    var updateData = {
      status: status || 'reviewed',
      score: score !== undefined && score !== null ? String(score) : submission.score,
      feedback: feedback || submission.feedback,
      reviewedAt: now,
      reviewedBy: user.id
    };

    var updated = updateRow(CONFIG.SHEETS.SUBMISSIONS, submissionId, updateData);

    // Notify student
    try {
      var assignment = getRowById(CONFIG.SHEETS.ASSIGNMENTS, submission.assignmentId);
      var assignmentTitle = assignment ? assignment.title : 'งาน';
      createNotification(
        submission.userId,
        'ผลการตรวจงาน',
        'งาน "' + assignmentTitle + '" ได้รับการตรวจแล้ว คะแนน: ' + (score || '-'),
        'review'
      );
    } catch (notifErr) {
      Logger.log('Warning: Could not send notification: ' + notifErr.message);
    }

    return { success: true, data: updated, message: 'ตรวจงานสำเร็จ' };
  } catch (err) {
    Logger.log('Error in reviewSubmission: ' + err.message);
    return { success: false, message: 'ไม่สามารถตรวจงานได้: ' + err.message };
  }
}
