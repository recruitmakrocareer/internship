"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  HiArrowPath,
  HiXMark,
  HiStar,
  HiUser,
  HiAcademicCap,
  HiClipboardDocumentCheck,
  HiChatBubbleLeftRight,
} from "react-icons/hi2";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  email: string;
  university?: string;
  major?: string;
  year?: number;
  avatar?: string;
}

interface EvaluationScore {
  category: string;
  score: number;
  maxScore: number;
}

interface Evaluation {
  id: string;
  evaluatorName: string;
  evaluateeName: string;
  type: string;
  overallScore: number;
  maxScore: number;
  scores: EvaluationScore[];
  comment?: string;
  createdAt: string;
}

const CRITERIA = [
  { key: "responsibility", label: "ความรับผิดชอบ" },
  { key: "learning", label: "ทักษะการเรียนรู้" },
  { key: "quality", label: "คุณภาพงาน" },
  { key: "teamwork", label: "การทำงานเป็นทีม" },
  { key: "punctuality", label: "ความตรงต่อเวลา" },
];

export default function MentorEvaluationsPage() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [receivedEvaluations, setReceivedEvaluations] = useState<Evaluation[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingEvaluations, setLoadingEvaluations] = useState(true);

  // Evaluation form state
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    responsibility: 3,
    learning: 3,
    quality: 3,
    teamwork: 3,
    punctuality: 3,
  });
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setLoadingStudents(true);
      const res = await fetch("/api/students?limit=100");
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลนักศึกษาได้");
      const data = await res.json();
      setStudents(data.students || data || []);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลนักศึกษา");
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  const fetchReceivedEvaluations = useCallback(async () => {
    try {
      setLoadingEvaluations(true);
      const res = await fetch("/api/evaluations?type=STUDENT_TO_MENTOR");
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลการประเมินได้");
      const data = await res.json();
      setReceivedEvaluations(data.evaluations || data || []);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการโหลดผลประเมิน");
    } finally {
      setLoadingEvaluations(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchStudents();
      fetchReceivedEvaluations();
    }
  }, [session, fetchStudents, fetchReceivedEvaluations]);

  const openEvalModal = (student: Student) => {
    setSelectedStudent(student);
    setScores({
      responsibility: 3,
      learning: 3,
      quality: 3,
      teamwork: 3,
      punctuality: 3,
    });
    setComment("");
    setEvalModalOpen(true);
  };

  const closeEvalModal = () => {
    setEvalModalOpen(false);
    setSelectedStudent(null);
  };

  const handleScoreChange = (key: string, value: number) => {
    setScores((prev) => ({ ...prev, [key]: Math.min(5, Math.max(1, value)) }));
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setSubmitting(true);
    try {
      const scoreData = CRITERIA.map((c) => ({
        category: c.label,
        score: scores[c.key],
        maxScore: 5,
      }));

      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluateeId: selectedStudent.id,
          type: "MENTOR_TO_STUDENT",
          scores: JSON.stringify(scoreData),
          comment,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "ไม่สามารถบันทึกการประเมินได้");
      }

      toast.success("บันทึกการประเมินสำเร็จ");
      closeEvalModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return "text-green-600";
    if (pct >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 4) return "bg-green-500";
    if (score >= 3) return "bg-blue-500";
    if (score >= 2) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <DashboardLayout role="MENTOR">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">การประเมิน</h1>
          <p className="text-gray-500 mt-1">ประเมินนักศึกษาและดูผลประเมินจากนักศึกษา</p>
        </div>

        {/* Section 1: Evaluate Students */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HiClipboardDocumentCheck className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">ประเมินนักศึกษา</h2>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
            {loadingStudents ? (
              <div className="flex items-center justify-center py-12">
                <HiArrowPath className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-500">กำลังโหลด...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center">
                <HiAcademicCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">ยังไม่มีนักศึกษาในความดูแล</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <HiUser className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">
                          {student.university || "ไม่ระบุมหาวิทยาลัย"}
                          {student.major ? ` - ${student.major}` : ""}
                          {student.year ? ` ชั้นปีที่ ${student.year}` : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openEvalModal(student)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      <HiStar className="h-4 w-4" />
                      ประเมิน
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Received Evaluations */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HiChatBubbleLeftRight className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">ผลประเมินจากนักศึกษา</h2>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
            {loadingEvaluations ? (
              <div className="flex items-center justify-center py-12">
                <HiArrowPath className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-500">กำลังโหลด...</span>
              </div>
            ) : receivedEvaluations.length === 0 ? (
              <div className="py-12 text-center">
                <HiChatBubbleLeftRight className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">ยังไม่มีผลประเมินจากนักศึกษา</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {receivedEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="px-6 py-5">
                    {/* Evaluator Info */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <HiUser className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {evaluation.evaluatorName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(evaluation.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-lg font-bold ${getScoreColor(evaluation.overallScore, evaluation.maxScore)}`}
                        >
                          {evaluation.overallScore}
                        </span>
                        <span className="text-sm text-gray-400">/{evaluation.maxScore}</span>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    {evaluation.scores && evaluation.scores.length > 0 && (
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-3">
                        {evaluation.scores.map((score, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                          >
                            <span className="text-xs text-gray-600">{score.category}</span>
                            <div className="flex items-center gap-1">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <HiStar
                                    key={star}
                                    className={`h-3.5 w-3.5 ${
                                      star <= score.score
                                        ? "text-yellow-400"
                                        : "text-gray-200"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-medium text-gray-700 ml-1">
                                {score.score}/{score.maxScore}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment */}
                    {evaluation.comment && (
                      <div className="rounded-lg bg-green-50 p-3">
                        <p className="text-sm text-green-800">
                          <span className="font-medium">ความเห็น:</span> {evaluation.comment}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Evaluation Modal */}
      {evalModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={closeEvalModal} />
          <div className="relative w-full max-w-lg mx-4 max-h-[90vh] flex flex-col bg-white rounded-xl shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">ประเมินนักศึกษา</h3>
                <p className="text-sm text-gray-500">{selectedStudent.name}</p>
              </div>
              <button
                onClick={closeEvalModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <HiXMark className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmitEvaluation} className="px-6 py-4 overflow-y-auto flex-1">
              <div className="space-y-5">
                {/* Criteria Scores */}
                {CRITERIA.map((criterion) => (
                  <div key={criterion.key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        {criterion.label}
                      </label>
                      <span className="text-sm font-semibold text-blue-600">
                        {scores[criterion.key]}/5
                      </span>
                    </div>

                    {/* Slider */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-4">1</span>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={scores[criterion.key]}
                        onChange={(e) =>
                          handleScoreChange(criterion.key, Number(e.target.value))
                        }
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <span className="text-xs text-gray-400 w-4">5</span>
                    </div>

                    {/* Star Display */}
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleScoreChange(criterion.key, star)}
                          className="focus:outline-none"
                        >
                          <HiStar
                            className={`h-5 w-5 transition-colors ${
                              star <= scores[criterion.key]
                                ? "text-yellow-400"
                                : "text-gray-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Overall Score Display */}
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">คะแนนรวมเฉลี่ย</span>
                    <span className="text-xl font-bold text-blue-600">
                      {(
                        Object.values(scores).reduce((a, b) => a + b, 0) /
                        Object.values(scores).length
                      ).toFixed(1)}
                      /5
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-blue-200">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all"
                      style={{
                        width: `${
                          (Object.values(scores).reduce((a, b) => a + b, 0) /
                            Object.values(scores).length /
                            5) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ความเห็นเพิ่มเติม
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="เขียนความเห็นหรือข้อเสนอแนะเพิ่มเติม..."
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeEvalModal}
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
                  บันทึกการประเมิน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
