/**
 * Code.gs - Main entry point for the Internship Management System
 * ระบบจัดการนักศึกษาฝึกงาน
 *
 * ใช้ได้ 2 แบบ:
 * 1. Apps Script Web App (standalone) - ใช้ doGet() serve HTML
 * 2. REST API สำหรับ GitHub Pages - ใช้ doGet()/doPost() return JSON
 */

// ============================================================
// Mode 1: Apps Script Web App (serve HTML pages)
// ============================================================
function doGet(e) {
  var action = e.parameter.action;

  // ถ้ามี action parameter = เป็น API call จาก GitHub Pages
  if (action) {
    return handleApiRequest(e.parameter);
  }

  // ไม่มี action = serve HTML page
  var page = e.parameter.page || 'login';
  var publicPages = ['login', 'register'];

  if (publicPages.indexOf(page) === -1) {
    var user = getCurrentUser();
    if (!user) {
      page = 'login';
    }
  }

  try {
    var template = HtmlService.createTemplateFromFile(page);
    return template.evaluate()
      .setTitle('ระบบจัดการนักศึกษาฝึกงาน')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    var template = HtmlService.createTemplateFromFile('login');
    return template.evaluate()
      .setTitle('ระบบจัดการนักศึกษาฝึกงาน')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}

// ============================================================
// Mode 2: REST API for GitHub Pages
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

  try {
    var result;

    switch (action) {
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
      case 'getCurrentUser':
        result = getCurrentUser();
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

function jsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}
