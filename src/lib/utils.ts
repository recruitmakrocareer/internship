import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    SUBMITTED: "bg-blue-100 text-blue-800",
    REVIEWED: "bg-purple-100 text-purple-800",
    REVISION_REQUESTED: "bg-orange-100 text-orange-800",
    APPROVED: "bg-green-100 text-green-800",
    NOT_STARTED: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "รอดำเนินการ",
    SUBMITTED: "ส่งแล้ว",
    REVIEWED: "ตรวจแล้ว",
    REVISION_REQUESTED: "ขอแก้ไข",
    APPROVED: "อนุมัติ",
    NOT_STARTED: "ยังไม่เริ่ม",
    IN_PROGRESS: "กำลังดำเนินการ",
    COMPLETED: "เสร็จสิ้น",
  };
  return labels[status] || status;
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    STUDENT: "นักศึกษา",
    MENTOR: "พี่เลี้ยง",
    ADMIN: "ผู้ดูแลระบบ",
  };
  return labels[role] || role;
}
