import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { assignments, users } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const result = await assignments.findByIdWithSubmissions(id);

    if (!result) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Enrich submissions with user info and sort by submittedAt desc
    const enrichedSubmissions = await Promise.all(
      (result.submissions || []).map(async (sub: Record<string, string>) => {
        const user = await users.findById(sub.userId);
        return {
          ...sub,
          user: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                studentId: user.studentId,
              }
            : null,
        };
      })
    );

    enrichedSubmissions.sort(
      (a, b) =>
        new Date((a as Record<string, unknown>).submittedAt as string || "").getTime() -
        new Date((b as Record<string, unknown>).submittedAt as string || "").getTime()
    ).reverse();

    return NextResponse.json({
      ...result,
      submissions: enrichedSubmissions,
    });
  } catch (error) {
    console.error("GET /api/assignments/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as { role: string }).role;
    if (userRole !== "ADMIN" && userRole !== "MENTOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { title, description, dueDate, maxScore, isActive } = body;

    const updateData: Record<string, string | number | boolean | null | undefined> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate).toISOString() : "";
    if (maxScore !== undefined) updateData.maxScore = maxScore;
    if (isActive !== undefined) updateData.isActive = String(isActive);

    const assignment = await assignments.update(id, updateData);

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("PATCH /api/assignments/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as { role: string }).role;
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    await assignments.delete(id);

    return NextResponse.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/assignments/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
