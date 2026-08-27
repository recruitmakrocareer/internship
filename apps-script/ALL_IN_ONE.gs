/**
 * ALL_IN_ONE.gs — ไฟล์รวม backend ทั้งหมด (GENERATED — ห้ามแก้ไฟล์นี้โดยตรง)
 *
 * สร้างจากไฟล์โมดูลใน apps-script/ ด้วยคำสั่ง: npm run build:gs
 * ถ้าจะแก้โค้ด ให้แก้ที่ไฟล์โมดูลแล้ว generate ใหม่
 *
 * วิธีใช้: ใน Apps Script ให้เลือกอย่างใดอย่างหนึ่ง
 *   ก) วางไฟล์โมดูลทั้งหมด (ไม่ต้องมีไฟล์นี้) — แนะนำ
 *   ข) วางไฟล์นี้ไฟล์เดียว (ต้องไม่มีไฟล์โมดูลอื่นในโปรเจกต์)
 * ห้ามวางทั้งสองแบบพร้อมกัน เพราะฟังก์ชันชื่อซ้ำกันจะทับกันเงียบ ๆ
 *
 * โมดูลที่รวมไว้ (17 ไฟล์): Config.gs, Session.gs, Database.gs, Auth.gs, Code.gs, AdminService.gs, AssignmentService.gs, EvaluationService.gs, FileUpload.gs, KnowledgeManagement.gs, MentorContacts.gs, NotificationService.gs, ResourceService.gs, RoadmapService.gs, TrainingPassport.gs, TrainingPlanService.gs, UserService.gs
 */


// ════════════════════════════════════════════════════════════
// Config.gs
// ════════════════════════════════════════════════════════════

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

  /**
   * ชีทข้อมูลอ้างอิงที่นำเข้าจากภายนอก (master data) — ระบบ "อ่านเท่านั้น"
   * ห้ามเขียนทับแถวหัวตาราง เพราะเจ้าของข้อมูลตั้งชื่อคอลัมน์เองได้
   * (เช่น 'Store_No' แทน 'storeNo') โค้ดจับคู่ชื่อคอลัมน์ให้เองตอนอ่าน
   */
  REFERENCE_SHEETS: ['StoreList', 'DepartmentList'],

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


// ════════════════════════════════════════════════════════════
// Session.gs
// ════════════════════════════════════════════════════════════

/**
 * Session.gs - Stateless session tokens + server-side authorization
 *
 * ทำไมต้องมีไฟล์นี้:
 * Web App ถูก deploy เป็น "Anyone" ทำให้ทุก action ใน handleApiRequest()
 * เคยเรียกได้โดยไม่ต้องล็อกอิน และตัวตนผู้เรียกก็มาจาก params.userId ที่ client
 * ส่งมาเอง (แก้ค่าได้อิสระ) ไฟล์นี้เพิ่ม 2 ชั้นป้องกัน:
 *
 *   1. Session token — ลงลายมือชื่อด้วย HMAC-SHA256 จาก secret ใน
 *      ScriptProperties ตรวจสอบได้ในหน่วยความจำ ไม่ต้องอ่านชีท (ไม่เพิ่ม latency)
 *   2. ACTION_POLICY_ — ตารางกำหนดว่าแต่ละ action ต้องเป็น role ใด และ
 *      พารามิเตอร์ตัวตนตัวไหนต้องถูกบังคับเป็นผู้ใช้ในโทเคน (กัน IDOR)
 *
 * โทเคนเป็น stateless: ไม่มีตาราง session ให้ดูแล/ล้าง แต่แลกมาด้วยการเพิกถอน
 * รายใบไม่ได้ (ต้องรอหมดอายุ หรือหมุน SESSION_SECRET เพื่อตัดทุกใบพร้อมกัน)
 */

// ════════════════════════════════════════════════════════════
// Session context (ต่อ 1 request)
// ════════════════════════════════════════════════════════════

var SESSION_CONTEXT_ = null;

/**
 * ตั้งค่า session ของ request ปัจจุบัน (เรียกจาก authorizeRequest_ เท่านั้น)
 * @param {Object|null} session - {userId, role} หรือ null
 */
function setSessionContext_(session) {
  SESSION_CONTEXT_ = session || null;
}

/**
 * @return {Object|null} session ของ request ปัจจุบัน {userId, role, expiresAt}
 */
function getSessionContext_() {
  return SESSION_CONTEXT_;
}

// ════════════════════════════════════════════════════════════
// Token mint / verify
// ════════════════════════════════════════════════════════════

/**
 * คืน secret สำหรับเซ็นโทเคน สร้างอัตโนมัติครั้งแรกที่ใช้
 * ลบ property นี้ใน Project Settings = เพิกถอนโทเคนทุกใบทันที
 * @return {string}
 */
function sessionSecret_() {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('SESSION_SECRET');
  if (!secret) {
    secret = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty('SESSION_SECRET', secret);
  }
  return secret;
}

/**
 * base64url ที่ไม่มี padding (ใช้ได้ทั้งใน query string และ JSON)
 * @param {string|Byte[]} value
 * @return {string}
 */
function base64Url_(value) {
  return Utilities.base64EncodeWebSafe(value).replace(/=+$/, '');
}

/**
 * @param {string} payloadB64 - payload ที่เข้ารหัส base64url แล้ว
 * @return {string} ลายมือชื่อ HMAC-SHA256 แบบ base64url
 */
function signSessionPayload_(payloadB64) {
  var raw = Utilities.computeHmacSha256Signature(payloadB64, sessionSecret_());
  return base64Url_(raw);
}

/**
 * เทียบสตริงแบบไม่ให้เวลาที่ใช้บอกใบ้ว่าตรงกันกี่ตัว (timing-safe)
 * @param {string} a
 * @param {string} b
 * @return {boolean}
 */
function timingSafeEquals_(a, b) {
  var sa = String(a), sb = String(b);
  if (sa.length !== sb.length) return false;
  var diff = 0;
  for (var i = 0; i < sa.length; i++) {
    diff |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * สร้าง session token สำหรับผู้ใช้ที่ล็อกอินสำเร็จ
 * @param {Object} user - ผู้ใช้ (ต้องมี id และ role)
 * @return {string} โทเคนรูปแบบ "<payload>.<signature>"
 */
function createSessionToken_(user) {
  var ttlHours = (CONFIG.AUTH && CONFIG.AUTH.SESSION_TTL_HOURS) || 12;
  var payload = {
    u: user.id,
    r: user.role,
    e: Date.now() + ttlHours * 60 * 60 * 1000
  };
  var payloadB64 = base64Url_(JSON.stringify(payload));
  return payloadB64 + '.' + signSessionPayload_(payloadB64);
}

/**
 * ตรวจสอบโทเคน: ลายมือชื่อถูกต้องและยังไม่หมดอายุ
 * @param {string} token
 * @return {Object|null} {userId, role, expiresAt} หรือ null ถ้าใช้ไม่ได้
 */
function verifySessionToken_(token) {
  try {
    if (!token) return null;
    var parts = String(token).split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

    if (!timingSafeEquals_(signSessionPayload_(parts[0]), parts[1])) return null;

    var json = Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString();
    var payload = JSON.parse(json);
    if (!payload || !payload.u || !payload.r || !payload.e) return null;
    if (Date.now() > Number(payload.e)) return null;

    return { userId: String(payload.u), role: String(payload.r), expiresAt: Number(payload.e) };
  } catch (err) {
    Logger.log('verifySessionToken_ error: ' + err.message);
    return null;
  }
}

// ════════════════════════════════════════════════════════════
// ความสัมพันธ์พี่เลี้ยง–นักศึกษา
// ════════════════════════════════════════════════════════════

/** แคชต่อ 1 request (Apps Script เริ่ม global ใหม่ทุกครั้งที่ถูกเรียก) */
var MENTOR_STUDENTS_CACHE_ = {};

/**
 * รหัสนักศึกษาที่อยู่ในความดูแลของพี่เลี้ยง (แถวที่ isActive = true)
 * ครอบทั้งการมอบหมายโดยแอดมิน (assignMentor) และที่นักศึกษาเพิ่มเอง (addMentorContact)
 * @param {string} mentorId
 * @return {string[]}
 */
function mentorStudentIds_(mentorId) {
  var key = String(mentorId);
  if (MENTOR_STUDENTS_CACHE_[key]) return MENTOR_STUDENTS_CACHE_[key];

  var rows = getRows(CONFIG.SHEETS.MENTOR_STUDENTS, { mentorId: key });
  var ids = [];
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].isActive) === 'true') ids.push(String(rows[i].studentId));
  }

  MENTOR_STUDENTS_CACHE_[key] = ids;
  return ids;
}

/**
 * พี่เลี้ยงคนนี้ดูแลนักศึกษาคนนี้อยู่หรือไม่ (ข้อมูลของตัวเองถือว่าใช่)
 * @param {string} mentorId
 * @param {string} studentId
 * @return {boolean}
 */
function mentorOwnsStudent_(mentorId, studentId) {
  if (String(mentorId) === String(studentId)) return true;
  return mentorStudentIds_(mentorId).indexOf(String(studentId)) !== -1;
}

// ════════════════════════════════════════════════════════════
// Authorization policy
// ════════════════════════════════════════════════════════════

/**
 * นโยบายต่อ action:
 *   public    - เรียกได้โดยไม่ต้องล็อกอิน
 *   bootstrap - เรียกได้เฉพาะตอนที่ระบบยังไม่มี ADMIN (ใช้ setup ครั้งแรก) นอกนั้นต้องเป็น ADMIN
 *   roles     - รายชื่อ role ที่เรียกได้ (ไม่ระบุ = ทุก role ที่ล็อกอินแล้ว)
 *   actor     - พารามิเตอร์ "ผู้กระทำ" บังคับเป็น userId ในโทเคนเสมอทุก role
 *   own       - พารามิเตอร์ "เจ้าของข้อมูล" บังคับเป็นตัวเองเมื่อเป็น STUDENT
 *               (MENTOR/ADMIN ยังส่ง id ของนักศึกษาที่ดูแลได้)
 *   ownMentor - พารามิเตอร์ mentor บังคับเป็นตัวเองเมื่อเป็น MENTOR
 *   mentorScope - พารามิเตอร์ที่ชี้ตัวนักศึกษา: ถ้าผู้เรียกเป็น MENTOR ต้องเป็น
 *               นักศึกษาในความดูแล (ตามชีท MentorStudents) ไม่งั้นตอบ FORBIDDEN
 *   studentSignOnly - นักศึกษาลงชื่อได้เฉพาะช่อง 'student' (ห้ามลงชื่อแทนผู้ฝึกสอน)
 */
var ACTION_POLICY_ = {
  // ── System ────────────────────────────────────────────────
  ping: { public: true },
  setupSystem: { bootstrap: true },
  syncAllHeaders: { roles: ['ADMIN'] },

  // ── Auth ──────────────────────────────────────────────────
  login: { public: true },
  register: { public: true },
  resetPassword: { public: true },
  logout: { public: true },
  getCurrentUser: {},
  changePassword: { actor: ['userId'] },

  // ── Users / Students ──────────────────────────────────────
  // รายชื่อนักศึกษาทั้งระบบใช้แต่ในหน้าแอดมิน — พี่เลี้ยงใช้ getStudentsByMentor
  getStudents: { roles: ['ADMIN'] },
  getStudent: { roles: ['ADMIN'] },
  createStudent: { roles: ['ADMIN'] },
  updateStudent: { roles: ['ADMIN'] },
  deactivateStudent: { roles: ['ADMIN'] },
  getUserProfile: { own: ['userId'], mentorScope: ['userId'] },
  updateProfile: { actor: ['userId'] },

  // ── Mentors ───────────────────────────────────────────────
  getMentors: {},
  createMentor: { roles: ['ADMIN'] },
  updateMentor: { roles: ['ADMIN'] },
  assignMentor: { roles: ['ADMIN'] },
  getStudentsByMentor: { roles: ['ADMIN', 'MENTOR'], ownMentor: ['mentorId'] },
  getMyMentors: { own: ['studentId'] },
  addMentorContact: { own: ['studentId'] },
  removeMentorContact: { own: ['studentId'] },

  // ── Roadmaps ──────────────────────────────────────────────
  getRoadmaps: {},
  getRoadmap: {},
  createRoadmap: { roles: ['ADMIN'], actor: ['createdBy'] },
  updateRoadmap: { roles: ['ADMIN'] },
  deleteRoadmap: { roles: ['ADMIN'] },
  createRoadmapStep: { roles: ['ADMIN'] },
  updateRoadmapStep: { roles: ['ADMIN'] },
  deleteRoadmapStep: { roles: ['ADMIN'] },
  getRoadmapProgress: { own: ['userId'], mentorScope: ['userId'] },
  updateRoadmapProgress: { own: ['userId'], mentorScope: ['userId'] },

  // ── Training plan + QR ประเมิน ────────────────────────────
  updateStepPlan: { own: ['userId'], mentorScope: ['userId'], actor: ['actorId'] },
  getEvalToken: { own: ['userId'], mentorScope: ['userId'] },
  getEvalByToken: { public: true },
  submitEvalByToken: { public: true },

  // ── Assignments ───────────────────────────────────────────
  getAssignments: {},
  getAssignment: {},
  createAssignment: { roles: ['ADMIN'], actor: ['createdBy'] },
  updateAssignment: { roles: ['ADMIN'] },
  deleteAssignment: { roles: ['ADMIN'] },
  submitAssignment: { actor: ['userId'] },
  // พี่เลี้ยงที่ไม่ระบุ userId จะถูกกรองเหลือนักศึกษาในความดูแล (ดู getSubmissions)
  getSubmissions: { own: ['userId'], mentorScope: ['userId'] },
  reviewSubmission: { roles: ['ADMIN', 'MENTOR'], actor: ['reviewerId'] },

  // ── Evaluations ───────────────────────────────────────────
  getEvaluations: { roles: ['ADMIN'] },
  // นักศึกษาส่งได้เฉพาะแบบประเมินของตัวเอง (แบบประเมินหลังฝึกงาน)
  // MENTOR/ADMIN ประเมินนักศึกษาคนอื่นได้ตามปกติ
  createEvaluation: { actor: ['evaluatorId'], own: ['evaluateeId'] },
  getEvaluationsByUser: { own: ['userId'], mentorScope: ['userId'] },

  // ── Resources ─────────────────────────────────────────────
  getResources: {},
  getResource: {},
  createResource: { roles: ['ADMIN'], actor: ['createdBy'] },
  updateResource: { roles: ['ADMIN'] },
  deleteResource: { roles: ['ADMIN'] },

  // ── Notifications ─────────────────────────────────────────
  // ไม่มีหน้าไหนอ่านการแจ้งเตือนของคนอื่น จึงบังคับเป็นของตัวเองทุกบทบาท
  getNotifications: { actor: ['userId'] },
  getUnreadCount: { actor: ['userId'] },
  markAsRead: {},
  markAllAsRead: { actor: ['userId'] },
  sendBroadcast: { roles: ['ADMIN'], actor: ['senderId'] },

  // ── Training Passport ─────────────────────────────────────
  getTrainingPassport: { own: ['userId'], mentorScope: ['userId'] },
  getTrainingPassportSummary: { own: ['userId'], mentorScope: ['userId'] },
  getTrainingPassportByMentor: { roles: ['ADMIN', 'MENTOR'], ownMentor: ['mentorId'] },
  getTrainingPassportOverview: { roles: ['ADMIN'] },
  signOffWeek: { own: ['userId'], mentorScope: ['userId'], studentSignOnly: true },

  // ── Knowledge Management ──────────────────────────────────
  getKnowledgeEntries: { own: ['userId'], mentorScope: ['userId'] },
  saveKnowledgeEntry: { own: ['userId'], mentorScope: ['userId'] },
  selectPresentationTopic: { own: ['userId'], mentorScope: ['userId'] },
  scorePresentationKM: { roles: ['ADMIN', 'MENTOR'], mentorScope: ['userId'], actor: ['evaluatorId'] },
  getKnowledgeSummary: { own: ['userId'], mentorScope: ['userId'] },
  getAllKnowledgeSummaries: { roles: ['ADMIN', 'MENTOR'] },

  // ── Files (Google Drive) ──────────────────────────────────
  // หน้าสมัครสมาชิกต้องแนบ CV/รูปถ่ายก่อนมีบัญชี จึงเปิดให้อัปโหลดลง
  // โฟลเดอร์ profiles ได้โดยไม่ล็อกอิน (จำกัดขนาดแยกใน FileUpload.gs)
  uploadFile: { publicSubfolders: ['profiles'] },
  getFileUrl: {},
  deleteFile: { roles: ['ADMIN'] },
  listFiles: { roles: ['ADMIN'] },

  // ── Reference data (ใช้ในหน้าสมัครสมาชิกก่อนล็อกอิน) ──────
  getStoreList: { public: true },
  getDepartmentList: { public: true },

  // ── Admin ─────────────────────────────────────────────────
  getAdminStats: { roles: ['ADMIN'] }
};

