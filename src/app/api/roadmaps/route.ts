import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { roadmaps, roadmapSteps } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allRoadmaps = await roadmaps.findManyWithSteps({ isActive: "true" });

    // Sort by order ascending
    allRoadmaps.sort(
      (a, b) => Number(a.order || 0) - Number(b.order || 0)
    );

    return NextResponse.json(allRoadmaps);
  } catch (error) {
    console.error("GET /api/roadmaps error:", error);
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
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, category, order, steps } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Create the roadmap first
    const roadmap = await roadmaps.create({
      title,
      description: description || "",
      category: category || "",
      order: order !== undefined ? String(order) : "0",
      isActive: "true",
    });

    // Create steps if provided
    const createdSteps: Record<string, string>[] = [];
    if (steps?.length) {
      for (let index = 0; index < steps.length; index++) {
        const step = steps[index] as {
          title: string;
          description?: string;
          content?: string;
          order?: number;
          durationDays?: number;
          resources?: string;
        };
        const createdStep = await roadmapSteps.create({
          roadmapId: roadmap.id,
          title: step.title,
          description: step.description || "",
          content: step.content || "",
          order: step.order !== undefined ? String(step.order) : String(index),
          durationDays: step.durationDays !== undefined ? String(step.durationDays) : "",
          resources: step.resources || "",
        });
        createdSteps.push(createdStep);
      }
    }

    // Sort steps by order
    createdSteps.sort(
      (a, b) => Number(a.order || 0) - Number(b.order || 0)
    );

    return NextResponse.json({ ...roadmap, steps: createdSteps }, { status: 201 });
  } catch (error) {
    console.error("POST /api/roadmaps error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
