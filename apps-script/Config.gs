/**
 * Config.gs - Configuration constants for the Internship Management System
 */

var CONFIG_SPREADSHEET_ID_ = '';
try { CONFIG_SPREADSHEET_ID_ = SpreadsheetApp.getActiveSpreadsheet().getId(); } catch (e) { CONFIG_SPREADSHEET_ID_ = ''; }

var CONFIG = {
  SPREADSHEET_ID: CONFIG_SPREADSHEET_ID_,

  // URL หน้าเว็บบน GitHub Pages (ใช้แสดงลิงก์เมื่อเปิด /exec ตรง ๆ)
  FRONTEND_URL: 'https://recruitmakrocareer.github.io/internship/',

  // Sheet names mapping
  SHEETS: {
    USERS: 'Users',
    MENTOR_STUDENTS: 'MentorStudents',
    ROADMAPS: 'Roadmaps',
    ROADMAP_STEPS: 'RoadmapSteps',
    ROADMAP_PROGRESS: 'RoadmapProgress',
    ASSIGNMENTS: 'Assignments',
    SUBMISSIONS: 'Submissions',
    EVALUATIONS: 'Evaluations',
    RESOURCES: 'Resources',
    NOTIFICATIONS: 'Notifications',
    KNOWLEDGE_ENTRIES: 'KnowledgeEntries',
    STORE_LIST: 'StoreList',
    DEPARTMENT_LIST: 'DepartmentList'
  },

  // Column headers for each sheet
  HEADERS: {
    Users: [
      'id', 'email', 'password', 'role', 'firstName', 'lastName',
      'studentId', 'department', 'phone', 'lineUserId', 'profileImage',
      'isActive', 'createdAt', 'updatedAt',
      'prefix', 'nickname', 'birthDate', 'idCardNumber',
      'university', 'faculty', 'major', 'year', 'gpa',
      'internshipType', 'startDate', 'endDate',
      'address', 'universityAddress', 'skills', 'interests',
      'advisorName', 'advisorContact',
      'employeeId', 'branch', 'position',
      'cvFileUrl', 'cvFileName', 'transcriptFileUrl', 'transcriptFileName',
      'idCardFileUrl', 'idCardFileName', 'photoFileUrl', 'photoFileName',
      'name',
      'currentAddress', 'currentProvince', 'currentPostcode',
      'idCardAddress', 'idCardProvince', 'idCardPostcode',
      'militaryStatus', 'medicalCondition',
      'preferredBranch1', 'preferredBranch2', 'preferredBranch3',
      'preferredDept1', 'preferredDept2', 'preferredDept3',
      'currentHouseNo', 'currentVillage', 'currentSoi', 'currentRoad',
      'currentSubdistrict', 'currentDistrict',
      'idCardHouseNo', 'idCardVillage', 'idCardSoi', 'idCardRoad',
      'idCardSubdistrict', 'idCardDistrict',
      'maxStudents', 'studentStatus',
      'educationLevel', 'additionalInfo',
      'uniHouseNo', 'uniRoad', 'uniSubdistrict', 'uniDistrict', 'uniProvince', 'uniPostcode'
    ],
    MentorStudents: [
      'id', 'mentorId', 'studentId', 'assignedAt', 'isActive'
    ],
    Roadmaps: [
      'id', 'title', 'description', 'department', 'isActive',
      'createdBy', 'createdAt', 'updatedAt'
    ],
    RoadmapSteps: [
      'id', 'roadmapId', 'stepNumber', 'title', 'description',
      'dueDate', 'isActive', 'createdAt', 'updatedAt',
      'durationDays', 'resources', 'fileUrl', 'fileName'
    ],
    RoadmapProgress: [
      'id', 'userId', 'roadmapId', 'stepId', 'status',
      'note', 'completedAt', 'updatedAt',
      'trainerName', 'trainerPosition', 'trainerContact',
      'startDate', 'endDate', 'trainingDays', 'timeSlot',
      'evalResult', 'evalComment', 'evalBy', 'evalAt',
      'evalToken', 'attemptCount', 'evalByPosition',
      'startTime', 'endTime', 'dayTimes'
    ],
    Assignments: [
      'id', 'title', 'description', 'dueDate', 'maxScore',
      'assignedTo', 'createdBy', 'isActive', 'createdAt', 'updatedAt',
      'source', 'professorName'
    ],
    Submissions: [
      'id', 'assignmentId', 'userId', 'content', 'fileUrl',
      'fileName', 'status', 'score', 'feedback', 'submittedAt',
      'reviewedAt', 'reviewedBy'
    ],
    Evaluations: [
      'id', 'type', 'evaluatorId', 'evaluateeId', 'period',
      'scores', 'totalScore', 'maxScore', 'comment',
      'createdAt', 'updatedAt'
    ],
    Resources: [
      'id', 'title', 'description', 'category', 'type',
      'url', 'fileUrl', 'content', 'tags', 'createdBy',
      'isActive', 'createdAt', 'updatedAt',
      'sectionName', 'sortOrder', 'status'
    ],
    Notifications: [
      'id', 'userId', 'title', 'message', 'type',
      'isRead', 'relatedId', 'createdAt'
    ],
    KnowledgeEntries: [
      'id', 'userId', 'topicNumber', 'topicName', 'keyTakeaways',
      'challenges', 'knowledgeApply', 'feedback', 'isSelectedForPresentation',
      'presentationScore', 'presentationScoreDetail', 'evaluatorId',
      'createdAt', 'updatedAt',
      'fileUrl', 'fileName'
    ],
    StoreList: ['storeNo', 'storeName', 'storeNameTH', 'formatType', 'subregion', 'province', 'provinceTH'],
    DepartmentList: ['division', 'department']
  },

  // User roles
  ROLES: {
    STUDENT: 'STUDENT',
    MENTOR: 'MENTOR',
    ADMIN: 'ADMIN'
  },

  // Session / authorization (ดูรายละเอียดใน Session.gs)
  AUTH: {
    // อายุของ session token หลังล็อกอิน (ชั่วโมง)
    SESSION_TTL_HOURS: 12,

    // ENFORCE = false จะปิดการตรวจสิทธิ์ฝั่ง server ทั้งหมด
    // มีไว้สำหรับ debug ชั่วคราวเท่านั้น ห้ามใช้บนระบบจริง
    ENFORCE: true
  }
};
