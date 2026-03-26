import {
  getAllRows,
  getRows,
  getRowById,
  appendRow,
  updateRow,
  deleteRow,
  countRows,
  searchRows,
  SHEETS,
} from "./google-sheets";

// ============================================================
// Users
// ============================================================
export const users = {
  async findMany(filter?: Record<string, string | undefined>) {
    return getRows(SHEETS.Users, filter);
  },

  async findById(id: string) {
    return getRowById(SHEETS.Users, id);
  },

  async findByEmail(email: string) {
    const rows = await getRows(SHEETS.Users, { email });
    return rows[0] || null;
  },

  async findByStudentId(studentId: string) {
    const rows = await getRows(SHEETS.Users, { studentId });
    return rows[0] || null;
  },

  async create(data: Record<string, string | number | boolean | null | undefined>) {
    return appendRow(SHEETS.Users, { ...data, isActive: data.isActive ?? "true" });
  },

  async update(id: string, data: Record<string, string | number | boolean | null | undefined>) {
    return updateRow(SHEETS.Users, id, data);
  },

  async delete(id: string) {
    return deleteRow(SHEETS.Users, id);
  },

  async search(query: string) {
    const byName = await searchRows(SHEETS.Users, "name", query);
    const byEmail = await searchRows(SHEETS.Users, "email", query);
    const byStudentId = await searchRows(SHEETS.Users, "studentId", query);
    // Deduplicate by ID
    const map = new Map<string, Record<string, string>>();
    [...byName, ...byEmail, ...byStudentId].forEach((r) => map.set(r.id, r));
    return Array.from(map.values());
  },

  async count(filter?: Record<string, string | undefined>) {
    return countRows(SHEETS.Users, filter);
  },
};

// ============================================================
// MentorStudents
// ============================================================
export const mentorStudents = {
  async findMany(filter?: Record<string, string | undefined>) {
    return getRows(SHEETS.MentorStudents, filter);
  },

  async create(data: Record<string, string | number | boolean | null | undefined>) {
    return appendRow(SHEETS.MentorStudents, data);
  },

  async findByMentorAndStudent(mentorId: string, studentId: string) {
    const rows = await getRows(SHEETS.MentorStudents, { mentorId, studentId });
    return rows[0] || null;
  },

  async delete(id: string) {
    return deleteRow(SHEETS.MentorStudents, id);
  },
};

// ============================================================
// Roadmaps
// ============================================================
export const roadmaps = {
  async findMany(filter?: Record<string, string | undefined>) {
    return getRows(SHEETS.Roadmaps, filter);
  },

  async findById(id: string) {
    return getRowById(SHEETS.Roadmaps, id);
  },

  async create(data: Record<string, string | number | boolean | null | undefined>) {
    return appendRow(SHEETS.Roadmaps, { ...data, isActive: data.isActive ?? "true" });
  },

  async update(id: string, data: Record<string, string | number | boolean | null | undefined>) {
    return updateRow(SHEETS.Roadmaps, id, data);
  },

  async delete(id: string) {
    return deleteRow(SHEETS.Roadmaps, id);
  },

  // Get roadmap with its steps
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findByIdWithSteps(id: string): Promise<any | null> {
    const roadmap = await getRowById(SHEETS.Roadmaps, id);
    if (!roadmap) return null;
    const steps = await getRows(SHEETS.RoadmapSteps, { roadmapId: id });
    steps.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
    return { ...roadmap, steps };
  },

  // Get all roadmaps with steps
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findManyWithSteps(filter?: Record<string, string | undefined>): Promise<any[]> {
    const allRoadmaps = await getRows(SHEETS.Roadmaps, filter);
    const allSteps = await getAllRows(SHEETS.RoadmapSteps);
    return allRoadmaps.map((roadmap) => ({
      ...roadmap,
      steps: allSteps
        .filter((s) => s.roadmapId === roadmap.id)
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    }));
  },
};

// ============================================================
// RoadmapSteps
// ============================================================
export const roadmapSteps = {
  async findMany(filter?: Record<string, string | undefined>) {
    return getRows(SHEETS.RoadmapSteps, filter);
  },

  async findById(id: string) {
    return getRowById(SHEETS.RoadmapSteps, id);
  },

  async create(data: Record<string, string | number | boolean | null | undefined>) {
    return appendRow(SHEETS.RoadmapSteps, data);
  },

  async update(id: string, data: Record<string, string | number | boolean | null | undefined>) {
    return updateRow(SHEETS.RoadmapSteps, id, data);
  },

  async delete(id: string) {
    return deleteRow(SHEETS.RoadmapSteps, id);
  },
};

