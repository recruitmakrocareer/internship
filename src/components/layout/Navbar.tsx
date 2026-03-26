"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { HiOutlineBell, HiOutlineLogout, HiOutlineUser } from "react-icons/hi";

export default function Navbar() {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roleLabelMap: Record<string, string> = {
    STUDENT: "นักศึกษา",
    MENTOR: "พี่เลี้ยง",
    ADMIN: "ผู้ดูแลระบบ",
  };

  const userRole = (session?.user as { role?: string })?.role || "";
  const userName = session?.user?.name || "ผู้ใช้งาน";
  const userEmail = session?.user?.email || "";

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left: Page context */}
      <div />

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          title="การแจ้งเตือน"
        >
          <HiOutlineBell className="h-5 w-5" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-700">
              <HiOutlineUser className="h-4 w-4" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-700">{userName}</p>
              <p className="text-xs text-gray-500">
                {roleLabelMap[userRole] || userRole}
              </p>
            </div>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-slide-in">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <HiOutlineLogout className="h-4 w-4" />
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
