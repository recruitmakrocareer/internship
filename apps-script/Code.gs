/**
 * Code.gs - Main entry point for the Internship Management System
 * ระบบจัดการนักศึกษาฝึกงาน
 */

/**
 * Serves the web app. Routes based on e.parameter.page.
 * @param {Object} e - Event parameter from web app request
 * @return {HtmlOutput} The HTML page to serve
 */
function doGet(e) {
  var page = e.parameter.page || 'login';

  // Define valid pages and their required roles
  var publicPages = ['login', 'register'];
  var studentPages = ['dashboard', 'student-profile', 'student-roadmap', 'student-assignments', 'student-evaluations', 'student-resources'];
  var adminPages = ['dashboard', 'admin-students', 'admin-mentors', 'admin-roadmaps', 'admin-assignments', 'admin-evaluations', 'admin-resources', 'admin-notifications'];
  var mentorPages = ['dashboard', 'mentor-students', 'mentor-assignments', 'mentor-evaluations'];

  // Check if page requires authentication
  if (publicPages.indexOf(page) === -1) {
    var user = getCurrentUser();
    if (!user) {
      // Redirect to login if not authenticated
      page = 'login';
    } else if (page === 'dashboard') {
      // Route dashboard based on role
      switch (user.role) {
        case CONFIG.ROLES.ADMIN:
          page = 'admin-dashboard';
          break;
        case CONFIG.ROLES.MENTOR:
          page = 'mentor-dashboard';
          break;
        case CONFIG.ROLES.STUDENT:
        default:
          page = 'student-dashboard';
          break;
      }
    }
  }

  try {
    var template = HtmlService.createTemplateFromFile(page);
    return template.evaluate()
      .setTitle('ระบบจัดการนักศึกษาฝึกงาน')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    // If template not found, serve login page
    var template = HtmlService.createTemplateFromFile('login');
    return template.evaluate()
      .setTitle('ระบบจัดการนักศึกษาฝึกงาน')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}

/**
 * Includes an HTML file as a partial (for CSS/JS includes).
 * @param {string} filename - The name of the HTML file to include
 * @return {string} The content of the HTML file
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Returns the URL of the deployed web app.
 * @return {string} The web app URL
 */
function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}
