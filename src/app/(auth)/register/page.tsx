"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import toast from "react-hot-toast";
import { HiAcademicCap } from "react-icons/hi2";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    university: "",
    faculty: "",
    major: "",
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (form.password.length < 6) {
      toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          studentId: form.studentId,
          university: form.university,
          faculty: form.faculty,
          major: form.major,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "เกิดข้อผิดพลาด");
      }

      toast.success("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <HiAcademicCap className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              ระบบจัดการนักศึกษาฝึกงาน
            </h1>
            <p className="text-gray-500 mt-2">สมัครสมาชิกเพื่อเริ่มใช้งาน</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="ชื่อ-นามสกุล"
              placeholder="กรอกชื่อ-นามสกุล"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
            <Input
              label="อีเมล"
              type="email"
              placeholder="กรอกอีเมล"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="รหัสผ่าน"
                type="password"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
              />
              <Input
                label="ยืนยันรหัสผ่าน"
                type="password"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                required
              />
            </div>
            <Input
              label="รหัสนักศึกษา"
              placeholder="กรอกรหัสนักศึกษา"
              value={form.studentId}
              onChange={(e) => updateField("studentId", e.target.value)}
              required
            />
            <Input
              label="มหาวิทยาลัย"
              placeholder="กรอกชื่อมหาวิทยาลัย"
              value={form.university}
              onChange={(e) => updateField("university", e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="คณะ"
                placeholder="กรอกชื่อคณะ"
                value={form.faculty}
                onChange={(e) => updateField("faculty", e.target.value)}
                required
              />
              <Input
                label="สาขาวิชา"
                placeholder="กรอกสาขาวิชา"
                value={form.major}
                onChange={(e) => updateField("major", e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              สมัครสมาชิก
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              มีบัญชีอยู่แล้ว?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
