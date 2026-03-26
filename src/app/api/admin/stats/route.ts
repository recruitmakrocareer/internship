import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      totalStudents,
      activeStudents,
      totalMentors,
      totalAssignments,
      totalSubmissions,
      approvedSubmissions,
      totalRoadmapSteps,
      completedSteps,
      totalEvaluations,
      totalResources,
      recentStudents,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
      prisma.user.count({ where: { role: "MENTOR" } }),
      prisma.assignment.count(),
      prisma.submission.count(),
      prisma.submission.count({ where: { status: "APPROVED" } }),
      prisma.roadmapProgress.count(),
      prisma.roadmapProgress.count({ where: { status: "COMPLETED" } }),
      prisma.evaluation.count(),
      prisma.resource.count(),
      prisma.user.findMany({
        where: { role: "STUDENT" },
        select: {
          id: true,
          name: true,
          email: true,
          studentId: true,
          university: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

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
