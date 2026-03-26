"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/login");
      return;
    }

    const role = (session.user as { role?: string })?.role;

    switch (role) {
      case "STUDENT":
        router.replace("/dashboard/student");
        break;
      case "ADMIN":
        router.replace("/dashboard/admin");
        break;
      case "MENTOR":
        router.replace("/dashboard/mentor");
        break;
      default:
        router.replace("/login");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-500">กำลังนำทาง...</p>
      </div>
    </div>
  );
}
