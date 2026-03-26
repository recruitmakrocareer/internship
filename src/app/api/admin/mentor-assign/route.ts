import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { users, mentorStudents } from "@/lib/db";

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
    const mentor = await users.findById(mentorId);

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
    const student = await users.findById(studentId);

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
    const existing = await mentorStudents.findByMentorAndStudent(
      mentorId,
      studentId
    );

    if (existing) {
      return NextResponse.json(
        { error: "This mentor-student assignment already exists" },
        { status: 409 }
      );
    }

    const assignment = await mentorStudents.create({
      mentorId,
      studentId,
    });

    // Return enriched response with mentor and student details
    return NextResponse.json(
      {
        ...assignment,
        mentor: {
          id: mentor.id,
          name: mentor.name,
          email: mentor.email,
          position: mentor.position || "",
        },
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          studentId: student.studentId || "",
          university: student.university || "",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/mentor-assign error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
