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

    const currentUser = session.user as { id: string; role: string };
    const { searchParams } = new URL(req.url);
    const evaluateeId = searchParams.get("evaluateeId");
    const evaluatorId = searchParams.get("evaluatorId");
    const type = searchParams.get("type");

    const where: Record<string, unknown> = {};

    if (evaluateeId) where.evaluateeId = evaluateeId;
    if (evaluatorId) where.evaluatorId = evaluatorId;
    if (type) where.type = type;

    // Students can only see their own evaluations
    if (currentUser.role === "STUDENT") {
      where.evaluateeId = currentUser.id;
    }

    const evaluations = await prisma.evaluation.findMany({
      where,
      include: {
        evaluator: {
          select: { id: true, name: true, email: true, role: true },
        },
        evaluatee: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error("GET /api/evaluations error:", error);
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

    const currentUser = session.user as { id: string };
    const body = await req.json();
    const { evaluateeId, type, period, scores, comment, overallScore } = body;

    if (!evaluateeId || !type || !scores) {
      return NextResponse.json(
        { error: "evaluateeId, type, and scores are required" },
        { status: 400 }
      );
    }

    // Ensure scores is a string (JSON)
    const scoresStr = typeof scores === "string" ? scores : JSON.stringify(scores);

    const evaluation = await prisma.evaluation.create({
      data: {
        evaluatorId: currentUser.id,
        evaluateeId,
        type,
        period,
        scores: scoresStr,
        comment,
        overallScore: overallScore ? parseFloat(overallScore) : undefined,
      },
      include: {
        evaluator: {
          select: { id: true, name: true, email: true },
        },
        evaluatee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    console.error("POST /api/evaluations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
