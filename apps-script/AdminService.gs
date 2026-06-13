/**
 * AdminService.gs - Admin dashboard and system setup functions
 * Provides statistics and system initialization.
 */

/**
 * Gets admin dashboard statistics.
 * @return {Object} Result with dashboard statistics
 */
function getAdminStats(params) {
  try {
    var user = resolveActingUser(params && params.userId);
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
      return String(p.status).toUpperCase() === 'COMPLETED';
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

    // Seed data: Makro Fresh Food 16-Week Training Passport Roadmap
    var roadmap1 = appendRow(CONFIG.SHEETS.ROADMAPS, {
      title: 'Training Passport - Makro Fresh Food (16 สัปดาห์)',
      description: 'แผนการฝึกอบรม Makro Fresh Food Supervisor 16 สัปดาห์ ครอบคลุมตั้งแต่การปฐมนิเทศจนถึงการนำเสนอโปรเจค',
      department: 'Fresh Food',
      isActive: 'true',
      createdBy: adminUser.id
    });

    // 16-week Training Passport steps
    var steps = [
      { stepNumber: 0, title: 'ก่อนลงสโตร์: ปฐมนิเทศ HO & Store', description: 'HO Orientation: แนะนำองค์กร นโยบาย ระเบียบข้อบังคับ / Store Orientation: แนะนำสโตร์ ทีมงาน สภาพแวดล้อมการทำงาน (สถานที่ฝึก: HO/Store, เครื่องมือ: OJT/ZOOM)', dueDate: '' },
      { stepNumber: 1, title: 'สัปดาห์ 1-2: ศึกษาแผนก Fresh Food & OJT', description: 'ศึกษาแผนกอาหารสด: F&V (ผักและผลไม้), Fish & Seafood (ปลาและอาหารทะเล), Butchery (เนื้อสัตว์), Dairy Chilled & Frozen (นมแช่เย็นและแช่แข็ง), Bakery (เบเกอรี่) พร้อม On-the-Job Training (สถานที่ฝึก: Store, เครื่องมือ: OJT)', dueDate: '' },
      { stepNumber: 2, title: 'สัปดาห์ 3: OPL Ordering', description: 'เรียนรู้ระบบการสั่งซื้อสินค้า (OPL Ordering) การวางแผนการสั่งซื้อ การจัดการ Stock ตามความต้องการ (สถานที่ฝึก: Store, เครื่องมือ: OJT/M-learning)', dueDate: '' },
      { stepNumber: 3, title: 'สัปดาห์ 4: Food Safety, GMP/HACCP', description: 'ความปลอดภัยอาหาร มาตรฐาน GMP (Good Manufacturing Practice) และ HACCP (Hazard Analysis Critical Control Point) (สถานที่ฝึก: Store/HO, เครื่องมือ: OJT/ZOOM)', dueDate: '' },
      { stepNumber: 4, title: 'สัปดาห์ 5: Receiving Management & Quality Check', description: 'การจัดการรับสินค้า การตรวจสอบคุณภาพสินค้าที่รับเข้า เกณฑ์การตรวจรับ (สถานที่ฝึก: Store, เครื่องมือ: OJT)', dueDate: '' },
      { stepNumber: 5, title: 'สัปดาห์ 6: Storage Management, Cold System, FIFO/FEFO', description: 'การจัดการคลังสินค้า ระบบความเย็น (Cold Chain) หลักการ FIFO (First In First Out) และ FEFO (First Expired First Out) (สถานที่ฝึก: Store, เครื่องมือ: OJT)', dueDate: '' },
      { stepNumber: 6, title: 'สัปดาห์ 7: Display Management, Plan-O-Gram, Merchandising', description: 'การจัดการการจัดแสดงสินค้า Plan-O-Gram การจัดเรียงสินค้า หลักการ Merchandising (สถานที่ฝึก: Store, เครื่องมือ: OJT/M-learning)', dueDate: '' },
      { stepNumber: 7, title: 'สัปดาห์ 8: Sale Analysis & Price Management', description: 'การวิเคราะห์ยอดขาย SGM Empowerment, BPM Price Change การจัดการราคาสินค้า (สถานที่ฝึก: Store, เครื่องมือ: OJT/M-learning)', dueDate: '' },
      { stepNumber: 8, title: 'สัปดาห์ 9: Stock Management & Inventory Adjustment', description: 'การจัดการสต็อกสินค้า การปรับปรุงสต็อก (Inventory Adjustment) การตรวจนับสินค้า (สถานที่ฝึก: Store, เครื่องมือ: OJT)', dueDate: '' },
      { stepNumber: 9, title: 'สัปดาห์ 10: Shrinkage Management (+ Innovation Project)', description: 'การจัดการการสูญเสีย (Shrinkage) การวิเคราะห์สาเหตุและแนวทางลดการสูญเสีย + เข้าเรียน Innovation Project Class จาก HO (สถานที่ฝึก: Store/HO, เครื่องมือ: OJT/ZOOM)', dueDate: '' },
      { stepNumber: 10, title: 'สัปดาห์ 11: Aging/NBS Management', description: 'การจัดการสินค้าใกล้หมดอายุ (Aging) และ NBS (Near Best-before/Sell-by) การลดราคา การจัดการสินค้าเสื่อมคุณภาพ (สถานที่ฝึก: Store, เครื่องมือ: OJT)', dueDate: '' },
      { stepNumber: 11, title: 'สัปดาห์ 12: Report Analysis (Trading/BI Report)', description: 'การวิเคราะห์รายงาน Trading Report และ BI Report การอ่านและตีความข้อมูล การนำข้อมูลไปใช้ในการตัดสินใจ (สถานที่ฝึก: Store, เครื่องมือ: OJT/M-learning)', dueDate: '' },
      { stepNumber: 12, title: 'สัปดาห์ 13: Customer Development', description: 'การพัฒนาลูกค้า การบริการลูกค้า การสร้างความพึงพอใจ การจัดการข้อร้องเรียน (สถานที่ฝึก: Store, เครื่องมือ: OJT)', dueDate: '' },
      { stepNumber: 13, title: 'สัปดาห์ 14: Soft Skill Management', description: 'ทักษะการเป็น Supervisor: การบริหารเวลา (Time Management), การแก้ปัญหา (Problem Solving), ทักษะการสื่อสาร (สถานที่ฝึก: Store/HO, เครื่องมือ: OJT/ZOOM)', dueDate: '' },
      { stepNumber: 14, title: 'สัปดาห์ 15: Supervisor Function Job', description: 'ปฏิบัติหน้าที่ Supervisor จริง รับผิดชอบงานเต็มรูปแบบ ดูแลทีมงาน จัดการงานประจำวัน (สถานที่ฝึก: Store, เครื่องมือ: OJT)', dueDate: '' },
      { stepNumber: 15, title: 'สัปดาห์ 16: Supervisor Function Job + Project Presentation', description: 'ปฏิบัติหน้าที่ Supervisor ต่อเนื่อง + นำเสนอ Innovation Project สรุปผลการฝึกอบรมทั้งหมด (สถานที่ฝึก: Store/HO, เครื่องมือ: OJT/ZOOM)', dueDate: '' }
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

    // Seed data: Knowledge Management Roadmap (6 topics)
    var kmRoadmap = appendRow(CONFIG.SHEETS.ROADMAPS, {
      title: 'Knowledge Management',
      description: 'การจัดการความรู้ 6 หัวข้อ สำหรับการประเมินผลการฝึกอบรม (25% ของคะแนนรวม) นักศึกษาต้องบันทึกความรู้ทั้ง 6 หัวข้อ และเลือก 1 หัวข้อเพื่อนำเสนอ',
      department: 'Fresh Food',
      isActive: 'true',
      createdBy: adminUser.id
    });

    var kmSteps = [
      { stepNumber: 1, title: 'การจัดการทรัพยากรบุคคล (Human Resource Management)', description: 'บันทึกความรู้เรื่องการจัดการทรัพยากรบุคคล: สิ่งที่ได้เรียนรู้, ปัญหาและแนวทางแก้ไข, การนำไปประยุกต์ใช้, ฟีดแบคและข้อเสนอแนะ' },
      { stepNumber: 2, title: 'การบริการลูกค้า (Customer Service)', description: 'บันทึกความรู้เรื่องการบริการลูกค้า: สิ่งที่ได้เรียนรู้, ปัญหาและแนวทางแก้ไข, การนำไปประยุกต์ใช้, ฟีดแบคและข้อเสนอแนะ' },
      { stepNumber: 3, title: 'การจัดการสินค้า (Merchandising)', description: 'บันทึกความรู้เรื่องการจัดการสินค้า: สิ่งที่ได้เรียนรู้, ปัญหาและแนวทางแก้ไข, การนำไปประยุกต์ใช้, ฟีดแบคและข้อเสนอแนะ' },
      { stepNumber: 4, title: 'การจัดการผลกำไรขาดทุน (Profit & Loss)', description: 'บันทึกความรู้เรื่องการจัดการผลกำไรขาดทุน: สิ่งที่ได้เรียนรู้, ปัญหาและแนวทางแก้ไข, การนำไปประยุกต์ใช้, ฟีดแบคและข้อเสนอแนะ' },
      { stepNumber: 5, title: 'ความปลอดภัยอาหาร (Food Safety)', description: 'บันทึกความรู้เรื่องความปลอดภัยอาหาร: สิ่งที่ได้เรียนรู้, ปัญหาและแนวทางแก้ไข, การนำไปประยุกต์ใช้, ฟีดแบคและข้อเสนอแนะ' },
      { stepNumber: 6, title: 'ความปลอดภัยการปฏิบัติงาน (Work Safety)', description: 'บันทึกความรู้เรื่องความปลอดภัยการปฏิบัติงาน: สิ่งที่ได้เรียนรู้, ปัญหาและแนวทางแก้ไข, การนำไปประยุกต์ใช้, ฟีดแบคและข้อเสนอแนะ' }
    ];

    for (var k = 0; k < kmSteps.length; k++) {
      appendRow(CONFIG.SHEETS.ROADMAP_STEPS, {
        roadmapId: kmRoadmap.id,
        stepNumber: kmSteps[k].stepNumber,
        title: kmSteps[k].title,
        description: kmSteps[k].description,
        dueDate: '',
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
