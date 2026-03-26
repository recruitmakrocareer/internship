import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { users } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const active = searchParams.get("active");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    let students: Record<string, string>[];

    if (search) {
      // Search across name, email, studentId, university
      students = await users.search(search);
      // Filter to only STUDENT role
      students = students.filter((s) => s.role === "STUDENT");
    } else {
      students = await users.findMany({ role: "STUDENT" });
    }

    // Filter by active status if specified
    if (active !== null && active !== undefined && active !== "") {
      students = students.filter((s) => s.isActive === active);
    }

    // Sort by createdAt descending
    students.sort(
      (a, b) =>
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
    );

    const total = students.length;

    // Paginate manually
    const paginated = students.slice(skip, skip + limit);

    return NextResponse.json({
      students: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/students error:", error);
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
    const {
      email,
      password,
      name,
      phone,
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

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const existing = await users.findByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await users.create({
      email,
      password: hashedPassword,
      name,
      role: "STUDENT",
      phone: phone || "",
      studentId: studentId || "",
      university: university || "",
      faculty: faculty || "",
      major: major || "",
      year: year ? String(year) : "",
      startDate: startDate || "",
      endDate: endDate || "",
      company: company || "",
      department: department || "",
      isActive: "true",
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("POST /api/students error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
