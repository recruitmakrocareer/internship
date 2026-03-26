import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as { id: string };
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || currentUser.id;

    const progress = await prisma.roadmapProgress.findMany({
      where: { userId },
      include: {
        step: {
          include: {
            roadmap: {
              select: { id: true, title: true, category: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("GET /api/roadmaps/progress error:", error);
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

    const body = await req.json();
    const { userId, stepId, status, note } = body;

    if (!userId || !stepId || !status) {
      return NextResponse.json(
        { error: "userId, stepId, and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const progress = await prisma.roadmapProgress.upsert({
      where: {
        userId_stepId: { userId, stepId },
      },
      update: {
        status,
        note: note ?? undefined,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
      create: {
        userId,
        stepId,
        status,
        note,
        completedAt: status === "COMPLETED" ? new Date() : undefined,
      },
      include: {
        step: {
          include: {
            roadmap: { select: { id: true, title: true } },
          },
        },
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("POST /api/roadmaps/progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
