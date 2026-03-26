import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { evaluations, users } from "@/lib/db";

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

    const filter: Record<string, string | undefined> = {};

    if (evaluateeId) filter.evaluateeId = evaluateeId;
    if (evaluatorId) filter.evaluatorId = evaluatorId;
    if (type) filter.type = type;

    // Students can only see their own evaluations
    if (currentUser.role === "STUDENT") {
      filter.evaluateeId = currentUser.id;
    }

    const allEvaluations = await evaluations.findMany(filter);

    // Sort by createdAt descending
    allEvaluations.sort(
      (a, b) =>
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
    );

    // Enrich with evaluator and evaluatee info
    const enriched = await Promise.all(
      allEvaluations.map(async (ev) => {
        const [evaluator, evaluatee] = await Promise.all([
          users.findById(ev.evaluatorId),
          users.findById(ev.evaluateeId),
        ]);
        return {
          ...ev,
          evaluator: evaluator
            ? {
                id: evaluator.id,
                name: evaluator.name,
                email: evaluator.email,
                role: evaluator.role,
              }
            : null,
          evaluatee: evaluatee
            ? {
                id: evaluatee.id,
                name: evaluatee.name,
                email: evaluatee.email,
                role: evaluatee.role,
              }
            : null,
        };
      })
    );

    return NextResponse.json(enriched);
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

    const evaluation = await evaluations.create({
      evaluatorId: currentUser.id,
      evaluateeId,
      type,
      period: period ?? "",
      scores: scoresStr,
      comment: comment ?? "",
      overallScore: overallScore ? String(parseFloat(overallScore)) : "",
    });

    // Enrich with evaluator and evaluatee info
    const [evaluator, evaluatee] = await Promise.all([
      users.findById(currentUser.id),
      users.findById(evaluateeId),
    ]);

    return NextResponse.json(
      {
        ...evaluation,
        evaluator: evaluator
          ? { id: evaluator.id, name: evaluator.name, email: evaluator.email }
          : null,
        evaluatee: evaluatee
          ? { id: evaluatee.id, name: evaluatee.name, email: evaluatee.email }
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/evaluations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
