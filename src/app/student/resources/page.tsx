"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";
import {
  HiMagnifyingGlass,
  HiDocumentArrowDown,
  HiLink,
  HiFolderOpen,
  HiSquares2X2,
  HiListBullet,
} from "react-icons/hi2";
import { formatDate } from "@/lib/utils";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  url: string;
  fileSize?: string;
  createdAt: string;
}

export default function StudentResourcesPage() {
  const { data: session } = useSession();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    async function fetchResources() {
      try {
        const res = await fetch("/api/resources");
        if (res.ok) {
          const data = await res.json();
          setResources(data.resources || data || []);
        }
      } catch {
        toast.error("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchResources();
  }, [session]);

  const categories = [
    "all",
    ...Array.from(new Set(resources.map((r) => r.category))),
  ];

  const filtered = resources.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === "all" || r.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">คลังความรู้</h1>
          <p className="text-gray-500 mt-1">
            เอกสาร สื่อการเรียนรู้ และแหล่งข้อมูลที่เป็นประโยชน์
          </p>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <Input
                placeholder="ค้นหาเอกสาร..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat === "all" ? "ทั้งหมด" : cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-400"
                }`}
              >
                <HiSquares2X2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded ${
                  viewMode === "list"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-400"
                }`}
              >
                <HiListBullet className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Card>

        {/* Resources */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <HiFolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ไม่พบเอกสาร</p>
            </div>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((resource) => (
              <Card key={resource.id}>
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      {resource.type === "link" ? (
                        <HiLink className="h-5 w-5 text-blue-600" />
                      ) : (
                        <HiDocumentArrowDown className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <Badge variant="info">{resource.category}</Badge>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-500 flex-1 mb-3">
                    {resource.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatDate(resource.createdAt)}</span>
                    {resource.fileSize && <span>{resource.fileSize}</span>}
                  </div>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3"
                  >
                    <Button variant="secondary" size="sm" fullWidth>
                      {resource.type === "link" ? "เปิดลิงก์" : "ดาวน์โหลด"}
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((resource) => (
              <Card key={resource.id}>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    {resource.type === "link" ? (
                      <HiLink className="h-5 w-5 text-blue-600" />
                    ) : (
                      <HiDocumentArrowDown className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {resource.description}
                    </p>
                  </div>
                  <Badge variant="info">{resource.category}</Badge>
                  <span className="text-xs text-gray-400">
                    {formatDate(resource.createdAt)}
                  </span>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary" size="sm">
                      {resource.type === "link" ? "เปิด" : "โหลด"}
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
