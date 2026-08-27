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
