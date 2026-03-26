"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  HiArrowPath,
  HiChevronDown,
  HiChevronUp,
  HiFunnel,
} from "react-icons/hi2";
import { formatDate, getStatusColor, getStatusLabel, getRoleLabel } from "@/lib/utils";

interface EvaluationScore {
  category: string;
  score: number;
  maxScore: number;
  comment?: string;
}

interface Evaluation {
  id: string;
  evaluatorName: string;
  evaluateeName: string;
  type: string;
  period: string;
  overallScore: number;
  maxScore: number;
  scores: EvaluationScore[];
  createdAt: string;
}

const typeOptions = [
  { value: "", label: "ทุกประเภท" },
  { value: "MENTOR_TO_STUDENT", label: "พี่เลี้ยงประเมินนักศึกษา" },
  { value: "STUDENT_TO_MENTOR", label: "นักศึกษาประเมินพี่เลี้ยง" },
  { value: "SELF", label: "ประเมินตนเอง" },
];

const periodOptions = [
  { value: "", label: "ทุกช่วงเวลา" },
  { value: "MIDTERM", label: "กลางภาค" },
  { value: "FINAL", label: "ปลายภาค" },
  { value: "MONTHLY", label: "รายเดือน" },
];

export default function AdminEvaluationsPage() {
  const { data: session } = useSession();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      if (periodFilter) params.set("period", periodFilter);
      const res = await fetch(`/api/evaluations?${params.toString()}`);
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");
      const data = await res.json();
      setEvaluations(data);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลการประเมิน");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, periodFilter]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      MENTOR_TO_STUDENT: "พี่เลี้ยงประเมินนักศึกษา",
      STUDENT_TO_MENTOR: "นักศึกษาประเมินพี่เลี้ยง",
      SELF: "ประเมินตนเอง",
    };
    return map[type] || type;
  };

  const getPeriodLabel = (period: string) => {
    const map: Record<string, string> = {
      MIDTERM: "กลางภาค",
      FINAL: "ปลายภาค",
      MONTHLY: "รายเดือน",
    };
    return map[period] || period;
  };

  const getScoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return "text-green-600";
    if (pct >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">ผลการประเมิน</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <HiFunnel className="h-5 w-5 text-gray-400" />
          <div>
            <label className="mr-2 text-sm font-medium text-gray-700">ประเภท:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mr-2 text-sm font-medium text-gray-700">ช่วงเวลา:</label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {periodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <HiArrowPath className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-500">กำลังโหลด...</span>
            </div>
          ) : evaluations.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              ไม่พบข้อมูลการประเมิน
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    ผู้ประเมิน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    ผู้ถูกประเมิน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    คะแนนรวม
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    วันที่
                  </th>
                  <th className="w-10 px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {evaluations.map((evaluation) => (
                  <>
                    <tr
                      key={evaluation.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        setExpandedId(
                          expandedId === evaluation.id ? null : evaluation.id
                        )
                      }
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {evaluation.evaluatorName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {evaluation.evaluateeName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {getTypeLabel(evaluation.type)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`text-sm font-semibold ${getScoreColor(evaluation.overallScore, evaluation.maxScore)}`}
                        >
                          {evaluation.overallScore}/{evaluation.maxScore}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatDate(evaluation.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {expandedId === evaluation.id ? (
                          <HiChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <HiChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </td>
                    </tr>
                    {expandedId === evaluation.id && (
                      <tr key={`${evaluation.id}-detail`}>
                        <td colSpan={6} className="bg-gray-50 px-6 py-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>ช่วงเวลา: {getPeriodLabel(evaluation.period)}</span>
                            </div>
                            {evaluation.scores && evaluation.scores.length > 0 ? (
                              <div className="grid gap-3 sm:grid-cols-2">
                                {evaluation.scores.map((score, idx) => (
                                  <div
                                    key={idx}
                                    className="rounded-lg border border-gray-200 bg-white p-3"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-700">
                                        {score.category}
                                      </span>
                                      <span
                                        className={`text-sm font-semibold ${getScoreColor(score.score, score.maxScore)}`}
                                      >
                                        {score.score}/{score.maxScore}
                                      </span>
                                    </div>
                                    <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                                      <div
                                        className="h-2 rounded-full bg-blue-500"
                                        style={{
                                          width: `${(score.score / score.maxScore) * 100}%`,
                                        }}
                                      />
                                    </div>
                                    {score.comment && (
                                      <p className="mt-1 text-xs text-gray-500">
                                        {score.comment}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                ไม่มีรายละเอียดคะแนน
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
