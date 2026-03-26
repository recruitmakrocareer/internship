"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  HiPlus,
  HiXMark,
  HiArrowPath,
  HiPencil,
  HiTrash,
  HiDocumentText,
  HiLink,
  HiPlayCircle,
  HiBookOpen,
  HiArrowUpTray,
} from "react-icons/hi2";
import { formatDate, getStatusColor, getStatusLabel, getRoleLabel } from "@/lib/utils";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  url?: string;
  fileName?: string;
  createdAt: string;
}

const categories = [
  { value: "", label: "ทั้งหมด" },
  { value: "เอกสาร", label: "เอกสาร" },
  { value: "บทเรียน", label: "บทเรียน" },
  { value: "วิดีโอ", label: "วิดีโอ" },
  { value: "ลิงก์", label: "ลิงก์" },
];

const typeOptions = [
  { value: "LINK", label: "ลิงก์" },
  { value: "FILE", label: "ไฟล์" },
];

export default function AdminResourcesPage() {
  const { data: session } = useSession();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "เอกสาร",
    type: "LINK",
    url: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter) params.set("category", categoryFilter);
      const res = await fetch(`/api/resources?${params.toString()}`);
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");
      const data = await res.json();
      setResources(data);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลแหล่งความรู้");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "เอกสาร",
      type: "LINK",
      url: "",
    });
    setSelectedFile(null);
    setEditingResource(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let fileUrl = formData.url;

      if (formData.type === "FILE" && selectedFile) {
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        if (!uploadRes.ok) throw new Error("ไม่สามารถอัปโหลดไฟล์ได้");
        const uploadResult = await uploadRes.json();
        fileUrl = uploadResult.url;
        setUploading(false);
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        url: fileUrl,
      };

      const url = editingResource
        ? `/api/resources/${editingResource.id}`
        : "/api/resources";
      const method = editingResource ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("ไม่สามารถบันทึกข้อมูลได้");
      toast.success(
        editingResource
          ? "แก้ไขแหล่งความรู้สำเร็จ"
          : "เพิ่มแหล่งความรู้สำเร็จ"
      );
      setShowAddModal(false);
      resetForm();
      fetchResources();
    } catch {
      setUploading(false);
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบแหล่งความรู้นี้หรือไม่?")) return;
    try {
      const res = await fetch(`/api/resources/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ไม่สามารถลบได้");
      toast.success("ลบแหล่งความรู้สำเร็จ");
      fetchResources();
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบแหล่งความรู้");
    }
  };

  const openEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      type: resource.type,
      url: resource.url || "",
    });
    setShowAddModal(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "เอกสาร":
        return <HiDocumentText className="h-8 w-8 text-blue-500" />;
      case "บทเรียน":
        return <HiBookOpen className="h-8 w-8 text-green-500" />;
      case "วิดีโอ":
        return <HiPlayCircle className="h-8 w-8 text-red-500" />;
      case "ลิงก์":
        return <HiLink className="h-8 w-8 text-purple-500" />;
      default:
        return <HiDocumentText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            จัดการแหล่งความรู้
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <HiPlus className="h-5 w-5" />
            เพิ่มแหล่งความรู้
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                categoryFilter === cat.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <HiArrowPath className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-500">กำลังโหลด...</span>
          </div>
        ) : resources.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-gray-500 shadow">
            ไม่พบข้อมูลแหล่งความรู้
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(resource.category)}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {resource.title}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {resource.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(resource)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                      title="แก้ไข"
                    >
                      <HiPencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                      title="ลบ"
                    >
                      <HiTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                  {resource.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>{formatDate(resource.createdAt)}</span>
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      เปิดลิงก์
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingResource ? "แก้ไขแหล่งความรู้" : "เพิ่มแหล่งความรู้"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiXMark className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ชื่อ
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    หมวดหมู่
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {categories
                      .filter((c) => c.value !== "")
                      .map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ประเภท
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {formData.type === "LINK" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    URL
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="https://..."
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    อัปโหลดไฟล์
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                      className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {selectedFile && (
                    <p className="mt-1 text-xs text-gray-500">
                      ไฟล์ที่เลือก: {selectedFile.name}
                    </p>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading && (
                    <HiArrowPath className="h-4 w-4 animate-spin" />
                  )}
                  {uploading ? "กำลังอัปโหลด..." : "บันทึก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
