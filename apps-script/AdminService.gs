/**
 * AdminService.gs - Admin dashboard and system setup functions
 * Provides statistics and system initialization.
 */

/**
 * Gets admin dashboard statistics.
 * @return {Object} Result with dashboard statistics
 */
function getAdminStats() {
  try {
    var user = getCurrentUser();
    if (!user || user.role !== CONFIG.ROLES.ADMIN) {
      return { success: false, message: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้' };
    }

    // Count users by role
    var allUsers = getAllRows(CONFIG.SHEETS.USERS);
    var activeStudents = allUsers.filter(function(u) {
      return u.role === CONFIG.ROLES.STUDENT && String(u.isActive) !== 'false';
    });
    var activeMentors = allUsers.filter(function(u) {
      return u.role === CONFIG.ROLES.MENTOR && String(u.isActive) !== 'false';
    });
    var totalStudents = allUsers.filter(function(u) {
      return u.role === CONFIG.ROLES.STUDENT;
    }).length;
    var totalMentors = allUsers.filter(function(u) {
      return u.role === CONFIG.ROLES.MENTOR;
    }).length;

    // Assignment stats
    var assignments = getRows(CONFIG.SHEETS.ASSIGNMENTS, { isActive: 'true' });
    var allSubmissions = getAllRows(CONFIG.SHEETS.SUBMISSIONS);
    var reviewedSubmissions = allSubmissions.filter(function(s) {
      return s.status === 'reviewed' || s.status === 'graded';
    });
    var pendingSubmissions = allSubmissions.filter(function(s) {
      return s.status === 'submitted' || s.status === 'pending';
    });

    // Roadmap progress stats
    var allProgress = getAllRows(CONFIG.SHEETS.ROADMAP_PROGRESS);
    var completedProgress = allProgress.filter(function(p) {
      return p.status === 'completed';
    });

    // Roadmap stats
    var roadmaps = getRows(CONFIG.SHEETS.ROADMAPS, { isActive: 'true' });
    var allSteps = getRows(CONFIG.SHEETS.ROADMAP_STEPS, { isActive: 'true' });
    var totalStepsForAll = allSteps.length * activeStudents.length;
    var overallRoadmapCompletion = totalStepsForAll > 0
      ? Math.round((completedProgress.length / totalStepsForAll) * 100)
      : 0;

    // Assignment completion rate
    var totalExpectedSubmissions = assignments.length * activeStudents.length;
    var assignmentCompletionRate = totalExpectedSubmissions > 0
      ? Math.round((allSubmissions.length / totalExpectedSubmissions) * 100)
      : 0;

    // Evaluation stats
    var evaluations = getAllRows(CONFIG.SHEETS.EVALUATIONS);

    // Mentor assignment stats
    var mentorAssignments = getRows(CONFIG.SHEETS.MENTOR_STUDENTS, { isActive: 'true' });
    var studentsWithMentor = [];
    for (var i = 0; i < mentorAssignments.length; i++) {
      if (studentsWithMentor.indexOf(mentorAssignments[i].studentId) === -1) {
        studentsWithMentor.push(mentorAssignments[i].studentId);
      }
    }

    // Recent activity (last 7 days)
    var sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    var recentSubmissions = allSubmissions.filter(function(s) {
      return new Date(s.submittedAt) >= sevenDaysAgo;
    }).length;

    var stats = {
      users: {
        totalStudents: totalStudents,
        activeStudents: activeStudents.length,
        totalMentors: totalMentors,
        activeMentors: activeMentors.length,
        studentsWithMentor: studentsWithMentor.length,
        studentsWithoutMentor: activeStudents.length - studentsWithMentor.length
      },
      assignments: {
        totalAssignments: assignments.length,
        totalSubmissions: allSubmissions.length,
        reviewedSubmissions: reviewedSubmissions.length,
        pendingSubmissions: pendingSubmissions.length,
        completionRate: assignmentCompletionRate
      },
      roadmaps: {
        totalRoadmaps: roadmaps.length,
        totalSteps: allSteps.length,
        overallCompletion: overallRoadmapCompletion
      },
      evaluations: {
        totalEvaluations: evaluations.length
      },
      recentActivity: {
        submissionsLast7Days: recentSubmissions
      }
    };

    return { success: true, data: stats };
  } catch (err) {
    Logger.log('Error in getAdminStats: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลสถิติได้: ' + err.message };
  }
}

/**
 * Initializes the system with all required sheets and seed data.
 * Creates admin, mentor, sample students, roadmaps, assignments, and resources.
 * @return {Object} Result with setup status
 */
function setupSystem() {
  try {
    // Create all sheets (getSheet auto-creates with headers)
    var sheetNames = Object.keys(CONFIG.SHEETS);
    for (var i = 0; i < sheetNames.length; i++) {
      var sheetKey = sheetNames[i];
      getSheet(CONFIG.SHEETS[sheetKey]);
    }

    // Check if admin already exists
    var existingAdmins = getRows(CONFIG.SHEETS.USERS, { role: CONFIG.ROLES.ADMIN });
    if (existingAdmins.length > 0) {
      return { success: true, message: 'ระบบถูกตั้งค่าแล้ว (พบผู้ดูแลระบบอยู่แล้ว)' };
    }

    // Seed data: Admin user
    var adminUser = appendRow(CONFIG.SHEETS.USERS, {
      email: 'admin@internship.com',
      password: hashPassword('admin123'),
      role: CONFIG.ROLES.ADMIN,
      firstName: 'ผู้ดูแล',
      lastName: 'ระบบ',
      studentId: '',
      department: 'ฝ่ายบริหาร',
      phone: '0800000001',
      lineUserId: '',
      profileImage: '',
      isActive: 'true'
    });

    // Seed data: Mentor user
    var mentorUser = appendRow(CONFIG.SHEETS.USERS, {
      email: 'mentor@internship.com',
      password: hashPassword('mentor123'),
      role: CONFIG.ROLES.MENTOR,
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      studentId: '',
      department: 'วิศวกรรมซอฟต์แวร์',
      phone: '0800000002',
      lineUserId: '',
      profileImage: '',
      isActive: 'true'
    });

    // Seed data: Student 1
    var student1 = appendRow(CONFIG.SHEETS.USERS, {
      email: 'student1@internship.com',
      password: hashPassword('student123'),
      role: CONFIG.ROLES.STUDENT,
      firstName: 'สมหญิง',
      lastName: 'ตั้งใจ',
      studentId: '6401001',
      department: 'วิทยาการคอมพิวเตอร์',
      phone: '0800000003',
      lineUserId: '',
      profileImage: '',
      isActive: 'true'
    });

    // Seed data: Student 2
    var student2 = appendRow(CONFIG.SHEETS.USERS, {
      email: 'student2@internship.com',
      password: hashPassword('student123'),
      role: CONFIG.ROLES.STUDENT,
      firstName: 'สมศักดิ์',
      lastName: 'ขยัน',
      studentId: '6401002',
      department: 'เทคโนโลยีสารสนเทศ',
      phone: '0800000004',
      lineUserId: '',
      profileImage: '',
      isActive: 'true'
    });

    // Assign mentor to students
    appendRow(CONFIG.SHEETS.MENTOR_STUDENTS, {
      mentorId: mentorUser.id,
      studentId: student1.id,
      isActive: 'true'
    });

    appendRow(CONFIG.SHEETS.MENTOR_STUDENTS, {
      mentorId: mentorUser.id,
      studentId: student2.id,
      isActive: 'true'
    });

    // Seed data: Roadmap
    var roadmap1 = appendRow(CONFIG.SHEETS.ROADMAPS, {
      title: 'แผนการฝึกงาน - พัฒนาเว็บแอปพลิเคชัน',
      description: 'แผนการฝึกงานสำหรับนักศึกษาสาขาพัฒนาเว็บแอปพลิเคชัน ครอบคลุมตั้งแต่พื้นฐานจนถึงการพัฒนาโปรเจค',
      department: 'วิศวกรรมซอฟต์แวร์',
      isActive: 'true',
      createdBy: adminUser.id
    });

    // Roadmap steps
    var steps = [
      { stepNumber: 1, title: 'ปฐมนิเทศและแนะนำองค์กร', description: 'ทำความรู้จักกับองค์กร ทีมงาน และระบบที่ใช้', dueDate: '' },
      { stepNumber: 2, title: 'ศึกษาเทคโนโลยีที่ใช้', description: 'ศึกษา HTML, CSS, JavaScript, และ Framework ที่ใช้ในโปรเจค', dueDate: '' },
      { stepNumber: 3, title: 'ทดลองพัฒนาโปรเจคขนาดเล็ก', description: 'ฝึกพัฒนาเว็บแอปพลิเคชันขนาดเล็กเพื่อทดสอบความเข้าใจ', dueDate: '' },
      { stepNumber: 4, title: 'เข้าร่วมโปรเจคจริง', description: 'เริ่มทำงานร่วมกับทีมในโปรเจคจริง', dueDate: '' },
      { stepNumber: 5, title: 'นำเสนอผลงานและสรุปการฝึกงาน', description: 'จัดทำรายงานและนำเสนอสิ่งที่ได้เรียนรู้', dueDate: '' }
    ];

    for (var s = 0; s < steps.length; s++) {
      appendRow(CONFIG.SHEETS.ROADMAP_STEPS, {
        roadmapId: roadmap1.id,
        stepNumber: steps[s].stepNumber,
        title: steps[s].title,
        description: steps[s].description,
        dueDate: steps[s].dueDate,
        isActive: 'true'
      });
    }

    // Seed data: Assignments
    appendRow(CONFIG.SHEETS.ASSIGNMENTS, {
      title: 'รายงานสรุปสัปดาห์ที่ 1',
      description: 'เขียนรายงานสรุปสิ่งที่ได้เรียนรู้ในสัปดาห์แรกของการฝึกงาน รวมถึงปัญหาที่พบและแนวทางแก้ไข',
      dueDate: '',
      maxScore: '100',
      assignedTo: 'all',
      createdBy: adminUser.id,
      isActive: 'true'
    });

    appendRow(CONFIG.SHEETS.ASSIGNMENTS, {
      title: 'โปรเจค HTML/CSS Portfolio',
      description: 'สร้างเว็บไซต์ Portfolio ส่วนตัวโดยใช้ HTML และ CSS มีหน้าเว็บอย่างน้อย 3 หน้า',
      dueDate: '',
      maxScore: '100',
      assignedTo: 'all',
      createdBy: mentorUser.id,
      isActive: 'true'
    });

    // Seed data: Resources
    appendRow(CONFIG.SHEETS.RESOURCES, {
      title: 'คู่มือการฝึกงาน',
      description: 'คู่มือสำหรับนักศึกษาฝึกงาน ครอบคลุมกฎระเบียบ ขั้นตอนปฏิบัติ และข้อควรปฏิบัติ',
      category: 'คู่มือ',
      type: 'document',
      url: '',
      fileUrl: '',
      content: 'ยินดีต้อนรับสู่โปรแกรมฝึกงาน กรุณาอ่านคู่มือนี้อย่างละเอียด',
      tags: 'คู่มือ, ฝึกงาน, กฎระเบียบ',
      createdBy: adminUser.id,
      isActive: 'true'
    });

    appendRow(CONFIG.SHEETS.RESOURCES, {
      title: 'แหล่งเรียนรู้ HTML/CSS/JavaScript',
      description: 'รวมลิงก์แหล่งเรียนรู้สำหรับการพัฒนาเว็บ',
      category: 'การเรียนรู้',
      type: 'link',
      url: 'https://developer.mozilla.org/th/',
      fileUrl: '',
      content: '',
      tags: 'HTML, CSS, JavaScript, เว็บ',
      createdBy: mentorUser.id,
      isActive: 'true'
    });

    appendRow(CONFIG.SHEETS.RESOURCES, {
      title: 'แนวทางการเขียนโค้ดที่ดี',
      description: 'แนวทางปฏิบัติที่ดีในการเขียนโค้ด (Best Practices) สำหรับนักพัฒนามือใหม่',
      category: 'การเรียนรู้',
      type: 'document',
      url: '',
      fileUrl: '',
      content: 'หลักการเขียนโค้ดที่ดี: 1) ตั้งชื่อตัวแปรให้สื่อความหมาย 2) เขียน Comment อธิบาย 3) แบ่งฟังก์ชันให้เหมาะสม',
      tags: 'โค้ด, Best Practices, พัฒนา',
      createdBy: adminUser.id,
      isActive: 'true'
    });

    // Create welcome notifications for seed users
    try {
      createNotification(student1.id, 'ยินดีต้อนรับ!', 'ยินดีต้อนรับสู่ระบบจัดการนักศึกษาฝึกงาน', 'info');
      createNotification(student2.id, 'ยินดีต้อนรับ!', 'ยินดีต้อนรับสู่ระบบจัดการนักศึกษาฝึกงาน', 'info');
      createNotification(mentorUser.id, 'ยินดีต้อนรับ!', 'คุณได้รับมอบหมายให้เป็นพี่เลี้ยงในระบบฝึกงาน', 'info');
    } catch (notifErr) {
      Logger.log('Warning: Could not create welcome notifications: ' + notifErr.message);
    }

    return {
      success: true,
      message: 'ตั้งค่าระบบสำเร็จ',
      data: {
        admin: { email: 'admin@internship.com', password: 'admin123' },
        mentor: { email: 'mentor@internship.com', password: 'mentor123' },
        students: [
          { email: 'student1@internship.com', password: 'student123' },
          { email: 'student2@internship.com', password: 'student123' }
        ]
      }
    };
  } catch (err) {
    Logger.log('Error in setupSystem: ' + err.message);
    return { success: false, message: 'เกิดข้อผิดพลาดในการตั้งค่าระบบ: ' + err.message };
  }
}
