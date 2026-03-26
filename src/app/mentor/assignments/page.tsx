"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  HiArrowPath,
  HiXMark,
  HiDocumentText,
  HiArrowDownTray,
  HiClipboardDocumentCheck,
  HiFunnel,
  HiPencilSquare,
} from "react-icons/hi2";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

interface Submission {
  id: string;
  userId: string;
  studentName: string;
  assignmentId: string;
  assignmentTitle: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  submittedAt: string;
  status: string;
  score?: number | null;
  maxScore?: number;
  feedback?: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "ทั้งหมด" },
  { value: "PENDING", label: "รอตรวจ" },
  { value: "SUBMITTED", label: "ส่งแล้ว" },
  { value: "REVIEWED", label: "ตรวจแล้ว" },
  { value: "APPROVED", label: "อนุมัติ" },
  { value: "REVISION_REQUESTED", label: "ขอแก้ไข" },
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "รอตรวจ",
  SUBMITTED: "ส่งแล้ว",
  REVIEWED: "ตรวจแล้ว",
  APPROVED: "อนุมัติ",
  REVISION_REQUESTED: "ขอแก้ไข",
};

export default function MentorAssignmentsPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Review form state
  const [reviewScore, setReviewScore] = useState<number | "">("");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewStatus, setReviewStatus] = useState("APPROVED");

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/assignments?${params.toString()}`);
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");
      const data = await res.json();

      // Flatten assignments and their submissions
      const allSubmissions: Submission[] = [];
      const assignments = data.assignments || data || [];
      for (const assignment of assignments) {
        const subs = assignment.submissions || [];
        for (const sub of subs) {
          allSubmissions.push({
            id: sub.id,
            userId: sub.userId,
            studentName: sub.studentName || sub.user?.name || "ไม่ทราบชื่อ",
            assignmentId: assignment.id,
            assignmentTitle: assignment.title,
            content: sub.content,
            fileUrl: sub.fileUrl,
            fileName: sub.fileName,
            submittedAt: sub.submittedAt || sub.createdAt,
            status: sub.status,
            score: sub.score,
            maxScore: assignment.maxScore,
            feedback: sub.feedback,
          });
        }
      }

      setSubmissions(allSubmissions);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลการส่งงาน");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (session) fetchSubmissions();
  }, [session, fetchSubmissions]);

  const openReviewModal = (submission: Submission) => {
    setSelectedSubmission(submission);
    setReviewScore(submission.score ?? "");
    setReviewFeedback(submission.feedback || "");
    setReviewStatus("APPROVED");
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedSubmission(null);
    setReviewScore("");
    setReviewFeedback("");
    setReviewStatus("APPROVED");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/assignments/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          score: reviewScore === "" ? null : Number(reviewScore),
          feedback: reviewFeedback,
          status: reviewStatus,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "ไม่สามารถบันทึกการตรวจได้");
      }

      toast.success("บันทึกผลการตรวจสำเร็จ");
      closeReviewModal();
      fetchSubmissions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubmissions = statusFilter
    ? submissions.filter((s) => s.status === statusFilter)
    : submissions;

  return (
    <DashboardLayout role="MENTOR">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ตรวจงานนักศึกษา</h1>
          <p className="text-gray-500 mt-1">ตรวจสอบและให้คะแนนงานที่นักศึกษาส่ง</p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <HiFunnel className="h-5 w-5 text-gray-400" />
          <div>
            <label className="mr-2 text-sm font-medium text-gray-700">สถานะ:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-sm text-gray-500">
            ทั้งหมด {filteredSubmissions.length} รายการ
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <HiArrowPath className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-500">กำลังโหลด...</span>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="py-12 text-center">
              <HiClipboardDocumentCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">ไม่พบรายการส่งงาน</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      นักศึกษา
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      งาน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      วันที่ส่ง
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      คะแนน
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      การดำเนินการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {submission.studentName}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 truncate max-w-xs">
                          {submission.assignmentTitle}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(submission.submittedAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(submission.status)}`}
                        >
                          {STATUS_LABELS[submission.status] || getStatusLabel(submission.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {submission.score !== undefined && submission.score !== null
                          ? `${submission.score}/${submission.maxScore || 100}`
                          : "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          onClick={() => openReviewModal(submission)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                          title="ตรวจงาน"
                        >
                          <HiPencilSquare className="h-4 w-4" />
                          ตรวจ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={closeReviewModal} />
          <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col bg-white rounded-xl shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">ตรวจงาน</h3>
                <p className="text-sm text-gray-500">{selectedSubmission.assignmentTitle}</p>
              </div>
              <button
                onClick={closeReviewModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <HiXMark className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 overflow-y-auto flex-1">
              {/* Student Info */}
              <div className="mb-4 rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-900">
                  นักศึกษา: {selectedSubmission.studentName}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  ส่งเมื่อ: {formatDate(selectedSubmission.submittedAt)}
                </p>
              </div>

              {/* Submission Content */}
              {selectedSubmission.content && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เนื้อหาที่ส่ง
                  </label>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 whitespace-pre-wrap">
                    {selectedSubmission.content}
                  </div>
                </div>
              )}

              {/* File Download */}
              {selectedSubmission.fileUrl && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ไฟล์แนบ
                  </label>
                  <a
                    href={selectedSubmission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <HiArrowDownTray className="h-4 w-4" />
                    {selectedSubmission.fileName || "ดาวน์โหลดไฟล์"}
                  </a>
                </div>
              )}

              {!selectedSubmission.content && !selectedSubmission.fileUrl && (
                <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                  <HiDocumentText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">ไม่มีเนื้อหาหรือไฟล์แนบ</p>
                </div>
              )}

              {/* Review Form */}
              <form onSubmit={handleSubmitReview} className="space-y-4 mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-900">ให้คะแนนและความเห็น</h4>

                {/* Score */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    คะแนน (เต็ม {selectedSubmission.maxScore || 100})
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={selectedSubmission.maxScore || 100}
                    value={reviewScore}
                    onChange={(e) =>
                      setReviewScore(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="กรอกคะแนน"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Feedback */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ความเห็น / ข้อเสนอแนะ
                  </label>
                  <textarea
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    rows={4}
                    placeholder="เขียนความเห็นหรือข้อเสนอแนะ..."
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ผลการตรวจ
                  </label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="APPROVED">อนุมัติ</option>
                    <option value="REVISION_REQUESTED">ขอแก้ไข</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting && <HiArrowPath className="h-4 w-4 animate-spin" />}
                    บันทึกผลการตรวจ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
