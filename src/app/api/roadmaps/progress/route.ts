import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { roadmapProgress, roadmapSteps, roadmaps } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as { id: string };
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || currentUser.id;

    const progressRecords = await roadmapProgress.findMany({ userId });

    // Enrich with step and roadmap data
    const enriched = await Promise.all(
      progressRecords.map(async (prog) => {
        const step = await roadmapSteps.findById(prog.stepId);
        let roadmap = null;
        if (step) {
          roadmap = await roadmaps.findById(step.roadmapId);
        }
        return {
          ...prog,
          step: step
            ? {
                ...step,
                roadmap: roadmap
                  ? {
                      id: roadmap.id,
                      title: roadmap.title,
                      category: roadmap.category || "",
                    }
                  : null,
              }
            : null,
        };
      })
    );

    // Sort by updatedAt descending
    enriched.sort(
      (a, b) =>
        new Date((b as Record<string, unknown>).updatedAt as string || "").getTime() -
        new Date((a as Record<string, unknown>).updatedAt as string || "").getTime()
    );

    return NextResponse.json(enriched);
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

    const progressData: Record<string, string> = {
      status,
      completedAt: status === "COMPLETED" ? new Date().toISOString() : "",
    };
    if (note !== undefined && note !== null) {
      progressData.note = note;
    }

    const progress = await roadmapProgress.upsert(userId, stepId, progressData);

    if (!progress) {
      return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
    }

    // Enrich with step and roadmap data
    const step = await roadmapSteps.findById(progress.stepId || stepId);
    let roadmap = null;
    if (step) {
      roadmap = await roadmaps.findById(step.roadmapId);
    }

    return NextResponse.json({
      ...progress,
      step: step
        ? {
            ...step,
            roadmap: roadmap
              ? { id: roadmap.id, title: roadmap.title }
              : null,
          }
        : null,
    });
  } catch (error) {
    console.error("POST /api/roadmaps/progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
