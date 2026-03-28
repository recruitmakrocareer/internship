// ==================== Hash-based Router ====================

const routes = {
  'login': renderLogin,
  'register': renderRegister,
  'dashboard': renderDashboard,
  'student-profile': renderStudentProfile,
  'student-roadmap': renderStudentRoadmap,
  'student-assignments': renderStudentAssignments,
  'student-evaluations': renderStudentEvaluations,
  'student-resources': renderStudentResources,
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
};

function router() {
  const hash = window.location.hash.slice(1) || 'login';
  const page = hash.split('?')[0];

  // หน้าสาธารณะที่ไม่ต้องล็อกอิน
  const publicPages = ['login', 'register'];
  if (!publicPages.includes(page) && !isLoggedIn()) {
    window.location.hash = '#login';
    return;
  }

  // ถ้าล็อกอินแล้วเข้าหน้า login/register ให้ redirect ไป dashboard
  if (publicPages.includes(page) && isLoggedIn()) {
    window.location.hash = '#dashboard';
    return;
  }

  const renderFn = routes[page];
  if (renderFn) {
    renderFn();
  } else {
    renderLogin();
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
