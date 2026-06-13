/**
 * TrainingPassport.gs - Training Passport service for Makro Fresh Food 16-week program
 * Handles sign-off tracking, passport viewing, and summary reporting.
 */

/**
 * Week definitions for the 16-week Training Passport.
 */
var TRAINING_WEEKS = [
  { week: 0, title: 'ก่อนลงสโตร์: ปฐมนิเทศ HO & Store', place: 'HO/Store', tool: 'OJT/ZOOM' },
  { week: 1, title: 'สัปดาห์ 1-2: ศึกษาแผนก Fresh Food & OJT', place: 'Store', tool: 'OJT' },
  { week: 2, title: 'สัปดาห์ 3: OPL Ordering', place: 'Store', tool: 'OJT/M-learning' },
  { week: 3, title: 'สัปดาห์ 4: Food Safety, GMP/HACCP', place: 'Store/HO', tool: 'OJT/ZOOM' },
  { week: 4, title: 'สัปดาห์ 5: Receiving Management & Quality Check', place: 'Store', tool: 'OJT' },
  { week: 5, title: 'สัปดาห์ 6: Storage Management, Cold System, FIFO/FEFO', place: 'Store', tool: 'OJT' },
  { week: 6, title: 'สัปดาห์ 7: Display Management, Plan-O-Gram, Merchandising', place: 'Store', tool: 'OJT/M-learning' },
  { week: 7, title: 'สัปดาห์ 8: Sale Analysis & Price Management', place: 'Store', tool: 'OJT/M-learning' },
  { week: 8, title: 'สัปดาห์ 9: Stock Management & Inventory Adjustment', place: 'Store', tool: 'OJT' },
  { week: 9, title: 'สัปดาห์ 10: Shrinkage Management (+ Innovation Project)', place: 'Store/HO', tool: 'OJT/ZOOM' },
  { week: 10, title: 'สัปดาห์ 11: Aging/NBS Management', place: 'Store', tool: 'OJT' },
  { week: 11, title: 'สัปดาห์ 12: Report Analysis (Trading/BI Report)', place: 'Store', tool: 'OJT/M-learning' },
  { week: 12, title: 'สัปดาห์ 13: Customer Development', place: 'Store', tool: 'OJT' },
  { week: 13, title: 'สัปดาห์ 14: Soft Skill Management', place: 'Store/HO', tool: 'OJT/ZOOM' },
  { week: 14, title: 'สัปดาห์ 15: Supervisor Function Job', place: 'Store', tool: 'OJT' },
  { week: 15, title: 'สัปดาห์ 16: Supervisor Function Job + Project Presentation', place: 'Store/HO', tool: 'OJT/ZOOM' }
];

/**
 * Gets the full 16-week Training Passport for a student with sign-off status per week.
 * @param {string} userId - Student user ID
 * @return {Object} Result with passport data
 */
function getTrainingPassport(userId) {
  try {
    if (!userId) {
      return { success: false, message: 'กรุณาระบุ userId' };
    }

    // Find the Training Passport roadmap
    var roadmaps = getRows(CONFIG.SHEETS.ROADMAPS, { isActive: 'true' });
    var passportRoadmap = null;
    for (var i = 0; i < roadmaps.length; i++) {
      if (roadmaps[i].title.indexOf('Training Passport') !== -1) {
        passportRoadmap = roadmaps[i];
        break;
      }
    }

    if (!passportRoadmap) {
      return { success: false, message: 'ไม่พบ Training Passport Roadmap' };
    }

    // Get steps for this roadmap
    var steps = getRows(CONFIG.SHEETS.ROADMAP_STEPS, { roadmapId: passportRoadmap.id, isActive: 'true' });
    steps.sort(function(a, b) { return Number(a.stepNumber) - Number(b.stepNumber); });

    // Get progress for this user
    var progress = getRows(CONFIG.SHEETS.ROADMAP_PROGRESS, { userId: userId, roadmapId: passportRoadmap.id });

    // Build passport weeks
    var weeks = [];
    for (var s = 0; s < steps.length; s++) {
      var step = steps[s];
      var weekDef = TRAINING_WEEKS[s] || {};

      // Find progress for this step
      var stepProgress = null;
      for (var p = 0; p < progress.length; p++) {
        if (String(progress[p].stepId) === String(step.id)) {
          stepProgress = progress[p];
          break;
        }
      }

      // Parse sign-off metadata from note field
      var signOffData = {
        trainerSigned: false,
        trainerDate: '',
        studentSigned: false,
        studentDate: '',
        trainerNotes: '',
        studentNotes: ''
      };

      if (stepProgress && stepProgress.note) {
        try {
          var parsed = JSON.parse(stepProgress.note);
          signOffData.trainerSigned = parsed.trainerSigned || false;
          signOffData.trainerDate = parsed.trainerDate || '';
          signOffData.studentSigned = parsed.studentSigned || false;
          signOffData.studentDate = parsed.studentDate || '';
          signOffData.trainerNotes = parsed.trainerNotes || '';
          signOffData.studentNotes = parsed.studentNotes || '';
        } catch (e) {
          // Note is plain text, not JSON
          signOffData.studentNotes = stepProgress.note;
        }
      }

      // Determine status
      var status = 'not_started';
      if (signOffData.trainerSigned && signOffData.studentSigned) {
        status = 'completed';
      } else if (signOffData.trainerSigned) {
        status = 'trainer_signed';
      } else if (stepProgress && String(stepProgress.status).toUpperCase() === 'IN_PROGRESS') {
        status = 'in_progress';
      } else if (stepProgress && String(stepProgress.status).toUpperCase() === 'COMPLETED') {
        status = 'completed';
      }

      weeks.push({
        weekNumber: step.stepNumber,
        stepId: step.id,
        title: step.title,
        description: step.description,
        trainingPlace: weekDef.place || '',
        trainingTool: weekDef.tool || '',
        status: status,
        signOff: signOffData,
        progressId: stepProgress ? stepProgress.id : null
      });
    }

    return {
      success: true,
      data: {
        roadmapId: passportRoadmap.id,
        userId: userId,
        weeks: weeks
      }
    };
  } catch (err) {
    Logger.log('Error in getTrainingPassport: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูล Training Passport ได้: ' + err.message };
  }
}