/**
 * ตรวจสิทธิ์ของ request แล้วบังคับพารามิเตอร์ตัวตนให้ตรงกับผู้ใช้ในโทเคน
 *
 * @param {string} action - ชื่อ action
 * @param {Object} params - พารามิเตอร์ของ request (แก้ไขในตัวเพื่อบังคับตัวตน)
 * @return {Object} {allowed: boolean, code: string, message: string, session: Object|null}
 */
function authorizeRequest_(action, params) {
  setSessionContext_(null);
  MENTOR_STUDENTS_CACHE_ = {};

  if (!action) {
    return { allowed: false, code: 'BAD_REQUEST', message: 'ไม่ได้ระบุ action' };
  }

  var policy = ACTION_POLICY_[action];
  if (!policy) {
    // action ที่ไม่รู้จักปล่อยผ่านไปให้ switch ตอบ "Unknown action"
    // แต่ถ้าเป็น action ที่เพิ่มใหม่แล้วลืมใส่นโยบาย จะถูกบังคับล็อกอินไว้ก่อน
    policy = {};
  }

  var enforce = !(CONFIG.AUTH && CONFIG.AUTH.ENFORCE === false);
  var session = verifySessionToken_(params.authToken);
  setSessionContext_(session);

  if (!enforce) {
    // โหมดผ่อนปรนสำหรับ debug เท่านั้น (CONFIG.AUTH.ENFORCE = false)
    return { allowed: true, session: session };
  }

  if (policy.public) {
    return { allowed: true, session: session };
  }

  // อัปโหลดไฟล์ระหว่างสมัครสมาชิก (ยังไม่มีบัญชี) เฉพาะโฟลเดอร์ที่อนุญาต
  if (!session && policy.publicSubfolders &&
      policy.publicSubfolders.indexOf(String(params.subfolder)) !== -1) {
    return { allowed: true, session: null };
  }

  if (policy.bootstrap) {
    var admins = getRows(CONFIG.SHEETS.USERS, { role: CONFIG.ROLES.ADMIN });
    if (admins.length === 0) {
      return { allowed: true, session: session };
    }
    policy = { roles: ['ADMIN'] };
  }

  if (!session) {
    return {
      allowed: false,
      code: 'UNAUTHORIZED',
      message: 'กรุณาเข้าสู่ระบบใหม่ (เซสชันหมดอายุหรือไม่ถูกต้อง)',
      session: null
    };
  }

  if (policy.roles && policy.roles.indexOf(session.role) === -1) {
    return {
      allowed: false,
      code: 'FORBIDDEN',
      message: 'คุณไม่มีสิทธิ์ใช้งานส่วนนี้',
      session: session
    };
  }

  // พี่เลี้ยงเข้าถึงได้เฉพาะนักศึกษาในความดูแลของตัวเอง
  if (policy.mentorScope && session.role === CONFIG.ROLES.MENTOR) {
    for (var m = 0; m < policy.mentorScope.length; m++) {
      var target = params[policy.mentorScope[m]];
      if (target && !mentorOwnsStudent_(session.userId, target)) {
        return {
          allowed: false,
          code: 'FORBIDDEN',
          message: 'คุณเข้าถึงได้เฉพาะข้อมูลของนักศึกษาในความดูแลของคุณ',
          session: session
        };
      }
    }
  }

  applyIdentityGuards_(policy, params, session);

  return { allowed: true, session: session };
}

/**
 * บังคับพารามิเตอร์ตัวตนให้เป็นผู้ใช้ในโทเคน (กันการอ้างเป็นคนอื่น)
 * @param {Object} policy
 * @param {Object} params
 * @param {Object} session
 */
function applyIdentityGuards_(policy, params, session) {
  var i;

  // ผู้กระทำ = เจ้าของโทเคนเสมอ ไม่ว่าจะ role ใด
  if (policy.actor) {
    for (i = 0; i < policy.actor.length; i++) {
      params[policy.actor[i]] = session.userId;
    }
  }

  // นักศึกษาเข้าถึงได้แค่ข้อมูลของตัวเอง
  if (policy.own && session.role === CONFIG.ROLES.STUDENT) {
    for (i = 0; i < policy.own.length; i++) {
      params[policy.own[i]] = session.userId;
    }
  }

  // พี่เลี้ยงดูได้แค่ในนามตัวเอง
  if (policy.ownMentor && session.role === CONFIG.ROLES.MENTOR) {
    for (i = 0; i < policy.ownMentor.length; i++) {
      params[policy.ownMentor[i]] = session.userId;
    }
  }

  // นักศึกษาลงชื่อได้เฉพาะช่องของนักศึกษา ห้ามลงชื่อแทนผู้ฝึกสอน
  if (policy.studentSignOnly && session.role === CONFIG.ROLES.STUDENT) {
    params.role = 'student';
  }
}


// ════════════════════════════════════════════════════════════
// Database.gs
// ════════════════════════════════════════════════════════════

/**
 * Database.gs - Core database functions using SpreadsheetApp
 * Provides CRUD operations on Google Sheets as a database layer.
 */

/**
 * Gets the spreadsheet instance.
 * @return {Spreadsheet} The spreadsheet object
 */
function getSpreadsheet() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
}

/**
 * Gets a sheet by name, creates it with headers if it doesn't exist.
 * @param {string} sheetName - The name of the sheet
 * @return {Sheet} The sheet object
 */
function getSheet(sheetName) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  var expectedHeaders = CONFIG.HEADERS[sheetName];

  // ชีทข้อมูลอ้างอิงที่มีอยู่แล้ว: ห้ามแตะแถวหัวตารางของเจ้าของข้อมูล
  if (sheet && isReferenceSheet(sheetName)) {
    return sheet;
  }

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (expectedHeaders && expectedHeaders.length > 0) {
      sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
      sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  } else if (expectedHeaders && expectedHeaders.length > 0) {
    reconcileHeaders(sheet, expectedHeaders);
  }

  return sheet;
}

/**
 * Safely reconciles a sheet's header row against the expected headers.
 *
 * The project convention is that new columns are ALWAYS appended to the end of
 * the CONFIG.HEADERS arrays. This helper enforces that: it only ever extends the
 * header row with genuinely-missing trailing columns and never overwrites an
 * existing header cell. If an existing header differs from the expected header at
 * the same position (a rename/reorder), it refuses to rewrite — overwriting would
 * silently remap every data row to the wrong column — and reports the mismatch
 * instead, leaving the data intact.
 *
 * @param {Sheet} sheet - The sheet to reconcile
 * @param {string[]} expected - The expected header array from CONFIG.HEADERS
 * @return {string} A status string: 'ok', 'extended ...', or 'MISMATCH ...'
 */
function reconcileHeaders(sheet, expected) {
  var lastCol = sheet.getLastColumn();
  var current = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

  // Trim trailing empty cells from the current header row.
  var currentLen = current.length;
  while (currentLen > 0 && current[currentLen - 1] === '') currentLen--;

  // Detect a true reorder/rename: any populated existing header that does not
  // match the expected header at the same position.
  for (var i = 0; i < currentLen; i++) {
    if (current[i] !== '' && current[i] !== expected[i]) {
      var msg = 'MISMATCH at col ' + (i + 1) + ': sheet has "' + current[i] +
        '" but CONFIG expects "' + expected[i] + '" — NOT rewriting to avoid data corruption';
      Logger.log('reconcileHeaders(' + sheet.getName() + '): ' + msg);
      return msg;
    }
  }

  // Existing headers are a valid prefix of expected. Append any missing columns.
  if (currentLen < expected.length) {
    sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
    invalidateSheetCache_(sheet.getName());
    sheet.getRange(1, 1, 1, expected.length).setFontWeight('bold');
    if (sheet.getFrozenRows() < 1) sheet.setFrozenRows(1);
    return 'extended ' + currentLen + ' -> ' + expected.length + ' cols';
  }

  return 'ok (' + currentLen + ' cols)';
}

/**
 * สร้าง filter สำหรับ getRows จากพารามิเตอร์ที่ส่งมาทาง API
 *
 * getRows เทียบ "ทุกคีย์" ใน filter กับค่าในแถว รวมคีย์ที่ไม่ใช่คอลัมน์ (จงใจให้
 * fail closed เพื่อไม่ให้คีย์ที่สะกดผิดกลายเป็น "ไม่กรองอะไรเลย") แต่ router ส่ง
 * params ทั้งก้อนซึ่งมี action/authToken ติดมาด้วย ถ้าไม่คัดออกก่อน จะไม่ตรงกับ
 * แถวไหนเลยและได้ผลลัพธ์ว่างทุกครั้ง
 *
 * @param {string} sheetName - ชื่อชีท (คีย์ใน CONFIG.HEADERS)
 * @param {Object} params - พารามิเตอร์จาก request
 * @param {string[]} allowedFields - คอลัมน์ที่อนุญาตให้ใช้กรอง
 * @return {Object} filter ที่มีแต่คอลัมน์จริงและมีค่า
 */
function sheetFilter_(sheetName, params, allowedFields) {
  var filter = {};
  if (!params) return filter;

  var headers = CONFIG.HEADERS[sheetName] || [];
  for (var i = 0; i < allowedFields.length; i++) {
    var field = allowedFields[i];
    if (headers.indexOf(field) === -1) continue;

    var value = params[field];
    if (value !== undefined && value !== null && String(value) !== '') {
      filter[field] = value;
    }
  }
  return filter;
}

/**
 * ตรวจว่าชีทเป็นข้อมูลอ้างอิงที่นำเข้าจากภายนอก (อ่านเท่านั้น ห้ามเขียนหัวตาราง)
 * @param {string} sheetName
 * @return {boolean}
 */
function isReferenceSheet(sheetName) {
  var list = CONFIG.REFERENCE_SHEETS || [];
  return list.indexOf(sheetName) !== -1;
}

/**
 * แคชข้อมูลชีทต่อ 1 request
 *
 * ทำไมต้องมี: getRowById() อ่านทั้งชีทหนึ่งครั้งต่อการเรียกหนึ่งครั้ง และหลาย handler
 * เรียกมันในลูป (เช่น getSubmissions หา user + assignment ของทุกแถว) ทำให้รายการ
 * 50 แถวกลายเป็นการอ่านชีทเป็นร้อยครั้ง ซึ่งเป็นงานที่ช้าที่สุดใน Apps Script
 *
 * ปลอดภัยเพราะ Apps Script เริ่มตัวแปร global ใหม่ทุกครั้งที่ web app ถูกเรียก
 * แคชจึงมีอายุแค่ภายใน request เดียว ไม่มีข้อมูลค้างข้าม request
 * และทุกฟังก์ชันที่เขียนข้อมูลจะล้างแคชของชีทนั้นทันที
 */
var SHEET_CACHE_ = {};

/**
 * ล้างแคชของชีท (ไม่ระบุชื่อ = ล้างทั้งหมด)
 * @param {string} [sheetName]
 */
function invalidateSheetCache_(sheetName) {
  if (sheetName) delete SHEET_CACHE_[sheetName];
  else SHEET_CACHE_ = {};
}

/**
 * อ่านชีททั้งหมดจากแคช (อ่านจริงครั้งแรกครั้งเดียวต่อ request)
 * @param {string} sheetName
 * @return {Object[]} แถวข้อมูลที่ parse แล้ว (ห้ามแก้ไข — ใช้ผ่าน getAllRows)
 */
function cachedRows_(sheetName) {
  if (SHEET_CACHE_[sheetName]) return SHEET_CACHE_[sheetName];

  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();

  var rows = [];
  if (data.length > 1) {
    var headers = data[0];
    for (var i = 1; i < data.length; i++) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        var val = data[i][j];
        if (val instanceof Date) {
          val = val.toISOString();
        }
        row[headers[j]] = val;
      }
      rows.push(row);
    }
  }

  SHEET_CACHE_[sheetName] = rows;
  return rows;
}

/**
 * Gets all rows from a sheet as an array of objects.
 * @param {string} sheetName - The name of the sheet
 * @return {Object[]} Array of row objects with header keys
 */
function getAllRows(sheetName) {
  try {
    var rows = cachedRows_(sheetName);

    // คืนสำเนาใหม่ทุกครั้ง เพราะผู้เรียกหลายที่แก้ไข object ที่ได้
    // (เช่น เติม studentName หรือ delete password) ถ้าคืนตัวเดิมจะเปื้อนข้ามการเรียก
    var copies = [];
    for (var i = 0; i < rows.length; i++) {
      var src = rows[i];
      var copy = {};
      var keys = Object.keys(src);
      for (var k = 0; k < keys.length; k++) copy[keys[k]] = src[keys[k]];
      copies.push(copy);
    }
    return copies;
  } catch (err) {
    Logger.log('Error in getAllRows(' + sheetName + '): ' + err.message);
    return [];
  }
}

/**
 * Gets rows matching a filter object.
 * @param {string} sheetName - The name of the sheet
 * @param {Object} filter - Key-value pairs to filter by (all must match)
 * @return {Object[]} Array of matching row objects
 */
function getRows(sheetName, filter) {
  try {
    var allRows = getAllRows(sheetName);

    if (!filter || Object.keys(filter).length === 0) {
      return allRows;
    }

    return allRows.filter(function(row) {
      var keys = Object.keys(filter);
      for (var i = 0; i < keys.length; i++) {
        if (String(row[keys[i]]) !== String(filter[keys[i]])) {
          return false;
        }
      }
      return true;
    });
  } catch (err) {
    Logger.log('Error in getRows(' + sheetName + '): ' + err.message);
    return [];
  }
}

/**
 * Gets a single row by its ID.
 * @param {string} sheetName - The name of the sheet
 * @param {string} id - The ID to search for
 * @return {Object|null} The matching row object or null
 */
function getRowById(sheetName, id) {
  try {
    var allRows = getAllRows(sheetName);

    for (var i = 0; i < allRows.length; i++) {
      if (String(allRows[i].id) === String(id)) {
        return allRows[i];
      }
    }

    return null;
  } catch (err) {
    Logger.log('Error in getRowById(' + sheetName + ', ' + id + '): ' + err.message);
    return null;
  }
}

/**
 * Appends a new row to a sheet with auto-generated ID and timestamps.
 * @param {string} sheetName - The name of the sheet
 * @param {Object} data - Key-value pairs of data to insert
 * @return {Object} The inserted row object with generated ID
 */
