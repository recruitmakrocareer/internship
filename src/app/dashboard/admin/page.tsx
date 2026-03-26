"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import { HiUsers, HiUserGroup, HiDocumentText, HiCheckCircle } from "react-icons/hi2";

interface AdminStats {
  totalStudents: number;
  totalMentors: number;
  activeAssignments: number;
  completionRate: number;
  recentStudents: { id: string; name: string; university: string; createdAt: string }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
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
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "นักศึกษาทั้งหมด",
      value: stats?.totalStudents ?? 0,
      icon: HiUsers,
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "พี่เลี้ยงทั้งหมด",
      value: stats?.totalMentors ?? 0,
      icon: HiUserGroup,
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      title: "งานที่มอบหมายอยู่",
      value: stats?.activeAssignments ?? 0,
      icon: HiDocumentText,
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
    {
      title: "อัตราการเสร็จสิ้น",
      value: `${stats?.completionRate ?? 0}%`,
      icon: HiCheckCircle,
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
  ];

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ดผู้ดูแลระบบ</h1>
          <p className="text-gray-500 mt-1">ภาพรวมระบบจัดการนักศึกษาฝึกงาน</p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <Card key={card.title}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.textColor}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Students */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">นักศึกษาลงทะเบียนล่าสุด</h2>
          {stats?.recentStudents && stats.recentStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ชื่อ</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">มหาวิทยาลัย</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">วันที่ลงทะเบียน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recentStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{student.university}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(student.createdAt).toLocaleDateString("th-TH")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">ยังไม่มีข้อมูลนักศึกษา</p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
