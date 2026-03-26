import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { assignments, submissions } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const allAssignments = await assignments.findMany({ isActive: "true" });

    // Sort by createdAt descending
    allAssignments.sort(
      (a, b) =>
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
    );

    const total = allAssignments.length;
    const paged = allAssignments.slice(skip, skip + limit);

    // For each assignment, get its submissions
    const assignmentsWithSubmissions = await Promise.all(
      paged.map(async (assignment) => {
        const subs = await submissions.findMany({
          assignmentId: assignment.id,
        });
        return {
          ...assignment,
          submissions: subs.map((s) => ({
            id: s.id,
            userId: s.userId,
            status: s.status,
            score: s.score,
            submittedAt: s.submittedAt,
          })),
        };
      })
    );

    return NextResponse.json({
      assignments: assignmentsWithSubmissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/assignments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as { role: string }).role;
    if (userRole !== "ADMIN" && userRole !== "MENTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, dueDate, maxScore } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const assignment = await assignments.create({
      title,
      description: description ?? "",
      dueDate: dueDate ? new Date(dueDate).toISOString() : "",
      maxScore: maxScore ?? 100,
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("POST /api/assignments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
