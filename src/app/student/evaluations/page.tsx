"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import toast from "react-hot-toast";
import { HiStar, HiClipboardDocumentCheck } from "react-icons/hi2";
import { formatDate } from "@/lib/utils";

interface Evaluation {
  id: string;
  evaluatorName: string;
  period: string;
  scores: Record<string, number>;
  comment: string;
  createdAt: string;
}

const mentorCategories = [
  { key: "teaching", label: "การสอน" },
  { key: "communication", label: "การสื่อสาร" },
  { key: "professionalism", label: "ความเป็นมืออาชีพ" },
  { key: "support", label: "การสนับสนุน" },
];

export default function StudentEvaluationsPage() {
  const { data: session } = useSession();
  const [receivedEvals, setReceivedEvals] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({
    teaching: 5,
    communication: 5,
    professionalism: 5,
    support: 5,
  });
  const [comment, setComment] = useState("");

  useEffect(() => {
    async function fetchEvaluations() {
      try {
        const res = await fetch("/api/students/evaluations");
        if (res.ok) {
          const data = await res.json();
          setReceivedEvals(data.evaluations || data || []);
        }
      } catch {
        toast.error("ไม่สามารถโหลดข้อมูลการประเมินได้");
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchEvaluations();
  }, [session]);

  const handleSubmitEvaluation = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/students/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "STUDENT_TO_MENTOR",
          scores,
          comment,
        }),
      });
      if (res.ok) {
        toast.success("ส่งการประเมินสำเร็จ");
        setComment("");
        setScores({
          teaching: 5,
          communication: 5,
          professionalism: 5,
          support: 5,
        });
      } else {
        toast.error("ไม่สามารถส่งการประเมินได้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value: number, onChange?: (v: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(star)}
            className={`${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            <HiStar
              className={`h-6 w-6 ${
                star <= value ? "text-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">การประเมินผล</h1>
          <p className="text-gray-500 mt-1">ดูผลการประเมินและประเมินพี่เลี้ยง</p>
        </div>

        {/* Received Evaluations */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ผลการประเมินที่ได้รับ
          </h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded" />
              ))}
            </div>
          ) : receivedEvals.length === 0 ? (
            <div className="text-center py-8">
              <HiClipboardDocumentCheck className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">ยังไม่มีผลการประเมิน</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedEvals.map((evaluation) => (
                <div
                  key={evaluation.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        ประเมินโดย: {evaluation.evaluatorName}
                      </p>
                      <p className="text-sm text-gray-500">
                        งวด: {evaluation.period} | {formatDate(evaluation.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {Object.entries(evaluation.scores).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{key}</span>
                        {renderStars(value)}
                      </div>
                    ))}
                  </div>
                  {evaluation.comment && (
                    <p className="text-sm text-gray-600 border-t border-gray-200 pt-3">
                      {evaluation.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Evaluate Mentor Form */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ประเมินพี่เลี้ยง
          </h2>
          <div className="space-y-4">
            {mentorCategories.map((category) => (
              <div
                key={category.key}
                className="flex items-center justify-between py-2"
              >
                <label className="text-sm font-medium text-gray-700">
                  {category.label}
                </label>
                {renderStars(scores[category.key], (value) =>
                  setScores((prev) => ({ ...prev, [category.key]: value }))
                )}
              </div>
            ))}

            <Textarea
              label="ความคิดเห็นเพิ่มเติม"
              placeholder="แสดงความคิดเห็นเกี่ยวกับพี่เลี้ยงของคุณ"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <Button onClick={handleSubmitEvaluation} isLoading={submitting}>
              ส่งการประเมิน
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