function appendRow(sheetName, data) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    var sheet = getSheet(sheetName);
    var headers = CONFIG.HEADERS[sheetName];

    if (!headers) {
      throw new Error('ไม่พบ headers สำหรับชีท: ' + sheetName);
    }

    // Auto-generate ID if not provided
    if (!data.id) {
      data.id = generateId();
    }

    // Add timestamps
    var now = new Date().toISOString();
    if (headers.indexOf('createdAt') !== -1 && !data.createdAt) {
      data.createdAt = now;
    }
    if (headers.indexOf('updatedAt') !== -1 && !data.updatedAt) {
      data.updatedAt = now;
    }
    if (headers.indexOf('submittedAt') !== -1 && !data.submittedAt) {
      data.submittedAt = now;
    }
    if (headers.indexOf('assignedAt') !== -1 && !data.assignedAt) {
      data.assignedAt = now;
    }

    // Build row array matching headers
    var rowArray = headers.map(function(header) {
      return data[header] !== undefined ? data[header] : '';
    });

    sheet.appendRow(rowArray);
    invalidateSheetCache_(sheetName);

    // Build return object
    var result = {};
    for (var i = 0; i < headers.length; i++) {
      result[headers[i]] = rowArray[i];
    }

    return result;
  } catch (err) {
    Logger.log('Error in appendRow(' + sheetName + '): ' + err.message);
    throw new Error('ไม่สามารถเพิ่มข้อมูลได้: ' + err.message);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Updates an existing row by ID.
 * @param {string} sheetName - The name of the sheet
 * @param {string} id - The ID of the row to update
 * @param {Object} data - Key-value pairs of data to update
 * @return {Object} The updated row object
 */
function updateRow(sheetName, id, data) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    var sheet = getSheet(sheetName);
    var allData = sheet.getDataRange().getValues();
    var headers = allData[0];
    var idColIndex = headers.indexOf('id');

    if (idColIndex === -1) {
      throw new Error('ไม่พบคอลัมน์ id ในชีท: ' + sheetName);
    }

    // Find the row
    var rowIndex = -1;
    for (var i = 1; i < allData.length; i++) {
      if (String(allData[i][idColIndex]) === String(id)) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('ไม่พบข้อมูล ID: ' + id);
    }

    // Update updatedAt timestamp
    if (headers.indexOf('updatedAt') !== -1) {
      data.updatedAt = new Date().toISOString();
    }

    // Update matching columns
    var currentRow = allData[rowIndex];
    for (var j = 0; j < headers.length; j++) {
      if (data[headers[j]] !== undefined) {
        currentRow[j] = data[headers[j]];
      }
    }

    // Write back (rowIndex + 1 because sheet is 1-indexed)
    sheet.getRange(rowIndex + 1, 1, 1, headers.length).setValues([currentRow]);
    invalidateSheetCache_(sheetName);

    // Build return object
    var result = {};
    for (var k = 0; k < headers.length; k++) {
      result[headers[k]] = currentRow[k];
    }

    return result;
  } catch (err) {
    Logger.log('Error in updateRow(' + sheetName + ', ' + id + '): ' + err.message);
    throw new Error('ไม่สามารถอัปเดตข้อมูลได้: ' + err.message);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Deletes a row by ID.
 * @param {string} sheetName - The name of the sheet
 * @param {string} id - The ID of the row to delete
 * @return {boolean} True if deleted successfully
 */
function deleteRow(sheetName, id) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    var sheet = getSheet(sheetName);
    var allData = sheet.getDataRange().getValues();
    var headers = allData[0];
    var idColIndex = headers.indexOf('id');

    if (idColIndex === -1) {
      throw new Error('ไม่พบคอลัมน์ id ในชีท: ' + sheetName);
    }

    for (var i = 1; i < allData.length; i++) {
      if (String(allData[i][idColIndex]) === String(id)) {
        sheet.deleteRow(i + 1); // +1 because sheet is 1-indexed
        invalidateSheetCache_(sheetName);
        return true;
      }
    }

    throw new Error('ไม่พบข้อมูล ID: ' + id);
  } catch (err) {
    Logger.log('Error in deleteRow(' + sheetName + ', ' + id + '): ' + err.message);
    throw new Error('ไม่สามารถลบข้อมูลได้: ' + err.message);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Searches rows by partial text match on a specific field.
 * @param {string} sheetName - The name of the sheet
 * @param {string} field - The field/column to search in
 * @param {string} query - The search query (partial match)
 * @return {Object[]} Array of matching row objects
 */
function searchRows(sheetName, field, query) {
  try {
    var allRows = getAllRows(sheetName);

    if (!query || query.trim() === '') {
      return allRows;
    }

    var lowerQuery = String(query).toLowerCase();

    return allRows.filter(function(row) {
      var value = String(row[field] || '').toLowerCase();
      return value.indexOf(lowerQuery) !== -1;
    });
  } catch (err) {
    Logger.log('Error in searchRows(' + sheetName + '): ' + err.message);
    return [];
  }
}

/**
 * Generates a unique ID using timestamp and random characters.
 * @return {string} A unique ID string
 */
function generateId() {
  var timestamp = new Date().getTime().toString(36);
  var random = Math.random().toString(36).substring(2, 8);
  return timestamp + random;
}

function syncAllHeaders() {
  try {
    var ss = getSpreadsheet();
    var sheetNames = Object.keys(CONFIG.HEADERS);
    var results = [];
    for (var i = 0; i < sheetNames.length; i++) {
      var name = sheetNames[i];
      var expected = CONFIG.HEADERS[name];
      if (!expected || expected.length === 0) continue;
      var sheet = ss.getSheetByName(name);
      if (sheet && isReferenceSheet(name)) {
        // ข้อมูลอ้างอิงนำเข้าจากภายนอก — ชื่อคอลัมน์เป็นของเจ้าของข้อมูล
        // โค้ดจับคู่ชื่อให้เองตอนอ่าน (ดู referenceRows_ ใน UserService.gs)
        results.push(name + ': skipped (reference sheet, ' + sheet.getLastColumn() + ' cols)');
      } else if (!sheet) {
        sheet = ss.insertSheet(name);
        sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
        sheet.getRange(1, 1, 1, expected.length).setFontWeight('bold');
        sheet.setFrozenRows(1);
        results.push(name + ': created (' + expected.length + ' cols)');
      } else {
        results.push(name + ': ' + reconcileHeaders(sheet, expected));
      }
    }
    invalidateSheetCache_();
    return { success: true, data: results };
  } catch (err) {
    Logger.log('Error in syncAllHeaders: ' + err.message);
    return { success: false, message: err.message };
  }
}

/**
 * Counts rows matching a filter.
 * @param {string} sheetName - The name of the sheet
 * @param {Object} filter - Key-value pairs to filter by (optional)
 * @return {number} Count of matching rows
 */
function countRows(sheetName, filter) {
  try {
    if (!filter || Object.keys(filter).length === 0) {
      var sheet = getSheet(sheetName);
      var lastRow = sheet.getLastRow();
      return Math.max(0, lastRow - 1); // Subtract header row
    }

    return getRows(sheetName, filter).length;
  } catch (err) {
    Logger.log('Error in countRows(' + sheetName + '): ' + err.message);
    return 0;
  }
}


// ════════════════════════════════════════════════════════════
// Auth.gs
// ════════════════════════════════════════════════════════════

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


// ════════════════════════════════════════════════════════════
// Code.gs
// ════════════════════════════════════════════════════════════

/**
 * Code.gs - Main entry point for the Internship Management System
 * ระบบจัดการนักศึกษาฝึกงาน
 *
 * Web App นี้ทำหน้าที่เป็น REST API ให้ frontend บน GitHub Pages (โฟลเดอร์ docs/)
 * ทุก request ผ่าน authorizeRequest_() ใน Session.gs เพื่อตรวจสิทธิ์ก่อนเข้า handler
 */

// ============================================================
// doGet: API เมื่อมี action, ไม่มี action = ชี้ทางไปหน้าเว็บ
// ============================================================
function doGet(e) {
  var params = (e && e.parameter) || {};

  if (params.action) {
    return handleApiRequest(params);
  }

  var frontendUrl = CONFIG.FRONTEND_URL || '';
  var link = frontendUrl
    ? '<p><a href="' + frontendUrl + '">' + frontendUrl + '</a></p>'
    : '<p>ตั้งค่า CONFIG.FRONTEND_URL ใน Config.gs เพื่อแสดงลิงก์หน้าเว็บ</p>';

  return HtmlService.createHtmlOutput(
    '<div style="font-family:sans-serif;padding:32px;line-height:1.7">' +
    '<h2>ระบบจัดการนักศึกษาฝึกงาน — API</h2>' +
    '<p>URL นี้เป็น API สำหรับหน้าเว็บของระบบ ไม่ใช่หน้าใช้งาน</p>' +
    link +
    '</div>'
  ).setTitle('ระบบจัดการนักศึกษาฝึกงาน — API');
}

// ============================================================
// doPost: API สำหรับทุกคำสั่งที่เขียนข้อมูล
// ============================================================
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var result = handleApiRequest(data);
    return result;
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 400);
  }
}

