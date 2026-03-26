"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  HiPlus,
  HiXMark,
  HiArrowPath,
  HiEye,
  HiDocumentText,
} from "react-icons/hi2";
import { formatDate, getStatusColor, getStatusLabel, getRoleLabel } from "@/lib/utils";

interface Submission {
  id: string;
  studentName: string;
  submittedAt: string;
  score?: number;
  status: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  submissionsCount: number;
  status: string;
  createdAt: string;
}

export default function AdminAssignmentsPage() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxScore: 100,
  });

  const fetchAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/assignments");
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");
      const data = await res.json();
      setAssignments(data);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลงาน");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("ไม่สามารถสร้างงานได้");
      toast.success("สร้างงานสำเร็จ");
      setShowAddModal(false);
      setFormData({ title: "", description: "", dueDate: "", maxScore: 100 });
      fetchAssignments();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการสร้างงาน");
    }
  };

  const fetchSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionsModal(true);
    setLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/assignments/${assignment.id}/submissions`);
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลการส่งงานได้");
      const data = await res.json();
      setSubmissions(data);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลการส่งงาน");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const getAssignmentStatus = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now) return { label: "เลยกำหนด", color: "bg-red-100 text-red-800" };
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 3) return { label: "ใกล้กำหนด", color: "bg-yellow-100 text-yellow-800" };
    return { label: "เปิดรับ", color: "bg-green-100 text-green-800" };
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">จัดการงาน</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <HiPlus className="h-5 w-5" />
            สร้างงาน
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <HiArrowPath className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-500">กำลังโหลด...</span>
            </div>
          ) : assignments.length === 0 ? (
            <div className="py-12 text-center text-gray-500">ไม่พบข้อมูลงาน</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    ชื่องาน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    กำหนดส่ง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    คะแนนเต็ม
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    จำนวนผู้ส่ง
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
                {assignments.map((assignment) => {
                  const status = getAssignmentStatus(assignment.dueDate);
                  return (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {assignment.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {assignment.description}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(assignment.dueDate)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {assignment.maxScore} คะแนน
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {assignment.submissionsCount} คน
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => fetchSubmissions(assignment)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                          title="ดูการส่งงาน"
                        >
                          <HiEye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">สร้างงาน</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiXMark className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ชื่องาน
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  รายละเอียด
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  กำหนดส่ง
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  คะแนนเต็ม
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.maxScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxScore: parseInt(e.target.value) || 100,
                    })
                  }
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

      {/* Submissions Modal */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  การส่งงาน
                </h2>
                <p className="text-sm text-gray-500">{selectedAssignment.title}</p>
              </div>
              <button
                onClick={() => {
                  setShowSubmissionsModal(false);
                  setSelectedAssignment(null);
                  setSubmissions([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiXMark className="h-6 w-6" />
              </button>
            </div>
            {loadingSubmissions ? (
              <div className="flex items-center justify-center py-8">
                <HiArrowPath className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-500">กำลังโหลด...</span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                ยังไม่มีการส่งงาน
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        ชื่อนักศึกษา
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        วันที่ส่ง
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        คะแนน
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        สถานะ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {submissions.map((sub) => (
                      <tr key={sub.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {sub.studentName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {formatDate(sub.submittedAt)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {sub.score !== undefined && sub.score !== null
                            ? `${sub.score}/${selectedAssignment.maxScore}`
                            : "-"}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(sub.status)}`}
                          >
                            {getStatusLabel(sub.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowSubmissionsModal(false);
                  setSelectedAssignment(null);
                  setSubmissions([]);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
