"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineBookOpen,
  HiOutlineBell,
  HiOutlineClipboardCheck,
  HiOutlineUpload,
} from "react-icons/hi";
import { ReactNode } from "react";

type Role = "STUDENT" | "MENTOR" | "ADMIN";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface SidebarProps {
  role: Role;
}

const studentNav: NavItem[] = [
  { href: "/student/dashboard", label: "แดชบอร์ด", icon: <HiOutlineHome className="h-5 w-5" /> },
  { href: "/student/profile", label: "โปรไฟล์", icon: <HiOutlineUser className="h-5 w-5" /> },
  { href: "/student/learning-plan", label: "แผนการเรียนรู้", icon: <HiOutlineClipboardList className="h-5 w-5" /> },
  { href: "/student/submissions", label: "ส่งงาน", icon: <HiOutlineUpload className="h-5 w-5" /> },
  { href: "/student/evaluations", label: "ประเมินผล", icon: <HiOutlineChartBar className="h-5 w-5" /> },
  { href: "/student/resources", label: "แหล่งความรู้", icon: <HiOutlineBookOpen className="h-5 w-5" /> },
];

const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "แดชบอร์ด", icon: <HiOutlineHome className="h-5 w-5" /> },
  { href: "/admin/students", label: "นักศึกษา", icon: <HiOutlineUsers className="h-5 w-5" /> },
  { href: "/admin/mentors", label: "พี่เลี้ยง", icon: <HiOutlineUser className="h-5 w-5" /> },
  { href: "/admin/learning-plans", label: "แผนการเรียนรู้", icon: <HiOutlineClipboardList className="h-5 w-5" /> },
  { href: "/admin/assignments", label: "งานที่มอบหมาย", icon: <HiOutlineDocumentText className="h-5 w-5" /> },
  { href: "/admin/evaluations", label: "ประเมินผล", icon: <HiOutlineChartBar className="h-5 w-5" /> },
  { href: "/admin/resources", label: "แหล่งความรู้", icon: <HiOutlineBookOpen className="h-5 w-5" /> },
  { href: "/admin/notifications", label: "แจ้งเตือน", icon: <HiOutlineBell className="h-5 w-5" /> },
];

const mentorNav: NavItem[] = [
  { href: "/mentor/dashboard", label: "แดชบอร์ด", icon: <HiOutlineHome className="h-5 w-5" /> },
  { href: "/mentor/students", label: "นักศึกษา", icon: <HiOutlineUsers className="h-5 w-5" /> },
  { href: "/mentor/reviews", label: "ตรวจงาน", icon: <HiOutlineClipboardCheck className="h-5 w-5" /> },
  { href: "/mentor/evaluations", label: "ประเมินผล", icon: <HiOutlineChartBar className="h-5 w-5" /> },
];

const navByRole: Record<Role, NavItem[]> = {
  STUDENT: studentNav,
  ADMIN: adminNav,
  MENTOR: mentorNav,
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navByRole[role] || [];

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary-600 text-white font-bold text-lg">
          ฝ
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900">ระบบฝึกงาน</h1>
          <p className="text-xs text-gray-500">Internship Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors duration-150
                    ${
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <span
                    className={isActive ? "text-primary-600" : "text-gray-400"}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          &copy; 2026 ระบบจัดการฝึกงาน
        </p>
      </div>
    </aside>
  );
}
