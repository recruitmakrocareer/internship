// ==================== Hash-based Router ====================

const routes = {
  'login': renderLogin,
  'register': renderRegister,
  'dashboard': renderDashboard,
  'student-profile': renderStudentProfile,
  'student-roadmap': renderStudentRoadmap,
  'training-calendar': renderTrainingCalendar,
  'evaluate': renderEvaluate,
  'student-assignments': renderStudentAssignments,
  'student-evaluations': renderStudentEvaluations,
  'student-resources': renderStudentResources,
  'student-mentors': renderStudentMentors,
  'admin-students': renderAdminStudents,
  'admin-mentors': renderAdminMentors,
  'admin-roadmaps': renderAdminRoadmaps,
  'admin-assignments': renderAdminAssignments,
  'admin-evaluations': renderAdminEvaluations,
  'admin-resources': renderAdminResources,
  'admin-notifications': renderAdminNotifications,
  'mentor-students': renderMentorStudents,
  'mentor-assignments': renderMentorAssignments,
  'mentor-evaluations': renderMentorEvaluations,
  'training-passport': renderTrainingPassport,
  'knowledge-management': renderKnowledgeManagement,
  'survey': renderSurvey,
  'resource-view': renderResourceView,
};

// หน้าที่จำกัดเฉพาะบางบทบาท (ที่ไม่อยู่ในตารางนี้ = เปิดได้ทุกบทบาทที่ล็อกอินแล้ว)
// ADMIN เปิดได้ทุกหน้า — สิทธิ์จริงยังถูกบังคับอีกชั้นที่ API (Session.gs)
const pageRoles = {
  'student-profile': ['STUDENT'],
  'student-roadmap': ['STUDENT'],
  'student-assignments': ['STUDENT'],
  'student-evaluations': ['STUDENT'],
  'student-resources': ['STUDENT'],
  'student-mentors': ['STUDENT'],
  'training-calendar': ['STUDENT'],
  'survey': ['STUDENT'],
  'mentor-students': ['MENTOR'],
  'mentor-assignments': ['MENTOR'],
  'mentor-evaluations': ['MENTOR'],
  'admin-students': ['ADMIN'],
  'admin-mentors': ['ADMIN'],
  'admin-roadmaps': ['ADMIN'],
  'admin-assignments': ['ADMIN'],
  'admin-evaluations': ['ADMIN'],
  'admin-resources': ['ADMIN'],
  'admin-notifications': ['ADMIN'],
};

function isPageAllowedForRole(page, role) {
  if (role === 'ADMIN') return true;
  const allowed = pageRoles[page];
  return !allowed || allowed.indexOf(role) !== -1;
}

function router() {
  const hash = window.location.hash.slice(1) || 'login';
  const page = hash.split('?')[0];

  // หน้าสาธารณะที่ไม่ต้องล็อกอิน (evaluate = แบบประเมินผ่าน QR Code)
  const publicPages = ['login', 'register', 'evaluate'];
  if (!publicPages.includes(page) && !isLoggedIn()) {
    window.location.hash = '#login';
    return;
  }

  // ถ้าล็อกอินแล้วเข้าหน้า login/register ให้ redirect ไป dashboard
  if (['login', 'register'].includes(page) && isLoggedIn()) {
    window.location.hash = '#dashboard';
    return;
  }

  // พิมพ์ URL เข้าหน้าของบทบาทอื่นตรง ๆ ไม่ได้
  if (!publicPages.includes(page)) {
    const user = getCurrentUser();
    if (user && !isPageAllowedForRole(page, user.role)) {
      if (typeof showToast === 'function') showToast('คุณไม่มีสิทธิ์เข้าหน้านี้', 'error');
      window.location.hash = '#dashboard';
      return;
    }
  }

  const renderFn = routes[page];
  if (typeof renderFn === 'function') {
    try { renderFn(); } catch (err) { console.error('[Router] render error on page "' + page + '":', err); }
  } else {
    console.warn('[Router] No render function for page:', page);
    renderLogin();
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
