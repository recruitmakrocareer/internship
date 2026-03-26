import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    if (!assignment.isActive) {
      return NextResponse.json(
        { error: "Assignment is no longer active" },
        { status: 400 }
      );
    }

    // Check if student already has a submission for this assignment
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        userId: currentUser.id,
      },
    });

    let submission;

    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content,
          fileUrl,
          fileName,
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
        include: {
          assignment: {
            select: { id: true, title: true },
          },
        },
      });
    } else {
      // Create new submission
      submission = await prisma.submission.create({
        data: {
          assignmentId,
          userId: currentUser.id,
          content,
          fileUrl,
          fileName,
          status: "SUBMITTED",
        },
        include: {
          assignment: {
            select: { id: true, title: true },
          },
        },
      });
    }

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("POST /api/assignments/submit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
