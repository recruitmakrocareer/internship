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
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { mentorId, studentId } = body;

    if (!mentorId || !studentId) {
      return NextResponse.json(
        { error: "mentorId and studentId are required" },
        { status: 400 }
      );
    }

    // Verify mentor exists and has MENTOR role
    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
      select: { id: true, name: true, role: true },
    });

    if (!mentor) {
      return NextResponse.json(
        { error: "Mentor not found" },
        { status: 404 }
      );
    }

    if (mentor.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Specified user is not a mentor" },
        { status: 400 }
      );
    }

    // Verify student exists and has STUDENT role
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, role: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Specified user is not a student" },
        { status: 400 }
      );
    }

    // Check if assignment already exists
    const existing = await prisma.mentorStudent.findUnique({
      where: {
        mentorId_studentId: { mentorId, studentId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This mentor-student assignment already exists" },
        { status: 409 }
      );
    }

    const assignment = await prisma.mentorStudent.create({
      data: {
        mentorId,
        studentId,
      },
      include: {
        mentor: {
          select: { id: true, name: true, email: true, position: true },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            university: true,
          },
        },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/mentor-assign error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
