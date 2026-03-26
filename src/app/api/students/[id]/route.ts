import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { users, mentorStudents, roadmapProgress, roadmapSteps, roadmaps } from "@/lib/db";

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

    const student = await users.findById(id);

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Fetch mentor relationships
    const mentorRelations = await mentorStudents.findMany({ studentId: id });
    const studentMentors = await Promise.all(
      mentorRelations.map(async (rel) => {
        const mentor = await users.findById(rel.mentorId);
        return {
          ...rel,
          mentor: mentor
            ? {
                id: mentor.id,
                name: mentor.name,
                email: mentor.email,
                position: mentor.position || "",
                expertise: mentor.expertise || "",
              }
            : null,
        };
      })
    );

    // Fetch roadmap progress
    const progressRecords = await roadmapProgress.findMany({ userId: id });
    const progressWithSteps = await Promise.all(
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
                  ? { id: roadmap.id, title: roadmap.title }
                  : null,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      ...student,
      studentMentors,
      roadmapProgress: progressWithSteps,
    });
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

    const updateData: Record<string, string> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (studentId !== undefined) updateData.studentId = studentId;
    if (university !== undefined) updateData.university = university;
    if (faculty !== undefined) updateData.faculty = faculty;
    if (major !== undefined) updateData.major = major;
    if (year !== undefined) updateData.year = String(year);
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (company !== undefined) updateData.company = company;
    if (department !== undefined) updateData.department = department;

    const student = await users.update(id, updateData);

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

    const student = await users.update(id, { isActive: "false" });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Student deactivated successfully",
      student: {
        id: student.id,
        name: student.name,
        isActive: student.isActive,
      },
    });
  } catch (error) {
    console.error("DELETE /api/students/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