/**
 * Signs off a week in the Training Passport.
 * @param {string} userId - Student user ID
 * @param {number} weekNumber - Week number (0-15)
 * @param {string} role - 'trainer' or 'student'
 * @param {string} notes - Optional notes
 * @return {Object} Result with updated progress
 */
function signOffWeek(userId, weekNumber, role, notes) {
  try {
    if (!userId || weekNumber === undefined || weekNumber === null || !role) {
      return { success: false, message: 'กรุณาระบุข้อมูลที่จำเป็น (userId, weekNumber, role)' };
    }

    weekNumber = Number(weekNumber);

    // Find the Training Passport roadmap
    var roadmaps = getRows(CONFIG.SHEETS.ROADMAPS, { isActive: 'true' });
    var passportRoadmap = null;
    for (var i = 0; i < roadmaps.length; i++) {
      if (roadmaps[i].title.indexOf('Training Passport') !== -1) {
        passportRoadmap = roadmaps[i];
        break;
      }
    }

    if (!passportRoadmap) {
      return { success: false, message: 'ไม่พบ Training Passport Roadmap' };
    }

    // Find the step for this week
    var steps = getRows(CONFIG.SHEETS.ROADMAP_STEPS, { roadmapId: passportRoadmap.id, isActive: 'true' });
    var targetStep = null;
    for (var s = 0; s < steps.length; s++) {
      if (Number(steps[s].stepNumber) === weekNumber) {
        targetStep = steps[s];
        break;
      }
    }

    if (!targetStep) {
      return { success: false, message: 'ไม่พบขั้นตอนสัปดาห์ที่ ' + weekNumber };
    }

    // Get existing progress
    var existingProgress = getRows(CONFIG.SHEETS.ROADMAP_PROGRESS, {
      userId: userId,
      stepId: targetStep.id
    });

    var now = new Date().toISOString();
    var dateStr = now.substring(0, 10);

    // Parse existing sign-off data
    var signOffData = {
      trainerSigned: false,
      trainerDate: '',
      studentSigned: false,
      studentDate: '',
      trainerNotes: '',
      studentNotes: ''
    };

    if (existingProgress.length > 0 && existingProgress[0].note) {
      try {
        var parsed = JSON.parse(existingProgress[0].note);
        signOffData = {
          trainerSigned: parsed.trainerSigned || false,
          trainerDate: parsed.trainerDate || '',
          studentSigned: parsed.studentSigned || false,
          studentDate: parsed.studentDate || '',
          trainerNotes: parsed.trainerNotes || '',
          studentNotes: parsed.studentNotes || ''
        };
      } catch (e) {
        // Ignore parse error
      }
    }

    // Update sign-off data based on role
    if (role === 'trainer') {
      signOffData.trainerSigned = true;
      signOffData.trainerDate = dateStr;
      if (notes) signOffData.trainerNotes = notes;
    } else if (role === 'student') {
      signOffData.studentSigned = true;
      signOffData.studentDate = dateStr;
      if (notes) signOffData.studentNotes = notes;
    } else {
      return { success: false, message: 'role ต้องเป็น trainer หรือ student' };
    }

    // Determine new status
    var newStatus = 'in_progress';
    if (signOffData.trainerSigned && signOffData.studentSigned) {
      newStatus = 'completed';
    }

    var noteJson = JSON.stringify(signOffData);

    var result;
    if (existingProgress.length > 0) {
      var updateData = {
        status: newStatus,
        note: noteJson,
        updatedAt: now
      };
      if (newStatus === 'completed') {
        updateData.completedAt = now;
      }
      result = updateRow(CONFIG.SHEETS.ROADMAP_PROGRESS, existingProgress[0].id, updateData);
    } else {
      result = appendRow(CONFIG.SHEETS.ROADMAP_PROGRESS, {
        userId: userId,
        roadmapId: passportRoadmap.id,
        stepId: targetStep.id,
        status: newStatus,
        note: noteJson,
        completedAt: newStatus === 'completed' ? now : '',
        updatedAt: now
      });
    }

    return { success: true, data: result, message: 'ลงชื่อรับรองสำเร็จ' };
  } catch (err) {
    Logger.log('Error in signOffWeek: ' + err.message);
    return { success: false, message: 'ไม่สามารถลงชื่อรับรองได้: ' + err.message };
  }
}

