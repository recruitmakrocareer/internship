import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { assignments, submissions } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as { id: string; role: string };
    if (currentUser.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can submit assignments" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { assignmentId, content, fileUrl, fileName } = body;

    if (!assignmentId) {
      return NextResponse.json(
        { error: "assignmentId is required" },
        { status: 400 }
      );
    }

    const assignment = await assignments.findById(assignmentId);

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    if (assignment.isActive !== "true") {
      return NextResponse.json(
        { error: "Assignment is no longer active" },
        { status: 400 }
      );
    }

    // Check if student already has a submission for this assignment
    const existingSubmission = await submissions.findByAssignmentAndUser(
      assignmentId,
      currentUser.id
    );

    let submission;

    if (existingSubmission) {
      // Update existing submission
      submission = await submissions.update(existingSubmission.id, {
        content: content ?? "",
        fileUrl: fileUrl ?? "",
        fileName: fileName ?? "",
        status: "SUBMITTED",
        submittedAt: new Date().toISOString(),
      });
    } else {
      // Create new submission
      submission = await submissions.create({
        assignmentId,
        userId: currentUser.id,
        content: content ?? "",
        fileUrl: fileUrl ?? "",
        fileName: fileName ?? "",
        status: "SUBMITTED",
        submittedAt: new Date().toISOString(),
      });
    }

    // Attach assignment info
    const result = {
      ...submission,
      assignment: {
        id: assignment.id,
        title: assignment.title,
      },
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/assignments/submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
