"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { HiUsers, HiClipboardDocumentCheck, HiDocumentArrowUp } from "react-icons/hi2";
import { formatDate } from "@/lib/utils";

interface AssignedStudent {
  id: string;
  name: string;
  university: string;
  roadmapProgress: number;
}

interface RecentSubmission {
  id: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: string;
  status: string;
}

interface MentorStats {
  assignedStudents: AssignedStudent[];
  pendingReviews: number;
  recentSubmissions: RecentSubmission[];
}

export default function MentorDashboardPage() {
  const [stats, setStats] = useState<MentorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/mentor/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <DashboardLayout role="MENTOR">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ดพี่เลี้ยง</h1>
          <p className="text-gray-500 mt-1">ภาพรวมนักศึกษาในความดูแล</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <HiUsers className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">นักศึกษาในความดูแล</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "-" : stats?.assignedStudents.length ?? 0}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-50">
                <HiClipboardDocumentCheck className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">รอตรวจงาน</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "-" : stats?.pendingReviews ?? 0}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-50">
                <HiDocumentArrowUp className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">งานที่ส่งล่าสุด</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "-" : stats?.recentSubmissions.length ?? 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Assigned Students */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">นักศึกษาในความดูแล</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          ) : stats?.assignedStudents && stats.assignedStudents.length > 0 ? (
            <div className="space-y-3">
              {stats.assignedStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.university}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">ความคืบหน้า</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${student.roadmapProgress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {student.roadmapProgress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีนักศึกษาในความดูแล</p>
          )}
        </Card>

        {/* Recent Submissions */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">งานที่ส่งล่าสุด</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          ) : stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">นักศึกษา</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">งาน</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">วันที่ส่ง</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentSubmissions.map((sub) => (
                    <tr key={sub.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{sub.studentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{sub.assignmentTitle}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(sub.submittedAt)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={sub.status === "SUBMITTED" ? "info" : sub.status === "APPROVED" ? "success" : "warning"}>
                          {sub.status === "SUBMITTED" ? "รอตรวจ" : sub.status === "APPROVED" ? "อนุมัติ" : "รอแก้ไข"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีงานที่ส่ง</p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
