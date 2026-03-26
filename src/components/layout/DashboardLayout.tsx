"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

type Role = "STUDENT" | "MENTOR" | "ADMIN";

interface DashboardLayoutProps {
  children: ReactNode;
  role: Role;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main area offset by sidebar width */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Top navbar */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