function handleApiRequest(params) {
  var action = params.action;

  if (typeof CONFIG === 'undefined') {
    return jsonResponse({
      success: false,
      error: 'CONFIG is not defined — ตรวจสอบว่าไฟล์ Config.gs มีอยู่ในโปรเจกต์ Apps Script และไม่มี syntax error'
    }, 500);
  }

  if (typeof authorizeRequest_ !== 'function') {
    return jsonResponse({
      success: false,
      error: 'ไม่พบ Session.gs — ตรวจสอบว่าคัดลอกไฟล์ .gs ครบทุกไฟล์แล้ว'
    }, 500);
  }

  // ── ตรวจสิทธิ์ก่อนเข้า handler ──────────────────────────────
  // authorizeRequest_ จะบังคับพารามิเตอร์ตัวตน (userId/studentId/...)
  // ให้ตรงกับผู้ใช้ในโทเคน จึงต้องเรียกก่อน switch เสมอ
  var gate;
  try {
    gate = authorizeRequest_(action, params);
  } catch (authErr) {
    return jsonResponse({ success: false, error: 'ตรวจสอบสิทธิ์ไม่สำเร็จ: ' + authErr.message }, 500);
  }

  if (!gate.allowed) {
    return jsonResponse({
      success: false,
      code: gate.code,
      message: gate.message,
      error: gate.message
    }, gate.code === 'FORBIDDEN' ? 403 : 401);
  }

  try {
    var result;

    switch (action) {
      // === System ===
      case 'ping':
        result = {
          success: true,
          version: 'v5-server-auth',
          usersColumns: CONFIG.HEADERS.Users.length,
          authEnforced: !(CONFIG.AUTH && CONFIG.AUTH.ENFORCE === false)
        };
        break;

      // === Auth ===
      case 'login':
        result = login(params.email, params.password);
        break;
      case 'register':
        result = register(params);
        break;
      case 'logout':
        result = logout();
        break;
      case 'resetPassword':
        result = resetPassword(params.email);
        break;
      case 'changePassword':
        result = changePassword(params.userId, params.currentPassword, params.newPassword);
        break;
      case 'getCurrentUser':
        var sessionUser = getCurrentUser();
        result = sessionUser
          ? { success: true, user: sessionUser }
          : { success: false, code: 'UNAUTHORIZED', message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' };
        break;

      // === Users / Students ===
      case 'getStudents':
        result = getStudents(params.search, params.activeOnly);
        break;
      case 'getStudent':
        result = getStudent(params.id);
        break;
      case 'createStudent':
        result = createStudent(params);
        break;
      case 'updateStudent':
        result = updateStudent(params.id, params);
        break;
      case 'deactivateStudent':
        result = deactivateStudent(params.id);
        break;
      case 'getUserProfile':
        result = getUserProfile(params.userId);
        break;
      case 'updateProfile':
        result = updateProfile(params.userId, params);
        break;

      // === Mentors ===
      case 'getMentors':
        result = getMentors();
        break;
      case 'createMentor':
        result = createMentor(params);
        break;
      case 'updateMentor':
        result = updateMentor(params.id, params);
        break;
      case 'assignMentor':
        result = assignMentor(params.mentorId, params.studentId);
        break;
      case 'getStudentsByMentor':
        result = getStudentsByMentor(params.mentorId);
        break;

      // === Mentor Contacts (student multi-mentor) ===
      case 'getMyMentors':
        result = getMyMentors(params.studentId);
        break;
      case 'addMentorContact':
        result = addMentorContact(params.studentId, params.mentorId);
        break;
      case 'removeMentorContact':
        result = removeMentorContact(params.studentId, params.mentorId);
        break;

      // === Roadmaps ===
      case 'getRoadmaps':
        result = getRoadmaps();
        break;
      case 'getRoadmap':
        result = getRoadmap(params.id);
        break;
      case 'createRoadmap':
        result = createRoadmap(params);
        break;
      case 'updateRoadmap':
        result = updateRoadmap(params.id, params);
        break;
      case 'deleteRoadmap':
        result = deleteRoadmap(params.id);
        break;
      case 'createRoadmapStep':
        result = createRoadmapStep(params);
        break;
      case 'updateRoadmapStep':
        result = updateRoadmapStep(params.id, params);
        break;
      case 'deleteRoadmapStep':
        result = deleteRoadmapStep(params.id);
        break;
      case 'getRoadmapProgress':
        result = getRoadmapProgress(params.userId);
        break;
      case 'updateRoadmapProgress':
        result = updateRoadmapProgress(params.userId, params.stepId, params.status, params.note);
        break;

      // === Training Plan (แผนการฝึกรายหัวข้อ + QR ประเมิน) ===
      case 'updateStepPlan':
        result = updateStepPlan(params);
        break;
      case 'getEvalToken':
        result = getEvalToken(params.userId, params.stepId);
        break;
      case 'getEvalByToken':
        result = getEvalByToken(params.token);
        break;
      case 'submitEvalByToken':
        result = submitEvalByToken(params.token, params.result, params.comment, params.evaluatorName, params.evaluatorPosition);
        break;

      // === Assignments ===
      case 'getAssignments':
        result = getAssignments();
        break;
      case 'getAssignment':
        result = getAssignment(params.id);
        break;
      case 'createAssignment':
        result = createAssignment(params);
        break;
      case 'updateAssignment':
        result = updateAssignment(params.id, params);
        break;
      case 'deleteAssignment':
        result = deleteAssignment(params.id);
        break;
      case 'submitAssignment':
        result = submitAssignment(params.assignmentId, params.userId, params.content, params.fileUrl, params.fileName);
        break;
      case 'getSubmissions':
        result = getSubmissions(params);
        break;
      case 'reviewSubmission':
        result = reviewSubmission(params.submissionId, params.status, params.score, params.feedback, params.reviewerId);
        break;

      // === Evaluations ===
      case 'getEvaluations':
        result = getEvaluations(params);
        break;
      case 'createEvaluation':
        result = createEvaluation(params);
        break;
      case 'getEvaluationsByUser':
        result = getEvaluationsByUser(params.userId, params.asEvaluator === 'true');
        break;

      // === Resources ===
      case 'getResources':
        result = getResources(params.category, params.type);
        break;
      case 'getResource':
        result = getResource(params.id);
        break;
      case 'createResource':
        result = createResource(params);
        break;
      case 'updateResource':
        result = updateResource(params.id, params);
        break;
      case 'deleteResource':
        result = deleteResource(params.id);
        break;

      // === Notifications ===
      case 'getNotifications':
        result = getNotifications(params.userId);
        break;
      case 'getUnreadCount':
        result = getUnreadCount(params.userId);
        break;
      case 'markAsRead':
        result = markAsRead(params.notificationId);
        break;
      case 'markAllAsRead':
        result = markAllAsRead(params.userId);
        break;
      case 'sendBroadcast':
        var recipientIds = params.recipientIds;
        if (typeof recipientIds === 'string') {
          recipientIds = JSON.parse(recipientIds);
        }
        result = sendBroadcast(params.title, params.message, recipientIds, params.sendLine === 'true', params.senderId);
        break;

      // === Training Passport ===
      case 'getTrainingPassport':
        result = getTrainingPassport(params.userId);
        break;
      case 'signOffWeek':
        result = signOffWeek(params.userId, params.weekNumber, params.role, params.notes);
        break;
      case 'getTrainingPassportSummary':
        result = getTrainingPassportSummary(params.userId);
        break;
      case 'getTrainingPassportByMentor':
        result = getTrainingPassportByMentor(params.mentorId);
        break;
      case 'getTrainingPassportOverview':
        result = getTrainingPassportOverview();
        break;

      // === Knowledge Management ===
      case 'getKnowledgeEntries':
        result = getKnowledgeEntries(params.userId);
        break;
      case 'saveKnowledgeEntry':
        result = saveKnowledgeEntry(params.userId, params.topicNumber, params);
        break;
      case 'selectPresentationTopic':
        result = selectPresentationTopic(params.userId, params.topicNumber);
        break;
      case 'scorePresentationKM':
        var scores = {
          format: params.format,
          content: params.content,
          timeManagement: params.timeManagement,
          presentationSkill: params.presentationSkill,
          qaSkill: params.qaSkill
        };
        result = scorePresentationKM(params.userId, params.evaluatorId, scores);
        break;
      case 'getKnowledgeSummary':
        result = getKnowledgeSummary(params.userId);
        break;
      case 'getAllKnowledgeSummaries':
        result = getAllKnowledgeSummaries();
        break;

      // === File Upload (Google Drive) ===
      case 'uploadFile':
        result = uploadFile(params);
        break;
      case 'deleteFile':
        result = deleteFile(params.fileId);
        break;
      case 'getFileUrl':
        result = getFileUrl(params.fileId);
        break;
      case 'listFiles':
        result = listFiles(params.subfolder);
        break;

      // === Reference Data ===
      case 'getStoreList':
        result = getStoreList();
        break;
      case 'getDepartmentList':
        result = getDepartmentList();
        break;

      // === Admin ===
      case 'getAdminStats':
        result = getAdminStats(params);
        break;
      case 'setupSystem':
        result = setupSystem();
        break;
      case 'syncAllHeaders':
        result = syncAllHeaders();
        break;

      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }

    return jsonResponse(result);

  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

/**
 * ตอบกลับเป็น JSON
 * หมายเหตุ: ContentService ตั้ง HTTP status code ไม่ได้ (Apps Script คืน 200 เสมอ)
 * statusCode รับไว้เพื่อสื่อเจตนาในโค้ด ฝั่ง client ให้ดูจากฟิลด์ code/success
 * @param {Object} data
 * @param {number} [statusCode]
 */
function jsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}


// ════════════════════════════════════════════════════════════
// AdminService.gs
// ════════════════════════════════════════════════════════════

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
    // Build the set of active student IDs so we never count assignments that
    // belong to deactivated students (which would make studentsWithoutMentor
    // go negative).
    var activeStudentIds = {};
    for (var a = 0; a < activeStudents.length; a++) {
      activeStudentIds[String(activeStudents[a].id)] = true;
    }
    var studentsWithMentor = [];
    for (var i = 0; i < mentorAssignments.length; i++) {
      var sid = String(mentorAssignments[i].studentId);
      if (activeStudentIds[sid] && studentsWithMentor.indexOf(sid) === -1) {
        studentsWithMentor.push(sid);
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
        studentsWithoutMentor: Math.max(0, activeStudents.length - studentsWithMentor.length)
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


// ════════════════════════════════════════════════════════════
// AssignmentService.gs
// ════════════════════════════════════════════════════════════

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
    var user = resolveActingUser(data.createdBy);
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
function getSubmissions(params) {
  try {
    // คัดเฉพาะคอลัมน์ที่ใช้กรองได้ — params ที่ router ส่งมามี action/authToken ปนอยู่
    var filter = sheetFilter_(CONFIG.SHEETS.SUBMISSIONS, params, ['assignmentId', 'userId', 'status']);

    var submissions;
    if (Object.keys(filter).length > 0) {
      submissions = getRows(CONFIG.SHEETS.SUBMISSIONS, filter);
    } else {
      submissions = getAllRows(CONFIG.SHEETS.SUBMISSIONS);
    }

    // พี่เลี้ยงที่ไม่ระบุ userId เห็นได้เฉพาะงานของนักศึกษาในความดูแลของตัวเอง
    var session = typeof getSessionContext_ === 'function' ? getSessionContext_() : null;
    if (session && session.role === CONFIG.ROLES.MENTOR && !filter.userId) {
      var ownStudents = mentorStudentIds_(session.userId);
      submissions = submissions.filter(function(s) {
        return ownStudents.indexOf(String(s.userId)) !== -1;
      });
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
 * @param {string} reviewerId - User ID of the reviewer (passed from frontend)
 * @return {Object} Result with updated submission data
 */
function reviewSubmission(submissionId, status, score, feedback, reviewerId) {
  try {
    var user = resolveActingUser(reviewerId);
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


// ════════════════════════════════════════════════════════════
// EvaluationService.gs
// ════════════════════════════════════════════════════════════

/**
 * EvaluationService.gs - Evaluation management functions
 * Handles performance evaluations between mentors/admins and students.
 */

/**
 * Gets evaluations with optional filters.
 * @param {Object} filter - Optional filter (type, evaluatorId, evaluateeId)
 * @return {Object} Result with evaluations array
 */
function getEvaluations(params) {
  try {
    // คัดเฉพาะคอลัมน์ที่ใช้กรองได้ — params ที่ router ส่งมามี action/authToken ปนอยู่
    var filter = sheetFilter_(CONFIG.SHEETS.EVALUATIONS, params,
      ['type', 'evaluatorId', 'evaluateeId', 'period']);

    var evaluations;
    if (Object.keys(filter).length > 0) {
      evaluations = getRows(CONFIG.SHEETS.EVALUATIONS, filter);
    } else {
      evaluations = getAllRows(CONFIG.SHEETS.EVALUATIONS);
    }

    // Enrich with user info
    for (var i = 0; i < evaluations.length; i++) {
      var evaluator = getRowById(CONFIG.SHEETS.USERS, evaluations[i].evaluatorId);
      if (evaluator) {
        evaluations[i].evaluatorName = evaluator.firstName + ' ' + evaluator.lastName;
        evaluations[i].evaluatorRole = evaluator.role;
      }

      var evaluatee = getRowById(CONFIG.SHEETS.USERS, evaluations[i].evaluateeId);
      if (evaluatee) {
        evaluations[i].evaluateeName = evaluatee.firstName + ' ' + evaluatee.lastName;
        evaluations[i].evaluateeStudentId = evaluatee.studentId;
      }

      // Parse scores JSON if it's a string
      if (typeof evaluations[i].scores === 'string' && evaluations[i].scores) {
        try {
          evaluations[i].scoresData = JSON.parse(evaluations[i].scores);
        } catch (parseErr) {
          evaluations[i].scoresData = {};
        }
      }
    }

    // Sort by creation date descending
    evaluations.sort(function(a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return { success: true, data: evaluations };
  } catch (err) {
    Logger.log('Error in getEvaluations: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลการประเมินได้: ' + err.message };
  }
}

/**
 * Creates a new evaluation.
 * @param {Object} data - Evaluation data (type, evaluateeId, period, scores, totalScore, maxScore, comment)
 * @return {Object} Result with created evaluation data
 */
function createEvaluation(data) {
  try {
    var user = resolveActingUser(data.evaluatorId);
    if (!user) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
    }

    if (!data.evaluateeId || !data.type) {
      return { success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' };
    }

    // Verify evaluatee exists
    var evaluatee = getRowById(CONFIG.SHEETS.USERS, data.evaluateeId);
    if (!evaluatee) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ถูกประเมิน' };
    }

    // Convert scores to JSON string if it's an object
    var scoresStr = data.scores;
    if (typeof data.scores === 'object') {
      scoresStr = JSON.stringify(data.scores);
    }

    var evaluationData = {
      type: data.type,
      evaluatorId: user.id,
      evaluateeId: data.evaluateeId,
      period: data.period || '',
      scores: scoresStr || '{}',
      totalScore: data.totalScore || '0',
      maxScore: data.maxScore || '100',
      comment: data.comment || ''
    };

    var newEvaluation = appendRow(CONFIG.SHEETS.EVALUATIONS, evaluationData);

    // Notify evaluatee
    try {
      createNotification(
        data.evaluateeId,
        'การประเมินใหม่',
        'คุณได้รับการประเมิน (' + data.type + ') จาก ' + user.firstName + ' ' + user.lastName,
        'evaluation'
      );
    } catch (notifErr) {
      Logger.log('Warning: Could not send notification: ' + notifErr.message);
    }

    return { success: true, data: newEvaluation, message: 'สร้างการประเมินสำเร็จ' };
  } catch (err) {
    Logger.log('Error in createEvaluation: ' + err.message);
    return { success: false, message: 'ไม่สามารถสร้างการประเมินได้: ' + err.message };
  }
}

/**
 * Gets evaluations by user (as evaluator or evaluatee).
 * @param {string} userId - User ID
 * @param {boolean} asEvaluator - If true, get evaluations given by user; if false, get evaluations received
 * @return {Object} Result with evaluations array
 */
function getEvaluationsByUser(userId, asEvaluator) {
  try {
    var filter = {};
    if (asEvaluator) {
      filter.evaluatorId = userId;
    } else {
      filter.evaluateeId = userId;
    }

    var evaluations = getRows(CONFIG.SHEETS.EVALUATIONS, filter);

    // Enrich with user info
    for (var i = 0; i < evaluations.length; i++) {
      var evaluator = getRowById(CONFIG.SHEETS.USERS, evaluations[i].evaluatorId);
      if (evaluator) {
        evaluations[i].evaluatorName = evaluator.firstName + ' ' + evaluator.lastName;
        evaluations[i].evaluatorRole = evaluator.role;
      }

      var evaluatee = getRowById(CONFIG.SHEETS.USERS, evaluations[i].evaluateeId);
      if (evaluatee) {
        evaluations[i].evaluateeName = evaluatee.firstName + ' ' + evaluatee.lastName;
        evaluations[i].evaluateeStudentId = evaluatee.studentId;
      }

      // Parse scores JSON
      if (typeof evaluations[i].scores === 'string' && evaluations[i].scores) {
        try {
          evaluations[i].scoresData = JSON.parse(evaluations[i].scores);
        } catch (parseErr) {
          evaluations[i].scoresData = {};
        }
      }
    }

    // Sort by creation date descending
    evaluations.sort(function(a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return { success: true, data: evaluations };
  } catch (err) {
    Logger.log('Error in getEvaluationsByUser: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลการประเมินได้: ' + err.message };
  }
}


// ════════════════════════════════════════════════════════════
// FileUpload.gs
// ════════════════════════════════════════════════════════════

/**
 * FileUpload.gs - Google Drive file upload and management functions
 * Handles file uploads from the frontend via base64 encoding,
 * file deletion, and file listing for the Internship Management System.
 */

/** @const {string} Root folder name in Google Drive */
var ROOT_FOLDER_NAME = 'InternshipSystem';

/** @const {number} Maximum file size in bytes (50MB) */
var MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

/**
 * @const {number} ขีดจำกัดสำหรับผู้ที่ยังไม่ล็อกอิน (10MB)
 * มีแค่หน้าสมัครสมาชิกที่อัปโหลดก่อนล็อกอินได้ (CV/รูปถ่าย ลงโฟลเดอร์ profiles)
 * จำกัดให้เล็กกว่าปกติเพื่อลดความเสี่ยงถูกใช้ทิ้งไฟล์ลง Drive
 */
var ANONYMOUS_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** @const {Object} Valid subfolder names */
var SUBFOLDERS = {
  SUBMISSIONS: 'submissions',
  RESOURCES: 'resources',
  PROFILES: 'profiles',
  KNOWLEDGE: 'knowledge',
  VIDEOS: 'videos'
};

/**
 * Gets or creates a subfolder inside the root "InternshipSystem" folder.
 * If the root folder does not exist, it is created first.
 * @param {string} folderName - Name of the subfolder to get or create
 * @return {Folder} Google Drive Folder object
 */
function getOrCreateFolder(folderName) {
  var rootFolder;
  var rootFolders = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);

  if (rootFolders.hasNext()) {
    rootFolder = rootFolders.next();
  } else {
    rootFolder = DriveApp.createFolder(ROOT_FOLDER_NAME);
    Logger.log('Created root folder: ' + ROOT_FOLDER_NAME);
  }

  // Look for existing subfolder inside root
  var subFolders = rootFolder.getFoldersByName(folderName);
  if (subFolders.hasNext()) {
    return subFolders.next();
  }

  // Create the subfolder
  var newFolder = rootFolder.createFolder(folderName);
  Logger.log('Created subfolder: ' + folderName);
  return newFolder;
}

/**
 * Uploads a file to Google Drive from base64-encoded data.
 * Files are stored in a subfolder under the root "InternshipSystem" folder.
 * @param {Object} params - Upload parameters
 * @param {string} params.fileName - Name of the file to save
 * @param {string} params.fileData - Base64-encoded file content
 * @param {string} params.mimeType - MIME type of the file (e.g. 'application/pdf')
 * @param {string} params.subfolder - Subfolder name ('submissions', 'resources', or 'profiles')
 * @return {Object} Result with file metadata or error message
 */
function uploadFile(params) {
  try {
    // Validate required parameters
    if (!params || !params.fileName || !params.fileData || !params.mimeType || !params.subfolder) {
      return { success: false, message: 'กรุณาระบุข้อมูลไฟล์ให้ครบถ้วน (fileName, fileData, mimeType, subfolder)' };
    }

    var fileName = params.fileName;
    var fileData = params.fileData;
    var mimeType = params.mimeType;
    var subfolder = params.subfolder;

    // Validate subfolder name
    var validSubfolders = [SUBFOLDERS.SUBMISSIONS, SUBFOLDERS.RESOURCES, SUBFOLDERS.PROFILES, SUBFOLDERS.KNOWLEDGE, SUBFOLDERS.VIDEOS];
    if (validSubfolders.indexOf(subfolder) === -1) {
      return {
        success: false,
        message: 'โฟลเดอร์ย่อยไม่ถูกต้อง กรุณาระบุ: submissions, resources, profiles, knowledge หรือ videos'
      };
    }

    // Strip data URL prefix if present (e.g. "data:application/pdf;base64,...")
    var base64Data = fileData;
    if (base64Data.indexOf(',') !== -1) {
      base64Data = base64Data.split(',')[1];
    }

    // Decode base64 to blob and check file size
    var decodedBytes = Utilities.base64Decode(base64Data);

    // ผู้ที่ยังไม่ล็อกอิน (หน้าสมัครสมาชิก) ใช้ขีดจำกัดที่เข้มกว่า
    var isAnonymous = typeof getSessionContext_ === 'function' && !getSessionContext_();
    var maxBytes = isAnonymous ? ANONYMOUS_MAX_FILE_SIZE_BYTES : MAX_FILE_SIZE_BYTES;

    if (decodedBytes.length > maxBytes) {
      var sizeMB = (decodedBytes.length / (1024 * 1024)).toFixed(2);
      var limitMB = Math.round(maxBytes / (1024 * 1024));
      return {
        success: false,
        message: 'ขนาดไฟล์เกินขีดจำกัด (' + sizeMB + ' MB) ขนาดสูงสุดที่อนุญาตคือ ' + limitMB + ' MB — สำหรับไฟล์ขนาดใหญ่กว่านี้ ให้อัปโหลดไฟล์ไปยัง Google Drive โดยตรง แล้ววาง URL ที่ช่อง "URL / ลิงก์" แทน'
      };
    }

    var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

    // Get or create the target folder
    var folder = getOrCreateFolder(subfolder);

    // Create the file in Drive
    var file = folder.createFile(blob);

    // Set sharing to anyone with the link can view
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();

    return {
      success: true,
      data: {
        fileId: fileId,
        fileUrl: 'https://drive.google.com/file/d/' + fileId + '/view',
        fileName: fileName,
        mimeType: mimeType
      },
      message: 'อัปโหลดไฟล์สำเร็จ'
    };
  } catch (err) {
    Logger.log('Error in uploadFile: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปโหลดไฟล์ได้: ' + err.message };
  }
}

/**
 * Deletes a file from Google Drive by its file ID.
 * @param {string} fileId - Google Drive file ID
 * @return {Object} Result with success status
 */
function deleteFile(fileId) {
  try {
    if (!fileId) {
      return { success: false, message: 'กรุณาระบุรหัสไฟล์' };
    }

    var file = DriveApp.getFileById(fileId);
    file.setTrashed(true);

    return { success: true, message: 'ลบไฟล์สำเร็จ' };
  } catch (err) {
    Logger.log('Error in deleteFile: ' + err.message);
    return { success: false, message: 'ไม่สามารถลบไฟล์ได้: ' + err.message };
  }
}

/**
 * Gets the view URL for a file stored in Google Drive.
 * @param {string} fileId - Google Drive file ID
 * @return {Object} Result with file URL
 */
function getFileUrl(fileId) {
  try {
    if (!fileId) {
      return { success: false, message: 'กรุณาระบุรหัสไฟล์' };
    }

    var file = DriveApp.getFileById(fileId);
    var url = 'https://drive.google.com/file/d/' + fileId + '/view';

    return {
      success: true,
      data: {
        fileId: fileId,
        fileUrl: url,
        fileName: file.getName(),
        mimeType: file.getMimeType()
      }
    };
  } catch (err) {
    Logger.log('Error in getFileUrl: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลไฟล์ได้: ' + err.message };
  }
}

/**
 * Lists all files in a subfolder under the root "InternshipSystem" folder.
 * @param {string} subfolder - Subfolder name ('submissions', 'resources', or 'profiles')
 * @return {Object} Result with array of file metadata
 */
function listFiles(subfolder) {
  try {
    if (!subfolder) {
      return { success: false, message: 'กรุณาระบุชื่อโฟลเดอร์ย่อย' };
    }

    var validSubfolders = [SUBFOLDERS.SUBMISSIONS, SUBFOLDERS.RESOURCES, SUBFOLDERS.PROFILES, SUBFOLDERS.KNOWLEDGE, SUBFOLDERS.VIDEOS];
    if (validSubfolders.indexOf(subfolder) === -1) {
      return {
        success: false,
        message: 'โฟลเดอร์ย่อยไม่ถูกต้อง กรุณาระบุ: submissions, resources, profiles, knowledge หรือ videos'
      };
    }

    var folder = getOrCreateFolder(subfolder);
    var files = folder.getFiles();
    var fileList = [];

    while (files.hasNext()) {
      var file = files.next();
      var fileId = file.getId();
      fileList.push({
        fileId: fileId,
        fileName: file.getName(),
        mimeType: file.getMimeType(),
        fileUrl: 'https://drive.google.com/file/d/' + fileId + '/view',
        size: file.getSize(),
        createdAt: file.getDateCreated().toISOString(),
        updatedAt: file.getLastUpdated().toISOString()
      });
    }

    // Sort by creation date descending (newest first)
    fileList.sort(function(a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return { success: true, data: fileList };
  } catch (err) {
    Logger.log('Error in listFiles: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงรายการไฟล์ได้: ' + err.message };
  }
}


// ════════════════════════════════════════════════════════════
// KnowledgeManagement.gs
// ════════════════════════════════════════════════════════════

/**
 * KnowledgeManagement.gs - Knowledge Management service
 * Handles 6 KM topics, entries, presentation selection, and scoring.
 */

/**
 * Knowledge Management topic definitions.
 */
var KM_TOPICS = [
  { number: 1, name: 'การจัดการทรัพยากรบุคคล (Human Resource Management)' },
  { number: 2, name: 'การบริการลูกค้า (Customer Service)' },
  { number: 3, name: 'การจัดการสินค้า (Merchandising)' },
  { number: 4, name: 'การจัดการผลกำไรขาดทุน (Profit & Loss)' },
  { number: 5, name: 'ความปลอดภัยอาหาร (Food Safety)' },
  { number: 6, name: 'ความปลอดภัยการปฏิบัติงาน (Work Safety)' }
];

/**
 * Gets all 6 KM entries for a student.
 * Returns entries for all 6 topics, creating empty placeholders for missing ones.
 * @param {string} userId - Student user ID
 * @return {Object} Result with entries array
 */
function getKnowledgeEntries(userId) {
  try {
    if (!userId) {
      return { success: false, message: 'กรุณาระบุ userId' };
    }

    var existingEntries = getRows(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, { userId: userId });

    var entries = [];
    for (var i = 0; i < KM_TOPICS.length; i++) {
      var topic = KM_TOPICS[i];
      var found = null;

      for (var j = 0; j < existingEntries.length; j++) {
        if (Number(existingEntries[j].topicNumber) === topic.number) {
          found = existingEntries[j];
          break;
        }
      }

      if (found) {
        // Parse presentation score detail if it's a string
        var scoreDetail = found.presentationScoreDetail;
        if (scoreDetail && typeof scoreDetail === 'string') {
          try {
            scoreDetail = JSON.parse(scoreDetail);
          } catch (e) {
            scoreDetail = null;
          }
        }

        entries.push({
          id: found.id,
          userId: found.userId,
          topicNumber: Number(found.topicNumber),
          topicName: found.topicName || topic.name,
          keyTakeaways: found.keyTakeaways || '',
          challenges: found.challenges || '',
          knowledgeApply: found.knowledgeApply || '',
          feedback: found.feedback || '',
          isSelectedForPresentation: String(found.isSelectedForPresentation) === 'true',
          fileUrl: found.fileUrl || '',
          fileName: found.fileName || '',
          presentationScore: found.presentationScore || '',
          presentationScoreDetail: scoreDetail,
          evaluatorId: found.evaluatorId || '',
          hasContent: !!(found.keyTakeaways || found.challenges || found.knowledgeApply || found.feedback),
          createdAt: found.createdAt || '',
          updatedAt: found.updatedAt || ''
        });
      } else {
        entries.push({
          id: null,
          userId: userId,
          topicNumber: topic.number,
          topicName: topic.name,
          keyTakeaways: '',
          challenges: '',
          knowledgeApply: '',
          feedback: '',
          isSelectedForPresentation: false,
          fileUrl: '',
          fileName: '',
          presentationScore: '',
          presentationScoreDetail: null,
          evaluatorId: '',
          hasContent: false,
          createdAt: '',
          updatedAt: ''
        });
      }
    }

    return { success: true, data: entries };
  } catch (err) {
    Logger.log('Error in getKnowledgeEntries: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูล Knowledge Management ได้: ' + err.message };
  }
}

/**
 * Saves or updates a KM entry for a specific topic.
 * @param {string} userId - Student user ID
 * @param {number} topicNumber - Topic number (1-6)
 * @param {Object} data - Entry data: keyTakeaways, challenges, knowledgeApply, feedback
 * @return {Object} Result with saved entry
 */
function saveKnowledgeEntry(userId, topicNumber, data) {
  try {
    if (!userId || !topicNumber) {
      return { success: false, message: 'กรุณาระบุ userId และ topicNumber' };
    }

    topicNumber = Number(topicNumber);
    if (topicNumber < 1 || topicNumber > 6) {
      return { success: false, message: 'topicNumber ต้องอยู่ระหว่าง 1-6' };
    }

    // Find topic name
    var topicName = '';
    for (var i = 0; i < KM_TOPICS.length; i++) {
      if (KM_TOPICS[i].number === topicNumber) {
        topicName = KM_TOPICS[i].name;
        break;
      }
    }

    // Check for existing entry
    var existingEntries = getRows(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, { userId: userId });
    var existing = null;
    for (var j = 0; j < existingEntries.length; j++) {
      if (Number(existingEntries[j].topicNumber) === topicNumber) {
        existing = existingEntries[j];
        break;
      }
    }

    var result;
    if (existing) {
      // Update existing entry
      var updateData = {
        keyTakeaways: data.keyTakeaways || '',
        challenges: data.challenges || '',
        knowledgeApply: data.knowledgeApply || '',
        feedback: data.feedback || ''
      };
      // Only overwrite attachment when a new file is provided, so editing text
      // without re-uploading does not wipe an existing attachment.
      if (data.fileUrl) updateData.fileUrl = data.fileUrl;
      if (data.fileName) updateData.fileName = data.fileName;
      result = updateRow(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, existing.id, updateData);
    } else {
      // Create new entry
      result = appendRow(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, {
        userId: userId,
        topicNumber: topicNumber,
        topicName: topicName,
        keyTakeaways: data.keyTakeaways || '',
        challenges: data.challenges || '',
        knowledgeApply: data.knowledgeApply || '',
        feedback: data.feedback || '',
        isSelectedForPresentation: 'false',
        presentationScore: '',
        presentationScoreDetail: '',
        evaluatorId: '',
        fileUrl: data.fileUrl || '',
        fileName: data.fileName || ''
      });
    }

    return { success: true, data: result, message: 'บันทึกข้อมูลสำเร็จ' };
  } catch (err) {
    Logger.log('Error in saveKnowledgeEntry: ' + err.message);
    return { success: false, message: 'ไม่สามารถบันทึกข้อมูลได้: ' + err.message };
  }
}

/**
 * Selects a topic for final presentation.
 * Only one topic can be selected at a time.
 * @param {string} userId - Student user ID
 * @param {number} topicNumber - Topic number (1-6) to select
 * @return {Object} Result with success status
 */
function selectPresentationTopic(userId, topicNumber) {
  try {
    if (!userId || !topicNumber) {
      return { success: false, message: 'กรุณาระบุ userId และ topicNumber' };
    }

    topicNumber = Number(topicNumber);

    // Get all entries for user
    var entries = getRows(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, { userId: userId });

    // Clear existing selections and set the new one
    for (var i = 0; i < entries.length; i++) {
      var isSelected = Number(entries[i].topicNumber) === topicNumber;
      if (String(entries[i].isSelectedForPresentation) === 'true' || isSelected) {
        updateRow(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, entries[i].id, {
          isSelectedForPresentation: isSelected ? 'true' : 'false'
        });
      }
    }

    // If the topic entry doesn't exist yet, create it with selection
    var topicExists = false;
    for (var j = 0; j < entries.length; j++) {
      if (Number(entries[j].topicNumber) === topicNumber) {
        topicExists = true;
        break;
      }
    }

    if (!topicExists) {
      var topicName = '';
      for (var k = 0; k < KM_TOPICS.length; k++) {
        if (KM_TOPICS[k].number === topicNumber) {
          topicName = KM_TOPICS[k].name;
          break;
        }
      }

      appendRow(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, {
        userId: userId,
        topicNumber: topicNumber,
        topicName: topicName,
        keyTakeaways: '',
        challenges: '',
        knowledgeApply: '',
        feedback: '',
        isSelectedForPresentation: 'true',
        presentationScore: '',
        presentationScoreDetail: '',
        evaluatorId: ''
      });
    }

    return { success: true, message: 'เลือกหัวข้อนำเสนอสำเร็จ' };
  } catch (err) {
    Logger.log('Error in selectPresentationTopic: ' + err.message);
    return { success: false, message: 'ไม่สามารถเลือกหัวข้อได้: ' + err.message };
  }
}

/**
 * Scores a student's KM presentation.
 * @param {string} userId - Student user ID
 * @param {string} evaluatorId - Evaluator user ID
 * @param {Object} scores - Scoring object: { format, content, timeManagement, presentationSkill, qaSkill } (each 1-10)
 * @return {Object} Result with calculated score
 */
function scorePresentationKM(userId, evaluatorId, scores) {
  try {
    if (!userId || !evaluatorId || !scores) {
      return { success: false, message: 'กรุณาระบุข้อมูลที่จำเป็น' };
    }

    var format = Number(scores.format) || 0;
    var content = Number(scores.content) || 0;
    var timeManagement = Number(scores.timeManagement) || 0;
    var presentationSkill = Number(scores.presentationSkill) || 0;
    var qaSkill = Number(scores.qaSkill) || 0;

    // Validate range 1-10
    var allScores = [format, content, timeManagement, presentationSkill, qaSkill];
    for (var v = 0; v < allScores.length; v++) {
      if (allScores[v] < 1 || allScores[v] > 10) {
        return { success: false, message: 'คะแนนแต่ละด้านต้องอยู่ระหว่าง 1-10' };
      }
    }

    // Calculate weighted total: format*0.15 + content*0.40 + time*0.15 + skill*0.15 + qa*0.15
    var weightedScore = (format * 0.15) + (content * 0.40) + (timeManagement * 0.15) +
                        (presentationSkill * 0.15) + (qaSkill * 0.15);
    // Convert to out of 100
    var totalScore = Math.round(weightedScore * 10);

    // Find the selected presentation entry
    var entries = getRows(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, { userId: userId });
    var selectedEntry = null;
    for (var i = 0; i < entries.length; i++) {
      if (String(entries[i].isSelectedForPresentation) === 'true') {
        selectedEntry = entries[i];
        break;
      }
    }

    if (!selectedEntry) {
      return { success: false, message: 'นักศึกษายังไม่ได้เลือกหัวข้อนำเสนอ' };
    }

    var scoreDetail = JSON.stringify({
      format: format,
      content: content,
      timeManagement: timeManagement,
      presentationSkill: presentationSkill,
      qaSkill: qaSkill,
      weightedScore: weightedScore,
      totalScore: totalScore
    });

    updateRow(CONFIG.SHEETS.KNOWLEDGE_ENTRIES, selectedEntry.id, {
      presentationScore: totalScore,
      presentationScoreDetail: scoreDetail,
      evaluatorId: evaluatorId
    });

    return {
      success: true,
      message: 'บันทึกคะแนนสำเร็จ',
      data: {
        format: format,
        content: content,
        timeManagement: timeManagement,
        presentationSkill: presentationSkill,
        qaSkill: qaSkill,
        weightedScore: weightedScore,
        totalScore: totalScore
      }
    };
  } catch (err) {
    Logger.log('Error in scorePresentationKM: ' + err.message);
    return { success: false, message: 'ไม่สามารถบันทึกคะแนนได้: ' + err.message };
  }
}

/**
 * Gets KM summary for a student.
 * @param {string} userId - Student user ID
 * @return {Object} Summary: topics completed, selected topic, presentation score
 */
function getKnowledgeSummary(userId) {
  try {
    if (!userId) {
      return { success: false, message: 'กรุณาระบุ userId' };
    }

    var entriesResult = getKnowledgeEntries(userId);
    if (!entriesResult.success) {
      return entriesResult;
    }

    var entries = entriesResult.data;
    var completedTopics = 0;
    var selectedTopic = null;
    var presentationScore = null;

    for (var i = 0; i < entries.length; i++) {
      if (entries[i].hasContent) {
        completedTopics++;
      }
      if (entries[i].isSelectedForPresentation) {
        selectedTopic = {
          topicNumber: entries[i].topicNumber,
          topicName: entries[i].topicName
        };
        if (entries[i].presentationScore) {
          presentationScore = Number(entries[i].presentationScore);
        }
      }
    }

    return {
      success: true,
      data: {
        totalTopics: 6,
        completedTopics: completedTopics,
        selectedTopic: selectedTopic,
        presentationScore: presentationScore,
        progressPercent: Math.round((completedTopics / 6) * 100)
      }
    };
  } catch (err) {
    Logger.log('Error in getKnowledgeSummary: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงสรุปได้: ' + err.message };
  }
}

/**
 * Admin: gets all students' KM status.
 * @return {Object} Result with array of student KM summaries
 */
function getAllKnowledgeSummaries() {
  try {
    var students = getRows(CONFIG.SHEETS.USERS, { role: CONFIG.ROLES.STUDENT });

    // พี่เลี้ยงเห็นภาพรวมเฉพาะนักศึกษาในความดูแลของตัวเอง
    var session = typeof getSessionContext_ === 'function' ? getSessionContext_() : null;
    if (session && session.role === CONFIG.ROLES.MENTOR) {
      var ownStudents = mentorStudentIds_(session.userId);
      students = students.filter(function(s) {
        return ownStudents.indexOf(String(s.id)) !== -1;
      });
    }

    var results = [];
    for (var i = 0; i < students.length; i++) {
      var student = students[i];
      if (String(student.isActive) === 'false') continue;

      var summary = getKnowledgeSummary(student.id);

      results.push({
        userId: student.id,
        name: (student.firstName || '') + ' ' + (student.lastName || ''),
        studentId: student.studentId || '',
        department: student.department || '',
        km: summary.success ? summary.data : null
      });
    }

    return { success: true, data: results };
  } catch (err) {
    Logger.log('Error in getAllKnowledgeSummaries: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลภาพรวมได้: ' + err.message };
  }
}


// ════════════════════════════════════════════════════════════
// MentorContacts.gs
// ════════════════════════════════════════════════════════════

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


// ════════════════════════════════════════════════════════════
// NotificationService.gs
// ════════════════════════════════════════════════════════════

/**
 * NotificationService.gs - Notification management functions
 * Handles in-app notifications and LINE messaging integration.
 */

/**
 * Gets notifications for a specific user.
 * @param {string} userId - User ID
 * @return {Object} Result with notifications array
 */
function getNotifications(userId) {
  try {
    var notifications = getRows(CONFIG.SHEETS.NOTIFICATIONS, { userId: userId });

    // Sort by creation date descending (newest first)
    notifications.sort(function(a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return { success: true, data: notifications };
  } catch (err) {
    Logger.log('Error in getNotifications: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลการแจ้งเตือนได้: ' + err.message };
  }
}

/**
 * Gets count of unread notifications for a user.
 * @param {string} userId - User ID
 * @return {Object} Result with unread count
 */
function getUnreadCount(userId) {
  try {
    var unread = getRows(CONFIG.SHEETS.NOTIFICATIONS, {
      userId: userId,
      isRead: 'false'
    });

    return { success: true, data: { count: unread.length } };
  } catch (err) {
    Logger.log('Error in getUnreadCount: ' + err.message);
    return { success: false, message: 'ไม่สามารถนับการแจ้งเตือนได้: ' + err.message };
  }
}

/**
 * Creates a new notification.
 * @param {string} userId - Target user ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (info, assignment, submission, review, evaluation, warning)
 * @return {Object} The created notification
 */
function createNotification(userId, title, message, type) {
  try {
    var notificationData = {
      userId: userId,
      title: title || '',
      message: message || '',
      type: type || 'info',
      isRead: 'false',
      relatedId: ''
    };

    var notification = appendRow(CONFIG.SHEETS.NOTIFICATIONS, notificationData);

    return notification;
  } catch (err) {
    Logger.log('Error in createNotification: ' + err.message);
    throw new Error('ไม่สามารถสร้างการแจ้งเตือนได้: ' + err.message);
  }
}

/**
 * Marks a single notification as read.
 * @param {string} notificationId - Notification ID
 * @return {Object} Result with success status
 */
function markAsRead(notificationId) {
  try {
    var notification = getRowById(CONFIG.SHEETS.NOTIFICATIONS, notificationId);
    if (!notification) {
      return { success: false, message: 'ไม่พบข้อมูลการแจ้งเตือน' };
    }

    // อ่านได้เฉพาะการแจ้งเตือนของตัวเอง (ADMIN ดูแลระบบได้ทั้งหมด)
    var session = getSessionContext_();
    if (session && session.role !== CONFIG.ROLES.ADMIN &&
        String(notification.userId) !== String(session.userId)) {
      return { success: false, message: 'คุณไม่มีสิทธิ์แก้ไขการแจ้งเตือนนี้' };
    }

    updateRow(CONFIG.SHEETS.NOTIFICATIONS, notificationId, { isRead: 'true' });

    return { success: true, message: 'อ่านการแจ้งเตือนแล้ว' };
  } catch (err) {
    Logger.log('Error in markAsRead: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดตการแจ้งเตือนได้: ' + err.message };
  }
}

/**
 * Marks all notifications as read for a user.
 * @param {string} userId - User ID
 * @return {Object} Result with success status and count of updated notifications
 */
function markAllAsRead(userId) {
  try {
    var unreadNotifications = getRows(CONFIG.SHEETS.NOTIFICATIONS, {
      userId: userId,
      isRead: 'false'
    });

    var count = 0;
    for (var i = 0; i < unreadNotifications.length; i++) {
      try {
        updateRow(CONFIG.SHEETS.NOTIFICATIONS, unreadNotifications[i].id, { isRead: 'true' });
        count++;
      } catch (updateErr) {
        Logger.log('Warning: Could not mark notification ' + unreadNotifications[i].id + ' as read');
      }
    }

    return { success: true, message: 'อ่านการแจ้งเตือนทั้งหมดแล้ว', data: { updatedCount: count } };
  } catch (err) {
    Logger.log('Error in markAllAsRead: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดตการแจ้งเตือนได้: ' + err.message };
  }
}

/**
 * Sends a broadcast notification to multiple users.
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string[]} recipientIds - Array of user IDs to notify
 * @param {boolean} sendLine - If true, also send via LINE messaging
 * @return {Object} Result with success status and counts
 */
function sendBroadcast(title, message, recipientIds, sendLine, senderId) {
  try {
    var user = resolveActingUser(senderId);
    if (!user || (user.role !== CONFIG.ROLES.ADMIN && user.role !== CONFIG.ROLES.MENTOR)) {
      return { success: false, message: 'คุณไม่มีสิทธิ์ส่งการแจ้งเตือน' };
    }

    if (!title || !message) {
      return { success: false, message: 'กรุณากรอกหัวข้อและข้อความ' };
    }

    var targets = recipientIds;

    // If no specific recipients, send to all active students
    if (!targets || targets.length === 0) {
      var students = getRows(CONFIG.SHEETS.USERS, { role: CONFIG.ROLES.STUDENT, isActive: 'true' });
      targets = students.map(function(s) { return s.id; });
    }

    var successCount = 0;
    var lineSuccessCount = 0;

    for (var i = 0; i < targets.length; i++) {
      try {
        createNotification(targets[i], title, message, 'broadcast');
        successCount++;

        // Send LINE message if requested
        if (sendLine) {
          var targetUser = getRowById(CONFIG.SHEETS.USERS, targets[i]);
          if (targetUser && targetUser.lineUserId) {
            try {
              sendLineMessage(targetUser.lineUserId, title + '\n\n' + message);
              lineSuccessCount++;
            } catch (lineErr) {
              Logger.log('Warning: Could not send LINE message to ' + targets[i] + ': ' + lineErr.message);
            }
          }
        }
      } catch (notifErr) {
        Logger.log('Warning: Could not send notification to ' + targets[i] + ': ' + notifErr.message);
      }
    }

    var resultMessage = 'ส่งการแจ้งเตือนสำเร็จ ' + successCount + '/' + targets.length + ' คน';
    if (sendLine) {
      resultMessage += ' (LINE: ' + lineSuccessCount + ' คน)';
    }

    return {
      success: true,
      message: resultMessage,
      data: {
        totalRecipients: targets.length,
        notificationsSent: successCount,
        lineMessagesSent: lineSuccessCount
      }
    };
  } catch (err) {
    Logger.log('Error in sendBroadcast: ' + err.message);
    return { success: false, message: 'ไม่สามารถส่งการแจ้งเตือนได้: ' + err.message };
  }
}

/**
 * Sends a LINE message via LINE Messaging API using UrlFetchApp.
 * Requires LINE Channel Access Token to be set in Script Properties.
 * @param {string} lineUserId - LINE user ID
 * @param {string} message - Message text to send
 * @return {boolean} True if sent successfully
 */
function sendLineMessage(lineUserId, message) {
  try {
    var lineToken = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');

    if (!lineToken) {
      Logger.log('LINE_CHANNEL_ACCESS_TOKEN not set in Script Properties');
      throw new Error('ยังไม่ได้ตั้งค่า LINE Channel Access Token');
    }

    var url = 'https://api.line.me/v2/bot/message/push';
    var payload = {
      to: lineUserId,
      messages: [
        {
          type: 'text',
          text: message
        }
      ]
    };

    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + lineToken
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();

    if (responseCode !== 200) {
      Logger.log('LINE API error: ' + response.getContentText());
      throw new Error('LINE API ตอบกลับ: ' + responseCode);
    }

    return true;
  } catch (err) {
    Logger.log('Error in sendLineMessage: ' + err.message);
    throw new Error('ไม่สามารถส่งข้อความ LINE ได้: ' + err.message);
  }
}


// ════════════════════════════════════════════════════════════
// ResourceService.gs
// ════════════════════════════════════════════════════════════

/**
 * ResourceService.gs - Resource/knowledge base management functions
 * Handles educational resources, documents, and links.
 */

/**
 * Gets resources with optional category and type filters.
 * @param {string} category - Optional category filter
 * @param {string} type - Optional type filter (document, video, link, etc.)
 * @return {Object} Result with resources array
 */
function getResources(category, type) {
  try {
    var resources = getRows(CONFIG.SHEETS.RESOURCES, { isActive: 'true' });

    // Apply category filter
    if (category && category.trim() !== '') {
      resources = resources.filter(function(r) {
        return String(r.category).toLowerCase() === category.toLowerCase();
      });
    }

    // Apply type filter
    if (type && type.trim() !== '') {
      resources = resources.filter(function(r) {
        return String(r.type).toLowerCase() === type.toLowerCase();
      });
    }

    // Enrich with creator info
    for (var i = 0; i < resources.length; i++) {
      if (resources[i].createdBy) {
        var creator = getRowById(CONFIG.SHEETS.USERS, resources[i].createdBy);
        if (creator) {
          resources[i].creatorName = creator.firstName + ' ' + creator.lastName;
        }
      }

      // Parse tags if it's a string
      if (typeof resources[i].tags === 'string' && resources[i].tags) {
        resources[i].tagsArray = resources[i].tags.split(',').map(function(t) {
          return t.trim();
        });
      } else {
        resources[i].tagsArray = [];
      }
    }

    // Sort by creation date descending
    resources.sort(function(a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return { success: true, data: resources };
  } catch (err) {
    Logger.log('Error in getResources: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลทรัพยากรได้: ' + err.message };
  }
}

/**
 * Gets a single resource by ID.
 * @param {string} id - Resource ID
 * @return {Object} Result with resource data
 */
function getResource(id) {
  try {
    var resource = getRowById(CONFIG.SHEETS.RESOURCES, id);
    if (!resource) {
      return { success: false, message: 'ไม่พบข้อมูลทรัพยากร' };
    }

    // Get creator info
    if (resource.createdBy) {
      var creator = getRowById(CONFIG.SHEETS.USERS, resource.createdBy);
      if (creator) {
        resource.creatorName = creator.firstName + ' ' + creator.lastName;
      }
    }

    // Parse tags
    if (typeof resource.tags === 'string' && resource.tags) {
      resource.tagsArray = resource.tags.split(',').map(function(t) {
        return t.trim();
      });
    } else {
      resource.tagsArray = [];
    }

    return { success: true, data: resource };
  } catch (err) {
    Logger.log('Error in getResource: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลทรัพยากรได้: ' + err.message };
  }
}

/**
 * Creates a new resource.
 * @param {Object} data - Resource data (title, description, category, type, url, fileUrl, content, tags)
 * @return {Object} Result with created resource data
 */
function createResource(data) {
  try {
    var user = resolveActingUser(data.createdBy);
    if (!user) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อน' };
    }

    if (!data.title) {
      return { success: false, message: 'กรุณากรอกชื่อทรัพยากร' };
    }

    // Convert tags array to comma-separated string if needed
    var tagsStr = data.tags;
    if (Array.isArray(data.tags)) {
      tagsStr = data.tags.join(', ');
    }

    var resourceData = {
      title: data.title.trim(),
      description: data.description || '',
      category: data.category || '',
      type: data.type || 'document',
      url: data.url || '',
      fileUrl: data.fileUrl || '',
      content: data.content || '',
      tags: tagsStr || '',
      createdBy: user.id,
      isActive: 'true'
    };

    var newResource = appendRow(CONFIG.SHEETS.RESOURCES, resourceData);

    return { success: true, data: newResource, message: 'สร้างทรัพยากรสำเร็จ' };
  } catch (err) {
    Logger.log('Error in createResource: ' + err.message);
    return { success: false, message: 'ไม่สามารถสร้างทรัพยากรได้: ' + err.message };
  }
}

/**
 * Updates an existing resource.
 * @param {string} id - Resource ID
 * @param {Object} data - Fields to update
 * @return {Object} Result with updated resource data
 */
function updateResource(id, data) {
  try {
    var resource = getRowById(CONFIG.SHEETS.RESOURCES, id);
    if (!resource) {
      return { success: false, message: 'ไม่พบข้อมูลทรัพยากร' };
    }

    delete data.id;
    delete data.createdBy;
    delete data.createdAt;

    // Convert tags array to comma-separated string if needed
    if (Array.isArray(data.tags)) {
      data.tags = data.tags.join(', ');
    }

    var updated = updateRow(CONFIG.SHEETS.RESOURCES, id, data);

    return { success: true, data: updated, message: 'อัปเดตทรัพยากรสำเร็จ' };
  } catch (err) {
    Logger.log('Error in updateResource: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดตทรัพยากรได้: ' + err.message };
  }
}

/**
 * Deletes a resource (soft delete).
 * @param {string} id - Resource ID
 * @return {Object} Result with success status
 */
function deleteResource(id) {
  try {
    var resource = getRowById(CONFIG.SHEETS.RESOURCES, id);
    if (!resource) {
      return { success: false, message: 'ไม่พบข้อมูลทรัพยากร' };
    }

    updateRow(CONFIG.SHEETS.RESOURCES, id, { isActive: 'false' });

    return { success: true, message: 'ลบทรัพยากรสำเร็จ' };
  } catch (err) {
    Logger.log('Error in deleteResource: ' + err.message);
    return { success: false, message: 'ไม่สามารถลบทรัพยากรได้: ' + err.message };
  }
}


// ════════════════════════════════════════════════════════════
// RoadmapService.gs
// ════════════════════════════════════════════════════════════

/**
 * RoadmapService.gs - Roadmap management functions
 * Handles roadmaps, steps, and student progress tracking.
 */

/**
 * Gets all active roadmaps with their steps.
 * @return {Object} Result with roadmaps array (each with steps)
 */
function getRoadmaps() {
  try {
    var roadmaps = getRows(CONFIG.SHEETS.ROADMAPS, { isActive: 'true' });
    var allSteps = getRows(CONFIG.SHEETS.ROADMAP_STEPS, { isActive: 'true' });

    // Attach steps to each roadmap
    for (var i = 0; i < roadmaps.length; i++) {
      roadmaps[i].steps = allSteps.filter(function(step) {
        return String(step.roadmapId) === String(roadmaps[i].id);
      }).sort(function(a, b) {
        return Number(a.stepNumber) - Number(b.stepNumber);
      });
    }

    return { success: true, data: roadmaps };
  } catch (err) {
    Logger.log('Error in getRoadmaps: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูล Roadmap ได้: ' + err.message };
  }
}

/**
 * Gets a single roadmap with its steps.
 * @param {string} id - Roadmap ID
 * @return {Object} Result with roadmap data and steps
 */
function getRoadmap(id) {
  try {
    var roadmap = getRowById(CONFIG.SHEETS.ROADMAPS, id);
    if (!roadmap) {
      return { success: false, message: 'ไม่พบข้อมูล Roadmap' };
    }

    var steps = getRows(CONFIG.SHEETS.ROADMAP_STEPS, { roadmapId: id, isActive: 'true' });
    steps.sort(function(a, b) {
      return Number(a.stepNumber) - Number(b.stepNumber);
    });

    roadmap.steps = steps;

    return { success: true, data: roadmap };
  } catch (err) {
    Logger.log('Error in getRoadmap: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูล Roadmap ได้: ' + err.message };
  }
}

/**
 * Creates a new roadmap (admin only).
 * @param {Object} data - Roadmap data (title, description, department)
 * @return {Object} Result with created roadmap data
 */
function createRoadmap(data) {
  try {
    var user = resolveActingUser(data.createdBy);
    if (!user || user.role !== CONFIG.ROLES.ADMIN) {
      return { success: false, message: 'คุณไม่มีสิทธิ์สร้าง Roadmap' };
    }

    if (!data.title) {
      return { success: false, message: 'กรุณากรอกชื่อ Roadmap' };
    }

    var roadmapData = {
      title: data.title.trim(),
      description: data.description || '',
      department: data.department || '',
      isActive: 'true',
      createdBy: user.id
    };

    var newRoadmap = appendRow(CONFIG.SHEETS.ROADMAPS, roadmapData);

    return { success: true, data: newRoadmap, message: 'สร้าง Roadmap สำเร็จ' };
  } catch (err) {
    Logger.log('Error in createRoadmap: ' + err.message);
    return { success: false, message: 'ไม่สามารถสร้าง Roadmap ได้: ' + err.message };
  }
}

/**
 * Updates an existing roadmap.
 * @param {string} id - Roadmap ID
 * @param {Object} data - Fields to update
 * @return {Object} Result with updated roadmap data
 */
function updateRoadmap(id, data) {
  try {
    var roadmap = getRowById(CONFIG.SHEETS.ROADMAPS, id);
    if (!roadmap) {
      return { success: false, message: 'ไม่พบข้อมูล Roadmap' };
    }

    delete data.id;
    delete data.createdBy;
    delete data.createdAt;

    var updated = updateRow(CONFIG.SHEETS.ROADMAPS, id, data);

    return { success: true, data: updated, message: 'อัปเดต Roadmap สำเร็จ' };
  } catch (err) {
    Logger.log('Error in updateRoadmap: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดต Roadmap ได้: ' + err.message };
  }
}

/**
 * Deletes a roadmap (soft delete by setting isActive to false).
 * @param {string} id - Roadmap ID
 * @return {Object} Result with success status
 */
function deleteRoadmap(id) {
  try {
    var roadmap = getRowById(CONFIG.SHEETS.ROADMAPS, id);
    if (!roadmap) {
      return { success: false, message: 'ไม่พบข้อมูล Roadmap' };
    }

    updateRow(CONFIG.SHEETS.ROADMAPS, id, { isActive: 'false' });

    // Also deactivate all steps
    var steps = getRows(CONFIG.SHEETS.ROADMAP_STEPS, { roadmapId: id });
    for (var i = 0; i < steps.length; i++) {
      updateRow(CONFIG.SHEETS.ROADMAP_STEPS, steps[i].id, { isActive: 'false' });
    }

    return { success: true, message: 'ลบ Roadmap สำเร็จ' };
  } catch (err) {
    Logger.log('Error in deleteRoadmap: ' + err.message);
    return { success: false, message: 'ไม่สามารถลบ Roadmap ได้: ' + err.message };
  }
}

/**
 * Creates a new step in a roadmap.
 * @param {Object} data - Step data (roadmapId, stepNumber, title, description, dueDate)
 * @return {Object} Result with created step data
 */
function createRoadmapStep(data) {
  try {
    if (!data.roadmapId || !data.title) {
      return { success: false, message: 'กรุณากรอกข้อมูลที่จำเป็น' };
    }

    // Verify roadmap exists
    var roadmap = getRowById(CONFIG.SHEETS.ROADMAPS, data.roadmapId);
    if (!roadmap) {
      return { success: false, message: 'ไม่พบข้อมูล Roadmap' };
    }

    // Auto-assign step number if not provided
    if (!data.stepNumber) {
      var existingSteps = getRows(CONFIG.SHEETS.ROADMAP_STEPS, { roadmapId: data.roadmapId, isActive: 'true' });
      data.stepNumber = existingSteps.length + 1;
    }

    var stepData = {
      roadmapId: data.roadmapId,
      stepNumber: data.stepNumber,
      title: data.title.trim(),
      description: data.description || '',
      dueDate: data.dueDate || '',
      isActive: 'true',
      durationDays: data.durationDays || '',
      resources: data.resources || '',
      fileUrl: data.fileUrl || '',
      fileName: data.fileName || ''
    };

    var newStep = appendRow(CONFIG.SHEETS.ROADMAP_STEPS, stepData);

    return { success: true, data: newStep, message: 'เพิ่มขั้นตอนสำเร็จ' };
  } catch (err) {
    Logger.log('Error in createRoadmapStep: ' + err.message);
    return { success: false, message: 'ไม่สามารถเพิ่มขั้นตอนได้: ' + err.message };
  }
}

/**
 * Updates a roadmap step.
 * @param {string} id - Step ID
 * @param {Object} data - Fields to update
 * @return {Object} Result with updated step data
 */
function updateRoadmapStep(id, data) {
  try {
    var step = getRowById(CONFIG.SHEETS.ROADMAP_STEPS, id);
    if (!step) {
      return { success: false, message: 'ไม่พบข้อมูลขั้นตอน' };
    }

    delete data.id;
    delete data.createdAt;

    var updated = updateRow(CONFIG.SHEETS.ROADMAP_STEPS, id, data);

    return { success: true, data: updated, message: 'อัปเดตขั้นตอนสำเร็จ' };
  } catch (err) {
    Logger.log('Error in updateRoadmapStep: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดตขั้นตอนได้: ' + err.message };
  }
}

/**
 * Deletes a roadmap step (soft delete).
 * @param {string} id - Step ID
 * @return {Object} Result with success status
 */
function deleteRoadmapStep(id) {
  try {
    var step = getRowById(CONFIG.SHEETS.ROADMAP_STEPS, id);
    if (!step) {
      return { success: false, message: 'ไม่พบข้อมูลขั้นตอน' };
    }

    updateRow(CONFIG.SHEETS.ROADMAP_STEPS, id, { isActive: 'false' });

    return { success: true, message: 'ลบขั้นตอนสำเร็จ' };
  } catch (err) {
    Logger.log('Error in deleteRoadmapStep: ' + err.message);
    return { success: false, message: 'ไม่สามารถลบขั้นตอนได้: ' + err.message };
  }
}

/**
 * Gets a user's progress across all roadmaps.
 * @param {string} userId - User ID
 * @return {Object} Result with progress data grouped by roadmap
 */
function getRoadmapProgress(userId) {
  try {
    // Return flat progress records — every frontend page builds a
    // progressMap keyed by stepId from this shape.
    var progress = getRows(CONFIG.SHEETS.ROADMAP_PROGRESS, { userId: userId });
    var allSteps = getAllRows(CONFIG.SHEETS.ROADMAP_STEPS);

    var stepMap = {};
    for (var i = 0; i < allSteps.length; i++) {
      stepMap[String(allSteps[i].id)] = allSteps[i];
    }

    for (var j = 0; j < progress.length; j++) {
      var step = stepMap[String(progress[j].stepId)];
      if (step) {
        progress[j].stepTitle = step.title;
        progress[j].stepNumber = step.stepNumber;
        if (!progress[j].roadmapId) progress[j].roadmapId = step.roadmapId;
      }
    }

    return { success: true, data: progress };
  } catch (err) {
    Logger.log('Error in getRoadmapProgress: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลความคืบหน้าได้: ' + err.message };
  }
}

/**
 * Updates a user's progress on a roadmap step (upsert).
 * @param {string} userId - User ID
 * @param {string} stepId - Step ID
 * @param {string} status - Status (not_started, in_progress, completed)
 * @param {string} note - Optional note
 * @return {Object} Result with updated progress data
 */
function updateRoadmapProgress(userId, stepId, status, note) {
  try {
    // Get step to find roadmapId
    var step = getRowById(CONFIG.SHEETS.ROADMAP_STEPS, stepId);
    if (!step) {
      return { success: false, message: 'ไม่พบข้อมูลขั้นตอน' };
    }

    // Check for existing progress record
    var existingProgress = getRows(CONFIG.SHEETS.ROADMAP_PROGRESS, {
      userId: userId,
      stepId: stepId
    });

    var result;
    var now = new Date().toISOString();
    var isCompleted = String(status).toUpperCase() === 'COMPLETED';

    if (existingProgress.length > 0) {
      // Update existing
      var updateData = {
        status: status,
        note: note || existingProgress[0].note,
        updatedAt: now
      };

      if (isCompleted && String(existingProgress[0].status).toUpperCase() !== 'COMPLETED') {
        updateData.completedAt = now;
      }

      result = updateRow(CONFIG.SHEETS.ROADMAP_PROGRESS, existingProgress[0].id, updateData);
    } else {
      // Create new progress record
      var progressData = {
        userId: userId,
        roadmapId: step.roadmapId,
        stepId: stepId,
        status: status,
        note: note || '',
        completedAt: isCompleted ? now : '',
        updatedAt: now
      };

      result = appendRow(CONFIG.SHEETS.ROADMAP_PROGRESS, progressData);
    }

    return { success: true, data: result, message: 'อัปเดตความคืบหน้าสำเร็จ' };
  } catch (err) {
    Logger.log('Error in updateRoadmapProgress: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดตความคืบหน้าได้: ' + err.message };
  }
}


// ════════════════════════════════════════════════════════════
// TrainingPassport.gs
// ════════════════════════════════════════════════════════════

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


// ════════════════════════════════════════════════════════════
// TrainingPlanService.gs
// ════════════════════════════════════════════════════════════

/**
 * TrainingPlanService.gs - Training plan per topic/step
 * แผนการฝึกรายหัวข้อ: ผู้ฝึกสอน, ระยะเวลา, ผลประเมิน ผ่าน/ไม่ผ่าน,
 * และการประเมินผ่าน QR Code โดยผู้สอนภายนอก (ไม่ต้องมีบัญชี)
 */

/**
 * Computes the automatic status of a step plan record.
 * กติกา: ผ่านการประเมิน → COMPLETED
 *        ยังไม่กำหนดวันฝึก → NOT_PLANNED
 *        ยังไม่ถึงวันฝึกวันแรก → NOT_STARTED
 *        ถึงวันฝึกแล้วแต่ยังไม่ประเมิน → IN_PROGRESS
 */
function computeAutoStatus(p) {
  if (String(p.evalResult || '').toUpperCase() === 'PASS') return 'COMPLETED';

  var firstDay = '';
  if (p.trainingDays) {
    var days = String(p.trainingDays).split(',').map(function(s) { return s.trim(); })
      .filter(function(s) { return s !== ''; }).sort();
    if (days.length > 0) firstDay = days[0];
  }
  if (!firstDay && p.startDate) {
    firstDay = String(p.startDate).substring(0, 10);
  }
  if (!firstDay) return 'NOT_PLANNED';

  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return today < firstDay ? 'NOT_STARTED' : 'IN_PROGRESS';
}

/**
 * Upserts plan details for a student's roadmap step.
 * Editable by the student themselves or an Admin.
 * Status is computed automatically from the plan dates and evaluation result.
 * Accepts: userId, stepId, actorId, trainerName, trainerPosition,
 *          trainerContact, startDate, endDate, trainingDays, note
 */
function updateStepPlan(params) {
  try {
    if (!params.userId || !params.stepId) {
      return { success: false, message: 'ข้อมูลไม่ครบถ้วน (userId, stepId)' };
    }

    var actor = resolveActingUser(params.actorId);
    if (!actor) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบ' };
    }
    if (actor.role !== CONFIG.ROLES.ADMIN && String(actor.id) !== String(params.userId)) {
      return { success: false, message: 'คุณไม่มีสิทธิ์แก้ไขแผนการฝึกนี้' };
    }

    var step = getRowById(CONFIG.SHEETS.ROADMAP_STEPS, params.stepId);
    if (!step) {
      return { success: false, message: 'ไม่พบข้อมูลขั้นตอน' };
    }

    var planFields = ['trainerName', 'trainerPosition', 'trainerContact',
                      'startDate', 'endDate', 'trainingDays', 'timeSlot',
                      'startTime', 'endTime', 'dayTimes', 'note'];
    var data = {};
    for (var i = 0; i < planFields.length; i++) {
      if (params[planFields[i]] !== undefined) {
        data[planFields[i]] = params[planFields[i]];
      }
    }

    var now = new Date().toISOString();
    var existing = getRows(CONFIG.SHEETS.ROADMAP_PROGRESS, {
      userId: params.userId,
      stepId: params.stepId
    });

    var result;
    if (existing.length > 0) {
      // คำนวณสถานะอัตโนมัติจากแผนใหม่ + ผลประเมินเดิม
      var merged = {};
      var exKeys = Object.keys(existing[0]);
      for (var k = 0; k < exKeys.length; k++) merged[exKeys[k]] = existing[0][exKeys[k]];
      var dKeys = Object.keys(data);
      for (var m = 0; m < dKeys.length; m++) merged[dKeys[m]] = data[dKeys[m]];
      data.status = computeAutoStatus(merged);
      if (data.status === 'COMPLETED' && !existing[0].completedAt) {
        data.completedAt = now;
      }
      if (!existing[0].evalToken) {
        data.evalToken = generateId() + generateId();
      }
      result = updateRow(CONFIG.SHEETS.ROADMAP_PROGRESS, existing[0].id, data);
    } else {
      data.userId = params.userId;
      data.roadmapId = step.roadmapId;
      data.stepId = params.stepId;
      data.status = computeAutoStatus(data);
      data.completedAt = '';
      data.evalToken = generateId() + generateId();
      data.attemptCount = 0;
      result = appendRow(CONFIG.SHEETS.ROADMAP_PROGRESS, data);
    }

    return { success: true, data: result, message: 'บันทึกแผนการฝึกสำเร็จ' };
  } catch (err) {
    Logger.log('Error in updateStepPlan: ' + err.message);
    return { success: false, message: 'ไม่สามารถบันทึกแผนการฝึกได้: ' + err.message };
  }
}

/**
 * Returns (and creates if needed) the QR evaluation token for a step.
 */
function getEvalToken(userId, stepId) {
  try {
    if (!userId || !stepId) {
      return { success: false, message: 'ข้อมูลไม่ครบถ้วน' };
    }

    var step = getRowById(CONFIG.SHEETS.ROADMAP_STEPS, stepId);
    if (!step) {
      return { success: false, message: 'ไม่พบข้อมูลขั้นตอน' };
    }

    var existing = getRows(CONFIG.SHEETS.ROADMAP_PROGRESS, {
      userId: userId,
      stepId: stepId
    });

    var token;
    if (existing.length > 0) {
      token = existing[0].evalToken;
      if (!token) {
        token = generateId() + generateId();
        updateRow(CONFIG.SHEETS.ROADMAP_PROGRESS, existing[0].id, { evalToken: token });
      }
    } else {
      token = generateId() + generateId();
      appendRow(CONFIG.SHEETS.ROADMAP_PROGRESS, {
        userId: userId,
        roadmapId: step.roadmapId,
        stepId: stepId,
        status: 'NOT_STARTED',
        note: '',
        completedAt: '',
        evalToken: token,
        attemptCount: 0
      });
    }

    return { success: true, data: { token: token } };
  } catch (err) {
    Logger.log('Error in getEvalToken: ' + err.message);
    return { success: false, message: 'ไม่สามารถสร้างลิงก์ประเมินได้: ' + err.message };
  }
}

/**
 * Public: gets evaluation context by token (for the QR evaluation form).
 * No login required — the token itself is the authorization.
 */
function getEvalByToken(token) {
  try {
    if (!token) {
      return { success: false, message: 'ไม่พบรหัสประเมิน' };
    }

    var rows = getRows(CONFIG.SHEETS.ROADMAP_PROGRESS, { evalToken: token });
    if (rows.length === 0) {
      return { success: false, message: 'ลิงก์ประเมินไม่ถูกต้องหรือหมดอายุ' };
    }

    var p = rows[0];
    var step = getRowById(CONFIG.SHEETS.ROADMAP_STEPS, p.stepId);
    var student = getRowById(CONFIG.SHEETS.USERS, p.userId);
    var roadmap = step ? getRowById(CONFIG.SHEETS.ROADMAPS, step.roadmapId) : null;

    return {
      success: true,
      data: {
        studentName: student ? ((student.prefix || '') + (student.firstName || '') + ' ' + (student.lastName || '')).trim() : '',
        studentCode: student ? (student.studentId || '') : '',
        stepTitle: step ? step.title : '',
        stepDescription: step ? step.description : '',
        roadmapTitle: roadmap ? roadmap.title : '',
        trainerName: p.trainerName || '',
        startDate: p.startDate || '',
        endDate: p.endDate || '',
        evalResult: p.evalResult || '',
        evalBy: p.evalBy || '',
        evalByPosition: p.evalByPosition || '',
        evalAt: p.evalAt || '',
        attemptCount: Number(p.attemptCount) || 0
      }
    };
  } catch (err) {
    Logger.log('Error in getEvalByToken: ' + err.message);
    return { success: false, message: 'ไม่สามารถดึงข้อมูลประเมินได้: ' + err.message };
  }
}

/**
 * Public: submits an evaluation result via token (from the QR form).
 * PASS  → step COMPLETED
 * FAIL  → step back to IN_PROGRESS (ต้องฝึกซ้ำ), attemptCount + 1
 */
function submitEvalByToken(token, result, comment, evaluatorName, evaluatorPosition) {
  try {
    if (!token) {
      return { success: false, message: 'ไม่พบรหัสประเมิน' };
    }

    var upper = String(result || '').toUpperCase();
    if (upper !== 'PASS' && upper !== 'FAIL') {
      return { success: false, message: 'กรุณาเลือกผลการประเมิน (ผ่าน/ไม่ผ่าน)' };
    }
    if (!evaluatorName || !String(evaluatorName).trim()) {
      return { success: false, message: 'กรุณากรอกชื่อผู้ประเมิน' };
    }
    if (!evaluatorPosition || !String(evaluatorPosition).trim()) {
      return { success: false, message: 'กรุณากรอกตำแหน่งผู้ประเมิน' };
    }

    var rows = getRows(CONFIG.SHEETS.ROADMAP_PROGRESS, { evalToken: token });
    if (rows.length === 0) {
      return { success: false, message: 'ลิงก์ประเมินไม่ถูกต้องหรือหมดอายุ' };
    }

    var p = rows[0];
    var now = new Date().toISOString();

    var updateData = {
      evalResult: upper,
      evalComment: comment || '',
      evalBy: String(evaluatorName).trim(),
      evalByPosition: String(evaluatorPosition).trim(),
      evalAt: now
    };

    if (upper === 'PASS') {
      updateData.status = 'COMPLETED';
      updateData.completedAt = now;
    } else {
      updateData.status = 'IN_PROGRESS';
      updateData.attemptCount = (Number(p.attemptCount) || 0) + 1;
    }

    updateRow(CONFIG.SHEETS.ROADMAP_PROGRESS, p.id, updateData);

    // Notify the student
    try {
      var step = getRowById(CONFIG.SHEETS.ROADMAP_STEPS, p.stepId);
      var stepTitle = step ? step.title : 'หัวข้อการฝึก';
      var msg = upper === 'PASS'
        ? 'คุณผ่านการประเมินหัวข้อ "' + stepTitle + '" โดย ' + evaluatorName
        : 'คุณไม่ผ่านการประเมินหัวข้อ "' + stepTitle + '" กรุณาฝึกเพิ่มเติมและประเมินใหม่อีกครั้ง';
      createNotification(p.userId, 'ผลการประเมินการฝึก', msg, upper === 'PASS' ? 'success' : 'warning');
    } catch (notifErr) {
      Logger.log('Warning: Could not send notification: ' + notifErr.message);
    }

    return {
      success: true,
      message: upper === 'PASS' ? 'บันทึกผลประเมิน: ผ่าน' : 'บันทึกผลประเมิน: ไม่ผ่าน (ต้องฝึกซ้ำ)'
    };
  } catch (err) {
    Logger.log('Error in submitEvalByToken: ' + err.message);
    return { success: false, message: 'ไม่สามารถบันทึกผลประเมินได้: ' + err.message };
  }
}


// ════════════════════════════════════════════════════════════
// UserService.gs
// ════════════════════════════════════════════════════════════

/**
 * UserService.gs - User management functions
 * Called from frontend via google.script.run
 */

/**
 * ฟิลด์ที่ส่งออกใน "รายการนักศึกษา" (getStudents / getStudentsByMentor)
 *
 * หน้ารายการใช้แค่ข้อมูลระบุตัวและสถานะการฝึก จึงไม่ส่งข้อมูลอ่อนไหวที่ไม่ได้ใช้
 * ออกไปทั้งชุด (เลขบัตรประชาชน, วันเกิด, ที่อยู่, สถานะทหาร, ประวัติสุขภาพ, GPA,
 * สาขาที่อยากฝึก, อาจารย์ที่ปรึกษา) — ลดทั้งความเสี่ยงข้อมูลรั่วและขนาด payload
 * จาก 80 คอลัมน์เหลือ 26
 *
 * หน้ารายละเอียด/แก้ไข/พิมพ์โปรไฟล์ดึงข้อมูลเต็มเมื่อเปิดจริงด้วย
 * getStudent(id) (ADMIN) หรือ getUserProfile(userId) (พี่เลี้ยงในความดูแล)
 */
var STUDENT_LIST_FIELDS_ = [
  'id', 'role', 'email', 'name', 'firstName', 'lastName', 'studentId',
  'department', 'phone', 'profileImage', 'photoFileUrl',
  'cvFileUrl', 'transcriptFileUrl', 'idCardFileUrl',
  'isActive', 'studentStatus', 'university', 'faculty', 'major', 'year',
  'internshipType', 'startDate', 'endDate', 'branch', 'createdAt', 'updatedAt'
];

/**
 * ย่อข้อมูลนักศึกษาให้เหลือเฉพาะฟิลด์ของหน้ารายการ
 * @param {Object} user - แถวข้อมูลผู้ใช้
 * @param {Object} [extra] - ฟิลด์เพิ่มเติมที่ต้องการแนบ (เช่น mentor, assignedAt)
 * @return {Object}
 */
function studentListView_(user, extra) {
  var view = {};
  for (var i = 0; i < STUDENT_LIST_FIELDS_.length; i++) {
    var field = STUDENT_LIST_FIELDS_[i];
    if (user[field] !== undefined) view[field] = user[field];
  }

  if (extra) {
    var keys = Object.keys(extra);
    for (var k = 0; k < keys.length; k++) view[keys[k]] = extra[keys[k]];
  }
  return view;
}

/**
 * Gets list of students with optional search and active filter.
 * @param {string} search - Optional search query (matches name, email, studentId)
 * @param {boolean} activeOnly - If true, only return active students
 * @return {Object} Result with success status and students array (list fields only)
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

    // Build mentor lookup so each student row carries its assigned mentor.
    // Done in bulk (two reads) instead of per-student to avoid N+1 lookups.
    var activeAssignments = getRows(CONFIG.SHEETS.MENTOR_STUDENTS, { isActive: 'true' });
    var allUsers = getAllRows(CONFIG.SHEETS.USERS);
    var userById = {};
    for (var u0 = 0; u0 < allUsers.length; u0++) {
      userById[String(allUsers[u0].id)] = allUsers[u0];
    }
    var mentorByStudent = {};
    for (var a = 0; a < activeAssignments.length; a++) {
      var sid = String(activeAssignments[a].studentId);
      if (mentorByStudent[sid]) continue; // keep first active assignment
      var mu = userById[String(activeAssignments[a].mentorId)];
      if (mu) {
        mentorByStudent[sid] = {
          id: mu.id,
          firstName: mu.firstName,
          lastName: mu.lastName,
          email: mu.email,
          department: mu.department
        };
      }
    }

    // ส่งเฉพาะฟิลด์ของหน้ารายการ (ไม่มี password และไม่มีข้อมูลอ่อนไหวที่ไม่ได้ใช้)
    var students = users.map(function(u) {
      return studentListView_(u, { mentor: mentorByStudent[String(u.id)] || null });
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
      copy.assignedStudents = mentorStudents.filter(function(ms) { return String(ms.mentorId) === String(u.id); }).length;
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
      position: data.position || '',
      maxStudents: data.maxStudents || '4'
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

    // Enforce mentor capacity (quota). Count active assignments for the target
    // mentor, excluding any row for this same student so reassignment to the
    // same/current mentor isn't double-counted.
    var maxStudents = parseInt(mentor.maxStudents, 10);
    if (isNaN(maxStudents) || maxStudents <= 0) {
      maxStudents = 4;
    }

    var mentorActiveAssignments = getRows(CONFIG.SHEETS.MENTOR_STUDENTS, {
      mentorId: mentorId,
      isActive: 'true'
    });
    var currentCount = mentorActiveAssignments.filter(function(ms) {
      return String(ms.studentId) !== String(studentId);
    }).length;

    if (currentCount >= maxStudents) {
      return { success: false, message: 'พี่เลี้ยงคนนี้รับนักศึกษาเต็มโควตาแล้ว' };
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
        students.push(studentListView_(student, { assignedAt: assignments[i].assignedAt }));
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

/**
 * ตัดตัวพิมพ์/ขีด/ช่องว่างออกจากชื่อคอลัมน์เพื่อเทียบแบบหลวม ๆ
 * 'Store_No' / 'STORE NO' / 'store-no' → 'storeno'
 * @param {*} header
 * @return {string}
 */
function normalizeHeaderKey_(header) {
  return String(header == null ? '' : header).replace(/[^A-Za-z0-9]/g, '').toLowerCase();
}

/**
 * ชื่อคอลัมน์ที่พบในชีทจริงแต่เทียบกับ CONFIG.HEADERS ตรง ๆ ไม่ได้
 * (รวมคำที่สะกดต่างจากไฟล์ต้นทาง)
 */
var REFERENCE_HEADER_ALIASES_ = {
  divison: 'division',
  divisionname: 'division',
  departmentname: 'department',
  storeid: 'storeNo',
  storecode: 'storeNo',
  storenamethai: 'storeNameTH',
  storenameeng: 'storeName'
};

/**
 * อ่านชีทข้อมูลอ้างอิงเป็น array ของ object โดยจับคู่ชื่อคอลัมน์ของเจ้าของข้อมูล
 * เข้ากับคีย์มาตรฐานใน CONFIG.HEADERS (หน้าเว็บอ่านคีย์แบบ camelCase)
 *
 * ชีทเหล่านี้นำเข้าจากภายนอก หัวตารางจึงเขียนได้หลายแบบ เช่น 'Store_No' แทน
 * 'storeNo' ถ้าอ่านด้วยชื่อคอลัมน์ดิบ ๆ หน้าเว็บจะได้ค่า undefined ทั้งหมด
 * คอลัมน์ที่จับคู่ไม่ได้ยังคงคีย์เดิมไว้ เพื่อไม่ทิ้งข้อมูลที่เจ้าของเพิ่มมาเอง
 *
 * @param {string} sheetName - ชื่อชีท (คีย์ใน CONFIG.HEADERS)
 * @param {string[]} fallbackKeys - คีย์ประจำตำแหน่งคอลัมน์ ใช้เมื่อจับคู่หัวตารางไม่ได้เลย
 * @return {Object[]} แถวข้อมูล (ไม่รวมแถวหัวตาราง)
 */
function referenceRows_(sheetName, fallbackKeys) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  // สร้างตารางแปลง: ชื่อคอลัมน์ที่ normalize แล้ว → คีย์มาตรฐาน
  var canonical = {};
  var expected = CONFIG.HEADERS[sheetName] || [];
  for (var e = 0; e < expected.length; e++) {
    canonical[normalizeHeaderKey_(expected[e])] = expected[e];
  }

  var sheetHeaders = data[0];
  var keys = [];
  for (var h = 0; h < sheetHeaders.length; h++) {
    var norm = normalizeHeaderKey_(sheetHeaders[h]);
    var mapped = canonical[norm] || REFERENCE_HEADER_ALIASES_[norm] || '';
    keys.push(mapped || String(sheetHeaders[h] == null ? '' : sheetHeaders[h]));
  }

  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === '' && String(data[i][1]) === '') continue;

    var row = {};
    for (var j = 0; j < keys.length; j++) {
      if (keys[j] === '') continue;
      row[keys[j]] = String(data[i][j] != null ? data[i][j] : '');
    }

    // หัวตารางแปลกไปจนจับคู่ไม่ได้ → ใช้ตำแหน่งคอลัมน์เป็นทางสำรอง
    for (var f = 0; f < fallbackKeys.length; f++) {
      if (!row[fallbackKeys[f]]) {
        row[fallbackKeys[f]] = String(data[i][f] != null ? data[i][f] : '');
      }
    }

    rows.push(row);
  }
  return rows;
}

function getStoreList() {
  try {
    return { success: true, data: referenceRows_(CONFIG.SHEETS.STORE_LIST, ['storeNo', 'storeName']) };
  } catch (err) {
    Logger.log('Error in getStoreList: ' + err.message);
    return { success: false, message: err.message };
  }
}

function getDepartmentList() {
  try {
    var rows = referenceRows_(CONFIG.SHEETS.DEPARTMENT_LIST, ['division', 'department']);
    var departments = [];
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].division && rows[i].department) departments.push(rows[i]);
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

    return { success: true, data: updated, message: 'อัปเดตโปรไฟล์สำเร็จ' };
  } catch (err) {
    Logger.log('Error in updateProfile: ' + err.message);
    return { success: false, message: 'ไม่สามารถอัปเดตโปรไฟล์ได้: ' + err.message };
  }
}

