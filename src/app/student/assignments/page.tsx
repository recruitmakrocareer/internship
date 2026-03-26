"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import FileUpload from "@/components/ui/FileUpload";
import Textarea from "@/components/ui/Textarea";
import toast from "react-hot-toast";
import {
  HiDocumentText,
  HiChevronDown,
  HiChevronUp,
  HiPaperAirplane,
} from "react-icons/hi2";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  score?: number;
  feedback?: string;
  submittedAt?: string;
}

export default function StudentAssignmentsPage() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const res = await fetch("/api/students/assignments");
        if (res.ok) {
          const data = await res.json();
          setAssignments(data.assignments || data || []);
        }
      } catch {
        toast.error("ไม่สามารถโหลดข้อมูลงานได้");
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchAssignments();
  }, [session]);

  const handleSubmit = async (assignmentId: string) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("note", note);
      files.forEach((file) => formData.append("files", file));

      const res = await fetch(`/api/students/assignments/${assignmentId}/submit`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setAssignments((prev) =>
          prev.map((a) =>
            a.id === assignmentId ? { ...a, status: "SUBMITTED", submittedAt: new Date().toISOString() } : a
          )
        );
        setFiles([]);
        setNote("");
        setExpandedId(null);
        toast.success("ส่งงานสำเร็จ");
      } else {
        toast.error("ไม่สามารถส่งงานได้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "SUBMITTED":
        return "info";
      case "REVISION_REQUESTED":
        return "warning";
      case "PENDING":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">งานมอบหมาย</h1>
          <p className="text-gray-500 mt-1">ดูและส่งงานมอบหมายของคุณ</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <HiDocumentText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ยังไม่มีงานมอบหมาย</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id} padding={false}>
                {/* Header row */}
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedId(
                      expandedId === assignment.id ? null : assignment.id
                    )
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <HiDocumentText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        กำหนดส่ง: {formatDate(assignment.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusBadgeVariant(assignment.status)}>
                      {getStatusLabel(assignment.status)}
                    </Badge>
                    {assignment.score !== undefined && assignment.score !== null && (
                      <span className="text-sm font-medium text-gray-700">
                        คะแนน: {assignment.score}
                      </span>
                    )}
                    {expandedId === assignment.id ? (
                      <HiChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <HiChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {expandedId === assignment.id && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-700 mb-4">
                      {assignment.description}
                    </p>

                    {assignment.feedback && (
                      <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm font-medium text-amber-800 mb-1">
                          ความคิดเห็นจากพี่เลี้ยง:
                        </p>
                        <p className="text-sm text-amber-700">
                          {assignment.feedback}
                        </p>
                      </div>
                    )}

                    {(assignment.status === "PENDING" ||
                      assignment.status === "REVISION_REQUESTED") && (
                      <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900">ส่งงาน</h4>
                        <Textarea
                          label="หมายเหตุ"
                          placeholder="เพิ่มหมายเหตุ (ถ้ามี)"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                        <FileUpload
                          label="แนบไฟล์"
                          multiple
                          onChange={setFiles}
                          value={files}
                        />
                        <Button
                          leftIcon={
                            <HiPaperAirplane className="h-4 w-4" />
                          }
                          isLoading={submitting}
                          onClick={() => handleSubmit(assignment.id)}
                        >
                          ส่งงาน
                        </Button>
                      </div>
                    )}

                    {assignment.submittedAt && (
                      <p className="text-xs text-gray-400 mt-3">
                        ส่งเมื่อ: {formatDate(assignment.submittedAt)}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
