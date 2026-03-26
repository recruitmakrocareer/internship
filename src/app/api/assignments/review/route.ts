import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { assignments, submissions, users } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as { role: string }).role;
    if (userRole !== "ADMIN" && userRole !== "MENTOR") {
      return NextResponse.json(
        { error: "Only mentors and admins can review submissions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { submissionId, status, score, feedback } = body;

    if (!submissionId || !status) {
      return NextResponse.json(
        { error: "submissionId and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = [
      "REVIEWED",
      "REVISION_REQUESTED",
      "APPROVED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const existingSubmission = await submissions.findById(submissionId);

    if (!existingSubmission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, string | number | boolean | null | undefined> = {
      status,
      reviewedAt: new Date().toISOString(),
    };
    if (score !== undefined) updateData.score = score;
    if (feedback !== undefined) updateData.feedback = feedback;

    const submission = await submissions.update(submissionId, updateData);

    if (!submission) {
      return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
    }

    // Enrich with assignment and user info
    const assignment = await assignments.findById(submission.assignmentId);
    const user = await users.findById(submission.userId);

    return NextResponse.json({
      ...submission,
      assignment: assignment
        ? { id: assignment.id, title: assignment.title }
        : null,
      user: user
        ? { id: user.id, name: user.name, email: user.email }
        : null,
    });
  } catch (error) {
    console.error("POST /api/assignments/review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
