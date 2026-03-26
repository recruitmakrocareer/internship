"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import { HiChartBar, HiDocumentText, HiBell, HiAcademicCap } from "react-icons/hi2";

interface StudentStats {
  roadmapProgress: number;
  pendingAssignments: number;
  completedAssignments: number;
  totalAssignments: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, notiRes] = await Promise.all([
          fetch("/api/students/stats"),
          fetch("/api/notifications?limit=5"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        if (notiRes.ok) {
          const notiData = await notiRes.json();
          setNotifications(notiData.notifications || notiData || []);
        }
      } catch {
        // silently handle fetch errors
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const summaryCards = [
    {
      title: "ความคืบหน้า Roadmap",
      value: stats ? `${stats.roadmapProgress}%` : "-",
      icon: HiChartBar,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "งานที่รอดำเนินการ",
      value: stats?.pendingAssignments ?? "-",
      icon: HiDocumentText,
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
    {
      title: "งานที่ส่งแล้ว",
      value: stats ? `${stats.completedAssignments}/${stats.totalAssignments}` : "-",
      icon: HiAcademicCap,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      title: "การแจ้งเตือนใหม่",
      value: notifications.filter((n) => !n.read).length,
      icon: HiBell,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
  ];

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            สวัสดี, {(session?.user as { name?: string })?.name || "นักศึกษา"}
          </h1>
          <p className="text-gray-500 mt-1">ภาพรวมการฝึกงานของคุณ</p>
        </div>

        {/* Summary Cards */}
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
            {summaryCards.map((card) => (
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

        {/* Roadmap Progress */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ความคืบหน้า Roadmap</h2>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${stats?.roadmapProgress ?? 0}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            เสร็จสิ้น {stats?.roadmapProgress ?? 0}% ของ Roadmap ทั้งหมด
          </p>
        </Card>

        {/* Notifications */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">การแจ้งเตือนล่าสุด</h2>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">ไม่มีการแจ้งเตือน</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((noti) => (
                <div
                  key={noti.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    noti.read ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div
                    className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                      noti.read ? "bg-gray-300" : "bg-blue-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{noti.title}</p>
                    <p className="text-sm text-gray-500">{noti.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
