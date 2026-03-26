"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  HiPlus,
  HiXMark,
  HiArrowPath,
  HiChevronDown,
  HiChevronUp,
  HiPencil,
  HiTrash,
} from "react-icons/hi2";
import { formatDate, getStatusColor, getStatusLabel, getRoleLabel } from "@/lib/utils";

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  category: string;
  steps: RoadmapStep[];
  createdAt: string;
}

export default function AdminRoadmapsPage() {
  const { data: session } = useSession();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showStepModal, setShowStepModal] = useState(false);
  const [editingStep, setEditingStep] = useState<RoadmapStep | null>(null);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [stepFormData, setStepFormData] = useState({
    title: "",
    description: "",
    duration: 1,
    order: 1,
  });

  const fetchRoadmaps = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/roadmaps");
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");
      const data = await res.json();
      setRoadmaps(data);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลแผนการเรียนรู้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  const handleAddRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/roadmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("ไม่สามารถสร้างแผนการเรียนรู้ได้");
      toast.success("สร้างแผนการเรียนรู้สำเร็จ");
      setShowAddModal(false);
      setFormData({ title: "", description: "", category: "" });
      fetchRoadmaps();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการสร้างแผนการเรียนรู้");
    }
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoadmapId) return;
    try {
      const url = editingStep
        ? `/api/roadmaps/${selectedRoadmapId}/steps/${editingStep.id}`
        : `/api/roadmaps/${selectedRoadmapId}/steps`;
      const method = editingStep ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stepFormData),
      });
      if (!res.ok) throw new Error("ไม่สามารถบันทึกขั้นตอนได้");
      toast.success(editingStep ? "แก้ไขขั้นตอนสำเร็จ" : "เพิ่มขั้นตอนสำเร็จ");
      setShowStepModal(false);
      setEditingStep(null);
      setStepFormData({ title: "", description: "", duration: 1, order: 1 });
      fetchRoadmaps();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการบันทึกขั้นตอน");
    }
  };

  const handleDeleteStep = async (roadmapId: string, stepId: string) => {
    if (!confirm("คุณต้องการลบขั้นตอนนี้หรือไม่?")) return;
    try {
      const res = await fetch(`/api/roadmaps/${roadmapId}/steps/${stepId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("ไม่สามารถลบขั้นตอนได้");
      toast.success("ลบขั้นตอนสำเร็จ");
      fetchRoadmaps();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบขั้นตอน");
    }
  };

  const openAddStepModal = (roadmapId: string, nextOrder: number) => {
    setSelectedRoadmapId(roadmapId);
    setEditingStep(null);
    setStepFormData({ title: "", description: "", duration: 1, order: nextOrder });
    setShowStepModal(true);
  };

  const openEditStepModal = (roadmapId: string, step: RoadmapStep) => {
    setSelectedRoadmapId(roadmapId);
    setEditingStep(step);
    setStepFormData({
      title: step.title,
      description: step.description,
      duration: step.duration,
      order: step.order,
    });
    setShowStepModal(true);
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">จัดการแผนการเรียนรู้</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <HiPlus className="h-5 w-5" />
            สร้างแผนการเรียนรู้
          </button>
        </div>

        {/* Roadmaps List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <HiArrowPath className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-500">กำลังโหลด...</span>
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-gray-500 shadow">
            ไม่พบข้อมูลแผนการเรียนรู้
          </div>
        ) : (
          <div className="space-y-4">
            {roadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow"
              >
                <div
                  className="flex cursor-pointer items-center justify-between px-6 py-4 hover:bg-gray-50"
                  onClick={() =>
                    setExpandedId(expandedId === roadmap.id ? null : roadmap.id)
                  }
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {roadmap.title}
                    </h3>
                    <p className="text-sm text-gray-500">{roadmap.description}</p>
                    <div className="mt-1 flex items-center gap-4 text-xs text-gray-400">
                      <span>หมวดหมู่: {roadmap.category || "-"}</span>
                      <span>ขั้นตอน: {roadmap.steps?.length || 0} ขั้นตอน</span>
                      <span>สร้างเมื่อ: {formatDate(roadmap.createdAt)}</span>
                    </div>
                  </div>
                  {expandedId === roadmap.id ? (
                    <HiChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <HiChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {expandedId === roadmap.id && (
                  <div className="border-t border-gray-200 px-6 py-4">
                    {roadmap.steps && roadmap.steps.length > 0 ? (
                      <div className="space-y-3">
                        {roadmap.steps
                          .sort((a, b) => a.order - b.order)
                          .map((step) => (
                            <div
                              key={step.id}
                              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                                    {step.order}
                                  </span>
                                  <p className="text-sm font-medium text-gray-900">
                                    {step.title}
                                  </p>
                                </div>
                                <p className="ml-8 text-xs text-gray-500">
                                  {step.description}
                                </p>
                                <p className="ml-8 text-xs text-gray-400">
                                  ระยะเวลา: {step.duration} วัน
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditStepModal(roadmap.id, step);
                                  }}
                                  className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-blue-600"
                                  title="แก้ไข"
                                >
                                  <HiPencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteStep(roadmap.id, step.id);
                                  }}
                                  className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-red-600"
                                  title="ลบ"
                                >
                                  <HiTrash className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-sm text-gray-500">
                        ยังไม่มีขั้นตอน
                      </p>
                    )}
                    <button
                      onClick={() =>
                        openAddStepModal(
                          roadmap.id,
                          (roadmap.steps?.length || 0) + 1
                        )
                      }
                      className="mt-4 inline-flex items-center gap-1 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
                    >
                      <HiPlus className="h-4 w-4" />
                      เพิ่มขั้นตอน
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Roadmap Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                สร้างแผนการเรียนรู้
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiXMark className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddRoadmap} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ชื่อแผน
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  คำอธิบาย
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  หมวดหมู่
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Step Modal */}
      {showStepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingStep ? "แก้ไขขั้นตอน" : "เพิ่มขั้นตอน"}
              </h2>
              <button
                onClick={() => {
                  setShowStepModal(false);
                  setEditingStep(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiXMark className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddStep} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ชื่อขั้นตอน
                </label>
                <input
                  type="text"
                  required
                  value={stepFormData.title}
                  onChange={(e) =>
                    setStepFormData({ ...stepFormData, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  คำอธิบาย
                </label>
                <textarea
                  required
                  value={stepFormData.description}
                  onChange={(e) =>
                    setStepFormData({
                      ...stepFormData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ระยะเวลา (วัน)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={stepFormData.duration}
                    onChange={(e) =>
                      setStepFormData({
                        ...stepFormData,
                        duration: parseInt(e.target.value) || 1,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ลำดับ
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={stepFormData.order}
                    onChange={(e) =>
                      setStepFormData({
                        ...stepFormData,
                        order: parseInt(e.target.value) || 1,
                      })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowStepModal(false);
                    setEditingStep(null);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
