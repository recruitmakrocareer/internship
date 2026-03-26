import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      name: "ผู้ดูแลระบบ",
      role: Role.ADMIN,
      phone: "0800000000",
    },
  });

  // Create Mentor
  const mentorPassword = await bcrypt.hash("mentor123", 10);
  const mentor = await prisma.user.upsert({
    where: { email: "mentor@example.com" },
    update: {},
    create: {
      email: "mentor@example.com",
      password: mentorPassword,
      name: "สมชาย ใจดี",
      role: Role.MENTOR,
      phone: "0811111111",
      position: "Senior Developer",
      expertise: "Full-Stack Development",
    },
  });

  // Create Students
  const studentPassword = await bcrypt.hash("student123", 10);
  const student1 = await prisma.user.upsert({
    where: { email: "student1@example.com" },
    update: {},
    create: {
      email: "student1@example.com",
      password: studentPassword,
      name: "สมหญิง รักเรียน",
      role: Role.STUDENT,
      studentId: "6401001",
      university: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี",
      faculty: "คณะเทคโนโลยีสารสนเทศ",
      major: "วิทยาการคอมพิวเตอร์",
      year: 4,
      startDate: new Date("2024-06-01"),
      endDate: new Date("2024-11-30"),
      company: "บริษัท เทค จำกัด",
      department: "ฝ่ายพัฒนาซอฟต์แวร์",
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "student2@example.com" },
    update: {},
    create: {
      email: "student2@example.com",
      password: studentPassword,
      name: "สมศักดิ์ ตั้งใจ",
      role: Role.STUDENT,
      studentId: "6401002",
      university: "จุฬาลงกรณ์มหาวิทยาลัย",
      faculty: "คณะวิศวกรรมศาสตร์",
      major: "วิศวกรรมคอมพิวเตอร์",
      year: 4,
      startDate: new Date("2024-06-01"),
      endDate: new Date("2024-11-30"),
      company: "บริษัท เทค จำกัด",
      department: "ฝ่ายพัฒนาซอฟต์แวร์",
    },
  });

  // Assign mentor to students
  await prisma.mentorStudent.upsert({
    where: { mentorId_studentId: { mentorId: mentor.id, studentId: student1.id } },
    update: {},
    create: { mentorId: mentor.id, studentId: student1.id },
  });
  await prisma.mentorStudent.upsert({
    where: { mentorId_studentId: { mentorId: mentor.id, studentId: student2.id } },
    update: {},
    create: { mentorId: mentor.id, studentId: student2.id },
  });

  // Create Roadmaps
  const roadmap1 = await prisma.roadmap.create({
    data: {
      title: "Web Development Fundamentals",
      description: "เรียนรู้พื้นฐานการพัฒนาเว็บแอปพลิเคชัน",
      category: "Development",
      order: 1,
      steps: {
        create: [
          { title: "HTML & CSS พื้นฐาน", description: "เรียนรู้โครงสร้าง HTML และการจัด Style ด้วย CSS", order: 1, durationDays: 5 },
          { title: "JavaScript พื้นฐาน", description: "เรียนรู้ภาษา JavaScript ตั้งแต่เริ่มต้น", order: 2, durationDays: 7 },
          { title: "TypeScript", description: "เรียนรู้ TypeScript สำหรับการพัฒนาที่มี Type Safety", order: 3, durationDays: 5 },
          { title: "React.js", description: "เรียนรู้ React.js Framework สำหรับสร้าง UI", order: 4, durationDays: 10 },
          { title: "Next.js", description: "เรียนรู้ Next.js Full-Stack Framework", order: 5, durationDays: 10 },
          { title: "Database & Prisma", description: "เรียนรู้การใช้งานฐานข้อมูลกับ Prisma ORM", order: 6, durationDays: 7 },
        ],
      },
    },
  });

  const roadmap2 = await prisma.roadmap.create({
    data: {
      title: "Soft Skills & Professional Development",
      description: "พัฒนาทักษะด้านการทำงานและการสื่อสาร",
      category: "Soft Skills",
      order: 2,
      steps: {
        create: [
          { title: "การสื่อสารในองค์กร", description: "เรียนรู้การสื่อสารอย่างมืออาชีพ", order: 1, durationDays: 3 },
          { title: "การทำงานเป็นทีม", description: "เรียนรู้เครื่องมือและวิธีการทำงานร่วมกัน", order: 2, durationDays: 3 },
          { title: "Git & Version Control", description: "เรียนรู้การใช้ Git สำหรับการทำงานร่วมกัน", order: 3, durationDays: 5 },
          { title: "Agile & Scrum", description: "เรียนรู้กระบวนการทำงานแบบ Agile", order: 4, durationDays: 3 },
        ],
      },
    },
  });

  // Create Assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      title: "สร้างหน้า Portfolio ส่วนตัว",
      description: "สร้างหน้าเว็บ Portfolio ด้วย HTML, CSS และ JavaScript แสดงข้อมูลส่วนตัว ผลงาน และทักษะ",
      dueDate: new Date("2024-07-15"),
      maxScore: 100,
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      title: "สร้าง Todo App ด้วย React",
      description: "สร้างแอปพลิเคชัน Todo List ด้วย React.js ที่มีฟีเจอร์ CRUD ครบถ้วน",
      dueDate: new Date("2024-08-01"),
      maxScore: 100,
    },
  });

  const assignment3 = await prisma.assignment.create({
    data: {
      title: "สรุปบทเรียน Week 1",
      description: "เขียนสรุปสิ่งที่เรียนรู้ในสัปดาห์แรกของการฝึกงาน",
      dueDate: new Date("2024-06-07"),
      maxScore: 50,
    },
  });

  // Create Resources
  await prisma.resource.create({
    data: {
      title: "คู่มือการฝึกงาน",
      description: "เอกสารแนะนำและข้อปฏิบัติสำหรับนักศึกษาฝึกงาน",
      category: "เอกสาร",
      type: "document",
      url: "#",
      uploadedById: admin.id,
    },
  });

  await prisma.resource.create({
    data: {
      title: "React.js Official Documentation",
      description: "เอกสารอ้างอิงสำหรับ React.js",
      category: "บทเรียน",
      type: "link",
      url: "https://react.dev",
      uploadedById: mentor.id,
    },
  });

  await prisma.resource.create({
    data: {
      title: "TypeScript Handbook",
      description: "คู่มือการใช้งาน TypeScript",
      category: "บทเรียน",
      type: "link",
      url: "https://www.typescriptlang.org/docs/handbook/",
      uploadedById: mentor.id,
    },
  });

  console.log("✅ Seed data created successfully!");
  console.log(`Admin: admin@example.com / admin123`);
  console.log(`Mentor: mentor@example.com / mentor123`);
  console.log(`Student 1: student1@example.com / student123`);
  console.log(`Student 2: student2@example.com / student123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
