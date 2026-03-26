"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { HiCheckCircle, HiClock, HiPlayCircle } from "react-icons/hi2";
import { getStatusColor, getStatusLabel } from "@/lib/utils";

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: string;
  status: string;
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  steps: RoadmapStep[];
}

export default function StudentRoadmapPage() {
  const { data: session } = useSession();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoadmaps() {
      try {
        const res = await fetch("/api/students/roadmaps");
        if (res.ok) {
          const data = await res.json();
          setRoadmaps(data.roadmaps || data || []);
        }
      } catch {
        toast.error("ไม่สามารถโหลดข้อมูล Roadmap ได้");
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchRoadmaps();
  }, [session]);

  const updateStepStatus = async (roadmapId: string, stepId: string, status: string) => {
    try {
      const res = await fetch(`/api/students/roadmaps/${roadmapId}/steps/${stepId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRoadmaps((prev) =>
          prev.map((rm) =>
            rm.id === roadmapId
              ? {
                  ...rm,
                  steps: rm.steps.map((step) =>
                    step.id === stepId ? { ...step, status } : step
                  ),
                }
              : rm
          )
        );
        toast.success("อัปเดตสถานะสำเร็จ");
      } else {
        toast.error("ไม่สามารถอัปเดตสถานะได้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <HiCheckCircle className="h-6 w-6 text-green-500" />;
      case "IN_PROGRESS":
        return <HiPlayCircle className="h-6 w-6 text-blue-500" />;
      default:
        return <HiClock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getProgress = (steps: RoadmapStep[]) => {
    if (steps.length === 0) return 0;
    const completed = steps.filter((s) => s.status === "COMPLETED").length;
    return Math.round((completed / steps.length) * 100);
  };

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roadmap การเรียนรู้</h1>
          <p className="text-gray-500 mt-1">ติดตามความก้าวหน้าในแผนการเรียนรู้ของคุณ</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                  <div className="space-y-3">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-16 bg-gray-100 rounded" />
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : roadmaps.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <HiClock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ยังไม่มี Roadmap ที่ได้รับมอบหมาย</p>
            </div>
          </Card>
        ) : (
          roadmaps.map((roadmap) => {
            const progress = getProgress(roadmap.steps);
            return (
              <Card key={roadmap.id}>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {roadmap.title}
                    </h2>
                    <Badge variant={progress === 100 ? "success" : "info"}>
                      {progress}% เสร็จสิ้น
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{roadmap.description}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  {roadmap.steps
                    .sort((a, b) => a.order - b.order)
                    .map((step, index) => (
                      <div
                        key={step.id}
                        className="flex items-start gap-4 relative"
                      >
                        {/* Timeline connector */}
                        <div className="flex flex-col items-center">
                          {getStepIcon(step.status)}
                          {index < roadmap.steps.length - 1 && (
                            <div
                              className={`w-0.5 h-full min-h-[40px] ${
                                step.status === "COMPLETED"
                                  ? "bg-green-300"
                                  : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>

                        {/* Step content */}
                        <div className="flex-1 pb-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                ขั้นตอนที่ {step.order}: {step.title}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {step.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs text-gray-400">
                                  ระยะเวลา: {step.duration}
                                </span>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
                                    step.status
                                  )}`}
                                >
                                  {getStatusLabel(step.status)}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {step.status === "NOT_STARTED" && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() =>
                                    updateStepStatus(roadmap.id, step.id, "IN_PROGRESS")
                                  }
                                >
                                  เริ่มทำ
                                </Button>
                              )}
                              {step.status === "IN_PROGRESS" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateStepStatus(roadmap.id, step.id, "COMPLETED")
                                  }
                                >
                                  เสร็จแล้ว
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
