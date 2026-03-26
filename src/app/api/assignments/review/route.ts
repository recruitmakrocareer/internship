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

    const existingSubmission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!existingSubmission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status,
        score: score !== undefined ? score : undefined,
        feedback: feedback ?? undefined,
        reviewedAt: new Date(),
      },
      include: {
        assignment: {
          select: { id: true, title: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("POST /api/assignments/review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