/**
 * Gets a summary of the Training Passport for a student.
 * @param {string} userId - Student user ID
 * @return {Object} Summary with total/completed weeks, current week, progress %, pending sign-offs
 */
function getTrainingPassportSummary(userId) {
  try {
    var passport = getTrainingPassport(userId);
    if (!passport.success) {
      return passport;
    }

    var weeks = passport.data.weeks;
    var totalWeeks = weeks.length;
    var completedWeeks = 0;
    var currentWeek = 0;
    var pendingTrainerSignOffs = 0;
    var pendingStudentSignOffs = 0;

    for (var i = 0; i < weeks.length; i++) {
      var w = weeks[i];
      if (w.status === 'completed') {
        completedWeeks++;
      } else if (w.status === 'in_progress' || w.status === 'trainer_signed') {
        if (currentWeek === 0) currentWeek = w.weekNumber;
      } else if (w.status === 'not_started') {
        if (currentWeek === 0 && completedWeeks > 0) currentWeek = w.weekNumber;
      }

      if (!w.signOff.trainerSigned && w.status !== 'not_started') {
        pendingTrainerSignOffs++;
      }
      if (!w.signOff.studentSigned && w.status !== 'not_started') {
        pendingStudentSignOffs++;
      }
    }

    // If no current week found, set to first incomplete
    if (currentWeek === 0 && completedWeeks < totalWeeks) {
      for (var j = 0; j < weeks.length; j++) {
        if (weeks[j].status !== 'completed') {
          currentWeek = weeks[j].weekNumber;
          break;
        }
      }
    }

    var progressPercent = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

    return {
      success: true,
      data: {
        totalWeeks: totalWeeks,
        completedWeeks: completedWeeks,
        currentWeek: currentWeek,
        progressPercent: progressPercent,
        pendingTrainerSignOffs: pendingTrainerSignOffs,
        pendingStudentSignOffs: pendingStudentSignOffs
      }
    };
  } catch (err) {
    Logger.log('Error in getTrainingPassportSummary: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงสรุป Training Passport ได้: ' + err.message };
  }
}

/**
 * Gets Training Passport status for all students assigned to a mentor.
 * @param {string} mentorId - Mentor user ID
 * @return {Object} Result with array of student passport summaries
 */
function getTrainingPassportByMentor(mentorId) {
  try {
    if (!mentorId) {
      return { success: false, message: 'กรุณาระบุ mentorId' };
    }

    // Get mentor's students
    var mentorStudents = getRows(CONFIG.SHEETS.MENTOR_STUDENTS, { mentorId: mentorId, isActive: 'true' });

    var results = [];
    for (var i = 0; i < mentorStudents.length; i++) {
      var studentId = mentorStudents[i].studentId;

      // Get student info
      var student = getRowById(CONFIG.SHEETS.USERS, studentId);
      if (!student || String(student.isActive) === 'false') continue;

      // Get passport summary
      var summary = getTrainingPassportSummary(studentId);

      results.push({
        userId: studentId,
        name: (student.firstName || '') + ' ' + (student.lastName || ''),
        studentId: student.studentId || '',
        department: student.department || '',
        passport: summary.success ? summary.data : null
      });
    }

    return { success: true, data: results };
  } catch (err) {
    Logger.log('Error in getTrainingPassportByMentor: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลได้: ' + err.message };
  }
}

/**
 * Admin view: gets all students' Training Passport completion status.
 * @return {Object} Result with array of all student passport summaries
 */
function getTrainingPassportOverview() {
  try {
    var students = getRows(CONFIG.SHEETS.USERS, { role: CONFIG.ROLES.STUDENT });

    var results = [];
    for (var i = 0; i < students.length; i++) {
      var student = students[i];
      if (String(student.isActive) === 'false') continue;

      var summary = getTrainingPassportSummary(student.id);

      results.push({
        userId: student.id,
        name: (student.firstName || '') + ' ' + (student.lastName || ''),
        studentId: student.studentId || '',
        department: student.department || '',
        passport: summary.success ? summary.data : null
      });
    }

    return { success: true, data: results };
  } catch (err) {
    Logger.log('Error in getTrainingPassportOverview: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลภาพรวมได้: ' + err.message };
  }
}
