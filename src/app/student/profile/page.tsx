"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { HiUser, HiPencilSquare } from "react-icons/hi2";

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentId: string;
  university: string;
  faculty: string;
  major: string;
}

export default function StudentProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    university: "",
    faculty: "",
    major: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const userId = (session?.user as { id?: string })?.id;
        if (!userId) return;
        const res = await fetch(`/api/students/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setForm({
            name: data.name || "",
            phone: data.phone || "",
            university: data.university || "",
            faculty: data.faculty || "",
            major: data.major || "",
          });
        }
      } catch {
        toast.error("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
      } finally {
        setLoading(false);
      }
    }
    if (session) fetchProfile();
  }, [session]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/students/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsEditing(false);
        toast.success("บันทึกข้อมูลสำเร็จ");
      } else {
        toast.error("ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="STUDENT">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ข้อมูลส่วนตัว</h1>
            <p className="text-gray-500 mt-1">จัดการข้อมูลโปรไฟล์ของคุณ</p>
          </div>
          {!isEditing && !loading && (
            <Button
              variant="secondary"
              leftIcon={<HiPencilSquare className="h-4 w-4" />}
              onClick={() => setIsEditing(true)}
            >
              แก้ไข
            </Button>
          )}
        </div>

        {loading ? (
          <Card>
            <div className="animate-pulse space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded" />
              ))}
            </div>
          </Card>
        ) : (
          <Card>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <HiUser className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {profile?.name}
                </h2>
                <p className="text-sm text-gray-500">{profile?.email}</p>
                <p className="text-sm text-gray-500">
                  รหัสนักศึกษา: {profile?.studentId}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="ชื่อ-นามสกุล"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="เบอร์โทรศัพท์"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                disabled={!isEditing}
                placeholder="กรอกเบอร์โทรศัพท์"
              />
              <Input
                label="มหาวิทยาลัย"
                value={form.university}
                onChange={(e) => updateField("university", e.target.value)}
                disabled={!isEditing}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="คณะ"
                  value={form.faculty}
                  onChange={(e) => updateField("faculty", e.target.value)}
                  disabled={!isEditing}
                />
                <Input
                  label="สาขาวิชา"
                  value={form.major}
                  onChange={(e) => updateField("major", e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              {isEditing && (
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <Button onClick={handleSave} isLoading={saving}>
                    บันทึก
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      if (profile) {
                        setForm({
                          name: profile.name,
                          phone: profile.phone || "",
                          university: profile.university,
                          faculty: profile.faculty,
                          major: profile.major,
                        });
                      }
                    }}
                  >
                    ยกเลิก
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
