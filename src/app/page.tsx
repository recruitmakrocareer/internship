"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import {
  HiAcademicCap,
  HiClipboardDocumentList,
  HiUserGroup,
  HiChartBarSquare,
  HiBookOpen,
  HiBell,
  HiStar,
  HiArrowRight,
  HiMap,
} from "react-icons/hi2";

const features = [
  {
    icon: HiMap,
    title: "Roadmap การเรียนรู้",
    description: "แผนการเรียนรู้แบบขั้นตอนที่ปรับแต่งได้ พร้อมติดตามความก้าวหน้า",
  },
  {
    icon: HiClipboardDocumentList,
    title: "จัดการงานมอบหมาย",
    description: "มอบหมายงาน ส่งงาน และตรวจงานได้อย่างเป็นระบบ",
  },
  {
    icon: HiUserGroup,
    title: "ระบบพี่เลี้ยง",
    description: "จับคู่พี่เลี้ยงกับนักศึกษา ดูแลและให้คำปรึกษาอย่างใกล้ชิด",
  },
  {
    icon: HiStar,
    title: "ประเมินผล",
    description: "ประเมินผลแบบ 360 องศา ทั้งจากพี่เลี้ยงและนักศึกษา",
  },
  {
    icon: HiBookOpen,
    title: "คลังความรู้",
    description: "รวมเอกสาร สื่อการเรียนรู้ และแหล่งข้อมูลที่เป็นประโยชน์",
  },
  {
    icon: HiBell,
    title: "แจ้งเตือนอัตโนมัติ",
    description: "แจ้งเตือนผ่านระบบและ LINE เพื่อไม่พลาดข้อมูลสำคัญ",
  },
  {
    icon: HiChartBarSquare,
    title: "รายงานและสถิติ",
    description: "แดชบอร์ดภาพรวม สถิติการฝึกงาน และรายงานความก้าวหน้า",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>

        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-xl">
              <HiAcademicCap className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-white font-semibold text-lg">InternShip</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary">
                สมัครสมาชิก
              </Button>
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            ระบบจัดการนักศึกษาฝึกงาน
          </h1>
          <p className="mt-6 text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            แพลตฟอร์มครบวงจรสำหรับบริหารจัดการการฝึกงาน
            ตั้งแต่การวางแผนการเรียนรู้ มอบหมายงาน ไปจนถึงการประเมินผล
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                เริ่มต้นใช้งาน
                <HiArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="ghost"
                className="text-white border border-white/30 hover:bg-white/10 hover:text-white"
              >
                เข้าสู่ระบบ
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              ฟีเจอร์หลักของระบบ
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              ครอบคลุมทุกขั้นตอนของการฝึกงาน ตั้งแต่เริ่มต้นจนสิ้นสุด
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            พร้อมเริ่มต้นใช้งานแล้วหรือยัง?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            สมัครสมาชิกฟรี เริ่มจัดการการฝึกงานอย่างมืออาชีพวันนี้
          </p>
          <Link href="/register">
            <Button size="lg">
              สมัครสมาชิกเลย
              <HiArrowRight className="h-5 w-5 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HiAcademicCap className="h-5 w-5 text-blue-400" />
            <span className="text-white font-medium">ระบบจัดการนักศึกษาฝึกงาน</span>
          </div>
          <p className="text-gray-400 text-sm">
            &copy; 2026 InternShip Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
