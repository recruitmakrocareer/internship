import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roadmaps = await prisma.roadmap.findMany({
      where: { isActive: true },
      include: {
        steps: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(roadmaps);
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

    const roadmap = await prisma.roadmap.create({
      data: {
        title,
        description,
        category,
        order: order ?? 0,
        steps: steps?.length
          ? {
              create: steps.map(
                (
                  step: {
                    title: string;
                    description?: string;
                    content?: string;
                    order?: number;
                    durationDays?: number;
                    resources?: string;
                  },
                  index: number
                ) => ({
                  title: step.title,
                  description: step.description,
                  content: step.content,
                  order: step.order ?? index,
                  durationDays: step.durationDays,
                  resources: step.resources,
                })
              ),
            }
          : undefined,
      },
      include: {
        steps: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json(roadmap, { status: 201 });
  } catch (error) {
    console.error("POST /api/roadmaps error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
