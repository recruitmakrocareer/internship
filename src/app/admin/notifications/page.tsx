"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  HiArrowPath,
  HiBell,
  HiPaperAirplane,
  HiUsers,
  HiUser,
} from "react-icons/hi2";
import { formatDate, getStatusColor, getStatusLabel, getRoleLabel } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  recipientType: string;
  recipientName?: string;
  sentViaLine: boolean;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recipientType, setRecipientType] = useState<"ALL" | "INDIVIDUAL">("ALL");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [sendViaLine, setSendViaLine] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
  });

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students");
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลนักศึกษาได้");
      const data = await res.json();
      setStudents(data);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลนักศึกษา");
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");
      const data = await res.json();
      setNotifications(data);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการโหลดประวัติการแจ้งเตือน");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recipientType === "INDIVIDUAL" && !selectedStudentId) {
      toast.error("กรุณาเลือกผู้รับ");
      return;
    }
    try {
      setSending(true);
      const payload = {
        title: formData.title,
        message: formData.message,
        recipientType,
        recipientId: recipientType === "INDIVIDUAL" ? selectedStudentId : undefined,
        sendViaLine,
      };
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("ไม่สามารถส่งการแจ้งเตือนได้");
      toast.success("ส่งการแจ้งเตือนสำเร็จ");
      setFormData({ title: "", message: "" });
      setRecipientType("ALL");
      setSelectedStudentId("");
      setSendViaLine(false);
      fetchNotifications();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการส่งการแจ้งเตือน");
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <HiBell className="h-7 w-7 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            ศูนย์การแจ้งเตือน
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Send Form */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              ส่งการแจ้งเตือน
            </h2>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  หัวข้อ
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="หัวข้อการแจ้งเตือน"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ข้อความ
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={4}
                  placeholder="เนื้อหาการแจ้งเตือน..."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Recipient Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ผู้รับ
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recipientType"
                      value="ALL"
                      checked={recipientType === "ALL"}
                      onChange={() => setRecipientType("ALL")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <HiUsers className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">นักศึกษาทั้งหมด</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recipientType"
                      value="INDIVIDUAL"
                      checked={recipientType === "INDIVIDUAL"}
                      onChange={() => setRecipientType("INDIVIDUAL")}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <HiUser className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">รายบุคคล</span>
                  </label>
                </div>
              </div>

              {recipientType === "INDIVIDUAL" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    เลือกนักศึกษา
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- เลือกนักศึกษา --</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* LINE Option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendViaLine"
                  checked={sendViaLine}
                  onChange={(e) => setSendViaLine(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label
                  htmlFor="sendViaLine"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  ส่งผ่าน LINE ด้วย
                </label>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <HiArrowPath className="h-4 w-4 animate-spin" />
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <HiPaperAirplane className="h-4 w-4" />
                    ส่งการแจ้งเตือน
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              ประวัติการแจ้งเตือน
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <HiArrowPath className="h-6 w-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-500">กำลังโหลด...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                ยังไม่มีประวัติการแจ้งเตือน
              </div>
            ) : (
              <div className="max-h-[500px] space-y-3 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {notif.title}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {formatDate(notif.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                      {notif.message}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      <span>
                        ผู้รับ:{" "}
                        {notif.recipientType === "ALL"
                          ? "ทั้งหมด"
                          : notif.recipientName || "รายบุคคล"}
                      </span>
                      {notif.sentViaLine && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          LINE
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