// ============================================================
// RoadmapProgress
// ============================================================
export const roadmapProgress = {
  async findMany(filter?: Record<string, string | undefined>) {
    return getRows(SHEETS.RoadmapProgress, filter);
  },

  async findByUserAndStep(userId: string, stepId: string) {
    const rows = await getRows(SHEETS.RoadmapProgress, { userId, stepId });
    return rows[0] || null;
  },

  async upsert(userId: string, stepId: string, data: Record<string, string | number | boolean | null | undefined>) {
    const existing = await this.findByUserAndStep(userId, stepId);
    if (existing) {
      return updateRow(SHEETS.RoadmapProgress, existing.id, data);
    }
    return appendRow(SHEETS.RoadmapProgress, { ...data, userId, stepId });
  },

  async create(data: Record<string, string | number | boolean | null | undefined>) {
    return appendRow(SHEETS.RoadmapProgress, data);
  },
};

// ============================================================
// Assignments
// ============================================================
export const assignments = {
  async findMany(filter?: Record<string, string | undefined>) {
    return getRows(SHEETS.Assignments, filter);
  },

  async findById(id: string) {
    return getRowById(SHEETS.Assignments, id);
  },

  async create(data: Record<string, string | number | boolean | null | undefined>) {
    return appendRow(SHEETS.Assignments, { ...data, isActive: data.isActive ?? "true" });
  },

  async update(id: string, data: Record<string, string | number | boolean | null | undefined>) {
    return updateRow(SHEETS.Assignments, id, data);
  },

  async delete(id: string) {
    return deleteRow(SHEETS.Assignments, id);
  },

  // Get assignment with submissions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async findByIdWithSubmissions(id: string): Promise<any | null> {
    const assignment = await getRowById(SHEETS.Assignments, id);
    if (!assignment) return null;
    const subs = await getRows(SHEETS.Submissions, { assignmentId: id });
    return { ...assignment, submissions: subs };
  },
};

// ============================================================
// Submissions
// ============================================================
export const submissions = {
  async findMany(filter?: Record<string, string | undefined>) {
    return getRows(SHEETS.Submissions, filter);
  },

  async findById(id: string) {
    return getRowById(SHEETS.Submissions, id);
  },

  async findByAssignmentAndUser(assignmentId: string, userId: string) {
    const rows = await getRows(SHEETS.Submissions, { assignmentId, userId });
    return rows[0] || null;
  },

  async create(data: Record<string, string | number | boolean | null | undefined>) {
    return appendRow(SHEETS.Submissions, { ...data, status: data.status ?? "SUBMITTED" });
  },

  async update(id: string, data: Record<string, string | number | boolean | null | undefined>) {
    return updateRow(SHEETS.Submissions, id, data);
  },
};

// ============================================================
// Evaluations
// ============================================================
export const evaluations = {
  async findMany(filter?: Record<string, string | undefined>) {
    return getRows(SHEETS.Evaluations, filter);
  },

  async findById(id: string) {
    return getRowById(SHEETS.Evaluations, id);
  },

  async create(data: Record<string, string | number | boolean | null | undefined>) {
    return appendRow(SHEETS.Evaluations, data);
  },

  async update(id: string, data: Record<string, string | number | boolean | null | undefined>) {
    return updateRow(SHEETS.Evaluations, id, data);
  },
};

// ============================================================
// Resources
// ============================================================
export const resources = {
  async findMany(filter?: Record<string, string | undefined>) {
    return getRows(SHEETS.Resources, filter);
  },

  async findById(id: string) {
    return getRowById(SHEETS.Resources, id);
  },

  async create(data: Record<string, string | number | boolean | null | undefined>) {
    return appendRow(SHEETS.Resources, { ...data, isPublic: data.isPublic ?? "true" });
  },

  async update(id: string, data: Record<string, string | number | boolean | null | undefined>) {
    return updateRow(SHEETS.Resources, id, data);
  },

  async delete(id: string) {
    return deleteRow(SHEETS.Resources, id);
  },
};

// ============================================================
// Notifications
// ============================================================
export const notifications = {
  async findMany(filter?: Record<string, string | undefined>) {
    return getRows(SHEETS.Notifications, filter);
  },

  async findById(id: string) {
    return getRowById(SHEETS.Notifications, id);
  },

  async create(data: Record<string, string | number | boolean | null | undefined>) {
    return appendRow(SHEETS.Notifications, { ...data, isRead: "false", sentViaLine: data.sentViaLine ?? "false" });
  },

  async update(id: string, data: Record<string, string | number | boolean | null | undefined>) {
    return updateRow(SHEETS.Notifications, id, data);
  },

  async markAllRead(userId: string) {
    const unread = await getRows(SHEETS.Notifications, { userId, isRead: "false" });
    await Promise.all(unread.map((n) => updateRow(SHEETS.Notifications, n.id, { isRead: "true" })));
    return unread.length;
  },
};

// ============================================================
// ActivityLogs
// ============================================================
export const activityLogs = {
  async create(data: Record<string, string | number | boolean | null | undefined>) {
    return appendRow(SHEETS.ActivityLogs, data);
  },

  async findMany(filter?: Record<string, string | undefined>) {
    return getRows(SHEETS.ActivityLogs, filter);
  },
};
