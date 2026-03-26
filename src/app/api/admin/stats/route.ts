import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  users,
  assignments,
  submissions,
  roadmapProgress,
  evaluations,
  resources,
} from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as { role: string }).role;
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      allStudents,
      totalMentors,
      allAssignments,
      allSubmissions,
      allProgress,
      allEvaluations,
      allResources,
    ] = await Promise.all([
      users.findMany({ role: "STUDENT" }),
      users.count({ role: "MENTOR" }),
      assignments.findMany(),
      submissions.findMany(),
      roadmapProgress.findMany(),
      evaluations.findMany(),
      resources.findMany(),
    ]);

    const totalStudents = allStudents.length;
    const activeStudents = allStudents.filter(
      (s) => s.isActive === "true"
    ).length;
    const totalAssignments = allAssignments.length;
    const totalSubmissions = allSubmissions.length;
    const approvedSubmissions = allSubmissions.filter(
      (s) => s.status === "APPROVED"
    ).length;
    const totalRoadmapSteps = allProgress.length;
    const completedSteps = allProgress.filter(
      (p) => p.status === "COMPLETED"
    ).length;
    const totalEvaluations = allEvaluations.length;
    const totalResources = allResources.length;

    // Get recent students (sorted by createdAt desc, take 5)
    const recentStudents = allStudents
      .sort(
        (a, b) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      )
      .slice(0, 5);

    const assignmentCompletionRate =
      totalSubmissions > 0
        ? Math.round((approvedSubmissions / totalSubmissions) * 100)
        : 0;

    const roadmapCompletionRate =
      totalRoadmapSteps > 0
        ? Math.round((completedSteps / totalRoadmapSteps) * 100)
        : 0;

    return NextResponse.json({
      students: {
        total: totalStudents,
        active: activeStudents,
        inactive: totalStudents - activeStudents,
      },
      mentors: {
        total: totalMentors,
      },
      assignments: {
        total: totalAssignments,
        submissions: totalSubmissions,
        approved: approvedSubmissions,
        completionRate: assignmentCompletionRate,
      },
      roadmap: {
        totalProgress: totalRoadmapSteps,
        completed: completedSteps,
        completionRate: roadmapCompletionRate,
      },
      evaluations: {
        total: totalEvaluations,
      },
      resources: {
        total: totalResources,
      },
      recentStudents,
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
