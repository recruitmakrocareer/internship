"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  HiMagnifyingGlass,
  HiPlus,
  HiXMark,
  HiEye,
  HiArrowPath,
  HiUserPlus,
} from "react-icons/hi2";
import { formatDate, getStatusColor, getStatusLabel, getRoleLabel } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  university?: string;
  major?: string;
  isActive: boolean;
  mentor?: { id: string; name: string };
  createdAt: string;
}

interface Mentor {
  id: string;
  name: string;
  email: string;
}

export default function AdminStudentsPage() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    university: "",
    major: "",
  });

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/students?${params.toString()}`);
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลนักศึกษา");
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchMentors = async () => {
    try {
      const res = await fetch("/api/students?role=MENTOR");
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลพี่เลี้ยงได้");
      const data = await res.json();
      setMentors(data);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลพี่เลี้ยง");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "STUDENT" }),
      });
      if (!res.ok) throw new Error("ไม่สามารถเพิ่มนักศึกษาได้");
      toast.success("เพิ่มนักศึกษาสำเร็จ");
      setShowAddModal(false);
      setFormData({ name: "", email: "", password: "", studentId: "", university: "", major: "" });
      fetchStudents();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มนักศึกษา");
    }
  };

  const handleToggleActive = async (student: Student) => {
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !student.isActive }),
      });
      if (!res.ok) throw new Error("ไม่สามารถเปลี่ยนสถานะได้");
      toast.success(
        student.isActive ? "ปิดใช้งานนักศึกษาแล้ว" : "เปิดใช้งานนักศึกษาแล้ว"
      );
      fetchStudents();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
    }
  };

  const handleAssignMentor = async (mentorId: string) => {
    if (!selectedStudent) return;
    try {
      const res = await fetch(`/api/students/${selectedStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId }),
      });
      if (!res.ok) throw new Error("ไม่สามารถกำหนดพี่เลี้ยงได้");
      toast.success("กำหนดพี่เลี้ยงสำเร็จ");
      setShowMentorModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการกำหนดพี่เลี้ยง");
    }
  };

  const openMentorModal = (student: Student) => {
    setSelectedStudent(student);
    setShowMentorModal(true);
    fetchMentors();
  };

  const openDetailModal = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">จัดการนักศึกษา</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <HiPlus className="h-5 w-5" />
            เพิ่มนักศึกษา
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหานักศึกษา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <HiArrowPath className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-500">กำลังโหลด...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-gray-500">ไม่พบข้อมูลนักศึกษา</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    ชื่อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    รหัสนักศึกษา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    มหาวิทยาลัย
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    สาขา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {student.studentId || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {student.university || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {student.major || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          student.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetailModal(student)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                          title="ดูรายละเอียด"
                        >
                          <HiEye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(student)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-yellow-600"
                          title={student.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                        >
                          <HiArrowPath className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openMentorModal(student)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-green-600"
                          title="กำหนดพี่เลี้ยง"
                        >
                          <HiUserPlus className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">เพิ่มนักศึกษา</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <HiXMark className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">รหัสนักศึกษา</label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">มหาวิทยาลัย</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">สาขา</label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">รายละเอียดนักศึกษา</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedStudent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiXMark className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">ชื่อ-นามสกุล:</span>
                <p className="text-sm text-gray-900">{selectedStudent.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">อีเมล:</span>
                <p className="text-sm text-gray-900">{selectedStudent.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">รหัสนักศึกษา:</span>
                <p className="text-sm text-gray-900">{selectedStudent.studentId || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">มหาวิทยาลัย:</span>
                <p className="text-sm text-gray-900">{selectedStudent.university || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">สาขา:</span>
                <p className="text-sm text-gray-900">{selectedStudent.major || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">สถานะ:</span>
                <p className="text-sm">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      selectedStudent.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedStudent.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">พี่เลี้ยง:</span>
                <p className="text-sm text-gray-900">{selectedStudent.mentor?.name || "ยังไม่ได้กำหนด"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">วันที่ลงทะเบียน:</span>
                <p className="text-sm text-gray-900">{formatDate(selectedStudent.createdAt)}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedStudent(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Mentor Modal */}
      {showMentorModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">กำหนดพี่เลี้ยง</h2>
              <button
                onClick={() => {
                  setShowMentorModal(false);
                  setSelectedStudent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiXMark className="h-6 w-6" />
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              กำหนดพี่เลี้ยงให้ <span className="font-medium">{selectedStudent.name}</span>
            </p>
            {mentors.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">ไม่พบข้อมูลพี่เลี้ยง</p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {mentors.map((mentor) => (
                  <button
                    key={mentor.id}
                    onClick={() => handleAssignMentor(mentor.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-left hover:bg-blue-50 hover:border-blue-300"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{mentor.name}</p>
                      <p className="text-xs text-gray-500">{mentor.email}</p>
                    </div>
                    <HiUserPlus className="h-5 w-5 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowMentorModal(false);
                  setSelectedStudent(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
