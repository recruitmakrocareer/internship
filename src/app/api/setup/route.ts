import { NextResponse } from "next/server";
import { initializeSheets } from "@/lib/google-sheets";
import { users } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    // 1. Initialize all sheets with headers
    await initializeSheets();

    // 2. Check if admin already exists
    const existingAdmin = await users.findByEmail("admin@example.com");
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: "ระบบถูกตั้งค่าไว้แล้ว",
        accounts: {
          admin: "admin@example.com / admin123",
          mentor: "mentor@example.com / mentor123",
          student1: "student1@example.com / student123",
          student2: "student2@example.com / student123",
        },
      });
    }

    // 3. Create seed data
    const adminPassword = await bcrypt.hash("admin123", 10);
    const mentorPassword = await bcrypt.hash("mentor123", 10);
    const studentPassword = await bcrypt.hash("student123", 10);

    // Admin
    const admin = await users.create({
      email: "admin@example.com",
      password: adminPassword,
      name: "ผู้ดูแลระบบ",
      role: "ADMIN",
      phone: "0800000000",
      isActive: "true",
    });

    // Mentor
    const mentor = await users.create({
      email: "mentor@example.com",
      password: mentorPassword,
      name: "สมชาย ใจดี",
      role: "MENTOR",
      phone: "0811111111",
      position: "Senior Developer",
      expertise: "Full-Stack Development",
      isActive: "true",
    });

    // Students
    const student1 = await users.create({
      email: "student1@example.com",
      password: studentPassword,
      name: "สมหญิง รักเรียน",
      role: "STUDENT",
      studentId: "6401001",
      university: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี",
      faculty: "คณะเทคโนโลยีสารสนเทศ",
      major: "วิทยาการคอมพิวเตอร์",
      year: 4,
      startDate: "2024-06-01",
      endDate: "2024-11-30",
      company: "บริษัท เทค จำกัด",
      department: "ฝ่ายพัฒนาซอฟต์แวร์",
      isActive: "true",
    });

    const student2 = await users.create({
      email: "student2@example.com",
      password: studentPassword,
      name: "สมศักดิ์ ตั้งใจ",
      role: "STUDENT",
      studentId: "6401002",
      university: "จุฬาลงกรณ์มหาวิทยาลัย",
      faculty: "คณะวิศวกรรมศาสตร์",
      major: "วิศวกรรมคอมพิวเตอร์",
      year: 4,
      startDate: "2024-06-01",
      endDate: "2024-11-30",
      company: "บริษัท เทค จำกัด",
      department: "ฝ่ายพัฒนาซอฟต์แวร์",
      isActive: "true",
    });

    // Mentor-Student assignments
    const { mentorStudents } = await import("@/lib/db");
    await mentorStudents.create({ mentorId: mentor.id, studentId: student1.id, assignedAt: new Date().toISOString() });
    await mentorStudents.create({ mentorId: mentor.id, studentId: student2.id, assignedAt: new Date().toISOString() });

    // Roadmaps
    const { roadmaps, roadmapSteps } = await import("@/lib/db");
    const roadmap1 = await roadmaps.create({
      title: "Web Development Fundamentals",
      description: "เรียนรู้พื้นฐานการพัฒนาเว็บแอปพลิเคชัน",
      category: "Development",
      order: 1,
      isActive: "true",
    });

    const steps1 = [
      { title: "HTML & CSS พื้นฐาน", description: "เรียนรู้โครงสร้าง HTML และการจัด Style ด้วย CSS", order: 1, durationDays: 5 },
      { title: "JavaScript พื้นฐาน", description: "เรียนรู้ภาษา JavaScript ตั้งแต่เริ่มต้น", order: 2, durationDays: 7 },
      { title: "TypeScript", description: "เรียนรู้ TypeScript สำหรับ Type Safety", order: 3, durationDays: 5 },
      { title: "React.js", description: "เรียนรู้ React.js Framework สำหรับสร้าง UI", order: 4, durationDays: 10 },
      { title: "Next.js", description: "เรียนรู้ Next.js Full-Stack Framework", order: 5, durationDays: 10 },
      { title: "Database & Prisma", description: "เรียนรู้การใช้งานฐานข้อมูล", order: 6, durationDays: 7 },
    ];
    for (const step of steps1) {
      await roadmapSteps.create({ ...step, roadmapId: roadmap1.id });
    }

    const roadmap2 = await roadmaps.create({
      title: "Soft Skills & Professional Development",
      description: "พัฒนาทักษะด้านการทำงานและการสื่อสาร",
      category: "Soft Skills",
      order: 2,
      isActive: "true",
    });

    const steps2 = [
      { title: "การสื่อสารในองค์กร", description: "เรียนรู้การสื่อสารอย่างมืออาชีพ", order: 1, durationDays: 3 },
      { title: "การทำงานเป็นทีม", description: "เรียนรู้เครื่องมือและวิธีการทำงานร่วมกัน", order: 2, durationDays: 3 },
      { title: "Git & Version Control", description: "เรียนรู้การใช้ Git", order: 3, durationDays: 5 },
      { title: "Agile & Scrum", description: "เรียนรู้กระบวนการทำงานแบบ Agile", order: 4, durationDays: 3 },
    ];
    for (const step of steps2) {
      await roadmapSteps.create({ ...step, roadmapId: roadmap2.id });
    }

    // Assignments
    const { assignments } = await import("@/lib/db");
    await assignments.create({
      title: "สร้างหน้า Portfolio ส่วนตัว",
      description: "สร้างหน้าเว็บ Portfolio ด้วย HTML, CSS และ JavaScript",
      dueDate: "2024-07-15",
      maxScore: 100,
      isActive: "true",
    });
    await assignments.create({
      title: "สร้าง Todo App ด้วย React",
      description: "สร้างแอปพลิเคชัน Todo List ด้วย React.js ที่มีฟีเจอร์ CRUD ครบถ้วน",
      dueDate: "2024-08-01",
      maxScore: 100,
      isActive: "true",
    });
    await assignments.create({
      title: "สรุปบทเรียน Week 1",
      description: "เขียนสรุปสิ่งที่เรียนรู้ในสัปดาห์แรกของการฝึกงาน",
      dueDate: "2024-06-07",
      maxScore: 50,
      isActive: "true",
    });

    // Resources
    const { resources } = await import("@/lib/db");
    await resources.create({
      title: "คู่มือการฝึกงาน",
      description: "เอกสารแนะนำและข้อปฏิบัติสำหรับนักศึกษาฝึกงาน",
      category: "เอกสาร",
      type: "document",
      url: "#",
      uploadedById: admin.id,
      isPublic: "true",
    });
    await resources.create({
      title: "React.js Official Documentation",
      description: "เอกสารอ้างอิงสำหรับ React.js",
      category: "บทเรียน",
      type: "link",
      url: "https://react.dev",
      uploadedById: mentor.id,
      isPublic: "true",
    });
    await resources.create({
      title: "TypeScript Handbook",
      description: "คู่มือการใช้งาน TypeScript",
      category: "บทเรียน",
      type: "link",
      url: "https://www.typescriptlang.org/docs/handbook/",
      uploadedById: mentor.id,
      isPublic: "true",
    });

    return NextResponse.json({
      success: true,
      message: "ตั้งค่าระบบสำเร็จ! สร้าง sheets และข้อมูลตัวอย่างเรียบร้อย",
      accounts: {
        admin: "admin@example.com / admin123",
        mentor: "mentor@example.com / mentor123",
        student1: "student1@example.com / student123",
        student2: "student2@example.com / student123",
      },
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการตั้งค่าระบบ", detail: String(error) },
      { status: 500 }
    );
  }
}
