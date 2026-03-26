import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const student = await prisma.user.findUnique({
      where: { id, role: "STUDENT" },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        studentId: true,
        university: true,
        faculty: true,
        major: true,
        year: true,
        startDate: true,
        endDate: true,
        company: true,
        department: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        studentMentors: {
          include: {
            mentor: {
              select: {
                id: true,
                name: true,
                email: true,
                position: true,
                expertise: true,
              },
            },
          },
        },
        submissions: {
          include: {
            assignment: {
              select: { id: true, title: true, dueDate: true, maxScore: true },
            },
          },
          orderBy: { submittedAt: "desc" },
        },
        roadmapProgress: {
          include: {
            step: {
              include: {
                roadmap: { select: { id: true, title: true } },
              },
            },
          },
        },
        receivedEvaluations: {
          include: {
            evaluator: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("GET /api/students/[id] error:", error);
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

    const { id } = params;
    const currentUser = session.user as { id: string; role: string };

    if (currentUser.role !== "ADMIN" && currentUser.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      phone,
      avatar,
      studentId,
      university,
      faculty,
      major,
      year,
      startDate,
      endDate,
      company,
      department,
    } = body;

    const student = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
        ...(studentId !== undefined && { studentId }),
        ...(university !== undefined && { university }),
        ...(faculty !== undefined && { faculty }),
        ...(major !== undefined && { major }),
        ...(year !== undefined && { year: parseInt(year, 10) }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(company !== undefined && { company }),
        ...(department !== undefined && { department }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        studentId: true,
        university: true,
        faculty: true,
        major: true,
        year: true,
        startDate: true,
        endDate: true,
        company: true,
        department: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("PATCH /api/students/[id] error:", error);
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

    const student = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, isActive: true },
    });

    return NextResponse.json({
      message: "Student deactivated successfully",
      student,
    });
  } catch (error) {
    console.error("DELETE /api/students/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
