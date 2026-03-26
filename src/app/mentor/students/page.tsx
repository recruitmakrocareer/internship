"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import {
  HiAcademicCap,
  HiUser,
  HiChartBar,
  HiClipboardDocumentCheck,
  HiEnvelope,
  HiPhone,
  HiBuildingOffice2,
  HiCalendarDays,
} from "react-icons/hi2";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  studentId?: string;
  university?: string;
  faculty?: string;
  major?: string;
  year?: number;
  startDate?: string;
  endDate?: string;
  company?: string;
  department?: string;
  isActive: boolean;
}

interface RoadmapProgress {
  total: number;
  completed: number;
  percentage: number;
}

interface AssignmentStats {
  total: number;
  submitted: number;
  approved: number;
}

interface StudentWithStats extends Student {
  roadmapProgress?: RoadmapProgress;
  assignmentStats?: AssignmentStats;
}

export default function MentorStudentsPage() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/students?limit=100");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const studentList: Student[] = data.students || data || [];

        // Fetch roadmap progress and assignment stats for each student
        const enriched = await Promise.all(
          studentList.map(async (student) => {
            let roadmapProgress: RoadmapProgress = { total: 0, completed: 0, percentage: 0 };
            let assignmentStats: AssignmentStats = { total: 0, submitted: 0, approved: 0 };

            try {
              const progressRes = await fetch(`/api/roadmaps/progress?userId=${student.id}`);
              if (progressRes.ok) {
                const progressData = await progressRes.json();
                const items = progressData.progress || progressData || [];
                const total = items.length;
                const completed = items.filter(
                  (p: { status: string }) => p.status === "COMPLETED"
                ).length;
                roadmapProgress = {
                  total,
                  completed,
                  percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
                };
              }
            } catch {
              // ignore
            }

            try {
              const assignRes = await fetch(`/api/assignments?limit=100`);
              if (assignRes.ok) {
                const assignData = await assignRes.json();
                const assignments = assignData.assignments || assignData || [];
                let total = 0;
                let submitted = 0;
                let approved = 0;
                for (const a of assignments) {
                  const subs = a.submissions || [];
                  for (const s of subs) {
                    if (s.userId === student.id) {
                      total++;
                      if (s.status === "SUBMITTED" || s.status === "REVIEWED" || s.status === "APPROVED") {
                        submitted++;
                      }
                      if (s.status === "APPROVED") {
                        approved++;
                      }
                    }
                  }
                }
                assignmentStats = { total, submitted, approved };
              }
            } catch {
              // ignore
            }

            return { ...student, roadmapProgress, assignmentStats };
          })
        );

        setStudents(enriched);
      } catch {
        toast.error("ไม่สามารถโหลดข้อมูลนักศึกษาได้");
      } finally {
        setLoading(false);
      }
    }

    if (session) fetchStudents();
  }, [session]);

  const openStudentDetail = (student: StudentWithStats) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  return (
    <DashboardLayout role="MENTOR">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">นักศึกษาในความดูแล</h1>
          <p className="text-gray-500 mt-1">ดูข้อมูลและความคืบหน้าของนักศึกษาที่ได้รับมอบหมาย</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : students.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <HiAcademicCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">ยังไม่มีนักศึกษาในความดูแล</p>
              <p className="text-gray-400 text-sm mt-1">
                เมื่อผู้ดูแลระบบมอบหมายนักศึกษาให้ จะแสดงรายชื่อที่นี่
              </p>
            </div>
          </Card>
        ) : (
          /* Student Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <Card
                key={student.id}
                className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
              >
                <button
                  className="w-full text-left"
                  onClick={() => openStudentDetail(student)}
                >
                  {/* Student Info Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <HiUser className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {student.university || "ไม่ระบุมหาวิทยาลัย"}
                      </p>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <HiAcademicCap className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {student.major || "ไม่ระบุสาขา"}
                        {student.year ? ` - ชั้นปีที่ ${student.year}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Roadmap Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 flex items-center">
                        <HiChartBar className="h-4 w-4 mr-1 text-blue-500" />
                        ความคืบหน้า Roadmap
                      </span>
                      <span className="font-medium text-blue-600">
                        {student.roadmapProgress?.percentage ?? 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${student.roadmapProgress?.percentage ?? 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Assignment Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <HiClipboardDocumentCheck className="h-4 w-4 mr-1 text-green-500" />
                      งานที่ส่ง
                    </span>
                    <span className="font-medium text-gray-700">
                      {student.assignmentStats?.submitted ?? 0} / {student.assignmentStats?.total ?? 0}
                    </span>
                  </div>
                </button>
              </Card>
            ))}
          </div>
        )}

        {/* Student Detail Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedStudent(null);
          }}
          title="รายละเอียดนักศึกษา"
          size="lg"
        >
          {selectedStudent && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  {selectedStudent.avatar ? (
                    <img
                      src={selectedStudent.avatar}
                      alt={selectedStudent.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <HiUser className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedStudent.name}
                  </h3>
                  {selectedStudent.studentId && (
                    <p className="text-sm text-gray-500">
                      รหัสนักศึกษา: {selectedStudent.studentId}
                    </p>
                  )}
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                      selectedStudent.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedStudent.isActive ? "กำลังฝึกงาน" : "สิ้นสุดการฝึกงาน"}
                  </span>
                </div>
              </div>

              {/* Contact & Academic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-700">
                  <HiEnvelope className="h-4 w-4 mr-2 text-gray-400" />
                  {selectedStudent.email}
                </div>
                {selectedStudent.phone && (
                  <div className="flex items-center text-sm text-gray-700">
                    <HiPhone className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedStudent.phone}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-700">
                  <HiAcademicCap className="h-4 w-4 mr-2 text-gray-400" />
                  {selectedStudent.university || "ไม่ระบุ"}
                </div>
                {selectedStudent.faculty && (
                  <div className="flex items-center text-sm text-gray-700">
                    <HiBuildingOffice2 className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedStudent.faculty}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-700">
                  <HiAcademicCap className="h-4 w-4 mr-2 text-gray-400" />
                  {selectedStudent.major || "ไม่ระบุสาขา"}
                  {selectedStudent.year ? ` - ชั้นปีที่ ${selectedStudent.year}` : ""}
                </div>
                {(selectedStudent.startDate || selectedStudent.endDate) && (
                  <div className="flex items-center text-sm text-gray-700">
                    <HiCalendarDays className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedStudent.startDate
                      ? formatDate(selectedStudent.startDate)
                      : "ไม่ระบุ"}{" "}
                    -{" "}
                    {selectedStudent.endDate
                      ? formatDate(selectedStudent.endDate)
                      : "ไม่ระบุ"}
                  </div>
                )}
              </div>

              {/* Progress Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Roadmap Progress */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <HiChartBar className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">ความคืบหน้า Roadmap</h4>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {selectedStudent.roadmapProgress?.percentage ?? 0}%
                  </div>
                  <p className="text-sm text-blue-700">
                    เสร็จสิ้น {selectedStudent.roadmapProgress?.completed ?? 0} จาก{" "}
                    {selectedStudent.roadmapProgress?.total ?? 0} ขั้นตอน
                  </p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${selectedStudent.roadmapProgress?.percentage ?? 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Assignment Stats */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <HiClipboardDocumentCheck className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-900">งานมอบหมาย</h4>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {selectedStudent.assignmentStats?.submitted ?? 0} / {selectedStudent.assignmentStats?.total ?? 0}
                  </div>
                  <p className="text-sm text-green-700">
                    งานที่ส่งแล้ว
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    อนุมัติแล้ว: {selectedStudent.assignmentStats?.approved ?? 0} งาน
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
