/**
 * Config.gs - Configuration constants for the Internship Management System
 */

var CONFIG = {
  // Spreadsheet ID - uses active spreadsheet for bound scripts, set manually for standalone
  SPREADSHEET_ID: (function() {
    try {
      return SpreadsheetApp.getActiveSpreadsheet().getId();
    } catch (e) {
      // Set your spreadsheet ID here for standalone scripts
      return 'YOUR_SPREADSHEET_ID_HERE';
    }
  })(),

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
    NOTIFICATIONS: 'Notifications'
  },

  // Column headers for each sheet
  HEADERS: {
    Users: [
      'id', 'email', 'password', 'role', 'firstName', 'lastName',
      'studentId', 'department', 'phone', 'lineUserId', 'profileImage',
      'isActive', 'createdAt', 'updatedAt'
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
      'dueDate', 'isActive', 'createdAt', 'updatedAt'
    ],
    RoadmapProgress: [
      'id', 'userId', 'roadmapId', 'stepId', 'status',
      'note', 'completedAt', 'updatedAt'
    ],
    Assignments: [
      'id', 'title', 'description', 'dueDate', 'maxScore',
      'assignedTo', 'createdBy', 'isActive', 'createdAt', 'updatedAt'
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
      'isActive', 'createdAt', 'updatedAt'
    ],
    Notifications: [
      'id', 'userId', 'title', 'message', 'type',
      'isRead', 'relatedId', 'createdAt'
    ]
  },

  // User roles
  ROLES: {
    STUDENT: 'STUDENT',
    MENTOR: 'MENTOR',
    ADMIN: 'ADMIN'
  }
};
