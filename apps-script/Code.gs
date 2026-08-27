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
